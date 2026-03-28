from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.services.ai import ask_ai
from backend.app.services.prompts import build_base_prompt, portfolio_prompt

router = APIRouter()

class Fund(BaseModel):
    name: str
    value: float
    xirr: float

class PortfolioRequest(BaseModel):
    profile: dict
    funds: list[Fund]

@router.post("/xray")
async def xray_portfolio(req: PortfolioRequest):
    """Generate full portfolio X-Ray analysis."""
    funds = [f.model_dump() for f in req.funds]
    total_val = sum(f["value"] for f in funds)
    if total_val == 0:
        return {"analysis": "No funds provided."}

    weighted_xirr = sum(f["xirr"] * (f["value"] / total_val) for f in funds)
    system = build_base_prompt(req.profile)
    user_msg = portfolio_prompt(funds, total_val, weighted_xirr)
    ai_text = await ask_ai(system, user_msg)
    return {
        "analysis": ai_text,
        "totalValue": total_val,
        "weightedXirr": round(weighted_xirr, 2)
    }
