from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.services.ai import ask_ai
from backend.app.services.prompts import build_base_prompt, life_event_prompt

router = APIRouter()

class LifeEventRequest(BaseModel):
    profile: dict
    event: str = "bonus"
    amount: float = 0
    context: str = ""

@router.post("/advise")
async def advise_life_event(req: LifeEventRequest):
    """Generate personalised advice for a life event"""
    system = build_base_prompt(req.profile)
    user_msg = life_event_prompt(req.event, req.amount, req.context)
    ai_text = await ask_ai(system, user_msg)
    return {"advice": ai_text}
