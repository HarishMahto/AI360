"""
AI360 – Auth Domain Router
Endpoints: POST /auth/login, POST /auth/logout
"""
from fastapi import APIRouter, Depends, HTTPException, status

from core.firebase import get_firestore
from core.rbac import get_current_user, CurrentUser
from domains.auth.schemas import LoginRequest, LoginResponse, LogoutResponse
from domains.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse, summary="Login with Firebase ID token")
async def login(request: LoginRequest, db=Depends(get_firestore)):
    """
    Exchange a Firebase ID token (from client SDK) for an AI360 JWT access token.
    Creates a new user profile on first login.
    """
    try:
        service = AuthService(db)
        return await service.login_with_firebase_token(request.id_token)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/logout", response_model=LogoutResponse, summary="Logout current user")
async def logout(current_user: CurrentUser = Depends(get_current_user)):
    """
    Logout endpoint. The client should discard its JWT token.
    Future: add token to a blocklist for immediate invalidation.
    """
    return LogoutResponse(message=f"User {current_user.email} logged out successfully")


@router.get("/me", summary="Get current user profile")
async def get_me(current_user: CurrentUser = Depends(get_current_user), db=Depends(get_firestore)):
    """Return the profile of the currently authenticated user."""
    from core.firebase import Collections
    user_doc = db.collection(Collections.USERS).document(current_user.user_id).get()
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    return user_doc.to_dict()
