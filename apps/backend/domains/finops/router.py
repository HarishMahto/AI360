"""
AI360 – FinOps HTTP Router
Endpoints: GET /finops/chargeback
"""
import logging
from typing import List
from fastapi import APIRouter, Depends

from core.rbac import get_current_user, CurrentUser, require_roles
from core.firebase import get_firestore
from domains.finops.schemas import ChargebackReportResponse, CostAdvisorResponse, ROICalculateRequest, ROICalculateResponse
from domains.finops.service import FinOpsService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/finops", tags=["FinOps"])

@router.get("/chargeback", response_model=List[ChargebackReportResponse], dependencies=[Depends(require_roles(["ADMIN", "EXECUTIVE"]))])
async def get_chargeback_report(
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    """
    Returns the chargeback report for all departments.
    """
    service = FinOpsService(db)
    return service.generate_chargeback_report()

@router.get("/cost-advisor", response_model=CostAdvisorResponse)
async def get_cost_advisor_nudge(
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    """
    Returns the daily proactive cost-saving nudge based on yesterday's usage (Section 11.5.1).
    """
    service = FinOpsService(db)
    return service.generate_daily_cost_advisor_nudge()

@router.post("/roi-calculator", response_model=ROICalculateResponse)
async def calculate_roi(
    request: ROICalculateRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    """
    Returns precise Business Value Generated and Net ROI calculations (Section 11.3).
    """
    service = FinOpsService(db)
    return service.calculate_roi(request.hours_saved, request.hourly_cost_rate, request.ai_cost_incurred)


