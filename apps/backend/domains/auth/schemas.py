"""
AI360 – Auth Domain Schemas
"""
from pydantic import BaseModel, EmailStr
from enum import Enum


class UserRole(str, Enum):
    EMPLOYEE = "EMPLOYEE"
    MANAGER = "MANAGER"
    ADMIN = "ADMIN"
    EXECUTIVE = "EXECUTIVE"


class LoginRequest(BaseModel):
    id_token: str


class UserProfile(BaseModel):
    id: str
    email: str
    display_name: str
    photo_url: str | None = None
    role: UserRole
    organization_id: str
    department_id: str | None = None
    team_id: str | None = None
    is_active: bool = True


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    expires_in: int  # seconds
    user: UserProfile


class LogoutResponse(BaseModel):
    message: str = "Logged out successfully"
