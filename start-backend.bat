@echo off
echo =========================================
echo Starting ArthMitra Backend (OpenAI)
echo =========================================
cd backend
call venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
