from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.services.ai import ask_ai
from backend.app.services.prompts import build_base_prompt, tax_prompt

router = APIRouter()

class TaxRequest(BaseModel):
    profile: dict
    grossSalary: float = 0.0
    invested80c: float = 0.0
    npsContribution: float = 0.0
    premium80d: float = 0.0
    homeLoanInterest: float = 0.0
    hraExemption: float = 0.0

@router.post("/analyse")
async def analyse_tax(req: TaxRequest):
    """Generate AI tax optimisation recommendations"""
    # Merge tax-specific fields into profile
    profile = req.profile.copy()
    profile["income"] = req.grossSalary or profile.get("income", 0)
    profile["invested80c"] = req.invested80c
    profile["premium"] = req.premium80d

    system = build_base_prompt(profile)
    ai_text = await ask_ai(system, tax_prompt())
    return {"recommendations": ai_text}
