@echo off
setlocal enabledelayedexpansion
title GreenFleet Quantum Launcher (SIH-26138)

echo =======================================================================
echo     GREENFLEET QUANTUM: MARITIME DECARBONIZATION & SPEED OPTIMIZER
echo                   Smart India Hackathon 2026 (SIH-26138)
echo =======================================================================
echo.

:: 1. Navigate to Project Directory
cd /d "%~dp0"

:: 2. Check Python Installation
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not found in PATH!
    echo Please install Python 3.10+ and add it to your system PATH.
    pause
    exit /b 1
)

:: 3. Check Node.js Installation
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in PATH!
    echo Please install Node.js 20+ and add it to your system PATH.
    pause
    exit /b 1
)

echo [1/4] Verifying Datasets, ML Models & Local SQLite Database...
python scripts\start_production.py
if %errorlevel% neq 0 (
    echo [WARNING] Bootstrap check returned warnings, continuing launch...
)

echo.
echo [2/4] Starting FastAPI Microservice on http://localhost:8000...
start "GreenFleet Quantum API Backend (Port 8000)" /min cmd /c "python -u backend\main.py"

:: Wait 2 seconds for backend to initialize
timeout /t 2 /nobreak >nul

echo.
echo [3/4] Starting React 19 Frontend Client on http://localhost:8443...
start "GreenFleet Quantum Web Client (Port 8443)" /min cmd /c "node node_modules\vite\bin\vite.js --port 8443 --host 0.0.0.0"

:: Wait 3 seconds for Vite server to boot
timeout /t 3 /nobreak >nul

echo.
echo [4/4] Opening Web Interface in Default Browser...
start http://localhost:8443

echo.
echo =======================================================================
echo   GREENFLEET QUANTUM IS LIVE AND RUNNING!
echo   -------------------------------------------------------------------
echo   * Web Dashboard:  http://localhost:8443
echo   * REST API Docs:  http://localhost:8000/docs
echo   * Live AIS Feed:  ws://localhost:8000/ws/ais/live
echo   * Local Database: data/greenfleet.db (SQLite)
echo =======================================================================
echo.
echo Press any key in this window to stop all servers and exit...
pause >nul

:: Stop background servers on exit
taskkill /f /im python.exe /fi "WINDOWTITLE eq GreenFleet Quantum API Backend*" >nul 2>&1
taskkill /f /im node.exe /fi "WINDOWTITLE eq GreenFleet Quantum Web Client*" >nul 2>&1

echo Servers shut down cleanly.
