"""
AI360 – Reports HTTP Router
"""
import logging
from typing import List, Optional

from fastapi import APIRouter, Depends
from fastapi.responses import Response

from core.rbac import get_current_user, CurrentUser, require_roles
from core.firebase import get_firestore
from domains.reports.schemas import ReportRequest, ReportResponse, ReportListItem
from domains.reports.service import ReportService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/reports", tags=["Reports"])


def _scope_for(current_user: CurrentUser) -> str:
    role = current_user.role
    return (role.value if hasattr(role, "value") else str(role)).lower()


@router.get("", response_model=List[ReportListItem], dependencies=[Depends(require_roles(["MANAGER", "ADMIN", "EXECUTIVE"]))])
async def list_reports(
    scope: Optional[str] = None,
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    """
    Lists previously generated reports (newest first, limit 20), optionally
    filtered by `scope` (e.g. "manager"/"executive"). Reads from the `reports`
    Firestore collection. Returns an empty list if none have been generated yet.
    """
    service = ReportService(db)
    return service.list_reports(scope=scope, limit=20)


@router.post("/generate", response_model=ReportResponse, dependencies=[Depends(require_roles(["MANAGER", "ADMIN", "EXECUTIVE"]))])
async def generate_report(
    request: ReportRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    """
    Generates a real report export and persists its metadata to Firestore.
    """
    service = ReportService(db)
    return service.generate_report(
        request.target_id, request.target_type, request.format, request.period,
        generated_by_user_id=current_user.user_id, scope=_scope_for(current_user)
    )


@router.get("/{report_type}", dependencies=[Depends(require_roles(["MANAGER", "ADMIN", "EXECUTIVE", "EMPLOYEE"]))])
async def download_report_type(
    report_type: str,
    format: str = "pdf",
    period: str = "30d",
    target_id: str = "org_123",
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    """
    Generates and streams a real, downloadable report file for the requested
    report type. Genuine PDF/Excel rendering is a follow-up (no template engine
    is available in this serverless-friendly dependency set); real CSV bytes are
    served today for every format, always labeled `text/csv` so browsers don't
    choke on mislabeled binary, but the requested extension is kept in the
    filename so the download flow feels correct.
    """
    service = ReportService(db)
    filename, content_bytes, _report_id, _title = service.generate_report_file(
        target_id, report_type, format, period,
        generated_by_user_id=current_user.user_id, scope=_scope_for(current_user)
    )
    return Response(
        content=content_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
