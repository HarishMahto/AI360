"""
AI360 – Notifications Domain Schemas
"""
from pydantic import BaseModel
from typing import Optional
from enum import Enum

class NotificationType(str, Enum):
    BUDGET_EXCEEDED = 'BUDGET_EXCEEDED'
    BUDGET_WARNING = 'BUDGET_WARNING'
    NEW_RECOMMENDATION = 'NEW_RECOMMENDATION'
    PROMPT_WARNING = 'PROMPT_WARNING'
    DAILY_SUMMARY = 'DAILY_SUMMARY'
    SYSTEM = 'SYSTEM'

class Priority(str, Enum):
    LOW = 'LOW'
    MEDIUM = 'MEDIUM'
    HIGH = 'HIGH'
    CRITICAL = 'CRITICAL'

class NotificationSchema(BaseModel):
    id: str
    type: NotificationType
    priority: Priority
    user_id: str
    title: str
    message: str
    is_read: bool = False
    action_url: Optional[str] = None
    created_at: str
