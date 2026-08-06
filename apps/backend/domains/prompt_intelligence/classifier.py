"""
AI360 – Prompt Classifier
Keyword-based classification with confidence scoring.
Classifies prompts into 10 predefined categories.
"""
import re
from domains.prompt_intelligence.schemas import PromptCategory

# Category keyword patterns (order matters – first match wins for the top pick)
CATEGORY_KEYWORDS: dict[PromptCategory, list[str]] = {
    PromptCategory.CODING: [
        r"\bcode\b", r"\bfunction\b", r"\bclass\b", r"\bprogram\b", r"\bscript\b",
        r"\bimplement\b", r"\bapi\b", r"\balgorithm\b", r"\bpython\b", r"\bjavascript\b",
        r"\btypescript\b", r"\bjava\b", r"\bgolang\b", r"\brust\b", r"\breact\b",
        r"\brefactor\b", r"\bunit test\b", r"\bwrite a .*function\b",
    ],
    PromptCategory.SQL: [
        r"\bsql\b", r"\bquery\b", r"\bselect\b", r"\bjoin\b", r"\bdatabase\b",
        r"\btable\b", r"\binsert\b", r"\bupdate\b", r"\bdelete\b", r"\bpostgres\b",
        r"\bmysql\b", r"\bschema\b", r"\borm\b",
    ],
    PromptCategory.DEBUGGING: [
        r"\bdebug\b", r"\berror\b", r"\bfix\b", r"\bbug\b", r"\bexception\b",
        r"\bstack trace\b", r"\bcrash\b", r"\bnot working\b", r"\bwhy (does|is|isn't)\b",
        r"\btroubleshoot\b", r"\bfailing\b",
    ],
    PromptCategory.EMAIL: [
        r"\bemail\b", r"\bsubject\b", r"\bdear\b", r"\bregards\b", r"\bwrite.*email\b",
        r"\bdraft.*message\b", r"\bfollow.up\b", r"\bnewsletter\b",
    ],
    PromptCategory.DOCUMENTATION: [
        r"\bdocument\b", r"\breadme\b", r"\bcomment\b", r"\bdocstring\b", r"\bwiki\b",
        r"\bspec\b", r"\bspecification\b", r"\bdocs\b", r"\bexplain.*code\b",
    ],
    PromptCategory.RESEARCH: [
        r"\bresearch\b", r"\bexplain\b", r"\bwhat is\b", r"\bhow does\b",
        r"\bcompar[ei]\b", r"\banalyz[ei]\b", r"\bpros and cons\b", r"\boverview\b",
        r"\bstud[yi]\b", r"\binvestigat\b",
    ],
    PromptCategory.ARCHITECTURE: [
        r"\barchitecture\b", r"\bdesign\b", r"\bsystem design\b", r"\bmicroservice\b",
        r"\bscalab\b", r"\binfrastructure\b", r"\bdiagram\b", r"\bpattern\b",
        r"\bcloud\b", r"\bkubernetes\b", r"\bdocker\b",
    ],
    PromptCategory.TRANSLATION: [
        r"\btranslat\b", r"\bin (french|spanish|german|japanese|chinese|hindi|arabic)\b",
        r"\bto (french|spanish|german|japanese|chinese|hindi|arabic)\b",
        r"\blanguage\b",
    ],
    PromptCategory.MEETING_NOTES: [
        r"\bmeeting\b", r"\bminutes\b", r"\bagenda\b", r"\baction items\b",
        r"\btranscript\b", r"\bdiscussion\b", r"\bsummariz.*meeting\b",
    ],
    PromptCategory.SUMMARIZATION: [
        r"\bsummariz\b", r"\bsummary\b", r"\btl;?dr\b", r"\bkey points\b",
        r"\bbullet points\b", r"\bshorten\b", r"\bcondense\b", r"\babstract\b",
    ],
}


class PromptClassifier:
    """
    Classifies a prompt into one of 10 predefined categories.
    Uses regex keyword matching with a confidence score based on match density.
    """

    def classify(self, prompt: str) -> tuple[PromptCategory, float]:
        """
        Classify the prompt.

        Returns:
            Tuple of (category, confidence) where confidence is 0.0–1.0.
        """
        text = prompt.lower()
        scores: dict[PromptCategory, int] = {}

        for category, patterns in CATEGORY_KEYWORDS.items():
            match_count = sum(1 for pattern in patterns if re.search(pattern, text))
            if match_count > 0:
                scores[category] = match_count

        if not scores:
            return PromptCategory.OTHER, 0.3

        # Sort by match count descending
        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        best_category, best_count = ranked[0]

        # Confidence: ratio of matches to total patterns for that category
        total_patterns = len(CATEGORY_KEYWORDS[best_category])
        confidence = min(0.95, 0.4 + (best_count / total_patterns) * 0.6)

        return best_category, round(confidence, 2)
