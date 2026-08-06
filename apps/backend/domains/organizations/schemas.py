"""
AI360 – Organizations Domain Schemas
"""
from pydantic import BaseModel, EmailStr, HttpUrl
from typing import List, Optional

class OrganizationCreate(BaseModel):
    name: str
    admin_email: EmailStr
    slug: str
    default_model: str = "gpt-4o-mini"
    pii_detection_enabled: bool = True

class OrganizationResponse(OrganizationCreate):
    id: str
    created_at: str
    updated_at: str

class DepartmentCreate(BaseModel):
    name: str
    manager_email: Optional[EmailStr] = None
    monthly_budget_usd: Optional[float] = None

class DepartmentResponse(DepartmentCreate):
    id: str
    organization_id: str
    created_at: str

class AIProviderConfig(BaseModel):
    openai_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None
    claude_api_key: Optional[str] = None
