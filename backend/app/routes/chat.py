from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.services.ai import ask_ai_chat
from backend.app.services.prompts import build_base_prompt, CHAT_INTRO

router = APIRouter()

class ChatMessage(BaseModel):
    role: str   # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    profile: dict
    history: list[ChatMessage]

@router.post("/message")
async def chat_message(req: ChatRequest):
    """Send a chat message and get a personalised AI response."""
    system = build_base_prompt(req.profile) + "\n\n" + CHAT_INTRO
    history = [{"role": m.role, "content": m.content} for m in req.history]
    # Keep last 10 turns to stay within context limits
    history = history[-10:]
    ai_text = await ask_ai_chat(system, history)
    return {"reply": ai_text}
