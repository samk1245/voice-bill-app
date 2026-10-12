@echo off
echo ==========================================================
echo        ZAALIMA MULTI-TENANT E-COMMERCE PLATFORM (SaaS)
echo ==========================================================
echo.
echo [1/2] Launching Backend API Server (Port 5000)...
start "Backend API" cmd /k "cd backend && npm run dev"
echo.
echo [2/2] Launching Frontend client (Port 5173)...
cd frontend
npm run dev
