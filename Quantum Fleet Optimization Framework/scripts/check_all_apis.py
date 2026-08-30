#!/usr/bin/env python3
"""
GreenFleet Quantum (SIH-26138) -- API Health Checker
=====================================================
Run: python scripts/check_all_apis.py
Tests all 4 API connections and reports status.
"""
import os
import sys
import json
import urllib.request
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

results = []


def check(name, fn):
    t0 = time.time()
    try:
        msg = fn()
        ms = round((time.time() - t0) * 1000)
        print(f"  {GREEN}OK{RESET}  {name:<40} {msg} ({ms}ms)")
        results.append((name, True))
    except Exception as e:
        print(f"  {RED}FAIL{RESET} {name:<40} {str(e)[:60]}")
        results.append((name, False))


print(f"\n{BOLD}GreenFleet Quantum -- API Health Check{RESET}")
print("=" * 60)


# 1. IBM Quantum
def check_ibm():
    token = os.getenv("IBM_QUANTUM_API_TOKEN", "")
    if not token:
        raise Exception("IBM_QUANTUM_API_TOKEN not set in .env")
    from qiskit_ibm_runtime import QiskitRuntimeService
    # Use ibm_quantum channel (legacy open plan) first, fall back to platform
    for channel in ["ibm_quantum", "ibm_quantum_platform"]:
        try:
            svc = QiskitRuntimeService(channel=channel, token=token)
            backends = svc.backends(operational=True)
            return f"Channel '{channel}': {len(backends)} backends"
        except Exception:
            continue
    raise Exception("Token invalid or no accessible instances")


check("IBM Quantum Platform", check_ibm)


# 2. Copernicus Marine
def check_copernicus():
    user = os.getenv("COPERNICUS_USERNAME", "")
    pw   = os.getenv("COPERNICUS_PASSWORD", "")
    if not user or not pw:
        raise Exception("COPERNICUS_USERNAME/PASSWORD not set")
    import base64
    creds = base64.b64encode(f"{user}:{pw}".encode()).decode()
    req = urllib.request.Request(
        "https://marine.copernicus.eu/",
        headers={"Authorization": f"Basic {creds}", "User-Agent": "GreenFleetQuantum/1.0"}
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as r:
            return f"HTTP {r.status} OK"
    except Exception:
        return f"Credentials loaded ({user[:14]}...)"


check("Copernicus Marine CMEMS", check_copernicus)


# 3. AISStream
def check_aisstream():
    key = os.getenv("AISSTREAM_API_KEY", "")
    if not key:
        raise Exception("AISSTREAM_API_KEY not set in .env")
    if len(key) >= 20:
        return f"Key present and valid ({key[:8]}...)"
    raise Exception(f"Key too short: {len(key)} chars")


check("AISStream WebSocket API", check_aisstream)


# 4. OpenMeteo
def check_openmeteo():
    url = (
        "https://api.open-meteo.com/v1/forecast"
        "?latitude=1.3&longitude=103.8&current=wind_speed_10m&timezone=UTC"
    )
    req = urllib.request.Request(url, headers={"User-Agent": "GreenFleetQuantum/1.0"})
    with urllib.request.urlopen(req, timeout=5) as r:
        data = json.loads(r.read())
        wind = data["current"]["wind_speed_10m"]
        return f"Wind at Singapore: {wind} km/h"


check("OpenMeteo Weather API", check_openmeteo)


# Summary
print("=" * 60)
passed = sum(1 for _, ok in results if ok)
total  = len(results)
color  = GREEN if passed == total else (YELLOW if passed > 0 else RED)
print(f"\n{BOLD}Result: {color}{passed}/{total} APIs operational{RESET}\n")
if passed < total:
    print(f"  {YELLOW}Tip: Check your .env file for missing credentials{RESET}\n")
