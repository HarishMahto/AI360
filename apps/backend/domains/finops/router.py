"""
AI360 – FinOps HTTP Router
Endpoints: GET /finops/chargeback
"""
import logging
from typing import List
from fastapi import APIRouter, Depends

from core.rbac import get_current_user, CurrentUser, require_roles
from core.firebase import get_firestore
from domains.finops.schemas import (
    ApplySuggestionRequest, ApplySuggestionResponse,
    ChargebackReportResponse, CostAdvisorResponse, ROICalculateRequest, ROICalculateResponse,
    LicenseSeatItem, ReallocateAllResponse,
)
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

@router.post("/cost-advisor/apply", response_model=ApplySuggestionResponse)
async def apply_cost_advisor_suggestion(
    request: ApplySuggestionRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    """
    Records that the manager applied today's Cost Advisor nudge (Section 11.5.1).
    """
    service = FinOpsService(db)
    return service.apply_cost_advisor_suggestion(
        current_user.user_id, request.department, request.action_type, request.target_model
    )

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


@router.get("/licenses/unused", response_model=List[LicenseSeatItem], dependencies=[Depends(require_roles(["MANAGER", "ADMIN", "EXECUTIVE"]))])
async def get_unused_licenses(
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    """
    Manager Dashboard "Unused Licenses" tab: seats inactive for 30+ days,
    read from Collections.LICENSE_SEATS.
    """
    service = FinOpsService(db)
    return service.get_unused_licenses()


@router.post("/licenses/{seat_id}/reallocate", response_model=LicenseSeatItem, dependencies=[Depends(require_roles(["MANAGER", "ADMIN", "EXECUTIVE"]))])
async def reallocate_license_seat(
    seat_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    """
    Marks a single unused license seat as reallocated.
    """
    service = FinOpsService(db)
    return service.reallocate_seat(seat_id)


@router.post("/licenses/reallocate-all", response_model=ReallocateAllResponse, dependencies=[Depends(require_roles(["MANAGER", "ADMIN", "EXECUTIVE"]))])
async def reallocate_all_license_seats(
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    """
    Batch-reallocates every inactive license seat ("Reallocate All Inactive Seats").
    """
    service = FinOpsService(db)
    count = service.reallocate_all_seats()
    return ReallocateAllResponse(reallocated_count=count)


