from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.services.ai import ask_ai
from backend.app.services.prompts import build_base_prompt, HEALTH_ASSESSMENT

router = APIRouter()

class UserProfile(BaseModel):
    name: str = "User"
    age: int = 30
    city: str = "India"
    risk: str = "moderate"
    income: float = 0.0
    otherIncome: float = 0.0
    hra: float = 0.0    
    rentPaid: float = 0.0
    expRent: float = 0.0    
    expGroceries: float = 0.0
    expTransport: float = 0.0
    expFun: float = 0.0
    expOther: float = 0.0
    expEmi: float = 0.0
    mf: float = 0.0
    epf: float = 0.0    
    fd: float = 0.0
    stocks: float = 0.0
    emergency: float = 0.0
    sip: float = 0.0
    termCover: float = 0.0
    healthCover: float = 0.0
    premium: float = 0.0
    invested80c: float = 0.0
    fireAge: int = 50
    goal: str = "fire"
    note: str = ""
    healthScore: int = 0

@router.post("/assess")
async def assess_health(profile: UserProfile):
    """Generate AI financial health assessment for the user."""
    u = profile.model_dump()
    system = build_base_prompt(u)
    ai_text = await ask_ai(system, HEALTH_ASSESSMENT)
    return {"assessment": ai_text}
