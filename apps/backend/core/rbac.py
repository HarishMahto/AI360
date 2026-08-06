"""
AI360 Backend – Role-Based Access Control
FastAPI dependency functions for protecting endpoints by user role.
"""
from enum import Enum
from typing import List

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from core.jwt import decode_access_token
from core.firebase import get_firestore, Collections

bearerscheme = HTTPBearer(auto_error=True)


class UserRole(str, Enum):
    EMPLOYEE = "EMPLOYEE"
    MANAGER = "MANAGER"
    ADMIN = "ADMIN"
    EXECUTIVE = "EXECUTIVE"


# Role hierarchy for permission checking
ROLE_HIERARCHY: dict[UserRole, int] = {
    UserRole.EMPLOYEE: 1,
    UserRole.MANAGER: 2,
    UserRole.EXECUTIVE: 3,
    UserRole.ADMIN: 4,
}


class CurrentUser:
    """Represents the authenticated user extracted from JWT."""
    def __init__(self, user_id: str, email: str, role: UserRole, organization_id: str,
                 department_id: str | None = None, team_id: str | None = None):
        self.user_id = user_id
        self.email = email
        self.role = role
        self.organization_id = organization_id
        self.department_id = department_id
        self.team_id = team_id

    def has_role(self, *roles) -> bool:
        flat_roles = []
        for r in roles:
            if isinstance(r, (list, tuple)):
                flat_roles.extend([x.value if hasattr(x, "value") else str(x) for x in r])
            else:
                flat_roles.append(r.value if hasattr(r, "value") else str(r))
        user_role_str = self.role.value if hasattr(self.role, "value") else str(self.role)
        return user_role_str in flat_roles

    def has_min_role(self, min_role: UserRole) -> bool:
        return ROLE_HIERARCHY.get(self.role, 0) >= ROLE_HIERARCHY.get(min_role, 0)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearerscheme),
) -> CurrentUser:
    """
    FastAPI dependency: Extract and validate the current user from the Bearer token.
    Raises 401 if token is invalid, 403 if user not found.
    """
    payload = decode_access_token(credentials.credentials)
    user_id: str = payload.get("sub", "")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    return CurrentUser(
        user_id=user_id,
        email=payload.get("email", ""),
        role=UserRole(payload.get("role", "EMPLOYEE")),
        organization_id=payload.get("org_id", ""),
        department_id=payload.get("dept_id"),
        team_id=payload.get("team_id"),
    )


def require_roles(*roles):
    """
    FastAPI dependency factory: Require the current user to have one of the given roles.
    Usage: Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)) or Depends(require_roles(["ADMIN", "MANAGER"]))
    """
    flat_roles = []
    for r in roles:
        if isinstance(r, (list, tuple)):
            flat_roles.extend([x.value if hasattr(x, "value") else str(x) for x in r])
        else:
            flat_roles.append(r.value if hasattr(r, "value") else str(r))

    async def dependency(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        user_role_str = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
        if user_role_str not in flat_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {flat_roles}",
            )
        return current_user
    return dependency


def require_min_role(min_role: UserRole):
    """
    FastAPI dependency factory: Require the current user to have at least the given role level.
    """
    async def dependency(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if not current_user.has_min_role(min_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Minimum required role: {min_role.value}",
            )
        return current_user
    return dependency
