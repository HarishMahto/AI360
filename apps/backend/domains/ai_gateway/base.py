"""
AI360 – AI Provider Adapter Abstract Base Class
All LLM provider adapters must implement this interface.
"""
from abc import ABC, abstractmethod
from typing import AsyncIterator, List
from domains.ai_gateway.models import ChatMessage, ChatResponse


class AIProviderAdapter(ABC):
    """
    Abstract interface for an AI provider adapter.
    Each concrete adapter (OpenAI, Gemini, Claude) implements this contract.
    """

    @abstractmethod
    async def chat(
        self,
        messages: List[ChatMessage],
        model: str,
        max_tokens: int | None = None,
        temperature: float = 0.7,
    ) -> ChatResponse:
        """
        Send a chat completion request and return the full response.

        Args:
            messages: Conversation history.
            model: Model identifier string.
            max_tokens: Optional token limit.
            temperature: Sampling temperature.

        Returns:
            ChatResponse with content, token counts, and cost.
        """
        ...

    @abstractmethod
    async def stream_chat(
        self,
        messages: List[ChatMessage],
        model: str,
        max_tokens: int | None = None,
        temperature: float = 0.7,
    ) -> AsyncIterator[str]:
        """
        Stream a chat completion response as text chunks.

        Yields:
            String chunks of the assistant's response.
        """
        ...

    @abstractmethod
    def estimate_tokens(self, text: str, model: str) -> int:
        """
        Estimate the number of tokens in a text string for the given model.

        Args:
            text: Input text.
            model: Model identifier (affects tokenizer).

        Returns:
            Estimated token count.
        """
        ...

    def calculate_cost(self, input_tokens: int, output_tokens: int, model: str) -> float:
        """
        Calculate the estimated cost in USD for a given token usage.
        Uses the MODEL_COST_TABLE; falls back to $0 if model not found.
        """
        from domains.ai_gateway.models import MODEL_COST_TABLE
        costs = MODEL_COST_TABLE.get(model, {"input": 0.0, "output": 0.0})
        return (
            (input_tokens / 1_000_000) * costs["input"]
            + (output_tokens / 1_000_000) * costs["output"]
        )
