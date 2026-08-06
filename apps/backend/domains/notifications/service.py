"""
AI360 – Notifications Service
"""
import logging
from typing import List
from datetime import datetime, timezone
import uuid
from google.cloud import firestore
from domains.notifications.schemas import NotificationSchema, NotificationType, Priority
from core.firebase import Collections

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self, db: firestore.Client):
        self.db = db

    def create_notification(self, notification: NotificationSchema):
        """
        Creates a notification in Firestore.
        """
        doc_ref = self.db.collection(Collections.NOTIFICATIONS).document(notification.id)
        doc_ref.set(notification.dict())
        logger.info(f"Created notification for user {notification.user_id}: {notification.title}")

    def get_user_notifications(self, user_id: str, unread_only: bool = False) -> List[NotificationSchema]:
        """
        Fetches notifications for a given user.
        """
        query = self.db.collection(Collections.NOTIFICATIONS).where("user_id", "==", user_id)
        if unread_only:
            query = query.where("is_read", "==", False)
            
        # Stub logic to return an empty list or mock data if db is empty
        docs = query.order_by("created_at", direction=firestore.Query.DESCENDING).limit(50).stream()
        results = [NotificationSchema(**doc.to_dict()) for doc in docs]
        
        # Return mock data if none exist to support frontend development
        if not results:
            return [
                NotificationSchema(
                    id=str(uuid.uuid4()),
                    type=NotificationType.SYSTEM,
                    priority=Priority.LOW,
                    user_id=user_id,
                    title="Welcome to AI360",
                    message="Your AI productivity journey starts here.",
                    is_read=False,
                    created_at=datetime.now(timezone.utc).isoformat()
                )
            ]
        return results

    def mark_as_read(self, notification_id: str):
        """
        Marks a specific notification as read.
        """
        doc_ref = self.db.collection(Collections.NOTIFICATIONS).document(notification_id)
        doc_ref.update({"is_read": True})
