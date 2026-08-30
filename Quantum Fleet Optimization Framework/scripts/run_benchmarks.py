"""
Production Multi-Corridor Algorithm Tournament Runner (SIH-26138)
==================================================================
Runs head-to-head performance benchmarks across all 5 optimization
algorithms and all major global shipping corridors:
1. Hybrid Quantum Optimizer (HQOA: QGA + QPSO + Memetic Pareto)
2. Pure Quantum Particle Swarm Optimization (QPSO)
3. Classical Particle Swarm Optimization (PSO)
4. Classical Genetic Algorithm (GA)
5. Dijkstra Dynamic Speed Grid Search

Exports results to 'models/benchmark_tournament_results.json'.
"""

import os
import sys
import json
import time
import pandas as pd

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.quantum_optimizer import (
    QuantumParticleSwarmOptimizer,
    QuantumGeneticAlgorithm,
    HybridQuantumOptimizer,
    ClassicalPSO,
    ClassicalGA,
    DijkstraSpeedOptimizer
)
from core.dataset_generator import GLOBAL_CORRIDORS, evaluate_voyage_cost

def run_tournament():
    print("=" * 75)
    print("GREENFLEET QUANTUM: MULTI-CORRIDOR ALGORITHM TOURNAMENT")
    print("=" * 75)

    corridors = ["SIN_ROT", "SHA_BOM", "RST_ROT"]
    tournament_results = {}

    for corridor_id in corridors:
        corridor = GLOBAL_CORRIDORS[corridor_id]
        clean_name = corridor['name'].replace("\u2192", "->")
        print(f"\nEvaluating Corridor: {clean_name} ({corridor['distance_nm']:,} NM)...")
        waypoints = corridor["waypoints"]
        n_legs = len(waypoints) - 1
        bounds = [(11.0, 20.0) for _ in range(n_legs)]

        def cost_fn(speeds):
            res = evaluate_voyage_cost(speeds, corridor, vessel_type="CONTAINER_15000TEU", fuel_type="VLSFO")
            return res["total_cost_usd"]

        solvers = {
            "Hybrid HQOA (QGA+QPSO)": HybridQuantumOptimizer(qga_iter=15, qpso_iter=30, n_particles=30),
            "Pure QPSO (Quantum)": QuantumParticleSwarmOptimizer(n_particles=35, max_iter=50),
            "Classical PSO": ClassicalPSO(n_particles=40, max_iter=90),
            "Classical GA": ClassicalGA(pop_size=40, max_iter=100),
            "Dijkstra Baseline": DijkstraSpeedOptimizer(speed_levels=5)
        }

        baseline_speeds = [16.5] * n_legs
        base_eval = evaluate_voyage_cost(baseline_speeds, corridor, vessel_type="CONTAINER_15000TEU", fuel_type="VLSFO")
        base_fuel = base_eval["total_fuel_mt"]

        corridor_data = []

        for name, solver in solvers.items():
            t0 = time.time()
            res = solver.optimize(cost_fn, bounds)
            runtime_ms = round((time.time() - t0) * 1000, 1)

            opt_eval = evaluate_voyage_cost(res["optimal_solution"], corridor, vessel_type="CONTAINER_15000TEU", fuel_type="VLSFO")
            fuel_saved_mt = max(0.0, base_fuel - opt_eval["total_fuel_mt"])
            fuel_saved_pct = round((fuel_saved_mt / max(1.0, base_fuel)) * 100.0, 2)
            cost_saved_usd = round(max(0.0, base_eval["total_cost_usd"] - opt_eval["total_cost_usd"]), 2)

            corridor_data.append({
                "algorithm": name,
                "runtime_ms": runtime_ms,
                "iterations": res["iterations"],
                "fuel_consumed_mt": round(opt_eval["total_fuel_mt"], 1),
                "fuel_saved_pct": fuel_saved_pct,
                "cost_saved_usd": cost_saved_usd,
                "co2_avoided_mt": round(max(0.0, base_eval["total_co2_wtw_mt"] - opt_eval["total_co2_wtw_mt"]), 1),
                "cii_grade": opt_eval["cii_grade"]
            })

        corridor_data.sort(key=lambda x: -x["fuel_saved_pct"])
        tournament_results[corridor_id] = corridor_data

        # Print formatted table
        df_res = pd.DataFrame(corridor_data)
        print(df_res[["algorithm", "runtime_ms", "iterations", "fuel_saved_pct", "cost_saved_usd", "cii_grade"]].to_string(index=False))

    out_path = "models/benchmark_tournament_results.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(tournament_results, f, indent=2)

    print(f"\n* Saved Tournament Results to '{out_path}'")
    print("=" * 75)
    print("TOURNAMENT COMPLETED SUCCESSFULLY!")
    print("=" * 75)


if __name__ == "__main__":
    run_tournament()
