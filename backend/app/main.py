from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.routes import health, fire, tax, life_events, couple, portfolio, chat, goals
from backend.app.routes import mf_data, stocks, auth, profile

app = FastAPI(
    title="ArthMitra API",
    description="AI-powered personal finance mentor for India",
    version="2.0.0"
)

# CORS — allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# AI-Powered Analysis Routes (requires OpenAI API key)
# ─────────────────────────────────────────────────────────────────────────────
app.include_router(health.router,       prefix="/api/health",     tags=["Health Score"])
app.include_router(fire.router,         prefix="/api/fire",       tags=["FIRE Planner"])
app.include_router(tax.router,          prefix="/api/tax",        tags=["Tax Wizard"])
app.include_router(life_events.router,  prefix="/api/life",       tags=["Life Events"])
app.include_router(couple.router,       prefix="/api/couple",     tags=["Couple Planner"])
app.include_router(portfolio.router,    prefix="/api/portfolio",  tags=["Portfolio X-Ray"])
app.include_router(goals.router,        prefix="/api/goals",      tags=["Personal Goals"])
app.include_router(chat.router,         prefix="/api/chat",       tags=["AI Mentor"])

# ─────────────────────────────────────────────────────────────────────────────
# Real Market Data Routes (free, no API key required)
# ─────────────────────────────────────────────────────────────────────────────
app.include_router(mf_data.router,      prefix="/api/mf",         tags=["Mutual Funds"])
app.include_router(stocks.router,       prefix="/api/stocks",     tags=["Stocks"])

# ─────────────────────────────────────────────────────────────────────────────
# Authentication & User Data Routes (requires Supabase)
# ─────────────────────────────────────────────────────────────────────────────
app.include_router(auth.router,         prefix="/api/auth",       tags=["Authentication"])
app.include_router(profile.router,      prefix="/api/profile",    tags=["User Profile"])

@app.get("/")
def root():
    return {
        "status": "ArthMitra API is running 🚀",
        "version": "2.0.0",
        "features": {
            "ai_analysis": "OpenAI GPT-4o powered",
            "market_data": "Real-time MF & Stock data",
            "auth": "Supabase (optional)"
        }
    }
