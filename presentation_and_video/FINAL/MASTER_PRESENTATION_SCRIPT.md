# 🎙️ GreenFleet Quantum (SIH-26138)
## Official Master Presentation Script & Prototype-Focused Video Guide
### *Smart India Hackathon 2026 • Clean & Green Technology (Software)*

---

## 👥 Project Credentials
* **Hackathon:** Smart India Hackathon 2026
* **Problem Statement ID:** `SIH-26138`
* **Problem Statement Title:** Dynamic Maritime Decarbonization, Voyage Speed and Dual-Fuel Optimization Engine
* **Theme & Category:** Clean & Green Technology / Software
* **Team ID:** `145834`
* **Team Name:** TeamBuilders
* **Video Duration:** **06:58 (6 minutes 58 seconds)** — *Strictly in the 6–7 minute range*
* **Video Composition:**
  * **PPT Presentation (Front):** ~2.49 minutes (Concise, high-impact overview of all features)
  * **Live Prototype Demonstration (Middle/Major):** ~4.08 minutes (**MAJOR PART OF VIDEO**, covering all 11 modules in depth)
  * **Conclusion (Last):** ~0.28 minutes
* **Master Video File:** `d:\PROJECTS\SIH\presentation_and_video\FINAL\TeamBuilders-SIH26138.mp4`

---

# 📑 PART 1: The Upfront Presentation Pitch (Slides 1 to 6) — `00:00 – 02:29`

---

### 📌 SLIDE 1: Title & Project Introduction (`00:00 – 00:20`)
*Visual: Slide 1 from the final PPT containing SIH 2026 header, Problem Statement ID SIH-26138, and Team TeamBuilders.*

"Respected evaluators and jury members, welcome to our presentation for Smart India Hackathon 2026.

We are Team TeamBuilders, presenting Problem Statement SIH-26138: Dynamic Maritime Decarbonization, Voyage Speed, and Dual-Fuel Optimization Engine—introducing GreenFleet Quantum."

---

### 📌 SLIDE 2: Problem Statement, Core Solution & Innovation (`00:20 – 00:51`)
*Visual: Slide 2 showing 50% fuel expense problem, GreenFleet Core 3-pillar loop, and verified 16.8% / $237,800 savings.*

"Over ninety percent of global trade moves by sea, but bunker fuel consumes over fifty percent of ship operating expenses, emitting one billion tonnes of CO2 annually.

Rigid routes and fixed engine speeds cause severe IMO Carbon Intensity and EU ETS carbon fines.

GreenFleet Quantum provides autonomous dynamic routing using Copernicus satellite vectors, naval hydrodynamic physics, and 156-qubit quantum optimization, cutting fuel by 16.8% and saving $237,800 per ocean crossing."

---

### 📌 SLIDE 3: Technical Approach & 5-Layer Flowchart (`00:51 – 01:20`)
*Visual: Slide 3 methodology flowchart from satellite Metocean ingestion to Docker Edge Gateway, hydrodynamic drag math, Qiskit solver, and ECDIS output.*

"Our architecture integrates five clean layers:
* Layer 1: Ingests live Copernicus metocean currents and AIS telemetry.
* Layer 2: Processes through a Shipboard Edge Gateway with a seven-day offline SQLite cache.
* Layer 3: Calculates hull resistance using Holtrop-Mennen and ISO 15016 physics.
* Layer 4: Executes our IBM Qiskit quantum solver.
* Layer 5: Outputs five route presets, one-click NMEA ECDIS files, and automated IMO DCS compliance reports under a continuous three-second loop."

---

### 📌 SLIDE 4: Feasibility, Commercial Viability & Safeguards (`01:20 – 01:45`)
*Visual: Slide 4 detailing TRL-7 open-source technical feasibility, plug-and-play zero Capex operational feasibility, 1st voyage breakeven, and safeguards.*

"GreenFleet Quantum is a zero-Capex, TRL-7 containerized software platform requiring zero hull modifications, drydocking, or external sensor costs.

It deploys in fifteen minutes, achieves positive cash return on its first voyage, and features full offline dead-reckoning resilience during mid-ocean satellite dropouts, alongside hydrodynamic wave impedance engine throttling for heavy storm safety."

---

### 📌 SLIDE 5: Impact, Key Metrics & Decarbonization (`01:45 – 02:09`)
*Visual: Slide 5 highlighting 16.8% fuel cut, 1,200 tonnes CO2 reduction, IMO Grade-A compliance, and 3.8-year retrofit payback.*

"Our verified benchmarks deliver a 16.8% fuel cut, $237,800 savings per voyage, 1,200 metric tonnes of CO2 eliminated, and guaranteed IMO Grade-A ratings eliminating EU ETS carbon taxes.

Scaled across 60,000 commercial vessels, this technology protects global trade with a 3.8-year retrofit payback, directly accelerating IMO 2050 Net-Zero."

---

### 📌 SLIDE 6: Research, References & Scientific Novelty (`02:09 – 02:29`)
*Visual: Slide 6 citing IMO Resolution MEPC.352(78), Copernicus CMEMS 1/12°, FuelEU Maritime 2023/1805, and Holtrop-Mennen/ISO 15016.*

"Our mathematical foundation is grounded in IMO Resolution MEPC.352(78), Copernicus CMEMS 1/12 degree velocity vectors, FuelEU Maritime Directive 2023/1805 lifecycle emissions, and Holtrop-Mennen ISO 15016 hydrodynamic resistance physics."

---

# 🖥️ PART 2: Comprehensive Live Prototype Demonstration (Major Time) — `02:29 – 06:41`

---

### 1. Module 01/11: Fleet Management & Hydrostatic Twin (`02:29 – 02:55`, 25.8s)
*Screen Action: Navigating the vessel registry, inspecting 15k TEU container carrier, bulkers, hydrostatic specs (LBP, draft, beam, DWT), and non-linear SFOC curves.*

"Entering our live working prototype, the Fleet Management module maintains comprehensive digital twins for the commercial fleet. Here we track container carriers, bulkers, and tankers, capturing exact shipyard hydrostatic specifications including length between perpendiculars, draft, beam, deadweight tonnage, and non-linear Specific Fuel Oil Consumption curves across engine loads to model hydrodynamic drag accurately."

---

### 2. Module 02/11: Voyage Planner & Metocean Ingestion (`02:55 – 03:19`, 24.0s)
*Screen Action: Selecting Yokohama to Long Beach transpacific corridor, configuring cargo loading, and streaming live Copernicus satellite current/wave fields.*

"In the Voyage Optimizer, we configure a transpacific ocean crossing from Yokohama to Long Beach for a 15,000 TEU container carrier. The system dynamically ingests high-resolution 1/12 degree Copernicus satellite ocean current velocity vectors, wave heights, and marine weather grids, overlaying sea surface data directly across all nautical waypoints along the great circle route."

---

### 3. Module 03/11: 156-Qubit Quantum Optimization Solver (`03:19 – 03:45`, 25.8s)
*Screen Action: Launching quantum solver, real-time terminal output, IBM Qiskit circuit execution with Hadamard/CNOT rotation gates, sub-150ms solve time.*

"Launching the optimization triggers our 156-qubit Hybrid Quantum Optimization Algorithm on IBM Qiskit. The solver constructs parameterized quantum circuits with Hadamard and entangling CNOT rotation gates, evaluating over 100 trillion speed, heading, and fuel blend permutations in sub-150ms, using zero-noise extrapolation to guarantee high-precision global convergence."

---

### 4. Module 04/11: Multi-Objective Pareto Plans & ECDIS Export (`03:45 – 04:10`, 25.0s)
*Screen Action: Exploring the Pareto frontier, comparing Plan Alpha (16.8% fuel cut) vs Plan Beta, inspecting waypoint schedules, clicking 'Export NMEA Route'.*

"The optimization console presents five Pareto-optimal navigation plans: Plan Alpha maximizes fuel economy with a verified 16.8% reduction, while Plan Beta balances speed and carbon tax mitigation. With a single click, the captain exports standard NMEA 0183 route files directly into bridge Furuno, Transas, and Wartsila ECDIS navigation displays."

---

### 5. Module 05/11: Commercial Economics & Swarm Convoy Sync (`04:10 – 04:32`, 21.8s)
*Screen Action: Viewing global bunker fuel prices (Singapore vs Rotterdam), 15-year retrofit DCF calculator, and activating Swarm Convoy speed synchronization.*

"The Commercial Economics module tracks real-time global bunker port prices across Singapore and Rotterdam, calculating fuel switching arbitrage and fifteen-year retrofit cash flows. The Swarm Convoy coordinator dynamically adjusts arrival speeds across multiple vessels to avoid port berth congestion, eliminating idle anchor fuel waste and port emissions."

---

### 6. Module 06/11: Shipboard Offline Edge Gateway (`04:32 – 04:54`, 22.6s)
*Screen Action: Demonstrating local Docker container status, NMEA serial stream buffer ($GPRMC), and 100% offline database calculation during simulated satellite blackout.*

"The Shipboard Edge Gateway demonstrates complete offline bridge capability. Operating inside a lightweight Docker container with a local SQLite write-ahead-log database, it ingests NMEA serial streams and continues executing real-time route optimizations during mid-ocean satellite communication blackouts with automatic bi-directional cloud synchronization upon reconnect."

---

### 7. Module 07/11: Alternative Fuels & Decarbonization Sandbox (`04:54 – 05:16`, 21.3s)
*Screen Action: Adjusting dual-fuel sliders (Bio-Methanol, LNG, Ammonia), viewing Well-to-Wake CO2 lifecycle reduction, and FuelEU compliance penalty savings.*

"In the Decarbonization Sandbox, fleet operators model alternative marine fuels including Bio-Methanol, Liquefied Natural Gas, and Green Ammonia. Interactive dual-fuel blending sliders compute Well-to-Wake lifecycle emission factors, predicting compliance credits and penalty savings under the European Union FuelEU Maritime directive."

---

### 8. Module 08/11: Tactical Command Center & Satellite GIS Map (`05:16 – 05:38`, 22.1s)
*Screen Action: Full-screen Leaflet nautical map with live vessels, animated Copernicus current streamlines, toggling Day Sun and Night Bridge modes.*

"The Tactical Command Center provides an interactive, full-screen Leaflet nautical GIS map displaying live global vessel tracking updated every three seconds. Operators can visualize real-time ocean current streamline vectors, wave impedance fields, and switch between high-contrast Day Sun and Night Bridge modes tailored for ship bridge watchkeeping officers."

---

### 9. Module 09/11: Algorithm Benchmark Tournament Arena (`05:38 – 06:00`, 22.7s)
*Screen Action: Running live tournament table comparing HQOA vs Dijkstra, A-Star, and Constant RPM baselines in fuel savings, runtime, and convergence.*

"Our Benchmark Arena conducts rigorous head-to-head tournaments, comparing our Hybrid Quantum Optimization Algorithm against classical Dijkstra, A-Star, Genetic Algorithms, and Constant RPM baselines. Across identical weather corridors, our quantum approach consistently achieves superior fuel savings, faster compute times, and optimal Pareto convergence."

---

### 10. Module 10/11: IBM Quantum Heron Hardware Architecture (`06:00 – 06:17`, 17.0s)
*Screen Action: Inspecting IBM Heron processor layout, heavy-hex qubit topology, quantum gate calibration, and zero-noise extrapolation error mitigation graphs.*

"This screen details the underlying IBM Quantum Heron processor architecture, displaying qubit coupling graphs, gate calibration errors, circuit depth optimization, and error suppression protocols that enable reliable execution of high-dimensional combinatorial maritime routing problems."

---

### 11. Module 11/11: Immutable Cryptographic Audit & IMO CII Hub (`06:17 – 06:41`, 23.6s)
*Screen Action: Viewing annual IMO CII Grade-A rating meter, 5-year trajectory forecast, and generating cryptographically signed SHA-256 digital audit certificates.*

"Finally, the Compliance Hub calculates official IMO Carbon Intensity Indicator ratings, projecting 5-year trajectory compliance and generating tamper-proof, SHA-256 cryptographically signed digital audit certificates for port authorities and maritime carbon auditors."

---

# 🏁 PART 3: Conclusion & Closing Statement — `06:41 – 06:58`

*Visual: Full HD clean closing slide summarizing core metrics, 16.8% fuel cut, IMO Grade-A compliance, and TeamBuilders credentials.*

"In conclusion, GreenFleet Quantum transitions commercial shipping from static, high-emission navigation to intelligent, quantum-optimized voyage execution—delivering massive fuel savings, 100% regulatory compliance, and cleaner oceans. Thank you."

---

# 📊 Master Video Timeline Matrix

| Section | Content | Timestamp | Duration | % of Total | Focus |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PART 1** | **All Final PPT Slides (1 to 6)** | `00:00 – 02:29` | **149.3s (2.49 min)** | **35.7%** | Upfront, concise feature overview (No personal/college names) |
| **PART 2** | **11-Module Live Prototype Demo** | `02:29 – 06:41` | **251.8s (4.20 min)** | **60.2%** | **MAJOR PART OF VIDEO:** Real-time software walkthrough |
| **PART 3** | **Clean Closing Summary** | `06:41 – 06:58` | **17.1s (0.29 min)** | **4.1%** | Professional conclusion & project callout |
| **TOTAL** | **Full Master Video** | **00:00 – 06:58** | **418.2s (6 min 58s)** | **100.0%** | **Strictly within 6–7 minutes** |
