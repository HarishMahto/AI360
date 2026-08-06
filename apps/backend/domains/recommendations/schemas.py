"""
AI360 – Recommendations Domain Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from domains.prompt_intelligence.schemas import PromptCategory
from enum import Enum

class RecommendationType(str, Enum):
    BETTER_PROMPT = 'BETTER_PROMPT'
    BETTER_MODEL = 'BETTER_MODEL'
    ESTIMATED_SAVINGS = 'ESTIMATED_SAVINGS'
    LEARNING = 'LEARNING'
    DEPARTMENT = 'DEPARTMENT'
    ORGANIZATION = 'ORGANIZATION'

class Priority(str, Enum):
    LOW = 'LOW'
    MEDIUM = 'MEDIUM'
    HIGH = 'HIGH'
    CRITICAL = 'CRITICAL'

class RecommendationResponse(BaseModel):
    id: str
    type: RecommendationType
    priority: Priority
    target_id: str
    target_type: str
    title: str
    description: str
    estimated_savings_usd: Optional[float] = None
    action_label: Optional[str] = None
    is_read: bool = False
    created_at: str

class ModelRoutingRequest(BaseModel):
    task_or_prompt: str = Field(min_length=1)

class ModelRoutingResponse(BaseModel):
    task_type: str
    recommended_model: str
    reasoning: str
    estimated_cost_per_1k_tokens: float
    latency_ms: int
    cost_savings_percent: int

class LearningRecommendation(BaseModel):
    course: str
    skill_target: str
    duration: str

class DepartmentRecommendation(BaseModel):
    target_team: str
    advice: str
    projected_impact: str

class SmartSuggestionsResponse(BaseModel):
    prompt_improvements: List[str]
    cost_reduction_tips: List[str]
    learning_recommendations: List[LearningRecommendation]
    department_recommendations: List[DepartmentRecommendation]

