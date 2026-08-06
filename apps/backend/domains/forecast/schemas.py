"""
AI360 – Forecast Domain Schemas
"""
from pydantic import BaseModel
from typing import List, Optional

class ForecastPoint(BaseModel):
    date: str
    predicted_cost_usd: float
    lower_bound: float
    upper_bound: float

class ForecastResponse(BaseModel):
    id: str
    target_id: str
    target_type: str  # employee, department, organization
    generated_at: str
    forecast_7d: List[ForecastPoint]
    forecast_30d: List[ForecastPoint]
    forecast_90d: List[ForecastPoint]
    monthly_budget_usd: Optional[float] = None
    budget_exceeded_date: Optional[str] = None

class OLSForecastPoint(BaseModel):
    day_or_month: str
    historical_cost: Optional[float] = None
    projected_cost: Optional[float] = None
    historical_tokens: Optional[int] = None
    projected_tokens: Optional[int] = None

class OLSRegressionRequest(BaseModel):
    historical_costs: List[float] = [1200.0, 1450.0, 1580.0, 1720.0, 1890.0, 2100.0]

class OLSRegressionResponse(BaseModel):
    slope: float
    intercept: float
    r_squared: float
    forecast_points: List[OLSForecastPoint]
    roadmap_note: str

