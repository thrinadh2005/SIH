"""
Quantum-Inspired Metaheuristic Optimization Engine
===================================================
Contains pure vectorized implementations of:
1. Quantum-Behaved Particle Swarm Optimization (QPSO) - Delta-Potential Wave Mechanics
2. Quantum Genetic Algorithm (QGA) - Q-Bit Superposition & Rotation Gates
3. 3-Tier Hybrid Quantum Optimization Architecture (HQOA: QGA + QPSO + Memetic Refinement)
4. Classical Benchmark Suite (Standard PSO, Classical GA, Dijkstra Grid Baseline)
"""

import math
import time
import random
from typing import List, Tuple, Dict, Any, Callable, Optional


# ─────────────────────────────────────────────────────────────────────────────
# 1. QUANTUM PARTICLE SWARM OPTIMIZER (QPSO)
# ─────────────────────────────────────────────────────────────────────────────

class QuantumParticleSwarmOptimizer:
    """
    Quantum Particle Swarm Optimization (QPSO)
    Based on Delta-Potential Well Wave-Function Superposition & Quantum Tunneling.
    Position update: x(t+1) = p ± β * |mbest - x(t)| * ln(1/u)
    """

    def __init__(self, n_particles: int = 40, max_iter: int = 70,
                 beta_start: float = 1.0, beta_end: float = 0.5):
        self.n_particles = n_particles
        self.max_iter = max_iter
        self.beta_start = beta_start
        self.beta_end = beta_end

    def optimize(self, cost_func: Callable[[List[float]], float],
                 bounds: List[Tuple[float, float]],
                 initial_guess: Optional[List[float]] = None) -> Dict[str, Any]:
        start_time = time.time()
        dim = len(bounds)
        lb = [b[0] for b in bounds]
        ub = [b[1] for b in bounds]

        # Initialize particles in quantum state space
        positions = []
        for i in range(self.n_particles):
            if i == 0 and initial_guess is not None and len(initial_guess) == dim:
                p = list(initial_guess)
            else:
                p = [random.uniform(lb[d], ub[d]) for d in range(dim)]
            positions.append(p)

        # Personal bests
        pbest = [list(p) for p in positions]
        pbest_scores = [cost_func(p) for p in positions]

        # Global best
        best_idx = pbest_scores.index(min(pbest_scores))
        gbest = list(pbest[best_idx])
        gbest_score = pbest_scores[best_idx]

        convergence_history = [gbest_score]
        tunneling_events = 0

        for t in range(self.max_iter):
            # Dynamic Contraction-Expansion coefficient
            beta = self.beta_start - (self.beta_start - self.beta_end) * (t / float(self.max_iter))

            # Compute Mean Best (mbest) of the quantum swarm
            mbest = [0.0] * dim
            for d in range(dim):
                mbest[d] = sum(pbest[i][d] for i in range(self.n_particles)) / float(self.n_particles)

            for i in range(self.n_particles):
                new_pos = [0.0] * dim
                for d in range(dim):
                    phi = random.random()
                    p_attr = phi * pbest[i][d] + (1.0 - phi) * gbest[d]

                    u = max(1e-8, random.random())
                    sign = 1.0 if random.random() > 0.5 else -1.0

                    # Quantum Tunneling delta-potential step
                    step = sign * beta * abs(mbest[d] - positions[i][d]) * math.log(1.0 / u)
                    if abs(step) > (ub[d] - lb[d]) * 0.4:
                        tunneling_events += 1

                    val = p_attr + step
                    # Boundary clamping
                    new_pos[d] = max(lb[d], min(ub[d], val))

                positions[i] = new_pos
                score = cost_func(new_pos)

                # Pbest & Gbest update
                if score < pbest_scores[i]:
                    pbest[i] = list(new_pos)
                    pbest_scores[i] = score
                    if score < gbest_score:
                        gbest = list(new_pos)
                        gbest_score = score

            convergence_history.append(gbest_score)

        elapsed_ms = (time.time() - start_time) * 1000.0

        return {
            "algorithm": "QPSO",
            "optimal_solution": gbest,
            "optimal_cost": gbest_score,
            "convergence_history": convergence_history,
            "iterations": self.max_iter,
            "execution_time_ms": round(elapsed_ms, 2),
            "tunneling_events": tunneling_events
        }


# ─────────────────────────────────────────────────────────────────────────────
# 2. QUANTUM GENETIC ALGORITHM (QGA)
# ─────────────────────────────────────────────────────────────────────────────

class QuantumGeneticAlgorithm:
    """
    Quantum Genetic Algorithm (QGA)
    Represents individuals with Q-bit superposition [alpha, beta]^T = [cos theta, sin theta]^T.
    Applies Quantum Rotation Gates U(Delta theta) to evolve probabilities directly.
    """

    def __init__(self, pop_size: int = 30, max_iter: int = 80, theta_step: float = 0.05 * math.pi):
        self.pop_size = pop_size
        self.max_iter = max_iter
        self.theta_step = theta_step

    def optimize(self, cost_func: Callable[[List[float]], float],
                 bounds: List[Tuple[float, float]]) -> Dict[str, Any]:
        start_time = time.time()
        dim = len(bounds)
        lb = [b[0] for b in bounds]
        ub = [b[1] for b in bounds]

        # Initialize Q-bit angles in equal superposition (theta = pi/4 -> alpha = beta = 1/sqrt(2))
        q_angles = [[math.pi / 4.0 for _ in range(dim)] for _ in range(self.pop_size)]

        gbest = [0.5 * (lb[d] + ub[d]) for d in range(dim)]
        gbest_score = cost_func(gbest)
        convergence_history = [gbest_score]

        for t in range(self.max_iter):
            # Observe/collapse quantum states to classical real parameters
            population_real = []
            fitness_scores = []

            for i in range(self.pop_size):
                candidate = [0.0] * dim
                for d in range(dim):
                    alpha = math.cos(q_angles[i][d])
                    # Probability of state |1> is beta^2 = sin^2(theta)
                    p_state = (math.sin(q_angles[i][d])) ** 2
                    # Scale according to probability
                    candidate[d] = lb[d] + p_state * (ub[d] - lb[d])
                    # Small stochastic perturbation
                    candidate[d] += random.gauss(0, (ub[d] - lb[d]) * 0.02)
                    candidate[d] = max(lb[d], min(ub[d], candidate[d]))

                score = cost_func(candidate)
                population_real.append(candidate)
                fitness_scores.append(score)

                if score < gbest_score:
                    gbest = list(candidate)
                    gbest_score = score

            # Quantum Rotation Gate Updates U(Delta theta)
            for i in range(self.pop_size):
                for d in range(dim):
                    # Direction of rotation toward best
                    curr_val = population_real[i][d]
                    best_val = gbest[d]

                    delta_theta = self.theta_step * (1.0 - t / float(self.max_iter))
                    if curr_val < best_val:
                        q_angles[i][d] += delta_theta
                    else:
                        q_angles[i][d] -= delta_theta

                    # Quantum NOT-gate mutation with low probability
                    if random.random() < 0.03:
                        q_angles[i][d] = 0.5 * math.pi - q_angles[i][d]

            convergence_history.append(gbest_score)

        elapsed_ms = (time.time() - start_time) * 1000.0

        return {
            "algorithm": "QGA",
            "optimal_solution": gbest,
            "optimal_cost": gbest_score,
            "convergence_history": convergence_history,
            "iterations": self.max_iter,
            "execution_time_ms": round(elapsed_ms, 2)
        }


# ─────────────────────────────────────────────────────────────────────────────
# 3. 3-TIER HYBRID QUANTUM OPTIMIZER (HQOA)
# ─────────────────────────────────────────────────────────────────────────────

class HybridQuantumOptimizer:
    """
    3-Tier Hybrid Quantum-Classical Memetic Optimizer (HQOA)
    1. Tier 1: QGA explores the broad discrete/continuous space with Q-bit superposition.
    2. Tier 2: QPSO takes QGA's best candidate and executes delta-potential quantum tunneling.
    3. Tier 3: Quantum Memetic Local Refinement polishes the Pareto frontier.
    """

    def __init__(self, qga_iter: int = 20, qpso_iter: int = 35, n_particles: int = 35):
        self.qga_iter = qga_iter
        self.qpso_iter = qpso_iter
        self.n_particles = n_particles

    def optimize(self, cost_func: Callable[[List[float]], float],
                 bounds: List[Tuple[float, float]]) -> Dict[str, Any]:
        start_time = time.time()

        # Stage 1: Fast QGA Macro Search
        qga = QuantumGeneticAlgorithm(pop_size=24, max_iter=self.qga_iter)
        qga_res = qga.optimize(cost_func, bounds)
        qga_best = qga_res["optimal_solution"]

        # Stage 2: QPSO Quantum Tunneling with QGA seed as attractor
        qpso = QuantumParticleSwarmOptimizer(
            n_particles=self.n_particles,
            max_iter=self.qpso_iter,
            beta_start=1.05,
            beta_end=0.45
        )
        qpso_res = qpso.optimize(cost_func, bounds, initial_guess=qga_best)
        qpso_best = qpso_res["optimal_solution"]
        qpso_cost = qpso_res["optimal_cost"]

        # Stage 3: Local Memetic Refinement
        dim = len(bounds)
        lb = [b[0] for b in bounds]
        ub = [b[1] for b in bounds]
        refined_solution = list(qpso_best)
        refined_cost = qpso_cost

        for step in [0.2, 0.05, 0.01]:
            for d in range(dim):
                for delta in [-step, step]:
                    test_sol = list(refined_solution)
                    test_sol[d] = max(lb[d], min(ub[d], test_sol[d] + delta))
                    test_cost = cost_func(test_sol)
                    if test_cost < refined_cost:
                        refined_cost = test_cost
                        refined_solution = list(test_sol)

        # Merge convergence curves
        merged_history = list(qga_res["convergence_history"]) + list(qpso_res["convergence_history"][1:])
        merged_history.append(refined_cost)

        elapsed_ms = (time.time() - start_time) * 1000.0

        return {
            "algorithm": "Hybrid HQOA (QGA + QPSO)",
            "optimal_solution": refined_solution,
            "optimal_cost": refined_cost,
            "convergence_history": merged_history,
            "iterations": len(merged_history),
            "execution_time_ms": round(elapsed_ms, 2),
            "qga_stage_cost": qga_res["optimal_cost"],
            "qpso_stage_cost": qpso_cost,
            "final_memetic_cost": refined_cost,
            "tunneling_events": qpso_res.get("tunneling_events", 12)
        }


# ─────────────────────────────────────────────────────────────────────────────
# 4. CLASSICAL BASELINES (PSO, GA, DIJKSTRA)
# ─────────────────────────────────────────────────────────────────────────────

class ClassicalPSO:
    """Standard Classical Particle Swarm Optimization with inertia weight."""
    def __init__(self, n_particles: int = 40, max_iter: int = 140, w: float = 0.72, c1: float = 1.49, c2: float = 1.49):
        self.n_particles = n_particles
        self.max_iter = max_iter
        self.w = w
        self.c1 = c1
        self.c2 = c2

    def optimize(self, cost_func: Callable[[List[float]], float],
                 bounds: List[Tuple[float, float]]) -> Dict[str, Any]:
        start_time = time.time()
        dim = len(bounds)
        lb = [b[0] for b in bounds]
        ub = [b[1] for b in bounds]

        positions = [[random.uniform(lb[d], ub[d]) for d in range(dim)] for _ in range(self.n_particles)]
        velocities = [[random.uniform(-(ub[d]-lb[d])*0.1, (ub[d]-lb[d])*0.1) for d in range(dim)] for _ in range(self.n_particles)]

        pbest = [list(p) for p in positions]
        pbest_scores = [cost_func(p) for p in positions]

        best_idx = pbest_scores.index(min(pbest_scores))
        gbest = list(pbest[best_idx])
        gbest_score = pbest_scores[best_idx]
        convergence_history = [gbest_score]

        for _ in range(self.max_iter):
            for i in range(self.n_particles):
                for d in range(dim):
                    r1 = random.random()
                    r2 = random.random()
                    velocities[i][d] = (self.w * velocities[i][d] +
                                        self.c1 * r1 * (pbest[i][d] - positions[i][d]) +
                                        self.c2 * r2 * (gbest[d] - positions[i][d]))
                    positions[i][d] = max(lb[d], min(ub[d], positions[i][d] + velocities[i][d]))

                score = cost_func(positions[i])
                if score < pbest_scores[i]:
                    pbest[i] = list(positions[i])
                    pbest_scores[i] = score
                    if score < gbest_score:
                        gbest = list(positions[i])
                        gbest_score = score
            convergence_history.append(gbest_score)

        elapsed_ms = (time.time() - start_time) * 1000.0
        return {
            "algorithm": "Classical PSO",
            "optimal_solution": gbest,
            "optimal_cost": gbest_score,
            "convergence_history": convergence_history,
            "iterations": self.max_iter,
            "execution_time_ms": round(elapsed_ms, 2)
        }


class ClassicalGA:
    """Standard Classical Genetic Algorithm with selection, crossover, and mutation."""
    def __init__(self, pop_size: int = 50, max_iter: int = 200, crossover_rate: float = 0.8, mutation_rate: float = 0.1):
        self.pop_size = pop_size
        self.max_iter = max_iter
        self.crossover_rate = crossover_rate
        self.mutation_rate = mutation_rate

    def optimize(self, cost_func: Callable[[List[float]], float],
                 bounds: List[Tuple[float, float]]) -> Dict[str, Any]:
        start_time = time.time()
        dim = len(bounds)
        lb = [b[0] for b in bounds]
        ub = [b[1] for b in bounds]

        pop = [[random.uniform(lb[d], ub[d]) for d in range(dim)] for _ in range(self.pop_size)]
        scores = [cost_func(p) for p in pop]

        best_idx = scores.index(min(scores))
        gbest = list(pop[best_idx])
        gbest_score = scores[best_idx]
        convergence_history = [gbest_score]

        for _ in range(self.max_iter):
            # Tournament selection
            new_pop = []
            for _ in range(self.pop_size // 2):
                # Parents
                i1, i2 = random.sample(range(self.pop_size), 2)
                p1 = pop[i1] if scores[i1] < scores[i2] else pop[i2]
                i3, i4 = random.sample(range(self.pop_size), 2)
                p2 = pop[i3] if scores[i3] < scores[i4] else pop[i4]

                # Crossover
                c1, c2 = list(p1), list(p2)
                if random.random() < self.crossover_rate:
                    point = random.randint(1, dim - 1) if dim > 1 else 0
                    c1 = p1[:point] + p2[point:]
                    c2 = p2[:point] + p1[point:]

                # Mutation
                for child in [c1, c2]:
                    for d in range(dim):
                        if random.random() < self.mutation_rate:
                            child[d] = max(lb[d], min(ub[d], child[d] + random.gauss(0, (ub[d] - lb[d]) * 0.1)))
                    new_pop.append(child)

            pop = new_pop
            scores = [cost_func(p) for p in pop]
            min_score = min(scores)
            if min_score < gbest_score:
                gbest_score = min_score
                gbest = list(pop[scores.index(min_score)])
            convergence_history.append(gbest_score)

        elapsed_ms = (time.time() - start_time) * 1000.0
        return {
            "algorithm": "Classical GA",
            "optimal_solution": gbest,
            "optimal_cost": gbest_score,
            "convergence_history": convergence_history,
            "iterations": self.max_iter,
            "execution_time_ms": round(elapsed_ms, 2)
        }


class DijkstraSpeedOptimizer:
    """Discretized speed grid baseline solver (mimics classical ECDIS routing)."""
    def __init__(self, speed_levels: int = 5):
        self.speed_levels = speed_levels

    def optimize(self, cost_func: Callable[[List[float]], float],
                 bounds: List[Tuple[float, float]]) -> Dict[str, Any]:
        start_time = time.time()
        dim = len(bounds)
        lb = [b[0] for b in bounds]
        ub = [b[1] for b in bounds]

        # Fixed static average speed grid search
        best_sol = [(lb[d] + ub[d]) * 0.5 for d in range(dim)]
        best_cost = cost_func(best_sol)
        convergence_history = [best_cost]

        # Check discreet candidate levels
        for level in range(self.speed_levels):
            factor = (level + 1) / float(self.speed_levels + 1)
            candidate = [lb[d] + factor * (ub[d] - lb[d]) for d in range(dim)]
            cost = cost_func(candidate)
            if cost < best_cost:
                best_cost = cost
                best_sol = list(candidate)
            convergence_history.append(best_cost)

        elapsed_ms = (time.time() - start_time) * 1000.0
        return {
            "algorithm": "Dijkstra Static Baseline",
            "optimal_solution": best_sol,
            "optimal_cost": best_cost,
            "convergence_history": convergence_history,
            "iterations": self.speed_levels,
            "execution_time_ms": round(elapsed_ms, 2)
        }
