"""
AI360 – AI Router Service
Selects the appropriate adapter for a given model and handles retry/failover.
"""
import asyncio
import logging
from typing import AsyncIterator

from domains.ai_gateway.base import AIProviderAdapter
from domains.ai_gateway.models import AIModel, AIProvider, MODEL_PROVIDER_MAP, ChatMessage, ChatResponse
from domains.ai_gateway.adapters.openai_adapter import OpenAIAdapter
from domains.ai_gateway.adapters.gemini_adapter import GeminiAdapter
from domains.ai_gateway.adapters.claude_adapter import ClaudeAdapter
from core.exceptions import ProviderUnavailableError
from config import get_settings

logger = logging.getLogger(__name__)

# Fallback chain: if primary provider fails, try these in order
FAILOVER_CHAIN: list[AIModel] = [
    AIModel.GPT_4O_MINI,
    AIModel.GEMINI_15_FLASH,
    AIModel.CLAUDE_3_HAIKU,
]


class AIRouter:
    """
    Routes chat requests to the correct provider adapter.
    Supports retry (exponential backoff) and provider failover.
    """

    def __init__(self):
        self._adapters: dict[AIProvider, AIProviderAdapter] = {}
        self._initialized = False

    def _init_adapters(self) -> None:
        """Lazily initialize adapters on first use."""
        if self._initialized:
            return
        settings = get_settings()
        if settings.openai_api_key:
            self._adapters[AIProvider.OPENAI] = OpenAIAdapter(settings.openai_api_key)
        if settings.gemini_api_key:
            self._adapters[AIProvider.GEMINI] = GeminiAdapter(settings.gemini_api_key)
        if settings.anthropic_api_key:
            self._adapters[AIProvider.CLAUDE] = ClaudeAdapter(settings.anthropic_api_key)
        self._initialized = True
        logger.info(f"AI adapters initialized: {list(self._adapters.keys())}")

    def get_adapter(self, model: AIModel) -> AIProviderAdapter:
        """Get the adapter for the given model. Raises if provider is not configured."""
        self._init_adapters()
        provider = MODEL_PROVIDER_MAP.get(model)
        adapter = self._adapters.get(provider) if provider else None
        if not adapter:
            raise ProviderUnavailableError(str(provider or model))
        return adapter

    async def chat(
        self,
        messages: list[ChatMessage],
        model: AIModel,
        max_tokens: int | None = None,
        temperature: float = 0.7,
        max_retries: int = 2,
    ) -> ChatResponse:
        """
        Send a chat request with retry + failover.
        Tries the requested model first, then falls back through FAILOVER_CHAIN.
        """
        models_to_try = [model]
        for fallback in FAILOVER_CHAIN:
            if fallback != model:
                models_to_try.append(fallback)

        last_error: Exception | None = None
        for attempt_model in models_to_try:
            for attempt in range(max_retries + 1):
                try:
                    adapter = self.get_adapter(attempt_model)
                    response = await adapter.chat(
                        messages=messages,
                        model=attempt_model.value,
                        max_tokens=max_tokens,
                        temperature=temperature,
                    )
                    if attempt_model != model:
                        logger.warning(f"Served request with fallback model '{attempt_model}' (requested: '{model}')")
                    return response
                except ProviderUnavailableError as e:
                    last_error = e
                    if attempt < max_retries:
                        wait = 2 ** attempt  # Exponential backoff: 1s, 2s
                        logger.warning(f"Provider error on attempt {attempt + 1}, retrying in {wait}s...")
                        await asyncio.sleep(wait)
                    break  # Move to next model in failover chain

        raise last_error or ProviderUnavailableError("all")

    async def stream_chat(
        self,
        messages: list[ChatMessage],
        model: AIModel,
        max_tokens: int | None = None,
        temperature: float = 0.7,
    ) -> AsyncIterator[str]:
        """Stream a chat completion from the selected provider."""
        self._init_adapters()
        adapter = self.get_adapter(model)
        async for chunk in adapter.stream_chat(
            messages=messages,
            model=model.value,
            max_tokens=max_tokens,
            temperature=temperature,
        ):
            yield chunk

    def health_check(self) -> dict[str, bool]:
        """Return availability status of each configured provider."""
        self._init_adapters()
        return {
            provider.value: provider in self._adapters
            for provider in AIProvider
        }


# Module-level singleton
_router: AIRouter | None = None


def get_ai_router() -> AIRouter:
    """FastAPI dependency / module accessor for the AI router singleton."""
    global _router
    if _router is None:
        _router = AIRouter()
    return _router
