"""
GreenFleet Quantum - Dual-Fuel Engine Retrofit & Wind-Assistance ROI Simulator
==============================================================================
Provides capital expenditure (CAPEX) financial modeling for shipowners:
1. Green Methanol Dual-Fuel Retrofit (MAN B&W ME-LGIM / WinGD)
2. LNG Dual-Fuel Retrofit (Cryogenic fuel gas supply system + tanks)
3. Wing Sail & Flettner Rotor Wind-Assisted Propulsion (WAPS)
4. 15-Year Discounted Cash Flow (DCF), Net Present Value (NPV), and IRR
5. EU ETS Carbon Tax Shielding & FuelEU Maritime penalty avoidance
"""

import math
from typing import Dict, Any, List, Optional


class RetrofitROISimulator:
    """
    Simulates investment returns and decarbonization metrics for maritime retrofits.
    """

    RETROFIT_ARCHETYPES = {
        "METHANOL_DUAL_FUEL": {
            "name": "Green Methanol Dual-Fuel Engine Retrofit",
            "capex_base_usd": 8400000.0,
            "drydock_days": 24,
            "drydock_offhire_cost_day_usd": 32000.0,
            "annual_fuel_saving_or_cost_delta_usd": 220000.0,  # FuelEU compliance penalty avoidance + long-term supply contract
            "annual_co2_avoided_mt": 18400.0,
            "annual_eu_ets_tax_shield_usd": 1640000.0,  # $89/tCO2 saved
            "annual_maintenance_delta_usd": 45000.0,
            "cii_grade_projection": "A (Major Superior)",
            "life_span_years": 15
        },
        "LNG_DUAL_FUEL": {
            "name": "LNG Dual-Fuel High-Pressure Retrofit",
            "capex_base_usd": 13500000.0,
            "drydock_days": 35,
            "drydock_offhire_cost_day_usd": 32000.0,
            "annual_fuel_saving_or_cost_delta_usd": 1850000.0,  # Lower energy cost vs VLSFO
            "annual_co2_avoided_mt": 12800.0,
            "annual_eu_ets_tax_shield_usd": 1145000.0,
            "annual_maintenance_delta_usd": 75000.0,
            "cii_grade_projection": "B+ (Superior)",
            "life_span_years": 15
        },
        "WING_SAIL_WIND_ASSIST": {
            "name": "Wing Sail Rigid Aerofoil Assistance (4x 30m Sails)",
            "capex_base_usd": 3400000.0,
            "drydock_days": 12,
            "drydock_offhire_cost_day_usd": 32000.0,
            "annual_fuel_saving_or_cost_delta_usd": 1150000.0,  # Direct free wind thrust (12-18% fuel burn cut)
            "annual_co2_avoided_mt": 6800.0,
            "annual_eu_ets_tax_shield_usd": 605000.0,
            "annual_maintenance_delta_usd": 35000.0,
            "cii_grade_projection": "A- (Superior)",
            "life_span_years": 15
        }
    }

    def evaluate_retrofit_options(
        self,
        vessel_dwt: float = 145000.0,
        carbon_tax_eur_tonne: float = 82.50,
        discount_rate_wacc: float = 0.08,
        custom_capex_adjust_pct: float = 0.0
    ) -> Dict[str, Any]:
        """
        Runs 15-year DCF, NPV, IRR, and payback analysis across retrofit archetypes.
        """
        results = []

        for key, arch in self.RETROFIT_ARCHETYPES.items():
            # Adjust capex for vessel size and user modifier
            dwt_scale = (vessel_dwt / 145000.0) ** 0.45
            adjusted_capex = (arch["capex_base_usd"] * dwt_scale) * (1.0 + custom_capex_adjust_pct / 100.0)
            offhire_cost = arch["drydock_days"] * arch["drydock_offhire_cost_day_usd"]
            initial_investment = adjusted_capex + offhire_cost

            # Annual net operational benefit (Fuel delta + EU ETS tax shield - Maintenance)
            annual_tax_shield = arch["annual_co2_avoided_mt"] * (carbon_tax_eur_tonne * 1.085)
            annual_net_cashflow = (
                arch["annual_fuel_saving_or_cost_delta_usd"] +
                annual_tax_shield -
                arch["annual_maintenance_delta_usd"]
            )

            # Cumulative Cash Flows & Discounted Cash Flows for 15 years
            cashflows = [-initial_investment]
            discounted_cashflows = [-initial_investment]
            cumulative_dcf = -initial_investment
            payback_year = None

            for yr in range(1, arch["life_span_years"] + 1):
                cf = annual_net_cashflow
                dcf = cf / ((1.0 + discount_rate_wacc) ** yr)
                cashflows.append(round(cf, 2))
                discounted_cashflows.append(round(dcf, 2))
                cumulative_dcf += dcf

                if cumulative_dcf >= 0 and payback_year is None:
                    # Interpolated fractional payback
                    prev_val = cumulative_dcf - dcf
                    fraction = abs(prev_val) / max(1.0, dcf)
                    payback_year = round((yr - 1) + fraction, 1)

            if payback_year is None:
                payback_year = round(initial_investment / max(1.0, annual_net_cashflow), 1)

            npv_15yr = sum(discounted_cashflows)

            # Approximate IRR calculation
            # r where NPV(r) = 0
            irr_estimate = self._compute_irr(cashflows)

            results.append({
                "retrofit_id": key,
                "technology_name": arch["name"],
                "total_capex_usd": round(adjusted_capex, 2),
                "drydock_offhire_cost_usd": round(offhire_cost, 2),
                "total_initial_investment_usd": round(initial_investment, 2),
                "annual_net_benefit_usd": round(annual_net_cashflow, 2),
                "annual_co2_abated_mt": arch["annual_co2_avoided_mt"],
                "annual_carbon_tax_shield_usd": round(annual_tax_shield, 2),
                "payback_period_years": payback_year,
                "npv_15yr_usd": round(npv_15yr, 2),
                "irr_pct": round(irr_estimate * 100.0, 1),
                "cii_grade_guarantee": arch["cii_grade_projection"],
                "discounted_cashflows_15yr": discounted_cashflows
            })

        # Rank by highest 15-year NPV
        results.sort(key=lambda x: -x["npv_15yr_usd"])

        return {
            "vessel_dwt": vessel_dwt,
            "wacc_discount_rate": discount_rate_wacc,
            "carbon_tax_assumed_usd": round(carbon_tax_eur_tonne * 1.085, 2),
            "top_recommended_retrofit": results[0]["technology_name"],
            "evaluations": results
        }

    def _compute_irr(self, cashflows: List[float]) -> float:
        """Computes internal rate of return using Newton-Raphson method."""
        rate = 0.12
        for _ in range(50):
            npv = sum(cf / ((1.0 + rate) ** t) for t, cf in enumerate(cashflows))
            d_npv = sum(-t * cf / ((1.0 + rate) ** (t + 1)) for t, cf in enumerate(cashflows))
            if abs(d_npv) < 1e-6:
                break
            new_rate = rate - npv / d_npv
            if abs(new_rate - rate) < 1e-4:
                return max(0.01, min(0.99, new_rate))
            rate = new_rate
        return max(0.05, min(0.65, rate))


# Global Singleton Instance
retrofit_simulator = RetrofitROISimulator()
