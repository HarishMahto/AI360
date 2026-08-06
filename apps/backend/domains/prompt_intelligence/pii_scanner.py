"""
AI360 – Sensitive Data Scanner (PII Scanner)
Detects emails, API keys, secrets, passwords, PII, and URLs with credentials.
Warns users before submission to protect sensitive company information.
"""
import re
from domains.prompt_intelligence.schemas import SensitiveDataFinding, SensitiveDataType

# Regex patterns for each sensitive data type
_PATTERNS: list[tuple[SensitiveDataType, str]] = [
    # Email addresses
    (SensitiveDataType.EMAIL, r'\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b'),
    # API keys (generic: starts with common prefixes + 20+ alphanumeric chars)
    (SensitiveDataType.API_KEY, r'\b(?:sk-|AIza|AKIA|ya29\.|ghp_|glpat-|xoxb-|xoxp-)[A-Za-z0-9\-_]{10,}\b'),
    # Bearer tokens / JWT
    (SensitiveDataType.SECRET_TOKEN, r'\b(?:Bearer |token[=:]\s*)([A-Za-z0-9\-_.~+/]{20,})\b'),
    # URLs with embedded credentials: http://user:pass@host
    (SensitiveDataType.URL_WITH_CREDENTIALS, r'https?://[^:@\s]+:[^@\s]+@[^\s]+'),
    # US Social Security Numbers
    (SensitiveDataType.PII_SSN, r'\b\d{3}-\d{2}-\d{4}\b'),
    # Credit card numbers (Visa, MC, Amex, Discover)
    (SensitiveDataType.PII_CREDIT_CARD, r'\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6011[0-9]{12})\b'),
    # US/International phone numbers
    (SensitiveDataType.PII_PHONE, r'\b(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b'),
    # SAP credentials specifically
    (SensitiveDataType.SAP_PASSWORD, r'SAP\s+password\s+(?:is\s+|=)?[^\s",;]{4,}'),
    # Customer names / account references
    (SensitiveDataType.CUSTOMER_NAME, r'\b(?:Customer|Client)[\s:]+[A-Za-z0-9\-_]{2,}\b'),
    # Enterprise Secrets
    (SensitiveDataType.ENTERPRISE_SECRET, r'\b(?:secret_key|api_secret|auth_token)[\s=:"]+[^\s",;]{6,}'),
    # Passwords: common patterns like password=xyz, pass: abc
    (SensitiveDataType.PASSWORD, r'(?:password|passwd|pwd|secret)[\s=:"]+[^\s",;]{6,}'),
]


def _mask_value(value: str) -> str:
    """
    Partially mask a sensitive value.
    Shows first 3 and last 2 chars; masks the middle.
    """
    if len(value) <= 6:
        return "***"
    return value[:3] + "*" * (len(value) - 5) + value[-2:]


class SensitiveDataScanner:
    """
    Scans prompt text for sensitive data patterns.
    Returns a list of findings with type, masked value, and position.
    """

    def scan(self, text: str) -> list[SensitiveDataFinding]:
        """
        Scan text for sensitive data patterns.

        Args:
            text: The prompt text to scan.

        Returns:
            List of SensitiveDataFinding objects (empty list if nothing detected).
        """
        findings: list[SensitiveDataFinding] = []
        seen_spans: set[tuple[int, int]] = set()

        for data_type, pattern in _PATTERNS:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                start, end = match.start(), match.end()
                # Deduplicate overlapping matches
                if any(s <= start < e or s < end <= e for s, e in seen_spans):
                    continue
                seen_spans.add((start, end))
                findings.append(SensitiveDataFinding(
                    type=data_type,
                    masked_value=_mask_value(match.group()),
                    start_index=start,
                    end_index=end,
                ))

        return findings

    def is_safe(self, text: str) -> bool:
        """Return True if no sensitive data is detected."""
        return len(self.scan(text)) == 0

    def mask_prompt(self, text: str, findings: list[SensitiveDataFinding]) -> str:
        """
        Replaces all detected sensitive spans in text with standardized masks.
        """
        if not findings:
            return text

        sorted_findings = sorted(findings, key=lambda f: f.start_index, reverse=True)
        masked = text
        for f in sorted_findings:
            if f.type == SensitiveDataType.CUSTOMER_NAME:
                replacement = "[MASKED_CUSTOMER_ID]"
            elif f.type in [SensitiveDataType.PASSWORD, SensitiveDataType.SAP_PASSWORD]:
                replacement = "[MASKED_PASSWORD]"
            elif f.type == SensitiveDataType.API_KEY:
                replacement = "[MASKED_API_KEY]"
            elif f.type in [SensitiveDataType.SECRET_TOKEN, SensitiveDataType.ENTERPRISE_SECRET]:
                replacement = "[MASKED_SECRET]"
            else:
                replacement = f"[MASKED_{f.type.value}]"
            masked = masked[:f.start_index] + replacement + masked[f.end_index:]
        return masked

