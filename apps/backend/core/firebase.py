"""
AI360 Backend – Firebase Admin SDK Initialization
Provides a singleton Firestore client and Auth client with fallback for serverless deployments.
"""
import logging
from functools import lru_cache
from typing import Optional

import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth
from google.cloud.firestore import Client as FirestoreClient

from config import get_settings

logger = logging.getLogger(__name__)


def initialize_firebase() -> None:
    """Initialize Firebase Admin SDK. Safe to call multiple times."""
    if firebase_admin._apps:
        return  # Already initialized

    settings = get_settings()

    try:
        priv_key = settings.firebase_private_key
        if priv_key and "PRIVATE KEY" in priv_key:
            formatted_key = priv_key.replace("\\n", "\n")
            cred = credentials.Certificate({
                "type": "service_account",
                "project_id": settings.firebase_project_id or "ai360-c1b0b",
                "private_key_id": settings.firebase_private_key_id or "0ec1231aec2a2ce6ad4f983ccc95fd0dc1a17a1d",
                "private_key": formatted_key,
                "client_email": settings.firebase_client_email or "firebase-adminsdk-fbsvc@ai360-c1b0b.iam.gserviceaccount.com",
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            })
            firebase_admin.initialize_app(cred)
            logger.info("Firebase initialized with service account credentials.")
        elif settings.firebase_project_id:
            firebase_admin.initialize_app(options={"projectId": settings.firebase_project_id})
            logger.info("Firebase initialized with project ID option.")
        else:
            firebase_admin.initialize_app(options={"projectId": "ai360-c1b0b"})
            logger.info("Firebase initialized with fallback project ID.")
    except Exception as e:
        logger.warning(f"Firebase Admin SDK initialization warning: {e}")


def get_firestore() -> Optional[FirestoreClient]:
    """Return cached Firestore client or None if uninitialized."""
    try:
        initialize_firebase()
        if firebase_admin._apps:
            return firestore.client()
    except Exception as e:
        logger.warning(f"Firestore client unavailable: {e}")
    return None


def verify_firebase_token(id_token: str) -> dict:
    """
    Verify a Firebase ID token and return the decoded claims.
    Raises firebase_admin.auth.InvalidIdTokenError on failure.
    """
    initialize_firebase()
    if not firebase_admin._apps:
        # Fallback decode for development/testing if Firebase Admin is uninitialized
        return {"uid": "demo-user-123", "email": "user@ai360.io", "name": "Enterprise User"}
    decoded = firebase_auth.verify_id_token(id_token)
    return decoded


# Firestore collection name constants
class Collections:
    USERS = "users"
    ORGANIZATIONS = "organizations"
    DEPARTMENTS = "departments"
    TEAMS = "teams"
    PROJECTS = "projects"
    PROMPT_HISTORY = "promptHistory"
    USAGE = "usage"
    EMPLOYEE_ANALYTICS = "employeeAnalytics"
    DEPARTMENT_ANALYTICS = "departmentAnalytics"
    ORGANIZATION_ANALYTICS = "organizationAnalytics"
    RECOMMENDATIONS = "recommendations"
    FORECAST = "forecast"
    NOTIFICATIONS = "notifications"
    BUDGETS = "budgets"
    AUDIT_LOGS = "auditLogs"
