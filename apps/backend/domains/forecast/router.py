"""
AI360 – Forecast HTTP Router
"""
import logging
from typing import Optional
from fastapi import APIRouter, Depends

from core.rbac import get_current_user, CurrentUser, require_roles
from core.firebase import get_firestore
from domains.forecast.schemas import ForecastResponse, OLSRegressionRequest, OLSRegressionResponse
from domains.forecast.service import ForecastEngine

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/forecast", tags=["Forecast"])

@router.get("", response_model=ForecastResponse, dependencies=[Depends(require_roles(["MANAGER", "ADMIN", "EXECUTIVE"]))])
async def get_forecast(
    target_type: Optional[str] = None,
    target_id: Optional[str] = None,
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    """
    Returns the predicted forecast (spend & usage) for a given target.
    Defaults to the caller's own organization when no target is supplied, so
    Manager/Executive dashboards can call this endpoint without extra params.
    """
    if not target_type or not target_id:
        if current_user.department_id and (target_type or "department") == "department":
            target_type, target_id = "department", current_user.department_id
        else:
            target_type, target_id = "organization", current_user.organization_id

    engine = ForecastEngine(db)
    return engine.get_forecast(target_id, target_type)

@router.post("/ols-regression", response_model=OLSRegressionResponse)
async def get_ols_regression(
    request: OLSRegressionRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    """
    Section 11.3: Returns OLS time-series regression forecast with R-squared accuracy and ARIMA/Prophet roadmap readiness.
    """
    engine = ForecastEngine(db)
    return engine.generate_ols_forecast(request.historical_costs)

