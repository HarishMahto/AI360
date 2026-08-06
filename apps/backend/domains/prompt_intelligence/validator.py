"""
AI360 – Prompt Validator
Rule-based validation: detects empty, too-short, and repeated prompts.
"""
from typing import Optional
from core.exceptions import PromptRejectedError


class PromptValidator:
    """
    Validates a prompt before processing.
    Raises PromptRejectedError for invalid prompts.
    """

    MIN_LENGTH = 10  # characters

    def validate(self, prompt: str, recent_prompts: Optional[list[str]] = None) -> str:
        """
        Validate the prompt and return the cleaned version.

        Args:
            prompt: The user's prompt text.
            recent_prompts: Recent prompt history for dedup check.

        Returns:
            Cleaned prompt string.

        Raises:
            PromptRejectedError if validation fails.
        """
        cleaned = prompt.strip()

        if not cleaned:
            raise PromptRejectedError("Prompt cannot be empty.")

        if len(cleaned) < self.MIN_LENGTH:
            raise PromptRejectedError(
                f"Prompt is too short ({len(cleaned)} chars). Please provide at least {self.MIN_LENGTH} characters."
            )

        if recent_prompts:
            recent_normalized = [p.strip().lower() for p in recent_prompts[-5:]]
            if cleaned.lower() in recent_normalized:
                raise PromptRejectedError("This prompt was already submitted recently. Please try a different question.")

        return cleaned
