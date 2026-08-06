"""
AI360 – Prompt Optimizer
Uses Gemini to rewrite prompts into an optimized version.
Also generates 5 style rewrites (Professional, Detailed, Concise, Technical, Business).
"""
import logging
from typing import Optional

from domains.prompt_intelligence.schemas import PromptOptimizeResponse, PromptRewrite, PromptCategory
from domains.prompt_intelligence.scorer import PromptQualityScorer
from domains.prompt_intelligence.pii_scanner import SensitiveDataScanner
from domains.prompt_intelligence.classifier import PromptClassifier
from config import get_settings

logger = logging.getLogger(__name__)

# System prompt template for optimization
OPTIMIZATION_META_PROMPT = """You are an expert prompt engineer. Your task is to rewrite the given prompt to be clearer, 
more specific, better structured, and more likely to get an excellent response from an AI assistant.

Return ONLY valid JSON with this exact structure (no markdown, no extra text):
{
  "optimized": "<the optimized prompt>",
  "professional": "<professional version>",
  "detailed": "<detailed version>",
  "concise": "<concise version>",
  "technical": "<technical version>",
  "business": "<business version>"
}

Original prompt to optimize: """


class PromptOptimizer:
    """
    Optimizes a prompt using Gemini Flash (cost-efficient).
    Falls back to rule-based enhancement if API call fails.
    """

    def __init__(self):
        self.scorer = PromptQualityScorer()
        self.scanner = SensitiveDataScanner()
        self.classifier = PromptClassifier()
        self._gemini_client = None

    def _get_gemini_client(self):
        """Lazily initialize Gemini client."""
        if self._gemini_client is None:
            import google.generativeai as genai
            settings = get_settings()
            if not settings.gemini_api_key:
                return None
            genai.configure(api_key=settings.gemini_api_key)
            self._gemini_client = genai.GenerativeModel("gemini-1.5-flash")
        return self._gemini_client

    async def optimize(self, prompt: str, category: Optional[PromptCategory] = None) -> PromptOptimizeResponse:
        """
        Optimize a prompt and return the full optimization response.
        """
        # 1. Scan for sensitive data first
        findings = self.scanner.scan(prompt)

        # 2. Score the original prompt
        original_score = self.scorer.score(prompt)

        # 3. Classify if no category given
        if category is None:
            category, _ = self.classifier.classify(prompt)

        # 4. Attempt Gemini optimization
        optimized_prompt, rewrites = await self._ai_optimize(prompt, category)

        # 5. Score the optimized version
        optimized_score = self.scorer.score(optimized_prompt)
        estimated_improvement = max(0.0, optimized_score.overall - original_score.overall)

        return PromptOptimizeResponse(
            original_prompt=prompt,
            optimized_prompt=optimized_prompt,
            original_score=original_score,
            estimated_improvement=round(estimated_improvement, 1),
            rewrites=rewrites,
            sensitive_data_findings=findings,
        )

    async def _ai_optimize(self, prompt: str, category: PromptCategory) -> tuple[str, PromptRewrite]:
        """
        Use Gemini to rewrite the prompt. Falls back to rule-based if unavailable.
        """
        try:
            client = self._get_gemini_client()
            if client:
                import json as json_module
                import asyncio
                meta_prompt = OPTIMIZATION_META_PROMPT + f'"{prompt}"\n\nCategory: {category.value}'
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None,
                    lambda: client.generate_content(meta_prompt)
                )
                raw = response.text.strip()
                # Strip markdown code fences if present
                if raw.startswith("```"):
                    raw = raw.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
                data = json_module.loads(raw)
                return (
                    data.get("optimized", prompt),
                    PromptRewrite(
                        professional=data.get("professional", prompt),
                        detailed=data.get("detailed", prompt),
                        concise=data.get("concise", prompt),
                        technical=data.get("technical", prompt),
                        business=data.get("business", prompt),
                    )
                )
        except Exception as e:
            logger.warning(f"Gemini optimization failed, falling back to rule-based: {e}")

        # Fallback: rule-based enhancement
        return self._rule_based_optimize(prompt, category)

    def _rule_based_optimize(self, prompt: str, category: PromptCategory) -> tuple[str, PromptRewrite]:
        """Simple rule-based prompt enhancement as fallback."""
        category_prefix = {
            PromptCategory.CODING: "As a senior software engineer, ",
            PromptCategory.SQL: "As a database expert, ",
            PromptCategory.EMAIL: "As a professional communicator, ",
            PromptCategory.RESEARCH: "As a research analyst, ",
            PromptCategory.DEBUGGING: "As a debugging expert, ",
            PromptCategory.ARCHITECTURE: "As a solutions architect, ",
        }.get(category, "")

        suffix = " Please provide a clear, well-structured response with examples where appropriate."
        optimized = f"{category_prefix}{prompt.strip()}{suffix}"

        return (
            optimized,
            PromptRewrite(
                professional=f"Please provide a professional analysis of: {prompt}",
                detailed=f"{prompt.strip()} Please include detailed explanations, examples, and step-by-step instructions.",
                concise=f"Briefly: {prompt.strip()}",
                technical=f"From a technical standpoint: {prompt.strip()} Include implementation details.",
                business=f"From a business perspective: {prompt.strip()} Focus on ROI and practical impact.",
            )
        )
