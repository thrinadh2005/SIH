@echo off
setlocal enabledelayedexpansion
title GreenFleet Quantum (SIH-26138)

:: Navigate to framework directory
if exist "%~dp0Quantum Fleet Optimization Framework" (
    cd /d "%~dp0Quantum Fleet Optimization Framework"
) else (
    cd /d "%~dp0"
)

cls
echo =======================================================================
echo     GREENFLEET QUANTUM: MARITIME DECARBONIZATION PLATFORM
echo                   Smart India Hackathon 2026 (SIH-26138)
echo =======================================================================
echo.

:: 1. Check Python & Node
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not found in PATH!
    pause
    exit /b 1
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in PATH!
    pause
    exit /b 1
)

echo [*] Initializing Backend Engine, SQLite DB, and Datasets...
python scripts\start_production.py --init-only


echo [*] Launching FastAPI Backend on http://localhost:8000...
start "GreenFleet_API" /min cmd /c "python -u backend\main.py"
ping 127.0.0.1 -n 3 >nul

echo [*] Launching React 19 Frontend on http://localhost:8443...
start "GreenFleet_Web" /min cmd /c "node node_modules\vite\bin\vite.js --port 8443 --host 0.0.0.0"
ping 127.0.0.1 -n 3 >nul

echo [*] Opening Live Platform in Browser...
start http://localhost:8443

echo.
echo =======================================================================
echo   GREENFLEET QUANTUM IS LIVE AND OPERATIONAL
echo   -------------------------------------------------------------------
echo   * Web Dashboard:  http://localhost:8443
echo   * REST API Docs:  http://localhost:8000/docs
echo   * Live AIS Feed:  ws://localhost:8000/ws/ais/live
echo   * Database:       data/greenfleet.db (SQLite)
echo =======================================================================
echo.
echo Press any key to stop all services and exit...
pause >nul

python scripts\start_production.py --stop


echo.
echo GreenFleet Quantum services shut down cleanly.
