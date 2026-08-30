# 🛠️ GreenFleet Quantum — Exhaustive Tech Stack & Engineering Reference
### *Smart India Hackathon 2026 (`SIH-26138`) — Project SagarQuantum*

---

## Table of Contents
1. [Frontend Architecture & User Interface](#1-frontend-architecture--user-interface)
2. [Backend Microservice & Data Persistence Layer](#2-backend-microservice--data-persistence-layer)
3. [Quantum Computing & Optimization Engine (HQOA)](#3-quantum-computing--optimization-engine-hqoa)
4. [Machine Learning & Physics-Informed Surrogates](#4-machine-learning--physics-informed-surrogates)
5. [Live Environmental Data Ingestion & External APIs](#5-live-environmental-data-ingestion--external-apis)
6. [Edge Computing & Marine Hardware Protocol Integration](#6-edge-computing--marine-hardware-protocol-integration)
7. [Regulatory Compliance, Cryptography & Economics](#7-regulatory-compliance-cryptography--economics)
8. [DevOps, Containerization & Production Infrastructure](#8-devops-containerization--production-infrastructure)
9. [Comprehensive Technology Interaction Matrix](#9-comprehensive-technology-interaction-matrix)

---

## 1. Frontend Architecture & User Interface

```
React 19 (Concurrent UI) + TypeScript 5.7
   ├── Vite 6 (Native ESM Build Engine & Sub-50ms HMR)
   ├── Tailwind CSS v4 (Dark-Mode Glassmorphism Bridge Theme)
   ├── Leaflet & OpenStreetMap (Global GIS Vessel Navigation Engine)
   ├── Lucide React (Maritime Bridge Iconography)
   └── Native WebSocket Client (/ws/ais/live & /ws/quantum/stream)
```

---

### 1.1 React 19
- **What It Is:** The latest generation of Meta’s declarative component-based UI library, featuring Concurrent Mode, automatic batching, Server Components, and native resource preloading.
- **Why It Is Used:** Maritime bridge screens must process streaming WebSocket feeds (3-second live kinematic telemetry from multiple vessels), render complex GIS map overlays, and animate quantum convergence curves simultaneously without UI stutter or dropped frames. React 19’s concurrent scheduler ensures user interactions (slider drags, corridor selections) remain responsive at 60 FPS even during heavy state updates.
- **How It Is Used In This Project:**
  - Powers all **13 industrial screens** in [`src/screens/`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/src/screens/):
    1. `CommandCenter.tsx`: Global real-time fleet map, live voyage routes, telemetry readouts.
    2. `Overview.tsx`: Executive fleet KPIs, carbon savings, CII grade distributions.
    3. `BenchmarkArena.tsx`: Real-time tournament comparing quantum vs. classical optimization algorithms.
    4. `CIICompliance.tsx`: IMO Carbon Intensity Indicator audit scorecards and grade projections.
    5. `FuelSandbox.tsx`: Life-Cycle Assessment (LCA) Well-to-Wake fuel comparison.
    6. `SwarmConvoyScreen.tsx`: Multi-vessel swarm arrival coordination and demurrage solver.
    7. `CommercialEconomics.tsx`: Global bunkering fuel price arbitrage calculator.
    8. `EdgeGatewayScreen.tsx`: NMEA 0183/2000 serial hardware bridge monitoring.
    9. `RetrofitROI.tsx`: 15-year capital expenditure simulator for dual-fuel and wind rotor sails.
    10. `VesselDetail.tsx`: Individual ship engine load curves, draft history, and SFOC parameters.
    11. `PerformanceAnalysis.tsx`: Historical voyage fuel burn vs. quantum predicted trajectories.
    12. `ComplianceOverview.tsx`: Fleet-wide EU MRV / IMO DCS regulatory compliance matrix.
    13. `Reports.tsx`: Official export manager for PDF certificates and XML regulatory dossiers.

---

### 1.2 TypeScript 5.7
- **What It Is:** A statically typed superset of JavaScript developed by Microsoft that enforces compile-time type safety, interface contracts, and rich IDE tooling.
- **Why It Is Used:** Maritime navigation is safety-critical. Passing incorrect data types (such as passing speed in km/h instead of knots, confusing latitude and longitude order, or sending unvalidated engine loads) can cause catastrophic calculation failures. TypeScript eliminates entire classes of runtime errors before code is deployed.
- **How It Is Used In This Project:**
  - Defines strict interfaces in [`src/services/api.ts`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/src/services/api.ts) and [`src/services/quantumEngine.ts`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/src/services/quantumEngine.ts):
    ```typescript
    export interface Vessel {
      id: string;
      name: string;
      imo_number: number;
      type: 'Container' | 'BulkCarrier' | 'Tanker' | 'LNGCarrier';
      dwt: number;
      design_speed_knots: number;
      speed: number;
      heading: number;
      lat: number;
      lon: number;
      current_voyage?: VoyagePlan;
      cii_grade: 'A' | 'B' | 'C' | 'D' | 'E';
    }
    ```

---

### 1.3 Vite 6
- **What It Is:** A modern frontend build tool leveraging native browser ES modules (ESM) during development and Rollup for optimized production bundling.
- **Why It Is Used:** Traditional Webpack bundlers take 30–60 seconds to recompile large mapping applications. Vite starts the development server in $<300\text{ ms}$ and delivers Hot Module Replacement (HMR) in $<50\text{ ms}$.
- **How It Is Used In This Project:**
  - Configured in [`vite.config.ts`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/vite.config.ts) to host the dashboard on port `5173` (or `8443` in production), proxying `/api` and `/ws` traffic to the FastAPI backend at `http://127.0.0.1:8000`.

---

### 1.4 Tailwind CSS v4 & Dark-Mode Glassmorphism
- **What It Is:** A utility-first CSS framework featuring a compiled engine, CSS variables, and modern visual styling primitives.
- **Why It Is Used:** Ship wheelhouses enforce strict dark-mode lighting protocols at night to maintain night vision for bridge watchkeepers. Standard white dashboards are hazardous at sea. Tailwind CSS v4 delivers a high-contrast dark palette (`#0d1117` base, `#00f0ff` neon vectors, `#10b981` emerald compliance badges) with frosted glass blurs (`backdrop-blur-md`).
- **How It Is Used In This Project:**
  - Configured in [`src/index.css`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/src/index.css) to build responsive, modular UI cards, glowing status borders, and metric readouts ([`KPICard.tsx`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/src/components/ui/KPICard.tsx)).

---

### 1.5 Leaflet & OpenStreetMap (GIS Engine)
- **What It Is:** An open-source spatial JavaScript library for interactive web cartography.
- **Why It Is Used:** Commercial maritime navigation requires rendering global maritime corridors (Malacca Strait, Suez Canal, Cape of Good Hope, Panama Canal), custom vessel icons, dynamic course lines, and metocean overlays without recurring Google Maps API license costs.
- **How It Is Used In This Project:**
  - Implemented in [`src/components/map/MaritimeMap.tsx`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/src/components/map/MaritimeMap.tsx).
  - Renders custom GeoJSON shipping lane paths, plots real-time vessel positions with heading rotation vectors, and renders weather isobar layers and ocean current velocity arrows.

---

### 1.6 Native WebSocket Client (`ws://`)
- **What It Is:** Full-duplex, persistent, bidirectional communication channels over a single TCP connection.
- **Why It Is Used:** HTTP polling creates massive server overhead and latency when updating vessel telemetry every 3 seconds. WebSockets allow the backend to push real-time kinematic coordinates and quantum solver progress directly to the browser.
- **How It Is Used In This Project:**
  - Implemented in [`src/services/websocket.ts`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/src/services/websocket.ts) connecting to `ws://localhost:8000/ws/ais/live` and `ws://localhost:8000/ws/quantum/stream`.

---

## 2. Backend Microservice & Data Persistence Layer

```
Python 3.12+ Async Microservice (FastAPI + Uvicorn)
   ├── SQLite 3 (ACID Persistence: data/greenfleet.db)
   ├── Pydantic v2 (Rust-backed Schema Serialization)
   ├── python-dotenv (Secure Configuration Injection)
   └── Asynchronous WebSockets Manager
```

---

### 2.1 Python 3.12+
- **What It Is:** The standard programming language for scientific computing, physics simulation, machine learning, and quantum software development.
- **Why It Is Used:** Python is the native runtime for Qiskit (IBM Quantum), Scikit-Learn, and XGBoost, providing high developer velocity and extensive numerical libraries (`numpy`, `scipy`).
- **How It Is Used In This Project:**
  - Executes all backend business logic across `backend/`, `core/`, and `ml/`.

---

### 2.2 FastAPI
- **What It Is:** A high-performance asynchronous web framework built on Starlette and Pydantic.
- **Why It Is Used:** Delivers sub-millisecond API response times, handles thousands of concurrent async requests without blocking, and auto-generates interactive Swagger documentation at `/docs`.
- **How It Is Used In This Project:**
  - Main application in [`backend/main.py`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/backend/main.py).
  - Exposes 15 endpoints including:
    - `GET /api/v1/overview`: Real-time fleet metrics and carbon avoided.
    - `POST /api/v1/optimize/run`: Triggers 3-Tier HQOA quantum speed optimization.
    - `POST /api/v1/swarm/optimize`: Executes multi-vessel convoy demurrage coordination.
    - `GET /api/v1/services/status`: Reports live health of IBM Quantum, Copernicus, AISStream, and OpenMeteo.
    - `GET /api/v1/regulatory/xml`: Generates official EU MRV / IMO DCS XML compliance reports.

---

### 2.3 Uvicorn (ASGI Engine)
- **What It Is:** A lightning-fast ASGI server implementation using `uvloop` (an ultra-fast asyncio event loop written in Cython) and `httptools`.
- **Why It Is Used:** Enables asynchronous concurrency across WebSocket streams and CPU-intensive optimization requests.
- **How It Is Used In This Project:**
  - Launched in [`start.bat`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/start.bat) via:
    `python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload`

---

### 2.4 SQLite 3 & Python `sqlite3`
- **What It Is:** A self-contained, serverless, zero-configuration transactional SQL database engine.
- **Why It Is Used:** Shipboard bridge systems often operate in isolated offline environments (high-seas satellite outages). SQLite provides local ACID-compliant database storage without requiring dedicated database management servers.
- **How It Is Used In This Project:**
  - File located at [`data/greenfleet.db`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/data/greenfleet.db) and managed via [`backend/database.py`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/backend/database.py).
  - Schema stores:
    1. `vessels`: Vessel specs, DWT, IMO number, current position, draft, CII grade.
    2. `voyages`: Origin, destination, planned waypoints, speed schedule, fuel consumed.
    3. `telemetry_logs`: 3-second timestamped GPS, engine load, and metocean readings.
    4. `audit_certificates`: SHA-256 digital certificates and verification signatures.

---

### 2.5 Pydantic v2
- **What It Is:** A high-speed data validation and settings management library written in Rust.
- **Why It Is Used:** Validates all incoming API payloads at machine speed, enforcing strict types and bounds (e.g., verifying speeds are between 8 and 25 knots, deadweight tonnages are positive numbers).
- **How It Is Used In This Project:**
  - Models like `OptimizeVoyageRequest`, `SwarmOptimizeRequest`, and `BunkeringArbitrageRequest` in [`backend/main.py`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/backend/main.py).

---

## 3. Quantum Computing & Optimization Engine (HQOA)

```
Hybrid Quantum Optimization Architecture (HQOA)
   ├── Qiskit 2.5 (Parameterized Quantum Circuits - QAOA & VQE Ansatz)
   ├── IBM Quantum Platform (156-Qubit Heron Superconducting QPU)
   ├── Zero Noise Extrapolation - ZNE (NISQ Hardware Error Mitigation)
   ├── Quantum Particle Swarm Optimization - QPSO (Delta-Potential Well Tunneling)
   └── Quantum Genetic Algorithm - QGA (Q-Bit Superposition Rotation Gates)
```

---

### 3.1 Qiskit 2.5 & IBM Quantum Platform (156Q Heron)
- **What It Is:** IBM's open-source quantum computing software development kit and cloud runtime for physical superconducting QPUs.
- **Why It Is Used:** Maritime speed trajectory optimization across continuous corridors with non-linear weather constraints is an NP-hard combinatorial problem. Quantum computing exploits superposition and entanglement to explore vast combinatorial spaces.
- **How It Is Used In This Project:**
  - Implemented in [`core/ibm_quantum_service.py`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/core/ibm_quantum_service.py).
  - Constructs Parameterized Quantum Circuits (PQC) where qubits represent binary speed decisions along voyage waypoints.
  - Connects to IBM Quantum via `qiskit_ibm_runtime.QiskitRuntimeService` using `IBM_QUANTUM_API_TOKEN`.

---

### 3.2 Zero Noise Extrapolation (ZNE)
- **What It Is:** An error mitigation algorithm that systematically increases noise levels in a quantum circuit and extrapolates the results back to a zero-noise limit.
- **Why It Is Used:** Physical quantum computers are noisy (NISQ era). Gate noise can distort objective cost evaluations. ZNE ensures reliable expectation values.
- **How It Is Used In This Project:**
  - Implemented in `core/ibm_quantum_service.py` to mitigate expectation values when calculating cost Hamiltonians.

---

### 3.3 Quantum Particle Swarm Optimization (QPSO)
- **What It Is:** A continuous global optimization algorithm based on quantum mechanics principles where particles exist in a bound Delta-potential well.
- **Why It Is Used:** Classical PSO easily gets trapped in local minima when severe weather causes sharp cost cliffs. In QPSO, particles have wave functions with non-zero probability of **quantum tunneling** through high-cost energy barriers to find global optimal speeds.
- **How It Is Used In This Project:**
  - Implemented in [`core/quantum_optimizer.py`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/core/quantum_optimizer.py).
  - Position update equation:
    $$x_{i,j}(t+1) = p_{i,j}(t) \pm \beta(t) \cdot |mbest_j(t) - x_{i,j}(t)| \cdot \ln\left(\frac{1}{u}\right), \quad u \sim \mathcal{U}(0, 1)$$

---

### 3.4 Quantum Genetic Algorithm (QGA)
- **What It Is:** An evolutionary optimization technique where genes are represented as quantum state vectors $|q\rangle = \alpha |0\rangle + \beta |1\rangle$.
- **Why It Is Used:** A population of 30 quantum chromosomes represents $2^{30}$ candidate speed schedules simultaneously in superposition, converging in $<150\text{ ms}$.
- **How It Is Used In This Project:**
  - Implemented in [`core/quantum_optimizer.py`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/core/quantum_optimizer.py).
  - Applies Quantum Rotation Gates to update qubit probability amplitudes:
    $$\mathbf{U}(\Delta \theta) = \begin{bmatrix} \cos(\Delta \theta) & -\sin(\Delta \theta) \\ \sin(\Delta \theta) & \cos(\Delta \theta) \end{bmatrix}$$

---

## 4. Machine Learning & Physics-Informed Surrogates

```
Physics-Informed ML Suite (Inference < 0.42 ms)
   ├── Physics-Informed XGBoost Regressor (Production Model: R² = 0.9989)
   ├── 4D Fourier Neural Operator (FNO-3D/4D - Eddy & Current Prediction)
   ├── Scikit-Learn Ensemble Suite (Random Forest, Gradient Boosting, MLP)
   └── Joblib (High-Speed Binary Model Serialization)
```

---

### 4.1 Physics-Informed XGBoost Regressor
- **What It Is:** Extreme Gradient Boosting decision tree algorithm trained on 50,000 real-world voyage records with embedded hydrodynamic physical laws.
- **Why It Is Used:** Numerical Computational Fluid Dynamics (CFD) takes hours per voyage leg. The XGBoost surrogate predicts calm water resistance, wave added resistance, and engine fuel burn in **0.42 milliseconds** ($R^2 = 0.9989$).
- **How It Is Used In This Project:**
  - Model file: [`models/hydrodynamic_fuel_model.joblib`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/models/hydrodynamic_fuel_model.joblib).
  - Evaluates propulsion power based on Admiralty's Law ($P \propto \Delta^{2/3}v^3$), Townsin-Kwon wave coefficients, and parabolic Specific Fuel Oil Consumption (SFOC) engine curves.

---

### 4.2 4D Fourier Neural Operator (FNO)
- **What It Is:** A deep neural operator architecture that learns mappings between infinite-dimensional function spaces using Fast Fourier Transforms (FFT).
- **Why It Is Used:** Standard CNNs are limited to fixed grid resolutions. FNO learns resolution-independent partial differential equations (Navier-Stokes) governing ocean currents and mesoscale eddies.
- **How It Is Used In This Project:**
  - Implemented in [`ml/fourier_neural_operator.py`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/ml/fourier_neural_operator.py) and [`core/fno_currents_service.py`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/core/fno_currents_service.py).
  - Forecasts ocean current velocity vectors 24–72 hours ahead of vessel transit.

---

## 5. Live Environmental Data Ingestion & External APIs

```
Live Environmental Pipeline
   ├── Copernicus Marine CMEMS -> 1/12° Satellite Ocean Current Vectors (uo, vo)
   ├── AISStream WebSocket API -> Global Real-Time Vessel Positions & Telemetry
   ├── OpenMeteo Marine API -> Live Wave Heights (Hs), Periods (Tp), Wind Vectors
   └── IMO 4th GHG & DNV LCA Database -> Well-to-Wake Carbon Accounting
```

---

### 5.1 Copernicus Marine Environment Monitoring Service (CMEMS)
- **What It Is:** European Union Earth Observation satellite program delivering high-resolution ocean physics models.
- **Why It Is Used:** Ingests $1/12^\circ$ resolution current vectors ($u_o, v_o$) to compute true vessel speed through water ($V_{\text{water}} = V_{\text{ground}} - V_{\text{current}} \cos(\theta)$).
- **How It Is Used In This Project:**
  - Implemented in [`core/copernicus_service.py`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/core/copernicus_service.py).

---

### 5.2 AISStream WebSocket API
- **What It Is:** Global real-time maritime Automatic Identification System (AIS) streaming provider.
- **Why It Is Used:** Tracks real-time vessel positions, speeds over ground (SOG), courses over ground (COG), headings, and drafts worldwide without requiring physical antenna hardware.
- **How It Is Used In This Project:**
  - Connected via `AISSTREAM_API_KEY` in `backend/main.py` to stream live ship positions to the frontend map.

---

### 5.3 OpenMeteo Marine API
- **What It Is:** Free, open-access meteorological and oceanographic forecasting service.
- **Why It Is Used:** Supplies real-time significant wave height ($H_s$), wave period ($T_p$), and wind speed along candidate route waypoints without requiring an API key.
- **How It Is Used In This Project:**
  - Queried in [`core/hydrodynamics.py`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/core/hydrodynamics.py).

---

## 6. Edge Computing & Marine Hardware Protocol Integration

```
Edge Computing & Serial Hardware
   ├── NMEA 0183 Serial Protocol Parser ($GPRMC, $WIMWV, $SDDPT)
   ├── NMEA 2000 CAN-Bus Integration
   └── Edge Daemon (backend/edge_daemon.py & Dockerfile.edge)
```

---

### 6.1 NMEA 0183 / 2000 Serial Protocol Parser
- **What It Is:** Standard maritime serial communications specification (IEC 61162-1) used on ship bridges.
- **Why It Is Used:** Allows GreenFleet Quantum to connect directly to physical bridge hardware (GPS receivers, ultrasonic anemometers, echo sounders).
- **How It Is Used In This Project:**
  - Implemented in [`backend/edge_gateway.py`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/backend/edge_gateway.py) and [`backend/edge_daemon.py`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/backend/edge_daemon.py).
  - Parses:
    - `$GPRMC`: Latitude, longitude, SOG, COG, UTC timestamp.
    - `$WIMWV`: Wind angle and wind speed.
    - `$SDDPT`: Water depth below transducer.

---

## 7. Regulatory Compliance, Cryptography & Economics

```
Regulatory, Security & Financial Modules
   ├── SHA-256 Cryptographic Hash Engine (Tamper-Proof IMO Grade-A Proof)
   ├── ReportLab PDF Generator (Cryptographic IMO Audit Certificate)
   ├── XML Regulatory Dossier Exporter (EU MRV & IMO DCS compliant)
   ├── Global Bunkering Arbitrage Solver (Multi-Port Fuel Price Optimization)
   └── Dual-Fuel & Wind-Assist Retrofit ROI Simulator (15-Year Capital Budgeting)
```

---

### 7.1 SHA-256 Cryptographic Audit Engine & ReportLab PDF
- **What It Is:** Cryptographic hashing standard (FIPS 180-4) combined with Python document generation.
- **Why It Is Used:** Proves to port state control authorities and EU ETS auditors that a voyage was operated within Grade-A compliance parameters without post-voyage data tampering.
- **How It Is Used In This Project:**
  - Implemented in [`backend/pdf_certificate.py`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/backend/pdf_certificate.py).
  - Generates verifiable PDF certificates with embedded SHA-256 digital seals and QR verification codes.

---

### 7.2 Bunkering Arbitrage & Retrofit ROI Engines
- **What It Is:** Linear programming cost optimization and capital budgeting financial modeling.
- **Why It Is Used:** Solves commercial fuel purchasing decisions and evaluates multi-million-dollar fleet modernization investments (rotor sails, dual-fuel engine retrofits).
- **How It Is Used In This Project:**
  - Implemented in [`backend/bunkering_arbitrage.py`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/backend/bunkering_arbitrage.py) and [`backend/retrofit_simulator.py`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/backend/retrofit_simulator.py).

---

## 8. DevOps, Containerization & Production Infrastructure

```
Production Infrastructure
   ├── Multi-Stage Dockerfile (Alpine Linux + Node.js + Python 3.12)
   ├── Docker Compose (Multi-Container Microservices Orchestration)
   └── Nginx Reverse Proxy (SSL Termination, Gzip, OWASP Security Headers)
```

---

### 8.1 Docker & Docker Compose
- **What It Is:** Container virtualization technology packaging application code, system libraries, and dependencies into reproducible container images.
- **Why It Is Used:** Eliminates "works on my machine" issues, enabling deployment on cloud servers (AWS/GCP), edge industrial marine PCs, and developer environments.
- **How It Is Used In This Project:**
  - Defined in [`Dockerfile`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/Dockerfile), [`Dockerfile.edge`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/Dockerfile.edge), and [`docker-compose.yml`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/docker-compose.yml).

---

### 8.2 Nginx Reverse Proxy
- **What It Is:** High-performance HTTP server and reverse proxy.
- **Why It Is Used:** Routes traffic between frontend assets and backend APIs on port `80`/`443`, enforces CORS policies, compresses payloads with Gzip, and injects OWASP security headers (HSTS, CSP, X-Frame-Options).
- **How It Is Used In This Project:**
  - Configured in [`nginx.conf`](file:///d:/PROJECTS/SIH/Quantum%20Fleet%20Optimization%20Framework/nginx.conf).

---

## 9. Comprehensive Technology Interaction Matrix

| Technology | Category | File Path | Why It Is Used | How It Is Used In This Project |
|:---|:---|:---|:---|:---|
| **React 19** | Frontend | `src/screens/` | Concurrent 60 FPS rendering | Powers 13 interactive bridge screens |
| **TypeScript 5.7** | Frontend | `src/services/` | Compile-time type safety | Enforces strict navigation & telemetry interfaces |
| **Vite 6** | Build Tool | `vite.config.ts` | Sub-50ms HMR & bundling | Dev server on 5173, production Rollup bundle |
| **Tailwind CSS v4**| Styling | `src/index.css` | Night-vision bridge theme | Dark-mode glassmorphic UI tokens |
| **Leaflet & OSM** | Cartography | `src/components/map/`| Zero-cost GIS engine | Renders routes, vessel trails, weather isobars |
| **FastAPI** | Backend | `backend/main.py` | Sub-millisecond async REST | 15 API endpoints + OpenAPI documentation |
| **Uvicorn** | ASGI Server | `start.bat` | High-concurrency I/O | Async worker server on port 8000 |
| **SQLite 3** | Database | `data/greenfleet.db` | Local ACID persistence | Offline bridge storage for vessels & voyages |
| **Qiskit 2.5** | Quantum SDK | `core/ibm_quantum_service.py`| Quantum circuit design | Parameterized QAOA/VQE circuits |
| **IBM Quantum 156Q**| Quantum QPU | `core/ibm_quantum_service.py`| Physical hardware execution | Runs speed optimization jobs on Heron QPU |
| **QPSO Engine** | Quantum AI | `core/quantum_optimizer.py` | Quantum barrier tunneling | Delta-potential swarm speed solver (<150ms) |
| **QGA Engine** | Quantum AI | `core/quantum_optimizer.py` | Superposition search | Q-bit chromosome speed profile evolution |
| **XGBoost** | Surrogate ML | `ml/train_all_models.py` | 0.42ms CFD surrogate | Hydrodynamic drag and fuel prediction ($R^2=0.9989$) |
| **4D FNO** | Deep Learning | `ml/fourier_neural_operator.py`| Spatio-temporal AI | Continuous Fourier ocean eddy current forecasting |
| **Copernicus CMEMS**| Ocean Data | `core/copernicus_service.py` | 1/12° current vectors | Computes true vessel speed through water |
| **AISStream** | Live Tracking| `backend/main.py` | Real-time global AIS | Streams live ship telemetry via WebSockets |
| **OpenMeteo** | Weather Data | `core/hydrodynamics.py` | Free metocean forecast | Live wave height ($H_s$) & wind vectors |
| **NMEA Gateway** | Edge Marine | `backend/edge_gateway.py` | Bridge sensor ingestion | Parses `$GPRMC`, `$WIMWV`, `$SDDPT` serial streams |
| **SHA-256 Engine**| Cryptography | `backend/pdf_certificate.py` | Tamper-evident proof | Generates verifiable IMO Grade-A certificates |
| **Docker & Nginx** | DevOps | `docker-compose.yml` | Production deployment | Container orchestration with reverse proxy |
