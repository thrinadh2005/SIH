import sys
import os
import json
import time
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from backend.main import app

client = TestClient(app)

results = []

def test_endpoint(name, method, url, payload=None, params=None):
    t0 = time.time()
    try:
        if method == "GET":
            resp = client.get(url, params=params)
        elif method == "POST":
            resp = client.post(url, json=payload, params=params)
        else:
            resp = client.request(method, url)
        dt = int((time.time() - t0) * 1000)
        status = resp.status_code
        passed = status in [200, 201]
        results.append({
            "name": name,
            "method": method,
            "url": url,
            "status": status,
            "passed": passed,
            "latency_ms": dt,
            "response_sample": str(resp.json())[:120] if passed and "json" in resp.headers.get("content-type", "") else resp.text[:120]
        })
    except Exception as e:
        dt = int((time.time() - t0) * 1000)
        results.append({
            "name": name,
            "method": method,
            "url": url,
            "status": "EXCEPTION",
            "passed": False,
            "latency_ms": dt,
            "error": str(e)
        })

print("=" * 60)
print("RUNNING EXHAUSTIVE DEMO AUDIT OF ALL GREENFLEET API ENDPOINTS")
print("=" * 60)

# 1. Core Endpoints
test_endpoint("Health Check", "GET", "/api/v1/health")
test_endpoint("Fleet Overview", "GET", "/api/v1/overview")
test_endpoint("Fleet List", "GET", "/api/v1/fleet")
test_endpoint("Shipping Corridors", "GET", "/api/v1/corridors")
test_endpoint("Ports List", "GET", "/api/v1/ports")
test_endpoint("Fuels Lifecycle", "GET", "/api/v1/fuels")
test_endpoint("Reports & Audit Logs", "GET", "/api/v1/reports")
test_endpoint("External Services Status", "GET", "/api/v1/services/status")

# 2. Quantum & Classical Optimizers
test_endpoint("Voyage Optimizer (HQOA)", "POST", "/api/v1/optimize/voyage", payload={
    "corridor_id": "SIN_ROT",
    "vessel_type": "CONTAINER_15000TEU",
    "fuel_type": "GREEN_METHANOL",
    "algorithm": "HYBRID_HQOA"
})
test_endpoint("Voyage Optimizer (QPSO)", "POST", "/api/v1/optimize/voyage", payload={
    "corridor_id": "SIN_ROT",
    "vessel_type": "CONTAINER_15000TEU",
    "fuel_type": "LNG",
    "algorithm": "QUANTUM_PSO"
})
test_endpoint("Voyage Optimizer (QGA)", "POST", "/api/v1/optimize/voyage", payload={
    "corridor_id": "SIN_ROT",
    "vessel_type": "CONTAINER_15000TEU",
    "fuel_type": "VLSFO",
    "algorithm": "QUANTUM_GA"
})
test_endpoint("Voyage Optimizer (Baseline)", "POST", "/api/v1/optimize/voyage", payload={
    "corridor_id": "SIN_ROT",
    "vessel_type": "CONTAINER_15000TEU",
    "fuel_type": "VLSFO",
    "algorithm": "CLASSICAL_BASELINE"
})
test_endpoint("Benchmark Suite", "POST", "/api/v1/optimize/benchmark", payload={
    "corridor_id": "SIN_ROT",
    "vessel_type": "CONTAINER_15000TEU",
    "fuel_type": "VLSFO"
})
test_endpoint("Benchmark Tournament", "GET", "/api/v1/benchmarks/tournament", params={"corridor_id": "SIN_ROT"})
test_endpoint("Quantum Status", "GET", "/api/v1/quantum/status")
test_endpoint("Quantum Real Trial Execution", "POST", "/api/v1/quantum/real-trial", payload={"shots": 100})

# 3. CII & Audit Certificates
test_endpoint("CII Calculation", "POST", "/api/v1/cii/calculate", payload={
    "vessel_type": "CONTAINER_15000TEU",
    "total_fuel_mt": 1200.0,
    "distance_nm": 8350.0,
    "fuel_type": "GREEN_METHANOL"
})
test_endpoint("Generate Audit Certificate Data", "POST", "/api/v1/certificate/generate", payload={
    "vessel_name": "Oceanic Vanguard",
    "imo_number": "IMO9876543",
    "corridor": "Singapore to Rotterdam",
    "distance_nm": 8350,
    "fuel_saved_mt": 368.5,
    "co2_avoided_mt": 1181.4,
    "fuel_type": "GREEN_METHANOL",
    "cii_grade": "A"
})
test_endpoint("Certificate HTML View", "GET", "/api/v1/certificate/view", params={"cert_id": "IMO-CII-DEMO"})

# 4. Edge Gateway & Satellite Telemetry
test_endpoint("Edge Telemetry", "GET", "/api/v1/edge/telemetry")
test_endpoint("Edge Status", "GET", "/api/v1/edge/status")
test_endpoint("Satellite AIS", "GET", "/api/v1/edge/satellite-ais", params={
    "vessel_id": "V001", "lat": 12.5, "lng": 43.1, "speed": 14.5, "heading": 290, "hours_since_fix": 0.4
})
test_endpoint("Edge Sync", "POST", "/api/v1/edge/sync", payload={
    "vessel_id": "V001", "nmea_payload": "$GPRMC,123519,A,1235.5,N,04308.4,E,14.5,290.0,230394,,,A*6A"
})

# 5. AI / ML Ocean Current Forecasting
test_endpoint("FNO 4D Current Forecast", "GET", "/api/v1/ai/fno-forecast")
test_endpoint("Live Weather Feed", "GET", "/api/v1/weather", params={"lat": 1.29, "lng": 103.85})
test_endpoint("Live Ocean Currents", "GET", "/api/v1/ocean-currents", params={"lat": 5.5, "lng": 85.2})
test_endpoint("Corridor Currents", "GET", "/api/v1/corridor-currents", params={"corridor_id": "SIN_ROT"})

# 6. Swarm Convoy Speed Coordination
test_endpoint("Swarm Convoy Optimizer", "POST", "/api/v1/swarm/optimize", payload={
    "port_id": "ROT",
    "vessel_count": 4,
    "congestion_factor": 1.25
})

# 7. Regulatory & Commercial Economics
test_endpoint("EU MRV XML Export", "GET", "/api/v1/regulatory/eu-mrv/xml", params={"vessel_name": "Oceanic Vanguard"})
test_endpoint("Poseidon Scorecard", "GET", "/api/v1/regulatory/poseidon-scorecard", params={"vessel_name": "Oceanic Vanguard"})
test_endpoint("EU ETS Wallet", "GET", "/api/v1/regulatory/eu-ets-wallet", params={"co2_mt": 4310.2})
test_endpoint("Bunker Arbitrage", "POST", "/api/v1/commercial/bunker-arbitrage", payload={
    "route_ports": ["SIN", "DXB", "SUEZ", "ROT"],
    "bunker_capacity_mt": 3500.0,
    "fuel_type": "VLSFO"
})
test_endpoint("Retrofit ROI", "POST", "/api/v1/commercial/retrofit-roi", payload={
    "vessel_type": "CONTAINER_15000TEU",
    "retrofit_type": "METHANOL_DUAL_FUEL",
    "annual_fuel_consumption_mt": 18000.0,
    "years": 10
})

# 8. WebSocket Stream Verification
t0 = time.time()
ws_passed = False
try:
    with client.websocket_connect("/ws/ais/live") as ws:
        msg1 = ws.receive_json()
        msg2 = ws.receive_json()
        if msg1.get("type") == "CONNECTION" and msg2.get("type") in ["VESSEL_UPDATE", "ALERT"]:
            ws_passed = True
    results.append({
        "name": "WebSocket Live AIS Telemetry Stream",
        "method": "WS",
        "url": "/ws/ais/live",
        "status": 200 if ws_passed else 500,
        "passed": ws_passed,
        "latency_ms": int((time.time() - t0) * 1000),
        "response_sample": f"Init: {msg1.get('type')}, First Frame: {msg2.get('type')}"
    })
except Exception as e:
    results.append({
        "name": "WebSocket Live AIS Telemetry Stream",
        "method": "WS",
        "url": "/ws/ais/live",
        "status": "EXCEPTION",
        "passed": False,
        "latency_ms": int((time.time() - t0) * 1000),
        "error": str(e)
    })

print(f"\nAUDIT RESULTS ({len(results)} Endpoints Tested):")
print("-" * 80)
passed_count = sum(1 for r in results if r["passed"])
for r in results:
    icon = "PASS" if r["passed"] else "FAIL"
    sample = str(r.get('response_sample', r.get('error', ''))).encode('ascii', errors='replace').decode('ascii')[:50]
    print(f"[{icon}] {r['method']:<4} {r['name']:<35} | Code: {r['status']} | {r['latency_ms']}ms | {sample}")

print("=" * 80)
print(f"OVERALL DEMO AUDIT SCORE: {passed_count}/{len(results)} Passed ({passed_count/len(results)*100:.1f}%)")

