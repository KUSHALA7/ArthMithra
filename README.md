# 💰 ArthMitra — AI Money Mentor

AI-powered personal finance mentor for India. 

## Project Structure

```
MoneyMentor/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Environment config
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── health.py        # Health score + onboarding AI
│   │   │   ├── fire.py          # FIRE planner AI
│   │   │   ├── tax.py           # Tax wizard AI
│   │   │   ├── life_events.py   # Life event advisor AI
│   │   │   ├── couple.py        # Couple planner AI
│   │   │   ├── portfolio.py     # Portfolio X-Ray AI
│   │   │   └── chat.py          # AI mentor chat
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── claude.py        # Anthropic API wrapper
│   │       └── prompts.py       # All system prompts
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   │   └── index.html           # HTML shell
│   ├── src/
│   │   ├── main.js              # App entry, routing
│   │   ├── state.js             # Global user state
│   │   ├── api.js               # All backend API calls
│   │   ├── utils.js             # Formatters, helpers
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   ├── Sidebar.js
│   │   │   └── LoadingOverlay.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── HealthScore.js
│   │   │   ├── FirePlanner.js
│   │   │   ├── TaxWizard.js
│   │   │   ├── LifeEvents.js
│   │   │   ├── CouplePlanner.js
│   │   │   ├── PortfolioXRay.js
│   │   │   └── AIMentor.js
│   │   └── styles/
│   │       └── main.css         # All styles
│   └── package.json
│
└── README.md
```

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Opens on http://localhost:5173
```

## Tech Stack
- **Backend**: Python + FastAPI + Anthropic SDK
- **Frontend**: Vanilla JS (no framework needed) + Vite
- **AI**: Claude Sonnet via Anthropic API
