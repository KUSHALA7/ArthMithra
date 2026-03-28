from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.services.ai import ask_ai
from backend.app.services.prompts import build_base_prompt

router = APIRouter()

class GoalRequest(BaseModel):
    profile: dict
    goalType: str
    goalLabel: str
    goalAmount: float
    timeline: int

@router.post("/analyze")
async def analyze_goal(req: GoalRequest):
    """Generate AI analysis for personal financial goals."""
    system = build_base_prompt(req.profile)

    # Build goal context
    monthly_required = req.goalAmount / (req.timeline * 12)
    monthly_surplus = (req.profile.get('income', 0) / 12) - (
        req.profile.get('expRent', 0) + req.profile.get('expGroceries', 0) +
        req.profile.get('expTransport', 0) + req.profile.get('expFun', 0) +
        req.profile.get('expOther', 0) + req.profile.get('expEmi', 0)
    )

    # Calculate feasibility
    feasible = monthly_surplus >= monthly_required
    gap = monthly_required - monthly_surplus if not feasible else 0

    user_msg = f"""
I want to achieve this financial goal: {req.goalLabel}

Goal Details:
- Target Amount: ₹{req.goalAmount:,.0f}
- Timeline: {req.timeline} years
- Monthly Required (without investment returns): ₹{monthly_required:,.0f}
- My Current Monthly Surplus: ₹{monthly_surplus:,.0f}
- Feasibility: {"✓ Achievable with current surplus" if feasible else f"✗ Need ₹{gap:,.0f} more per month"}

Based on my financial profile, please provide:
1. Whether this goal is realistic and achievable
2. Key steps to achieve this goal
3. Recommended investment strategy (SIP, lump sum, savings accounts)
4. Risk considerations specific to this goal
5. Timeline adjustments if needed
6. Quick tips to accelerate progress
7. Emergency alternatives if full target seems difficult

Keep response concise, actionable, and personalized to my situation.
"""

    ai_text = await ask_ai(system, user_msg)
    return {"analysis": ai_text}
