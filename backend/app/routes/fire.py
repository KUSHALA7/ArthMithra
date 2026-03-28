from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.services.ai import ask_ai
from backend.app.services.prompts import build_base_prompt, fire_prompt

router = APIRouter()

class FireRequest(BaseModel):
    profile: dict
    fireAge: int = 50
    expectedReturn: float = 11.0
    withdrawalRate: float = 3.5
    inflationRate: float = 6.0

@router.post("/analyse")
async def analyse_fire(req: FireRequest):
    """Generate AI FIRE analysis and roadmap advice."""
    system = build_base_prompt(req.profile)
    user_msg = fire_prompt(req.fireAge, req.expectedReturn)
    ai_text = await ask_ai(system, user_msg)
    return {"analysis": ai_text}
