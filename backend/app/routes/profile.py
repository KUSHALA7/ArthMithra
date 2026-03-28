"""
User Profile API Routes - Save/Load Financial Profiles

Endpoints:
- GET  /api/profile - Get current user's financial profile
- POST /api/profile - Save/update financial profile
- DELETE /api/profile - Delete profile
- GET  /api/profile/chat - Get chat history
- POST /api/profile/chat - Save chat history
"""

from fastapi import APIRouter, Header
from pydantic import BaseModel
from typing import Optional
from backend.app.services.supabase_client import (
    save_user_profile, get_user_profile, delete_user_profile,
    save_chat_history, get_chat_history, get_user, is_configured
)

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# Request Models
# ─────────────────────────────────────────────────────────────────────────────

class ProfileData(BaseModel):
    name: str = "User"
    age: int = 30
    city: str = "India"
    risk: str = "moderate"
    income: float = 0
    otherIncome: float = 0
    hra: float = 0
    rentPaid: float = 0
    expRent: float = 0
    expGroceries: float = 0
    expTransport: float = 0
    expFun: float = 0
    expOther: float = 0
    expEmi: float = 0
    mf: float = 0
    epf: float = 0
    fd: float = 0
    stocks: float = 0
    emergency: float = 0
    sip: float = 0
    termCover: float = 0
    healthCover: float = 0
    premium: float = 0
    invested80c: float = 0
    fireAge: int = 50
    goal: str = "fire"
    note: str = ""
    healthScore: int = 0


class ChatHistoryData(BaseModel):
    """Chat history with AI mentor."""
    messages: list[dict]


# ─────────────────────────────────────────────────────────────────────────────
# Helper to extract user from token
# ─────────────────────────────────────────────────────────────────────────────

async def get_user_id_from_token(authorization: str) -> Optional[str]:
    """Extract user_id from authorization header."""
    if not authorization:
        return None
    token = authorization.replace("Bearer ", "")
    user = await get_user(token)
    return user.get("user_id")


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/status")
async def profile_status():
    """Check if profile storage is available."""
    return {
        "configured": is_configured(),
        "message": "Database ready" if is_configured() else "Set up Supabase to enable profile saving"
    }


@router.get("")
async def get_profile(authorization: Optional[str] = Header(None)):
    """
    Get the current user's financial profile.
    Requires: Authorization: Bearer <access_token>
    """
    if not authorization:
        return {"error": "Not authenticated", "profile": {}}

    user_id = await get_user_id_from_token(authorization)
    if not user_id:
        return {"error": "Invalid token", "profile": {}}

    return await get_user_profile(user_id)


@router.post("")
async def save_profile(profile: ProfileData, authorization: Optional[str] = Header(None)):
    """
    Save/update the current user's financial profile.
    Requires: Authorization: Bearer <access_token>
    """
    if not authorization:
        return {"error": "Not authenticated"}

    user_id = await get_user_id_from_token(authorization)
    if not user_id:
        return {"error": "Invalid token"}

    return await save_user_profile(user_id, profile.model_dump())


@router.delete("")
async def delete_profile(authorization: Optional[str] = Header(None)):
    """
    Delete the current user's profile.
    Requires: Authorization: Bearer <access_token>
    """
    if not authorization:
        return {"error": "Not authenticated"}

    user_id = await get_user_id_from_token(authorization)
    if not user_id:
        return {"error": "Invalid token"}

    return await delete_user_profile(user_id)


@router.get("/chat")
async def get_chat(authorization: Optional[str] = Header(None)):
    """
    Get the current user's chat history with AI mentor.
    """
    if not authorization:
        return {"error": "Not authenticated", "messages": []}

    user_id = await get_user_id_from_token(authorization)
    if not user_id:
        return {"error": "Invalid token", "messages": []}

    return await get_chat_history(user_id)


@router.post("/chat")
async def save_chat(data: ChatHistoryData, authorization: Optional[str] = Header(None)):
    """
    Save the current user's chat history.
    """
    if not authorization:
        return {"error": "Not authenticated"}

    user_id = await get_user_id_from_token(authorization)
    if not user_id:
        return {"error": "Invalid token"}

    return await save_chat_history(user_id, data.messages)
