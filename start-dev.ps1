# Multi-Tenant E-Commerce Dev Server Launcher
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "       ZAALIMA MULTI-TENANT E-COMMERCE PLATFORM (SaaS)" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""

# Launch Backend API server in a separate window
Write-Host "[1/2] Launching Backend API Server (Port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; Set-Title 'Backend API'; npm run dev"

# Launch Frontend client in the current terminal
Write-Host "[2/2] Launching Frontend client (Port 5173)..." -ForegroundColor Cyan
Write-Host "Redirecting to frontend workspace. Starting Vite..." -ForegroundColor Yellow
cd frontend
npm run dev
