"""
Authentication API Routes - Supabase Auth

Endpoints:
- POST /api/auth/signup - Register new user
- POST /api/auth/signin - Login user
- POST /api/auth/signout - Logout user
- GET  /api/auth/me - Get current user
- POST /api/auth/reset-password - Send password reset email
- DELETE /api/auth/delete-account - Delete user account and data
- GET  /api/auth/status - Check if auth is configured
"""

from fastapi import APIRouter, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
from backend.app.services.supabase_client import (
    sign_up, sign_in, sign_out, get_user, reset_password,
    is_configured, SUPABASE_SCHEMA, delete_user_profile, delete_chat_history
)

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# Request Models
# ─────────────────────────────────────────────────────────────────────────────

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str

class SignInRequest(BaseModel):
    email: EmailStr
    password: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/status")
async def auth_status():
    """Check if Supabase authentication is configured."""
    return {
        "configured": is_configured(),
        "message": "Supabase is ready" if is_configured() else "Add SUPABASE_URL and SUPABASE_ANON_KEY to .env"
    }


@router.get("/setup-guide")
async def setup_guide():
    """Instructions for setting up Supabase."""
    return {
        "steps": [
            "1. Go to https://supabase.com and create a free account",
            "2. Create a new project (note: it takes ~2 minutes to set up)",
            "3. Go to Settings > API",
            "4. Copy 'Project URL' → add as SUPABASE_URL in .env",
            "5. Copy 'anon public' key → add as SUPABASE_ANON_KEY in .env",
            "6. Go to SQL Editor and run the schema below to create tables",
            "7. Restart your backend server"
        ],
        "schema_sql": SUPABASE_SCHEMA
    }


@router.post("/signup")
async def register(request: SignUpRequest):
    """
    Register a new user.
    Returns user info and sends confirmation email.
    """
    return await sign_up(request.email, request.password)


@router.post("/signin")
async def login(request: SignInRequest):
    """
    Sign in an existing user.
    Returns access token and refresh token.
    """
    return await sign_in(request.email, request.password)


@router.post("/signout")
async def logout(authorization: Optional[str] = Header(None)):
    """Sign out the current user."""
    token = authorization.replace("Bearer ", "") if authorization else ""
    return await sign_out(token)


@router.get("/me")
async def current_user(authorization: Optional[str] = Header(None)):
    """
    Get current user info from access token.
    Pass token as: Authorization: Bearer <access_token>
    """
    if not authorization:
        return {"error": "No authorization header"}

    token = authorization.replace("Bearer ", "")
    return await get_user(token)


@router.post("/reset-password")
async def request_password_reset(request: ResetPasswordRequest):
    """Send password reset email to user."""
    return await reset_password(request.email)


@router.delete("/delete-account")
async def delete_account(authorization: Optional[str] = Header(None)):
    """
    Delete user account and all associated data.
    This action is irreversible.
    """
    if not authorization:
        return {"error": "No authorization header"}

    token = authorization.replace("Bearer ", "")

    # Get user info first
    user_info = await get_user(token)
    if "error" in user_info:
        return user_info

    user_id = user_info.get("user_id")
    if not user_id:
        return {"error": "Could not get user ID"}

    # Delete user profile data
    profile_result = await delete_user_profile(user_id)

    # Delete chat history
    chat_result = await delete_chat_history(user_id)

    return {
        "success": True,
        "message": "Account data deleted successfully. Please sign out.",
        "details": {
            "profile": profile_result,
            "chat_history": chat_result
        }
    }
