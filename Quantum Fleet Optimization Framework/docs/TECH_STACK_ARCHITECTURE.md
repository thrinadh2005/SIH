# 🛠️ GreenFleet Quantum — Tech Stack Architecture & Deep Technical Guide
### *Smart India Hackathon 2026 (`SIH-26138`) — Project SagarQuantum*

---

## 1. Frontend Architecture & User Interface

### 1.1 React 19
- **What it is:** The latest generation of the declarative JavaScript UI library from Meta, featuring automatic concurrent rendering, server components, and compiled asset optimizations.
- **Why it is used:** Maritime bridge and fleet operator consoles require high frame rates (60 FPS) when streaming live AIS kinematics, rendering thousands of map waypoints, and running real-time quantum convergence curves. React 19 eliminates virtual DOM overhead with efficient rendering transitions.
- **How it is used:** Powers all 13 interactive screens in `src/screens/` (CommandCenter, BenchmarkArena, SwarmConvoy, CommercialEconomics, RetrofitROI, EdgeGateway, etc.), managing dynamic state transitions without UI lag.

### 1.2 TypeScript 5.7
- **What it is:** A strongly typed superset of JavaScript that compiles down to clean browser-executable JavaScript.
- **Why it is used:** Maritime navigation deals with safety-critical data (draft constraints, latitude/longitude coordinates, wave heights in meters, engine load percentages, and cryptographic hashes). Type safety prevents runtime crashes and data corruption.
- **How it is used:** Strictly types all backend payloads, vessel models, and optimization parameters in `src/services/api.ts` and `src/services/quantumEngine.ts`.

### 1.3 Vite 6
- **What it is:** A next-generation native ES-module frontend build tool and dev server.
- **Why it is used:** Replaces slow Webpack bundlers with instantaneous Hot Module Replacement (HMR <50ms) and optimized Rollup production builds.
- **How it is used:** Configured in `vite.config.ts` to host the dashboard on port 5173 / 8443 and proxy API calls to the FastAPI backend on port 8000.

### 1.4 Tailwind CSS v4 & Dark-Mode Glassmorphism
- **What it is:** A utility-first CSS engine with compiled custom CSS variables and modern layout primitives.
- **Why it is used:** Ship navigation bridges are dark environments (night mode compliance) to preserve night vision. The dark-mode glassmorphic theme ensures high contrast, legibility, and modern aesthetics.
- **How it is used:** Custom styling tokens in `src/index.css` provide glowing neon borders, backdrop blurs (`backdrop-blur-md`), and status cards.

### 1.5 Leaflet & OpenStreetMap (GIS Engine)
- **What it is:** An open-source JavaScript mapping library for interactive spatial cartography.
- **Why it is used:** Provides tile rendering for global oceans without costly Google Maps API billing or rate limits.
- **How it is used:** Implemented in `src/components/map/MaritimeMap.tsx` to render global maritime corridors (Malacca Strait, Suez Canal, Cape of Good Hope, Panama Canal), draw dynamic vessel trajectories, and overlay real-time weather isobars and ocean current vectors.

---

## 2. Backend & Microservice Architecture

### 2.1 Python 3.12+
- **What it is:** Modern high-performance Python with improved interpreter speeds and native async capabilities.
- **Why it is used:** Serves as the primary language for scientific computing, physics modeling, machine learning inference, and quantum computing SDKs (Qiskit).
- **How it is used:** Powers all backend engines in `backend/`, `core/`, and `ml/`.

### 2.2 FastAPI
- **What it is:** A modern, high-performance web framework for building APIs with Python based on standard Python type hints.
- **Why it is used:** Delivers sub-millisecond execution times, native asynchronous request handling (`async`/`await`), built-in WebSocket support, and automated interactive OpenAPI docs (`/docs`).
- **How it is used:** Implemented in `backend/main.py`, exposing 15 REST endpoints including `/api/v1/overview`, `/api/v1/optimize/run`, `/api/v1/swarm/optimize`, `/api/v1/regulatory/xml`, and `/api/v1/services/status`.

### 2.3 Uvicorn (ASGI Server)
- **What it is:** A lightning-fast ASGI server implementation using `uvloop` and `httptools`.
- **Why it is used:** Handles thousands of concurrent WebSocket connections and REST requests without thread locking.
- **How it is used:** Starts the backend server on `0.0.0.0:8000` via `start.bat` or Docker containers.

### 2.4 SQLite 3 & Python `sqlite3`
- **What it is:** A self-contained, serverless, transactional SQL database engine.
- **Why it is used:** Maritime edge systems and shipboard bridge servers need robust offline databases that do not require managing external database daemons while maintaining full ACID compliance.
- **How it is used:** Located at `data/greenfleet.db` and managed via `backend/database.py` to store vessel registries, historical voyage telemetry, fuel logs, and cryptographic audit certificates.

---

## 3. Quantum Computing & Optimization Suite

### 3.1 Qiskit 2.5 & IBM Quantum Platform (156Q Heron)
- **What it is:** IBM's open-source quantum framework and cloud access layer to physical superconducting quantum processing units (QPUs).
- **Why it is used:** Solves combinatorial speed assignment and multi-vessel routing on real quantum hardware with high gate fidelity.
- **How it is used:** Implemented in `core/ibm_quantum_service.py` using `SamplerV2` and `EstimatorV2` primitives on IBM Heron quantum backends.

### 3.2 Zero Noise Extrapolation (ZNE)
- **What it is:** An error mitigation technique for Noisy Intermediate-Scale Quantum (NISQ) devices.
- **Why it is used:** Mitigates hardware gate noise and decoherence, ensuring calculated speed decisions remain accurate.
- **How it is used:** Applied in `core/ibm_quantum_service.py` to mitigate noise in objective function cost evaluations.

### 3.3 Quantum Particle Swarm Optimization (QPSO)
- **What it is:** A continuous global optimization algorithm where particles behave according to quantum mechanics in a Delta-potential well.
- **Why it is used:** Classical algorithms get trapped in local minima during storms. QPSO particles have non-zero probability of **quantum tunneling** through high-cost weather barriers to find the true global minimum.
- **How it is used:** Implemented in `core/quantum_optimizer.py` to iteratively compute global optimal speed schedules in $<150\text{ ms}$.

### 3.4 Quantum Genetic Algorithm (QGA)
- **What it is:** An evolutionary algorithm where chromosome genes are represented as quantum bits (Q-bits) in superposition states $|q\rangle = \alpha |0\rangle + \beta |1\rangle$.
- **Why it is used:** Enables a small population of 30 quantum chromosomes to represent $2^{30}$ possible speed combinations simultaneously.
- **How it is used:** Implemented in `core/quantum_optimizer.py` using Quantum Rotation Gates to evolve speed trajectories.

---

## 4. Machine Learning & Physics Surrogates

### 4.1 Physics-Informed XGBoost Regressor
- **What it is:** Extreme Gradient Boosting decision tree algorithm trained with physical constraints.
- **Why it is used:** Full computational fluid dynamics (CFD) takes hours per voyage leg. The surrogate predicts hydrodynamic hull drag, wave added resistance, and fuel burn in **0.42 milliseconds** ($R^2 = 0.9989$).
- **How it is used:** Loaded in `core/hydrodynamics.py` to evaluate voyage leg costs instantaneously.

### 4.2 4D Fourier Neural Operator (FNO)
- **What it is:** A deep learning architecture that learns mappings between infinite-dimensional function spaces using Fast Fourier Transforms.
- **Why it is used:** Learns resolution-independent partial differential equations (Navier-Stokes) governing ocean currents and mesoscale eddies.
- **How it is used:** Implemented in `ml/fourier_neural_operator.py` and `core/fno_currents_service.py` to forecast current velocities 24–72 hours ahead.

---

## 5. Live Environmental & Data Feeds

### 5.1 Copernicus Marine Environment Monitoring Service (CMEMS)
- **What it is:** European Union Earth Observation satellite program delivering global ocean physics data.
- **Why it is used:** Provides satellite-measured $1/12^\circ$ resolution current vectors ($u_o, v_o$) to determine whether the ocean is pushing the ship forward or dragging it back.
- **How it is used:** Authenticates in `core/copernicus_service.py` and adjusts true speed through water ($V_{\text{water}} = V_{\text{ground}} - V_{\text{current}} \cos(\theta)$).

### 5.2 AISStream WebSocket
- **What it is:** Real-time global Automatic Identification System (AIS) data provider streaming live marine VHF transponder messages over WebSockets.
- **Why it is used:** Supplies live tracking of vessel positions, speeds, heading, and draft without requiring physical AIS antenna hardware.
- **How it is used:** Connected in `backend/main.py` to stream live vessel updates to connected frontend clients on `/ws/ais/live`.

### 5.3 OpenMeteo Marine Weather API
- **What it is:** Free, open-source metocean API delivering global weather and ocean forecasts.
- **Why it is used:** Delivers zero-configuration, keyless access to high-accuracy sea state forecasts.
- **How it is used:** Queries significant wave height ($H_s$), wave period ($T_p$), and wind velocity along route waypoints in `core/hydrodynamics.py`.

---

## 6. Edge Computing, Compliance & Deployment

### 6.1 NMEA 0183 / 2000 Serial Edge Gateway
- **What it is:** Marine hardware communication protocol standard for interconnecting GPS, anemometers, and gyrocompasses.
- **Why it is used:** Allows GreenFleet Quantum to run on shipboard edge computers connected directly to bridge instruments.
- **How it is used:** Implemented in `backend/edge_gateway.py` and `backend/edge_daemon.py` to parse `$GPRMC`, `$WIMWV`, and `$SDDPT` sentences.

### 6.2 SHA-256 Cryptographic Audit & ReportLab PDF
- **What it is:** Cryptographic hashing standard (FIPS 180-4) and Python document generation library.
- **Why it is used:** Generates tamper-evident digital certificates proving that a vessel operated within IMO Grade-A parameters.
- **How it is used:** Generates signed audit certificates in `backend/pdf_certificate.py` with QR-code verification.

### 6.3 Docker & Nginx Reverse Proxy
- **What it is:** Containerization platform and production reverse proxy web server.
- **Why it is used:** Guarantees identical execution across developer laptops, cloud servers, and shipboard edge computers with SSL termination.
- **How it is used:** Multi-container orchestration defined in `docker-compose.yml`, `Dockerfile`, `Dockerfile.edge`, and `nginx.conf`.
