"""
AI360 – Notifications HTTP Router
"""
import logging
from typing import List
from fastapi import APIRouter, Depends

from core.rbac import get_current_user, CurrentUser, require_roles
from core.firebase import get_firestore
from domains.notifications.schemas import NotificationSchema
from domains.notifications.service import NotificationService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationSchema], dependencies=[Depends(require_roles(["EMPLOYEE", "MANAGER", "ADMIN", "EXECUTIVE"]))])
async def get_notifications(
    unread_only: bool = False,
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    """
    Returns notifications for the authenticated user.
    """
    service = NotificationService(db)
    return service.get_user_notifications(current_user.user_id, unread_only)

@router.post("/{notification_id}/read", dependencies=[Depends(require_roles(["EMPLOYEE", "MANAGER", "ADMIN", "EXECUTIVE"]))])
async def mark_notification_read(
    notification_id: str,
    db = Depends(get_firestore)
):
    """
    Marks a notification as read.
    """
    service = NotificationService(db)
    service.mark_as_read(notification_id)
    return {"status": "success"}
