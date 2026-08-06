"""
AI360 – Organizations HTTP Router
"""
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException

from core.rbac import get_current_user, CurrentUser, require_roles
from core.firebase import get_firestore
from domains.organizations.schemas import OrganizationCreate, OrganizationResponse, DepartmentCreate, DepartmentResponse, AIProviderConfig
from domains.organizations.service import OrganizationService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/organizations", tags=["Organizations"])

@router.post("", response_model=OrganizationResponse, dependencies=[Depends(require_roles(["ADMIN"]))])
async def create_organization(
    org: OrganizationCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    service = OrganizationService(db)
    return service.create_organization(org)

@router.get("/{org_id}", response_model=OrganizationResponse, dependencies=[Depends(require_roles(["ADMIN"]))])
async def get_organization(
    org_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    service = OrganizationService(db)
    org = service.get_organization(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org

@router.post("/{org_id}/departments", response_model=DepartmentResponse, dependencies=[Depends(require_roles(["ADMIN"]))])
async def create_department(
    org_id: str,
    dept: DepartmentCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    service = OrganizationService(db)
    return service.create_department(org_id, dept)

@router.get("/{org_id}/departments", response_model=List[DepartmentResponse], dependencies=[Depends(require_roles(["ADMIN", "MANAGER", "EXECUTIVE"]))])
async def get_departments(
    org_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    service = OrganizationService(db)
    return service.get_departments(org_id)

@router.put("/{org_id}/providers", dependencies=[Depends(require_roles(["ADMIN"]))])
async def update_providers(
    org_id: str,
    config: AIProviderConfig,
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    service = OrganizationService(db)
    return service.update_provider_config(org_id, config)
