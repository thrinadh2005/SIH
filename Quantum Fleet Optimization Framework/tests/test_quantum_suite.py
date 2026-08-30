"""
Unit and Integration Tests for Quantum Optimizer & Hydrodynamics
"""

import unittest
from core.hydrodynamics import HydrodynamicModel, FUEL_PROPERTIES
from core.quantum_optimizer import (
    QuantumParticleSwarmOptimizer,
    QuantumGeneticAlgorithm,
    HybridQuantumOptimizer,
    ClassicalPSO,
    ClassicalGA,
    DijkstraSpeedOptimizer
)
from core.dataset_generator import GLOBAL_CORRIDORS, evaluate_voyage_cost


class TestHydrodynamics(unittest.TestCase):
    def test_calm_water_power_scaling(self):
        hydro = HydrodynamicModel("CONTAINER_15000TEU")
        p10 = hydro.calculate_calm_water_power(10.0)
        p20 = hydro.calculate_calm_water_power(20.0)
        # Power scales cubically with speed (20^3 / 10^3 = 8)
        self.assertAlmostEqual(p20 / p10, 8.0, delta=0.1)

    def test_wave_drag_positive(self):
        hydro = HydrodynamicModel("CONTAINER_15000TEU")
        p_wave = hydro.calculate_added_wave_power(14.0, wave_height_m=3.5)
        self.assertGreater(p_wave, 500.0)

    def test_cii_grade_calculation(self):
        hydro = HydrodynamicModel("CONTAINER_15000TEU")
        cii_res = hydro.calculate_cii_score(450.0, 8280.0, fuel_type="VLSFO")
        self.assertIn(cii_res["grade"], ["A", "B", "C"])
        self.assertTrue(cii_res["is_compliant"])


class TestQuantumOptimizers(unittest.TestCase):
    def setUp(self):
        self.corridor = GLOBAL_CORRIDORS["SIN_ROT"]
        n_legs = len(self.corridor["waypoints"]) - 1
        self.bounds = [(12.0, 19.0) for _ in range(n_legs)]

        def cost_fn(speeds):
            res = evaluate_voyage_cost(speeds, self.corridor, vessel_type="CONTAINER_15000TEU", fuel_type="VLSFO")
            return res["total_cost_usd"]

        self.cost_fn = cost_fn

    def test_qpso_execution(self):
        qpso = QuantumParticleSwarmOptimizer(n_particles=20, max_iter=25)
        res = qpso.optimize(self.cost_fn, self.bounds)
        self.assertEqual(res["algorithm"], "QPSO")
        self.assertLess(res["optimal_cost"], 4500000.0)
        self.assertGreater(len(res["convergence_history"]), 10)

    def test_qga_execution(self):
        qga = QuantumGeneticAlgorithm(pop_size=15, max_iter=20)
        res = qga.optimize(self.cost_fn, self.bounds)
        self.assertEqual(res["algorithm"], "QGA")
        self.assertLess(res["optimal_cost"], 4500000.0)

    def test_hybrid_hqoa_execution(self):
        hqoa = HybridQuantumOptimizer(qga_iter=10, qpso_iter=15, n_particles=18)
        res = hqoa.optimize(self.cost_fn, self.bounds)
        self.assertEqual(res["algorithm"], "Hybrid HQOA (QGA + QPSO)")
        self.assertLess(res["optimal_cost"], 4500000.0)
        self.assertLess(res["execution_time_ms"], 3000.0)


if __name__ == "__main__":
    unittest.main()
