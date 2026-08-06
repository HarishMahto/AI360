"""
AI360 – Analytics HTTP Router
Endpoints: GET /dashboard/employee, POST /admin/aggregate
"""
import logging
from typing import List
from fastapi import APIRouter, Depends, BackgroundTasks

from core.rbac import get_current_user, CurrentUser, require_roles
from core.firebase import get_firestore
from domains.analytics.schemas import EmployeeDashboardResponse, ManagerDashboardResponse, ExecutiveDashboardResponse, AggregateRequest, TeamBenchmarkResponse, MaturityScoreResponse, LeaderboardResponse
from domains.analytics.service import AnalyticsService

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Analytics"])

@router.get("/dashboard/employee", response_model=EmployeeDashboardResponse)
async def get_employee_dashboard(
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    """
    Returns all data required to render the Employee Dashboard page.
    Combines today's live stats with historical aggregated stats.
    """
    service = AnalyticsService(db)
    return service.get_employee_dashboard_payload(current_user.user_id)

@router.get("/dashboard/manager", response_model=ManagerDashboardResponse, dependencies=[Depends(require_roles(["MANAGER", "ADMIN", "EXECUTIVE"]))])
async def get_manager_dashboard(
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    """Returns data required to render the Manager Dashboard."""
    service = AnalyticsService(db)
    return service.get_manager_dashboard_payload(current_user.user_id)

@router.get("/dashboard/executive", response_model=ExecutiveDashboardResponse, dependencies=[Depends(require_roles(["EXECUTIVE", "ADMIN"]))])
async def get_executive_dashboard(
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    """Returns data required to render the Executive Dashboard."""
    service = AnalyticsService(db)
    return service.get_executive_dashboard_payload()

@router.post("/admin/aggregate", dependencies=[Depends(require_roles(["ADMIN", "EXECUTIVE"]))])
async def trigger_aggregation(
    request: AggregateRequest,
    background_tasks: BackgroundTasks,
    db = Depends(get_firestore)
):
    """
    Manually trigger the daily aggregation job.
    Runs in the background. Admin only.
    """
    service = AnalyticsService(db)
    background_tasks.add_task(service.run_daily_aggregation, request.target_date)
    return {"message": "Aggregation job started in background."}

@router.get("/analytics/team-benchmarks", response_model=List[TeamBenchmarkResponse])
async def get_team_benchmarks(
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    """
    Returns AI proficiency benchmark scores and coaching signals across teams (Section 11.5.2).
    """
    service = AnalyticsService(db)
    return service.get_team_benchmarks()

@router.get("/analytics/maturity-score", response_model=MaturityScoreResponse)
async def get_maturity_score(
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    """
    Returns the organization's 4-level AI Maturity ladder and adoption score (Section 11.5.3).
    """
    service = AnalyticsService(db)
    return service.get_organization_maturity_score()

@router.get("/analytics/leaderboards", response_model=LeaderboardResponse)
async def get_leaderboards(
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    """
    Returns gamified leaderboard rankings across four categories (Section 11.4).
    """
    service = AnalyticsService(db)
    return service.get_gamification_leaderboards()


@router.get("/analytics/employee", summary="Get granular analytics for employee session")
async def get_employee_analytics(
    period: str = "30d",
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    service = AnalyticsService(db)
    return {"data": service.get_granular_employee_analytics(current_user.user_id, period)}


@router.get("/analytics/team", summary="Get team-level telemetry and usage distributions")
async def get_team_analytics(
    team_id: str = "engineering_team",
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    service = AnalyticsService(db)
    return {"data": service.get_granular_team_analytics(team_id)}


@router.get("/analytics/department", summary="Get department rankings and efficiency metrics")
async def get_department_analytics(
    department_id: str = "Engineering",
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    service = AnalyticsService(db)
    return {"data": service.get_granular_department_analytics(department_id)}


@router.get("/analytics/organization", summary="Get top-level enterprise AI adoption and FinOps summary")
async def get_org_analytics(
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    service = AnalyticsService(db)
    return {"data": service.get_granular_organization_analytics()}



