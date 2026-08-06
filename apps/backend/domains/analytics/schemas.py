"""
AI360 – Analytics Domain Schemas
"""
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import date
from domains.prompt_intelligence.schemas import PromptCategory
from domains.ai_gateway.models import AIModel

class EmployeeDashboardResponse(BaseModel):
    today_stats: dict
    week_stats: dict
    adoption_score: float
    efficiency_score: float
    recent_history: list
    recommendations: list
    category_breakdown: dict
    daily_trend: list

class ManagerDashboardResponse(BaseModel):
    today_spend_usd: float
    month_spend_usd: float
    team_adoption_score: float
    team_efficiency_score: float
    team_members: list
    department_cost_breakdown: dict
    token_trend: list
    cost_trend: list
    category_breakdown: dict
    model_usage: dict
    top_tasks: list
    recommendations: list
    forecast_30d: list

class ExecutiveDashboardResponse(BaseModel):
    organization_spend_monthly_trend: list
    roi_metrics: dict
    department_ranking: list
    adoption_heatmap: dict
    forecast_projections: dict
    savings_estimate_usd: float
    executive_kpis: dict

class AggregateRequest(BaseModel):
    target_date: Optional[str] = None  # YYYY-MM-DD

class TeamBenchmarkResponse(BaseModel):
    team_name: str
    score: int
    status: str
    primary_strength: str
    improvement_focus: str
    coaching_signal: Optional[str] = None

class MaturityLevelDetail(BaseModel):
    level_number: int
    level_name: str
    description: str
    quarter_achieved: str
    status: str
    key_milestone: str

class MaturityScoreResponse(BaseModel):
    current_level: int = 4
    current_level_name: str = "AI Native"
    maturity_index: int = 86
    ladder: List[MaturityLevelDetail]

class LeaderboardUser(BaseModel):
    rank: int
    name: str
    department: str
    category: str
    score_or_metric: str
    badge_title: str
    avatar_bg: str
    change_status: str

class LeaderboardResponse(BaseModel):
    top_prompt_writer: List[LeaderboardUser]
    top_ai_user: List[LeaderboardUser]
    most_improved: List[LeaderboardUser]
    most_efficient: List[LeaderboardUser]


