"""
AI360 – Reports HTTP Router
"""
import logging
from fastapi import APIRouter, Depends

from core.rbac import get_current_user, CurrentUser, require_roles
from core.firebase import get_firestore
from domains.reports.schemas import ReportRequest, ReportResponse
from domains.reports.service import ReportService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/generate", response_model=ReportResponse, dependencies=[Depends(require_roles(["MANAGER", "ADMIN", "EXECUTIVE"]))])
async def generate_report(
    request: ReportRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    """
    Generates an asynchronous export of analytics data.
    Returns a download URL pointing to a storage bucket.
    """
    service = ReportService(db)
    return service.generate_report(request.target_id, request.target_type, request.format, request.period)


@router.get("/{report_type}", response_model=ReportResponse, dependencies=[Depends(require_roles(["MANAGER", "ADMIN", "EXECUTIVE", "EMPLOYEE"]))])
async def download_report_type(
    report_type: str,
    format: str = "pdf",
    period: str = "30d",
    target_id: str = "org_123",
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    """
    Returns download link or exportable analytical summary for the requested report type and format.
    """
    service = ReportService(db)
    return service.generate_report(target_id, report_type, format, period)
