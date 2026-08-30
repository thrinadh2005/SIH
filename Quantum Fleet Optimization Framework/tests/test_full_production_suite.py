"""
Production Full-Stack Test Suite for GreenFleet Quantum (SIH-26138)
===================================================================
Executes exhaustive automated verification covering:
1. Hydrodynamic Engine & IMO 4th GHG Carbon Factors
2. Pure & Hybrid Quantum-Inspired Metaheuristics (QGA, QPSO, HQOA)
3. Physics-Informed ML Surrogate Regressor Model Inference
4. Dataset File Structure & Row Integrity in data/
5. Live FastAPI REST API Endpoints & Dynamic JSON Schemas
"""

import os
import sys
import unittest
import json
import joblib
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.hydrodynamics import HydrodynamicModel, FUEL_PROPERTIES, VESSEL_TYPES
from core.quantum_optimizer import (
    QuantumParticleSwarmOptimizer,
    QuantumGeneticAlgorithm,
    HybridQuantumOptimizer,
    ClassicalPSO,
    ClassicalGA,
    DijkstraSpeedOptimizer
)
from core.dataset_generator import GLOBAL_CORRIDORS, evaluate_voyage_cost
from backend.main import app


class TestHydrodynamicPhysics(unittest.TestCase):
    def setUp(self):
        self.hydro = HydrodynamicModel("CONTAINER_15000TEU")

    def test_calm_water_admiralty_law(self):
        p10 = self.hydro.calculate_calm_water_power(10.0)
        p20 = self.hydro.calculate_calm_water_power(20.0)
        self.assertAlmostEqual(p20 / p10, 8.0, delta=0.05)

    def test_wave_drag_directional_factors(self):
        p_head = self.hydro.calculate_added_wave_power(14.0, wave_height_m=3.0, wave_angle_deg=0.0)
        p_beam = self.hydro.calculate_added_wave_power(14.0, wave_height_m=3.0, wave_angle_deg=90.0)
        p_follow = self.hydro.calculate_added_wave_power(14.0, wave_height_m=3.0, wave_angle_deg=180.0)
        self.assertGreater(p_head, p_beam)
        self.assertGreater(p_beam, p_follow)

    def test_sfoc_engine_load_curve(self):
        sfoc_optimal = self.hydro.get_sfoc(78.0)
        sfoc_low = self.hydro.get_sfoc(30.0)
        sfoc_overload = self.hydro.get_sfoc(104.0)
        self.assertLess(sfoc_optimal, sfoc_low)
        self.assertLess(sfoc_optimal, sfoc_overload)

    def test_multi_fuel_wtw_emissions(self):
        res_meth = self.hydro.calculate_fuel_consumption(15.0, distance_nm=1000.0, fuel_type="GREEN_METHANOL")
        res_vlsfo = self.hydro.calculate_fuel_consumption(15.0, distance_nm=1000.0, fuel_type="VLSFO")
        self.assertLess(res_meth["co2_wtw_mt"], res_vlsfo["co2_wtw_mt"])


class TestQuantumOptimizationAlgorithms(unittest.TestCase):
    def setUp(self):
        self.corridor = GLOBAL_CORRIDORS["SIN_ROT"]
        n_legs = len(self.corridor["waypoints"]) - 1
        self.bounds = [(12.0, 19.0) for _ in range(n_legs)]

        def cost_fn(speeds):
            res = evaluate_voyage_cost(speeds, self.corridor, vessel_type="CONTAINER_15000TEU", fuel_type="VLSFO")
            return res["total_cost_usd"]

        self.cost_fn = cost_fn

    def test_hybrid_hqoa_convergence(self):
        hqoa = HybridQuantumOptimizer(qga_iter=10, qpso_iter=20, n_particles=20)
        res = hqoa.optimize(self.cost_fn, self.bounds)
        self.assertEqual(res["algorithm"], "Hybrid HQOA (QGA + QPSO)")
        self.assertGreater(len(res["convergence_history"]), 5)
        self.assertLess(res["optimal_cost"], 5000000.0)

    def test_qpso_tunneling_events(self):
        qpso = QuantumParticleSwarmOptimizer(n_particles=25, max_iter=30)
        res = qpso.optimize(self.cost_fn, self.bounds)
        self.assertIn("tunneling_events", res)
        self.assertGreaterEqual(res["tunneling_events"], 0)

    def test_qga_probability_rotation(self):
        qga = QuantumGeneticAlgorithm(pop_size=20, max_iter=25)
        res = qga.optimize(self.cost_fn, self.bounds)
        self.assertEqual(res["algorithm"], "QGA")
        self.assertEqual(len(res["optimal_solution"]), len(self.bounds))


class TestMLSurrogateModel(unittest.TestCase):
    def test_model_artifact_inference(self):
        model_path = "models/hydrodynamic_fuel_model.joblib"
        self.assertTrue(os.path.exists(model_path), f"Missing model artifact: {model_path}")
        model = joblib.load(model_path)
        
        sample_input = pd.DataFrame([{
            "vessel_type": 1,
            "dwt": 145000.0,
            "displacement": 175000.0,
            "speed_knots": 15.5,
            "draft_ratio": 0.85,
            "wave_height_m": 1.8,
            "wind_speed_kmh": 22.0,
            "wind_angle_deg": 45.0
        }])
        
        pred = model.predict(sample_input)
        self.assertGreater(pred[0], 10.0)
        self.assertLess(pred[0], 250.0)


class TestDatasetIntegrity(unittest.TestCase):
    def test_dataset_files_exist_and_non_empty(self):
        required_datasets = [
            "data/ais_vessel_telemetry.csv",
            "data/ocean_metocean_weather.csv",
            "data/imo_vessel_registry.csv",
            "data/lifecycle_fuel_emissions.csv",
            "data/global_ports_and_corridors.csv"
        ]
        for ds in required_datasets:
            self.assertTrue(os.path.exists(ds), f"Missing dataset: {ds}")
            df = pd.read_csv(ds)
            self.assertGreater(len(df), 0, f"Dataset is empty: {ds}")


class TestFastAPIEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_endpoint(self):
        res = self.client.get("/api/v1/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")

    def test_overview_endpoint(self):
        res = self.client.get("/api/v1/overview")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("total_vessels", data)
        self.assertIn("fuel_saved_ytd_pct", data)

    def test_fleet_endpoint(self):
        res = self.client.get("/api/v1/fleet")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 5)

    def test_optimize_voyage_endpoint(self):
        payload = {
            "corridor_id": "SIN_ROT",
            "vessel_type": "CONTAINER_15000TEU",
            "fuel_type": "GREEN_METHANOL",
            "algorithm": "HYBRID_HQOA"
        }
        res = self.client.post("/api/v1/optimize/voyage", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("savings", data)
        self.assertGreater(data["savings"]["fuel_saved_pct"], 0)

    def test_cii_calculate_endpoint(self):
        payload = {
            "fuel_mt": 480.0,
            "distance_nm": 8280.0,
            "vessel_type": "CONTAINER_15000TEU",
            "fuel_type": "GREEN_METHANOL"
        }
        res = self.client.post("/api/v1/cii/calculate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("grade", data)

    def test_ocean_currents_endpoint(self):
        res = self.client.get("/api/v1/ocean-currents?lat=4.0&lng=100.0")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("uo_ms", data)
        self.assertIn("vo_ms", data)
        self.assertIn("current_speed_knots", data)

    def test_corridor_currents_endpoint(self):
        res = self.client.get("/api/v1/corridor-currents?corridor_id=SIN_ROT")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("waypoints_currents", data)
        self.assertGreater(len(data["waypoints_currents"]), 0)

    def test_quantum_real_trial_endpoint(self):
        res = self.client.post("/api/v1/quantum/real-trial?legs=4&shots=512")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["is_real_quantum_circuit"])
        self.assertIn("optimal_bitstring", data)
        self.assertIn("quantum_fidelity", data)

    def test_quantum_status_endpoint(self):
        res = self.client.get("/api/v1/quantum/status")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["is_operational"])
        self.assertIn("backend", data)


if __name__ == "__main__":
    unittest.main()

