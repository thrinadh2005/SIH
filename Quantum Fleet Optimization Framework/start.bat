@echo off
setlocal enabledelayedexpansion
title GreenFleet Quantum (SIH-26138)

cd /d "%~dp0"
cls

echo =======================================================================
echo       GREENFLEET QUANTUM: Maritime Decarbonization Platform
echo                 Smart India Hackathon 2026 (SIH-26138)
echo =======================================================================
echo.

where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found in PATH! Install from python.org
    pause & exit /b 1
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found in PATH! Install from nodejs.org
    pause & exit /b 1
)

if not exist ".env" (
    echo [WARN] .env not found - app will run in simulation mode.
    echo        Copy .env.example to .env and add your API keys.
    echo.
)

echo [*] Launching FastAPI Backend on http://localhost:8000 ...
start "GreenFleet_API" /min cmd /c "python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 3 /nobreak >nul

echo [*] Launching React Frontend on http://localhost:5173 ...
start "GreenFleet_Web" /min cmd /c "node node_modules\vite\bin\vite.js --port 5173 --host 0.0.0.0"
timeout /t 3 /nobreak >nul

start http://localhost:5173

echo.
echo =======================================================================
echo   GREENFLEET QUANTUM IS LIVE
echo   -------------------------------------------------------------------
echo   Web Dashboard   :  http://localhost:5173
echo   REST API Docs   :  http://localhost:8000/docs
echo   Health Check    :  http://localhost:8000/api/v1/health
echo   Service Status  :  http://localhost:8000/api/v1/services/status
echo   Live AIS Feed   :  ws://localhost:8000/ws/ais/live
echo   Database        :  data/greenfleet.db (SQLite)
echo   Run API check   :  python scripts\check_all_apis.py
echo =======================================================================
echo.
echo Press any key to STOP all services...
pause >nul

taskkill /f /im python.exe /fi "WINDOWTITLE eq GreenFleet_API*" >nul 2>&1
taskkill /f /im node.exe /fi "WINDOWTITLE eq GreenFleet_Web*" >nul 2>&1
echo [OK] GreenFleet Quantum stopped cleanly.
