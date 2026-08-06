"""
AI360 – Prompt Quality Scorer
Scores prompts on 6 criteria (0-100 each) with a weighted overall score.
Provides actionable improvement suggestions.
"""
import re
from domains.prompt_intelligence.schemas import PromptScoreDetail


# Scoring weights (must sum to 1.0)
WEIGHTS = {
    "clarity": 0.20,
    "context": 0.20,
    "specificity": 0.20,
    "structure": 0.15,
    "constraints": 0.15,
    "output_format": 0.10,
}


class PromptQualityScorer:
    """
    Multi-criteria prompt quality scorer.
    Each criterion is scored independently via heuristic rules,
    then combined using configurable weights.
    """

    def score(self, prompt: str) -> PromptScoreDetail:
        """
        Score the prompt across all 6 quality dimensions.

        Returns:
            PromptScoreDetail with per-criterion scores and suggestions.
        """
        text = prompt.strip()
        words = text.split()
        word_count = len(words)
        char_count = len(text)
        sentences = re.split(r'[.!?]+', text)
        sentence_count = len([s for s in sentences if s.strip()])

        # ── Clarity (0-100) ───────────────────────────────────────────────────
        # Rewards: moderate length (30-200 words), no all-caps, few typos indicator
        clarity = 40
        if word_count >= 10:
            clarity += 20
        if word_count >= 30:
            clarity += 20
        if word_count <= 200:
            clarity += 10
        if not text.isupper():
            clarity += 10  # Not all caps
        clarity = min(100, clarity)

        # ── Context (0-100) ───────────────────────────────────────────────────
        # Rewards: role/persona mentions, project context, background info
        context = 20
        context_indicators = [
            r"\b(i am|i'm|we are|as a|my|our|working on|building|project)\b",
            r"\b(background|context|situation|currently|existing|using)\b",
            r"\b(in|for|at|with) [A-Z][a-zA-Z]+\b",  # proper nouns
        ]
        for pattern in context_indicators:
            if re.search(pattern, text, re.IGNORECASE):
                context += 25
        if word_count > 50:
            context += 15  # longer prompts likely have more context
        context = min(100, context)

        # ── Specificity (0-100) ───────────────────────────────────────────────
        # Rewards: specific numbers, names, technical terms, version numbers
        specificity = 30
        specificity_indicators = [
            r"\b\d+\b",                              # numbers
            r"\b(v\d+\.\d+|python \d|react \d)\b",  # version numbers
            r"\b[A-Z][a-zA-Z]+(\.[A-Z][a-zA-Z]+)+\b",  # namespaced identifiers
            r"\"[^\"]{3,}\"",                          # quoted strings
            r"`[^`]{2,}`",                             # backtick code
            r"\b(exactly|specifically|must|should|need to|require)\b",
        ]
        for pattern in specificity_indicators:
            if re.search(pattern, text, re.IGNORECASE):
                specificity += 12
        specificity = min(100, specificity)

        # ── Structure (0-100) ─────────────────────────────────────────────────
        # Rewards: numbered lists, bullet points, multiple sentences, clear question
        structure = 30
        if sentence_count >= 2:
            structure += 20
        if re.search(r'(\d+[.)\s]|[-*•]\s)', text):
            structure += 25  # Has lists
        if re.search(r'\?', text):
            structure += 15  # Has a question
        if re.search(r'(step|first|then|finally|next)', text, re.IGNORECASE):
            structure += 10  # Sequential language
        structure = min(100, structure)

        # ── Constraints (0-100) ───────────────────────────────────────────────
        # Rewards: length limits, style requirements, do/don't instructions
        constraints = 20
        constraint_patterns = [
            r"\b(don't|do not|avoid|without|no more than|at least|maximum|minimum)\b",
            r"\b(only|exclusively|must not|cannot|should not)\b",
            r"\b(keep it|make it|ensure|make sure)\b",
            r"\b(\d+ (words|sentences|paragraphs|lines|characters))\b",
        ]
        for pattern in constraint_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                constraints += 20
        constraints = min(100, constraints)

        # ── Output Format (0-100) ─────────────────────────────────────────────
        # Rewards: explicit format requests (JSON, list, table, markdown)
        output_format = 15
        format_patterns = [
            r"\b(json|yaml|xml|csv|markdown|html)\b",
            r"\b(list|table|bullet|numbered|outline|diagram)\b",
            r"\b(as a|in the form of|formatted as|output format)\b",
            r"\b(example|sample|template|format)\b",
            r"\b(return|respond|answer|reply)\b",
        ]
        for pattern in format_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                output_format += 17
        output_format = min(100, output_format)

        # ── Overall weighted score ────────────────────────────────────────────
        overall = (
            clarity * WEIGHTS["clarity"]
            + context * WEIGHTS["context"]
            + specificity * WEIGHTS["specificity"]
            + structure * WEIGHTS["structure"]
            + constraints * WEIGHTS["constraints"]
            + output_format * WEIGHTS["output_format"]
        )

        # ── Generate improvement suggestions ─────────────────────────────────
        suggestions = []
        if clarity < 60:
            suggestions.append("Make your prompt clearer by splitting long run-on sentences.")
        if context < 50:
            suggestions.append("Add more context: who you are, what you're working on, and the goal.")
        if specificity < 50:
            suggestions.append("Be more specific: include version numbers, exact requirements, or examples.")
        if structure < 50:
            suggestions.append("Use bullet points or numbered steps to structure your request.")
        if constraints < 40:
            suggestions.append("Add constraints: specify length, tone, language, or what to avoid.")
        if output_format < 40:
            suggestions.append("Specify the output format you want (e.g., JSON, bullet list, table, code snippet).")

        return PromptScoreDetail(
            overall=round(overall, 1),
            clarity=round(clarity, 1),
            context=round(context, 1),
            specificity=round(specificity, 1),
            structure=round(structure, 1),
            constraints=round(constraints, 1),
            output_format=round(output_format, 1),
            suggestions=suggestions[:4],  # Return top 4 suggestions
        )
