"""
AI360 – FinOps Domain Schemas
"""
from pydantic import BaseModel
from typing import List

class BudgetAlertRequest(BaseModel):
    department_id: str
    target_date: str

class ChargebackReportResponse(BaseModel):
    department_id: str
    department_name: str
    total_spend_usd: float
    total_tokens: int
    budget_limit_usd: float
    utilization_percentage: float

class CostAdvisorResponse(BaseModel):
    period: str = "Yesterday"
    department: str
    spent_formatted: str
    spent_usd: float
    potential_saving_formatted: str
    potential_saving_usd: float
    recommendation: str
    action_type: str = "switch_model"
    target_model: str = "Gemini Flash"

class ROICalculateRequest(BaseModel):
    hours_saved: float = 1250.0
    hourly_cost_rate: float = 60.0
    ai_cost_incurred: float = 15800.0

class ROICalculateResponse(BaseModel):
    hours_saved: float
    hourly_cost_rate: float
    business_value_generated: float
    ai_cost_incurred: float
    net_roi: float
    net_roi_percentage: float
    formula_string: str


