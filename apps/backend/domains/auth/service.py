"""
AI360 – Auth Domain Service
Handles Firebase token verification, user lookup/creation, and JWT issuance.
"""
import logging
from datetime import timedelta

from firebase_admin import auth as firebase_auth
from google.cloud.firestore import Client as FirestoreClient

from core.firebase import Collections
from core.jwt import create_access_token
from config import get_settings
from domains.auth.schemas import UserProfile, UserRole, LoginResponse

logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self, db: FirestoreClient):
        self.db = db
        self.settings = get_settings()

    async def login_with_firebase_token(self, id_token: str) -> LoginResponse:
        """
        Verify a Firebase ID token, look up or create the user in Firestore,
        and return a JWT access token along with the user profile.
        """
        # 1. Verify Firebase token
        try:
            decoded = firebase_auth.verify_id_token(id_token)
        except firebase_auth.InvalidIdTokenError as e:
            raise ValueError(f"Invalid Firebase token: {e}")

        uid = decoded["uid"]
        email = decoded.get("email", "")
        display_name = decoded.get("name", email.split("@")[0])
        photo_url = decoded.get("picture")

        # 2. Look up or create user document in Firestore
        user_ref = self.db.collection(Collections.USERS).document(uid)
        user_doc = user_ref.get()

        if user_doc.exists:
            user_data = user_doc.to_dict()
        else:
            # First-time login: create user with default EMPLOYEE role
            user_data = {
                "id": uid,
                "email": email,
                "displayName": display_name,
                "photoURL": photo_url,
                "role": UserRole.EMPLOYEE.value,
                "organizationId": "",  # Assigned by admin later
                "departmentId": None,
                "teamId": None,
                "isActive": True,
                "createdAt": firestore_server_timestamp(),
                "updatedAt": firestore_server_timestamp(),
            }
            user_ref.set(user_data)
            logger.info(f"New user created: {uid} ({email})")

        user_profile = UserProfile(
            id=uid,
            email=email,
            display_name=display_name,
            photo_url=photo_url,
            role=UserRole(user_data.get("role", UserRole.EMPLOYEE.value)),
            organization_id=user_data.get("organizationId", ""),
            department_id=user_data.get("departmentId"),
            team_id=user_data.get("teamId"),
            is_active=user_data.get("isActive", True),
        )

        # 3. Create JWT with user claims
        token_data = {
            "sub": uid,
            "email": email,
            "role": user_profile.role.value,
            "org_id": user_profile.organization_id,
            "dept_id": user_profile.department_id,
            "team_id": user_profile.team_id,
        }
        access_token = create_access_token(token_data)
        expire_seconds = self.settings.jwt_expire_minutes * 60

        return LoginResponse(access_token=access_token, expires_in=expire_seconds, user=user_profile)


def firestore_server_timestamp():
    from google.cloud.firestore import SERVER_TIMESTAMP
    return SERVER_TIMESTAMP
