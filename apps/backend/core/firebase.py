"""
AI360 Backend – Firebase Admin SDK Initialization
Provides a singleton Firestore client and Auth client.
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

    if settings.firebase_project_id and settings.firebase_private_key:
        # Use service account credentials from environment
        cred = credentials.Certificate({
            "type": "service_account",
            "project_id": settings.firebase_project_id,
            "private_key_id": settings.firebase_private_key_id,
            "private_key": settings.firebase_private_key.replace("\\n", "\n"),
            "client_email": settings.firebase_client_email,
            "client_id": settings.firebase_client_id,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        })
        firebase_admin.initialize_app(cred)
        logger.info("Firebase initialized with service account credentials.")
    else:
        # Application Default Credentials (local dev with gcloud CLI)
        firebase_admin.initialize_app()
        logger.warning("Firebase initialized with Application Default Credentials. Set env vars for production.")


@lru_cache
def get_firestore() -> FirestoreClient:
    """Return cached Firestore client."""
    initialize_firebase()
    return firestore.client()


def verify_firebase_token(id_token: str) -> dict:
    """
    Verify a Firebase ID token and return the decoded claims.
    Raises firebase_admin.auth.InvalidIdTokenError on failure.
    """
    initialize_firebase()
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
