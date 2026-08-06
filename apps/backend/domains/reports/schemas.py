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
