"""
AI360 – Anthropic Claude Provider Adapter
Supports Claude 3.5 Sonnet, Claude 3 Haiku, Claude 3 Opus.
"""
import time
import uuid
import logging
from typing import AsyncIterator, List

import anthropic
from anthropic import AsyncAnthropic, APIError

from domains.ai_gateway.base import AIProviderAdapter
from domains.ai_gateway.models import ChatMessage, ChatResponse, AIProvider
from core.exceptions import ProviderUnavailableError

logger = logging.getLogger(__name__)


class ClaudeAdapter(AIProviderAdapter):
    """
    Adapter for Anthropic's Claude Messages API.
    Claude uses a distinct system message format from OpenAI.
    """

    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("Anthropic API key is required")
        self.client = AsyncAnthropic(api_key=api_key)
        self.provider = AIProvider.CLAUDE.value

    def _prepare_messages(self, messages: List[ChatMessage]) -> tuple[str, list]:
        """
        Split system messages from conversation messages.
        Claude requires system prompt as a separate parameter.
        """
        system_parts = [m.content for m in messages if m.role == "system"]
        system_prompt = "\n".join(system_parts)
        chat_messages = [{"role": m.role, "content": m.content} for m in messages if m.role != "system"]
        return system_prompt, chat_messages

    async def chat(
        self,
        messages: List[ChatMessage],
        model: str,
        max_tokens: int | None = None,
        temperature: float = 0.7,
    ) -> ChatResponse:
        start = time.monotonic()
        try:
            system_prompt, chat_messages = self._prepare_messages(messages)
            kwargs = dict(
                model=model,
                max_tokens=max_tokens or 4096,
                temperature=temperature,
                messages=chat_messages,
            )
            if system_prompt:
                kwargs["system"] = system_prompt

            response = await self.client.messages.create(**kwargs)

            latency_ms = int((time.monotonic() - start) * 1000)
            content = response.content[0].text if response.content else ""
            input_tokens = response.usage.input_tokens
            output_tokens = response.usage.output_tokens
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
        except APIError as e:
            logger.error(f"Claude API error: {e}")
            raise ProviderUnavailableError("Claude")

    async def stream_chat(
        self,
        messages: List[ChatMessage],
        model: str,
        max_tokens: int | None = None,
        temperature: float = 0.7,
    ) -> AsyncIterator[str]:
        try:
            system_prompt, chat_messages = self._prepare_messages(messages)
            kwargs = dict(model=model, max_tokens=max_tokens or 4096, temperature=temperature, messages=chat_messages)
            if system_prompt:
                kwargs["system"] = system_prompt

            async with self.client.messages.stream(**kwargs) as stream:
                async for text in stream.text_stream:
                    yield text
        except APIError as e:
            logger.error(f"Claude streaming error: {e}")
            raise ProviderUnavailableError("Claude")

    def estimate_tokens(self, text: str, model: str) -> int:
        """Claude uses the same ~4chars/token approximation."""
        return max(1, len(text) // 4)
