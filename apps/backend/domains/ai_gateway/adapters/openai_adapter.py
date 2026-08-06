"""
AI360 – OpenAI Provider Adapter
Supports GPT-4o, GPT-4o-mini, GPT-4-turbo, GPT-3.5-turbo with streaming.
"""
import time
import uuid
import logging
from typing import AsyncIterator, List

from openai import AsyncOpenAI
from openai._exceptions import OpenAIError

from domains.ai_gateway.base import AIProviderAdapter
from domains.ai_gateway.models import ChatMessage, ChatResponse, AIProvider
from core.exceptions import ProviderUnavailableError

logger = logging.getLogger(__name__)


class OpenAIAdapter(AIProviderAdapter):
    """
    Adapter for OpenAI's Chat Completions API.
    Uses the official AsyncOpenAI client for async/await compatibility.
    """

    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("OpenAI API key is required")
        self.client = AsyncOpenAI(api_key=api_key)
        self.provider = AIProvider.OPENAI.value

    async def chat(
        self,
        messages: List[ChatMessage],
        model: str,
        max_tokens: int | None = None,
        temperature: float = 0.7,
    ) -> ChatResponse:
        """
        Send a synchronous (non-streaming) chat request to OpenAI.
        """
        start = time.monotonic()
        try:
            oai_messages = [{"role": m.role, "content": m.content} for m in messages]
            kwargs = dict(model=model, messages=oai_messages, temperature=temperature)
            if max_tokens:
                kwargs["max_tokens"] = max_tokens

            response = await self.client.chat.completions.create(**kwargs)

            latency_ms = int((time.monotonic() - start) * 1000)
            content = response.choices[0].message.content or ""
            usage = response.usage
            input_tokens = usage.prompt_tokens if usage else 0
            output_tokens = usage.completion_tokens if usage else 0
            total_tokens = input_tokens + output_tokens
            cost = self.calculate_cost(input_tokens, output_tokens, model)

            return ChatResponse(
                id=response.id or str(uuid.uuid4()),
                content=content,
                model=model,
                provider=self.provider,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                total_tokens=total_tokens,
                estimated_cost_usd=cost,
                latency_ms=latency_ms,
            )
        except OpenAIError as e:
            logger.error(f"OpenAI API error: {e}")
            raise ProviderUnavailableError("OpenAI")

    async def stream_chat(
        self,
        messages: List[ChatMessage],
        model: str,
        max_tokens: int | None = None,
        temperature: float = 0.7,
    ) -> AsyncIterator[str]:
        """
        Stream chat completion chunks from OpenAI.
        """
        try:
            oai_messages = [{"role": m.role, "content": m.content} for m in messages]
            kwargs = dict(model=model, messages=oai_messages, temperature=temperature, stream=True)
            if max_tokens:
                kwargs["max_tokens"] = max_tokens

            async with self.client.chat.completions.stream(**kwargs) as stream:
                async for event in stream:
                    delta = event.choices[0].delta if event.choices else None
                    if delta and delta.content:
                        yield delta.content
        except OpenAIError as e:
            logger.error(f"OpenAI streaming error: {e}")
            raise ProviderUnavailableError("OpenAI")

    def estimate_tokens(self, text: str, model: str) -> int:
        """
        Estimate tokens using tiktoken (OpenAI's tokenizer).
        Falls back to word-count approximation if tiktoken is unavailable.
        """
        try:
            import tiktoken
            enc = tiktoken.encoding_for_model(model) if "gpt" in model else tiktoken.get_encoding("cl100k_base")
            return len(enc.encode(text))
        except Exception:
            return max(1, len(text.split()) * 4 // 3)  # rough approximation
