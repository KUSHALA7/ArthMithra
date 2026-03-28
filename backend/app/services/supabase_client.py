"""
Supabase Service - Authentication & Database

To set up Supabase:
1. Go to https://supabase.com and create a free account
2. Create a new project
3. Get your credentials from: Settings > API
4. Add to .env:
   - SUPABASE_URL=https://your-project.supabase.co
   - SUPABASE_ANON_KEY=your-anon-key
   - SUPABASE_SERVICE_KEY=your-service-key (optional, for admin ops)
"""

from supabase import create_client, Client
from backend.app.config import settings
from typing import Optional
import json

# Initialize Supabase client (if configured)
supabase: Optional[Client] = None

if settings.supabase_url and settings.supabase_anon_key:
    supabase = create_client(settings.supabase_url, settings.supabase_anon_key)


def is_configured() -> bool:
    """Check if Supabase is configured."""
    return supabase is not None


# ─────────────────────────────────────────────────────────────────────────────
# AUTHENTICATION FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

async def sign_up(email: str, password: str) -> dict:
    """Register a new user."""
    if not supabase:
        return {"error": "Supabase not configured"}
    try:
        response = supabase.auth.sign_up({"email": email, "password": password})
        if response.user:
            return {
                "success": True,
                "user_id": response.user.id,
                "email": response.user.email,
                "message": "Check your email to confirm registration"
            }
        return {"error": "Registration failed"}
    except Exception as e:
        return {"error": str(e)}


async def sign_in(email: str, password: str) -> dict:
    """Sign in an existing user."""
    if not supabase:
        return {"error": "Supabase not configured"}
    try:
        response = supabase.auth.sign_in_with_password({"email": email, "password": password})
        if response.user:
            return {
                "success": True,
                "user_id": response.user.id,
                "email": response.user.email,
                "access_token": response.session.access_token,
                "refresh_token": response.session.refresh_token,
                "expires_at": response.session.expires_at
            }
        return {"error": "Invalid credentials"}
    except Exception as e:
        return {"error": str(e)}


async def sign_out(access_token: str) -> dict:
    """Sign out a user."""
    if not supabase:
        return {"error": "Supabase not configured"}
    try:
        supabase.auth.sign_out()
        return {"success": True, "message": "Signed out successfully"}
    except Exception as e:
        return {"error": str(e)}


async def get_user(access_token: str) -> dict:
    """Get current user from access token."""
    if not supabase:
        return {"error": "Supabase not configured"}
    try:
        response = supabase.auth.get_user(access_token)
        if response.user:
            return {
                "user_id": response.user.id,
                "email": response.user.email,
                "created_at": str(response.user.created_at)
            }
        return {"error": "Invalid token"}
    except Exception as e:
        return {"error": str(e)}


async def reset_password(email: str) -> dict:
    """Send password reset email."""
    if not supabase:
        return {"error": "Supabase not configured"}
    try:
        supabase.auth.reset_password_email(email)
        return {"success": True, "message": "Password reset email sent"}
    except Exception as e:
        return {"error": str(e)}


# ─────────────────────────────────────────────────────────────────────────────
# DATABASE FUNCTIONS - User Profiles
# ─────────────────────────────────────────────────────────────────────────────

async def save_user_profile(user_id: str, profile_data: dict) -> dict:
    """Save or update user financial profile."""
    if not supabase:
        return {"error": "Supabase not configured"}
    try:
        # Upsert (insert or update) the profile
        response = supabase.table("user_profiles").upsert({
            "user_id": user_id,
            "profile_data": json.dumps(profile_data),
            "updated_at": "now()"
        }, on_conflict="user_id").execute()

        if response.data:
            return {"success": True, "message": "Profile saved"}
        return {"error": "Failed to save profile"}
    except Exception as e:
        return {"error": str(e)}


async def get_user_profile(user_id: str) -> dict:
    """Get user financial profile."""
    if not supabase:
        return {"error": "Supabase not configured"}
    try:
        response = supabase.table("user_profiles").select("*").eq("user_id", user_id).single().execute()
        if response.data:
            profile = response.data
            return {
                "success": True,
                "profile": json.loads(profile.get("profile_data", "{}")),
                "updated_at": profile.get("updated_at")
            }
        return {"error": "Profile not found", "profile": {}}
    except Exception as e:
        return {"error": str(e), "profile": {}}


async def delete_user_profile(user_id: str) -> dict:
    """Delete user profile."""
    if not supabase:
        return {"error": "Supabase not configured"}
    try:
        supabase.table("user_profiles").delete().eq("user_id", user_id).execute()
        return {"success": True, "message": "Profile deleted"}
    except Exception as e:
        return {"error": str(e)}


# ─────────────────────────────────────────────────────────────────────────────
# DATABASE FUNCTIONS - Chat History
# ─────────────────────────────────────────────────────────────────────────────

async def save_chat_history(user_id: str, messages: list) -> dict:
    """Save user's chat history with AI mentor."""
    if not supabase:
        return {"error": "Supabase not configured"}
    try:
        response = supabase.table("chat_history").upsert({
            "user_id": user_id,
            "messages": json.dumps(messages),
            "updated_at": "now()"
        }, on_conflict="user_id").execute()

        if response.data:
            return {"success": True}
        return {"error": "Failed to save chat history"}
    except Exception as e:
        return {"error": str(e)}


async def get_chat_history(user_id: str) -> dict:
    """Get user's chat history."""
    if not supabase:
        return {"error": "Supabase not configured"}
    try:
        response = supabase.table("chat_history").select("*").eq("user_id", user_id).single().execute()
        if response.data:
            return {
                "success": True,
                "messages": json.loads(response.data.get("messages", "[]"))
            }
        return {"messages": []}
    except Exception as e:
        return {"error": str(e), "messages": []}


async def delete_chat_history(user_id: str) -> dict:
    """Delete user's chat history."""
    if not supabase:
        return {"error": "Supabase not configured"}
    try:
        supabase.table("chat_history").delete().eq("user_id", user_id).execute()
        return {"success": True, "message": "Chat history deleted"}
    except Exception as e:
        return {"error": str(e)}


# ─────────────────────────────────────────────────────────────────────────────
# SUPABASE TABLE SCHEMA (Run this in Supabase SQL Editor)
# ─────────────────────────────────────────────────────────────────────────────

SUPABASE_SCHEMA = """
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat History Table
CREATE TABLE IF NOT EXISTS chat_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    messages JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON user_profiles FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own chat" ON chat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat" ON chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat" ON chat_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat" ON chat_history FOR DELETE USING (auth.uid() = user_id);
"""
