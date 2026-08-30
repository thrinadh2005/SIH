@echo off
setlocal enabledelayedexpansion
title GreenFleet Quantum (SIH-26138)

:: Navigate to current directory
cd /d "%~dp0"

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

echo [*] Initializing Backend Engine and Datasets...
python -c "
import os, sys, subprocess
ds = ['data/ais_vessel_telemetry.csv', 'data/ocean_metocean_weather.csv', 'data/imo_vessel_registry.csv', 'data/lifecycle_fuel_emissions.csv', 'data/global_ports_and_corridors.csv']
if not all(os.path.exists(f) for f in ds):
    subprocess.run([sys.executable, 'scripts/download_all_datasets.py'], check=True)
if not os.path.exists('models/hydrodynamic_fuel_model.joblib'):
    subprocess.run([sys.executable, 'ml/train_all_models.py'], check=True)
"

echo [*] Launching FastAPI Backend on http://localhost:8000...
start "GreenFleet_API" /min cmd /c "python -u backend\main.py"
timeout /t 2 /nobreak >nul

echo [*] Launching React 19 Frontend on http://localhost:8443...
start "GreenFleet_Web" /min cmd /c "node node_modules\vite\bin\vite.js --port 8443 --host 0.0.0.0"
timeout /t 2 /nobreak >nul

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

taskkill /f /im python.exe /fi "WINDOWTITLE eq GreenFleet_API*" >nul 2>&1
taskkill /f /im node.exe /fi "WINDOWTITLE eq GreenFleet_Web*" >nul 2>&1

echo.
echo GreenFleet Quantum services shut down cleanly.
