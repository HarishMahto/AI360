"""
AI360 – Prompt Intelligence Domain Schemas
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class PromptCategory(str, Enum):
    CODING = "CODING"
    SQL = "SQL"
    EMAIL = "EMAIL"
    DOCUMENTATION = "DOCUMENTATION"
    RESEARCH = "RESEARCH"
    DEBUGGING = "DEBUGGING"
    ARCHITECTURE = "ARCHITECTURE"
    TRANSLATION = "TRANSLATION"
    MEETING_NOTES = "MEETING_NOTES"
    SUMMARIZATION = "SUMMARIZATION"
    OTHER = "OTHER"


class PromptScoreDetail(BaseModel):
    overall: float = Field(ge=0, le=100)
    clarity: float = Field(ge=0, le=100)
    context: float = Field(ge=0, le=100)
    specificity: float = Field(ge=0, le=100)
    structure: float = Field(ge=0, le=100)
    constraints: float = Field(ge=0, le=100)
    output_format: float = Field(ge=0, le=100)
    suggestions: List[str] = []


class SensitiveDataType(str, Enum):
    EMAIL = "EMAIL"
    PASSWORD = "PASSWORD"
    API_KEY = "API_KEY"
    SECRET_TOKEN = "SECRET_TOKEN"
    URL_WITH_CREDENTIALS = "URL_WITH_CREDENTIALS"
    PII_SSN = "PII_SSN"
    PII_CREDIT_CARD = "PII_CREDIT_CARD"
    PII_PHONE = "PII_PHONE"
    CUSTOMER_NAME = "CUSTOMER_NAME"
    SAP_PASSWORD = "SAP_PASSWORD"
    ENTERPRISE_SECRET = "ENTERPRISE_SECRET"


class SensitiveDataFinding(BaseModel):
    type: SensitiveDataType
    masked_value: str
    start_index: int
    end_index: int


class PromptScoreRequest(BaseModel):
    prompt: str = Field(min_length=1)


class PromptScoreResponse(BaseModel):
    score: PromptScoreDetail
    category: PromptCategory
    category_confidence: float
    sensitive_findings: List[SensitiveDataFinding] = []


class PromptOptimizeRequest(BaseModel):
    prompt: str = Field(min_length=1)
    category: Optional[PromptCategory] = None


class PromptRewrite(BaseModel):
    professional: str
    detailed: str
    concise: str
    technical: str
    business: str


class PromptOptimizeResponse(BaseModel):
    original_prompt: str
    optimized_prompt: str
    original_score: PromptScoreDetail
    estimated_improvement: float  # percentage
    rewrites: PromptRewrite
    sensitive_data_findings: List[SensitiveDataFinding] = []


class PromptClassifyRequest(BaseModel):
    prompt: str = Field(min_length=1)


class PromptClassifyResponse(BaseModel):
    category: PromptCategory
    confidence: float


class PrivacyMetadata(BaseModel):
    token_count: int
    model: str
    timestamp: str
    prompt_quality_score: float


class PrivacyLayerRequest(BaseModel):
    prompt: str = Field(min_length=1)
    allow_full_prompt_storage: bool = False
    target_model: Optional[str] = "gemini-1.5-flash"


class PrivacyLayerResponse(BaseModel):
    contains_sensitive_data: bool
    detected_types: List[str]
    masked_prompt: str
    warning_message: Optional[str] = None
    metadata: PrivacyMetadata
    stored_payload_type: str = "metadata_only"
    sensitive_findings: List[SensitiveDataFinding] = []


# ── Section 10.2 Employee Dashboard AI Engine Schemas ─────────────────────────

class FiveDimensionScore(BaseModel):
    clarity: float = Field(ge=0, le=100)
    context: float = Field(ge=0, le=100)
    specificity: float = Field(ge=0, le=100)
    format: float = Field(ge=0, le=100)
    use_of_examples: float = Field(ge=0, le=100)
    overall_score: int = Field(ge=0, le=100)


class TokenOptimizationDetail(BaseModel):
    current_tokens: int
    optimized_tokens: int
    savings_percent: int
    savings_label: str


class PromptCoachRequest(BaseModel):
    prompt: str = Field(min_length=1)
    model: Optional[str] = "gemini-1.5-flash"


class PromptCoachResponse(BaseModel):
    original_prompt: str
    suggestion: str
    optimized_prompt: str
    score_out_of_100: int
    dimensions: FiveDimensionScore
    token_optimizer: TokenOptimizationDetail


class ModelRecommendationSignal(BaseModel):
    signal: str
    recommendation: str
    estimated_saving: str
    action_type: str = "switch_model"
    target_model: str = "Gemini Flash"
    is_reversible: bool = True


class PromptHistoryItem(BaseModel):
    id: str
    user_id: str
    title: str
    prompt_text: str
    category: str
    prompt_score: int
    is_favorite: bool = False
    is_marketplace_template: bool = False
    uses_count: int = 1
    hours_saved: float = 0.5
    created_at: str


class PromptHistoryCreateRequest(BaseModel):
    title: str
    prompt_text: str
    category: str = "CODING"
    prompt_score: int = 82
    is_favorite: bool = False
    is_marketplace_template: bool = False


class PromptMarketplaceItem(BaseModel):
    id: str
    title: str
    star_rating: float
    star_display: str = "★★★★★"
    used_by_count: int
    hours_saved: float
    author_team: str
    category: str
    description: str
    prompt_template: str


class LearningCoachTip(BaseModel):
    tip: str
    description: str
    target_weakness: str


class LearningCoachResponse(BaseModel):
    current_pattern_summary: str
    score_trajectory: List[int] = [68, 72, 75, 78, 82]
    tips: List[LearningCoachTip]


class UsagePeriodSummary(BaseModel):
    period: str
    prompts: int
    tokens: str
    cost: str
    hours_saved: float


class SessionSummaryResponse(BaseModel):
    snapshots: List[UsagePeriodSummary]

