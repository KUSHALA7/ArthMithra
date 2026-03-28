from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.services.ai import ask_ai
from backend.app.services.prompts import build_base_prompt, couple_prompt

router = APIRouter()

class CoupleRequest(BaseModel):
    profile: dict
    partnerAName: str = "Partner A"
    partnerBName: str = "Partner B"
    partnerAIncome: float = 0
    partnerBIncome: float = 0
    partnerA80c: float = 0
    partnerB80c: float = 0
    partnerANps: float = 0
    partnerBNps: float = 0
    hraWho: str = "neither"

@router.post("/optimise")
async def optimise_couple(req: CoupleRequest):
    """Generate joint financial optimisation plan for a couple."""
    system = build_base_prompt(req.profile)
    user_msg = couple_prompt(
        req.partnerAName, req.partnerBName,
        req.partnerAIncome, req.partnerBIncome,
        req.partnerA80c, req.partnerB80c,
        req.partnerANps, req.partnerBNps,
        req.hraWho
    )
    ai_text = await ask_ai(system, user_msg)
    return {"plan": ai_text}
