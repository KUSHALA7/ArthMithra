@echo off
echo =========================================
echo Starting ArthMitra - Full Stack (OpenAI)
echo =========================================

echo.
echo [1/2] Starting Backend API Server...
start "ArthMitra Backend" cmd /k "cd backend && call venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Dev Server...
start "ArthMitra Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo =========================================
echo ArthMitra is starting!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo =========================================
