"""
AI360 – Reports Domain Schemas
"""
from pydantic import BaseModel
from typing import Optional

class ReportRequest(BaseModel):
    target_id: str
    target_type: str
    format: str = 'pdf' # pdf, excel, csv
    period: str = '30d'

class ReportResponse(BaseModel):
    download_url: str
    expires_at: str
    id: Optional[str] = None
    title: Optional[str] = None
    type: Optional[str] = None
    format: Optional[str] = None

class ReportListItem(BaseModel):
    """A single row in the 'Recent Reports' list (GET /reports)."""
    id: str
    title: str
    type: str
    format: str
    generated_at: str
