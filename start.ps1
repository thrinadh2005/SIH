# GreenFleet Quantum (SIH-26138) - PowerShell Launcher
$Host.UI.RawUI.WindowTitle = "GreenFleet Quantum (SIH-26138)"

$frameworkDir = Join-Path $PSScriptRoot "Quantum Fleet Optimization Framework"
if (Test-Path $frameworkDir) {
    Set-Location $frameworkDir
}

Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "    GREENFLEET QUANTUM: MARITIME DECARBONIZATION PLATFORM" -ForegroundColor Green
Write-Host "                  Smart India Hackathon 2026 (SIH-26138)" -ForegroundColor Yellow
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Python & Node
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Python is not found in PATH!" -ForegroundColor Red
    pause
    exit 1
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not found in PATH!" -ForegroundColor Red
    pause
    exit 1
}

# 2. Free stale ports & bootstrap datasets
Write-Host "[*] Initializing Backend Engine, SQLite DB, and Datasets..." -ForegroundColor Magenta
python scripts\start_production.py --init-only

# 3. Launch Backend
Write-Host "[*] Launching FastAPI Backend on http://localhost:8000..." -ForegroundColor Green
$backendProc = Start-Process -FilePath "python" -ArgumentList "-u backend\main.py" -PassThru -WindowStyle Minimized

Start-Sleep -Seconds 2

# 4. Launch Frontend
Write-Host "[*] Launching React 19 Frontend on http://localhost:8443..." -ForegroundColor Green
$frontendProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev -- --port 8443" -PassThru -WindowStyle Minimized

Start-Sleep -Seconds 2

# 5. Open Browser
Write-Host "[*] Opening Live Platform in Browser..." -ForegroundColor Cyan
Start-Process "http://localhost:8443"

Write-Host ""
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "  GREENFLEET QUANTUM IS LIVE AND OPERATIONAL" -ForegroundColor Green
Write-Host "  -------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  * Web Dashboard:  http://localhost:8443" -ForegroundColor White
Write-Host "  * REST API Docs:  http://localhost:8000/docs" -ForegroundColor White
Write-Host "  * Live AIS Feed:  ws://localhost:8000/ws/ais/live" -ForegroundColor White
Write-Host "  * Database:       data/greenfleet.db (SQLite)" -ForegroundColor White
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Enter to stop all services and exit..." -ForegroundColor Yellow
Read-Host

Write-Host "[*] Shutting down GreenFleet services..." -ForegroundColor Magenta
python scripts\start_production.py --stop
if ($backendProc -and -not $backendProc.HasExited) { Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue }
if ($frontendProc -and -not $frontendProc.HasExited) { Stop-Process -Id $frontendProc.Id -Force -ErrorAction SilentlyContinue }

Write-Host "GreenFleet Quantum services shut down cleanly." -ForegroundColor Green
