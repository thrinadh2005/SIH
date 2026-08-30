"""
GreenFleet Quantum - Global Port Bunkering Price Arbitrage & Route Optimization
==============================================================================
Solves multi-port dynamic bunkering procurement along maritime corridors with
the world's major commercial maritime ports across Europe, Asia, Americas,
Middle East, Africa, and Australasia.
"""

import math
import time
from typing import Dict, Any, List, Optional


class BunkeringArbitrageSolver:
    """
    Dynamic bunker procurement and multi-port price arbitrage solver.
    """

    GLOBAL_BUNKER_HUBS = {
        "SGSIN": {
            "name": "Port of Singapore (SGSIN)",
            "country": "Singapore",
            "lat": 1.29, "lng": 103.85,
            "max_draft_m": 18.5,
            "avg_berth_wait_hrs": 5.5,
            "port_call_fee_usd": 18500.0,
            "bunker_barge_fee_usd": 4200.0,
            "prices_usd_mt": {
                "VLSFO": 615.0, "MGO": 745.0, "LNG": 590.0,
                "GREEN_METHANOL": 820.0, "BIO_METHANOL": 860.0, "AMMONIA": 940.0
            }
        },
        "NLRTM": {
            "name": "Port of Rotterdam (NLRTM)",
            "country": "Netherlands",
            "lat": 51.92, "lng": 4.47,
            "max_draft_m": 24.0,
            "avg_berth_wait_hrs": 4.0,
            "port_call_fee_usd": 22000.0,
            "bunker_barge_fee_usd": 5100.0,
            "prices_usd_mt": {
                "VLSFO": 585.0, "MGO": 720.0, "LNG": 540.0,
                "GREEN_METHANOL": 790.0, "BIO_METHANOL": 830.0, "AMMONIA": 890.0
            }
        },
        "CNSHA": {
            "name": "Port of Shanghai (CNSHA)",
            "country": "China",
            "lat": 31.23, "lng": 121.50,
            "max_draft_m": 16.5,
            "avg_berth_wait_hrs": 7.0,
            "port_call_fee_usd": 19500.0,
            "bunker_barge_fee_usd": 4400.0,
            "prices_usd_mt": {
                "VLSFO": 610.0, "MGO": 750.0, "LNG": 580.0,
                "GREEN_METHANOL": 810.0, "BIO_METHANOL": 850.0, "AMMONIA": 920.0
            }
        },
        "CNNGB": {
            "name": "Ningbo-Zhoushan (CNNGB)",
            "country": "China",
            "lat": 29.88, "lng": 121.56,
            "max_draft_m": 22.0,
            "avg_berth_wait_hrs": 6.0,
            "port_call_fee_usd": 19000.0,
            "bunker_barge_fee_usd": 4300.0,
            "prices_usd_mt": {
                "VLSFO": 605.0, "MGO": 745.0, "LNG": 575.0,
                "GREEN_METHANOL": 805.0, "BIO_METHANOL": 845.0, "AMMONIA": 915.0
            }
        },
        "AEFUJ": {
            "name": "Port of Fujairah (AEFUJ)",
            "country": "United Arab Emirates",
            "lat": 25.13, "lng": 56.36,
            "max_draft_m": 18.0,
            "avg_berth_wait_hrs": 4.5,
            "port_call_fee_usd": 16000.0,
            "bunker_barge_fee_usd": 3800.0,
            "prices_usd_mt": {
                "VLSFO": 598.0, "MGO": 760.0, "LNG": 610.0,
                "GREEN_METHANOL": 890.0, "BIO_METHANOL": 920.0, "AMMONIA": 980.0
            }
        },
        "AEJEA": {
            "name": "Jebel Ali / Dubai (AEJEA)",
            "country": "United Arab Emirates",
            "lat": 25.01, "lng": 55.06,
            "max_draft_m": 17.0,
            "avg_berth_wait_hrs": 5.0,
            "port_call_fee_usd": 17500.0,
            "bunker_barge_fee_usd": 4000.0,
            "prices_usd_mt": {
                "VLSFO": 602.0, "MGO": 755.0, "LNG": 605.0,
                "GREEN_METHANOL": 880.0, "BIO_METHANOL": 915.0, "AMMONIA": 970.0
            }
        },
        "GIB": {
            "name": "Port of Gibraltar (GIB)",
            "country": "Gibraltar",
            "lat": 36.14, "lng": -5.35,
            "max_draft_m": 19.0,
            "avg_berth_wait_hrs": 3.5,
            "port_call_fee_usd": 14500.0,
            "bunker_barge_fee_usd": 3900.0,
            "prices_usd_mt": {
                "VLSFO": 608.0, "MGO": 735.0, "LNG": 575.0,
                "GREEN_METHANOL": 840.0, "BIO_METHANOL": 880.0, "AMMONIA": 930.0
            }
        },
        "USHOU": {
            "name": "Port of Houston (USHOU)",
            "country": "United States",
            "lat": 29.76, "lng": -95.36,
            "max_draft_m": 15.0,
            "avg_berth_wait_hrs": 6.5,
            "port_call_fee_usd": 21000.0,
            "bunker_barge_fee_usd": 4800.0,
            "prices_usd_mt": {
                "VLSFO": 570.0, "MGO": 710.0, "LNG": 490.0,
                "GREEN_METHANOL": 760.0, "BIO_METHANOL": 800.0, "AMMONIA": 870.0
            }
        },
        "USLAX": {
            "name": "Port of Los Angeles (USLAX)",
            "country": "United States",
            "lat": 33.74, "lng": -118.27,
            "max_draft_m": 16.5,
            "avg_berth_wait_hrs": 8.5,
            "port_call_fee_usd": 25000.0,
            "bunker_barge_fee_usd": 5500.0,
            "prices_usd_mt": {
                "VLSFO": 625.0, "MGO": 760.0, "LNG": 530.0,
                "GREEN_METHANOL": 795.0, "BIO_METHANOL": 835.0, "AMMONIA": 895.0
            }
        },
        "USNYC": {
            "name": "Port of New York & NJ (USNYC)",
            "country": "United States",
            "lat": 40.68, "lng": -74.04,
            "max_draft_m": 15.5,
            "avg_berth_wait_hrs": 5.5,
            "port_call_fee_usd": 23000.0,
            "bunker_barge_fee_usd": 5200.0,
            "prices_usd_mt": {
                "VLSFO": 595.0, "MGO": 730.0, "LNG": 510.0,
                "GREEN_METHANOL": 780.0, "BIO_METHANOL": 820.0, "AMMONIA": 880.0
            }
        },
        "KRPUS": {
            "name": "Port of Busan (KRPUS)",
            "country": "South Korea",
            "lat": 35.10, "lng": 129.04,
            "max_draft_m": 17.0,
            "avg_berth_wait_hrs": 4.5,
            "port_call_fee_usd": 17800.0,
            "bunker_barge_fee_usd": 4100.0,
            "prices_usd_mt": {
                "VLSFO": 628.0, "MGO": 765.0, "LNG": 620.0,
                "GREEN_METHANOL": 850.0, "BIO_METHANOL": 895.0, "AMMONIA": 960.0
            }
        },
        "JPYOK": {
            "name": "Port of Yokohama (JPYOK)",
            "country": "Japan",
            "lat": 35.44, "lng": 139.64,
            "max_draft_m": 16.0,
            "avg_berth_wait_hrs": 4.0,
            "port_call_fee_usd": 18500.0,
            "bunker_barge_fee_usd": 4300.0,
            "prices_usd_mt": {
                "VLSFO": 635.0, "MGO": 770.0, "LNG": 615.0,
                "GREEN_METHANOL": 860.0, "BIO_METHANOL": 905.0, "AMMONIA": 970.0
            }
        },
        "BEANR": {
            "name": "Port of Antwerp-Bruges (BEANR)",
            "country": "Belgium",
            "lat": 51.28, "lng": 4.33,
            "max_draft_m": 17.5,
            "avg_berth_wait_hrs": 4.5,
            "port_call_fee_usd": 21500.0,
            "bunker_barge_fee_usd": 4900.0,
            "prices_usd_mt": {
                "VLSFO": 588.0, "MGO": 722.0, "LNG": 545.0,
                "GREEN_METHANOL": 795.0, "BIO_METHANOL": 835.0, "AMMONIA": 895.0
            }
        },
        "DEHAM": {
            "name": "Port of Hamburg (DEHAM)",
            "country": "Germany",
            "lat": 53.54, "lng": 9.99,
            "max_draft_m": 15.1,
            "avg_berth_wait_hrs": 5.0,
            "port_call_fee_usd": 22500.0,
            "bunker_barge_fee_usd": 5000.0,
            "prices_usd_mt": {
                "VLSFO": 592.0, "MGO": 728.0, "LNG": 550.0,
                "GREEN_METHANOL": 800.0, "BIO_METHANOL": 840.0, "AMMONIA": 900.0
            }
        },
        "GRPIR": {
            "name": "Port of Piraeus (GRPIR)",
            "country": "Greece",
            "lat": 37.94, "lng": 23.63,
            "max_draft_m": 19.5,
            "avg_berth_wait_hrs": 4.0,
            "port_call_fee_usd": 15500.0,
            "bunker_barge_fee_usd": 3700.0,
            "prices_usd_mt": {
                "VLSFO": 612.0, "MGO": 740.0, "LNG": 570.0,
                "GREEN_METHANOL": 830.0, "BIO_METHANOL": 870.0, "AMMONIA": 925.0
            }
        },
        "ESVLC": {
            "name": "Port of Valencia (ESVLC)",
            "country": "Spain",
            "lat": 39.44, "lng": -0.32,
            "max_draft_m": 18.0,
            "avg_berth_wait_hrs": 3.5,
            "port_call_fee_usd": 16000.0,
            "bunker_barge_fee_usd": 3800.0,
            "prices_usd_mt": {
                "VLSFO": 605.0, "MGO": 735.0, "LNG": 565.0,
                "GREEN_METHANOL": 825.0, "BIO_METHANOL": 865.0, "AMMONIA": 920.0
            }
        },
        "EGPSD": {
            "name": "Port Said / Suez (EGPSD)",
            "country": "Egypt",
            "lat": 31.26, "lng": 32.30,
            "max_draft_m": 20.0,
            "avg_berth_wait_hrs": 6.0,
            "port_call_fee_usd": 14000.0,
            "bunker_barge_fee_usd": 3500.0,
            "prices_usd_mt": {
                "VLSFO": 618.0, "MGO": 755.0, "LNG": 585.0,
                "GREEN_METHANOL": 850.0, "BIO_METHANOL": 890.0, "AMMONIA": 945.0
            }
        },
        "INNSA": {
            "name": "JNPT Mumbai (INNSA)",
            "country": "India",
            "lat": 18.95, "lng": 72.95,
            "max_draft_m": 15.0,
            "avg_berth_wait_hrs": 9.0,
            "port_call_fee_usd": 15000.0,
            "bunker_barge_fee_usd": 3600.0,
            "prices_usd_mt": {
                "VLSFO": 622.0, "MGO": 760.0, "LNG": 600.0,
                "GREEN_METHANOL": 865.0, "BIO_METHANOL": 905.0, "AMMONIA": 965.0
            }
        },
        "INMAA": {
            "name": "Port of Chennai (INMAA)",
            "country": "India",
            "lat": 13.08, "lng": 80.29,
            "max_draft_m": 16.5,
            "avg_berth_wait_hrs": 8.0,
            "port_call_fee_usd": 14800.0,
            "bunker_barge_fee_usd": 3500.0,
            "prices_usd_mt": {
                "VLSFO": 625.0, "MGO": 765.0, "LNG": 605.0,
                "GREEN_METHANOL": 870.0, "BIO_METHANOL": 910.0, "AMMONIA": 970.0
            }
        },
        "INPRT": {
            "name": "Port of Paradip (INPRT)",
            "country": "India",
            "lat": 20.26, "lng": 86.67,
            "max_draft_m": 15.5,
            "avg_berth_wait_hrs": 11.0,
            "port_call_fee_usd": 13500.0,
            "bunker_barge_fee_usd": 3300.0,
            "prices_usd_mt": {
                "VLSFO": 630.0, "MGO": 770.0, "LNG": 615.0,
                "GREEN_METHANOL": 880.0, "BIO_METHANOL": 920.0, "AMMONIA": 980.0
            }
        },
        "INCOK": {
            "name": "Port of Kochi (INCOK)",
            "country": "India",
            "lat": 9.96, "lng": 76.27,
            "max_draft_m": 14.5,
            "avg_berth_wait_hrs": 6.0,
            "port_call_fee_usd": 14200.0,
            "bunker_barge_fee_usd": 3400.0,
            "prices_usd_mt": {
                "VLSFO": 620.0, "MGO": 758.0, "LNG": 595.0,
                "GREEN_METHANOL": 860.0, "BIO_METHANOL": 900.0, "AMMONIA": 960.0
            }
        },
        "LKCMB": {
            "name": "Port of Colombo (LKCMB)",
            "country": "Sri Lanka",
            "lat": 6.94, "lng": 79.84,
            "max_draft_m": 18.0,
            "avg_berth_wait_hrs": 4.5,
            "port_call_fee_usd": 15200.0,
            "bunker_barge_fee_usd": 3600.0,
            "prices_usd_mt": {
                "VLSFO": 615.0, "MGO": 750.0, "LNG": 590.0,
                "GREEN_METHANOL": 855.0, "BIO_METHANOL": 895.0, "AMMONIA": 955.0
            }
        },
        "MYPKG": {
            "name": "Port Klang (MYPKG)",
            "country": "Malaysia",
            "lat": 3.00, "lng": 101.40,
            "max_draft_m": 17.5,
            "avg_berth_wait_hrs": 5.0,
            "port_call_fee_usd": 16500.0,
            "bunker_barge_fee_usd": 3900.0,
            "prices_usd_mt": {
                "VLSFO": 612.0, "MGO": 742.0, "LNG": 585.0,
                "GREEN_METHANOL": 825.0, "BIO_METHANOL": 865.0, "AMMONIA": 935.0
            }
        },
        "THLCH": {
            "name": "Laem Chabang (THLCH)",
            "country": "Thailand",
            "lat": 13.08, "lng": 100.88,
            "max_draft_m": 16.0,
            "avg_berth_wait_hrs": 5.5,
            "port_call_fee_usd": 15800.0,
            "bunker_barge_fee_usd": 3700.0,
            "prices_usd_mt": {
                "VLSFO": 618.0, "MGO": 752.0, "LNG": 595.0,
                "GREEN_METHANOL": 840.0, "BIO_METHANOL": 880.0, "AMMONIA": 945.0
            }
        },
        "HKHKG": {
            "name": "Port of Hong Kong (HKHKG)",
            "country": "Hong Kong",
            "lat": 22.31, "lng": 114.17,
            "max_draft_m": 17.5,
            "avg_berth_wait_hrs": 4.0,
            "port_call_fee_usd": 18000.0,
            "bunker_barge_fee_usd": 4200.0,
            "prices_usd_mt": {
                "VLSFO": 610.0, "MGO": 748.0, "LNG": 585.0,
                "GREEN_METHANOL": 815.0, "BIO_METHANOL": 855.0, "AMMONIA": 925.0
            }
        },
        "AUPHE": {
            "name": "Port Hedland (AUPHE)",
            "country": "Australia",
            "lat": -20.31, "lng": 118.57,
            "max_draft_m": 22.0,
            "avg_berth_wait_hrs": 12.0,
            "port_call_fee_usd": 24000.0,
            "bunker_barge_fee_usd": 5200.0,
            "prices_usd_mt": {
                "VLSFO": 645.0, "MGO": 790.0, "LNG": 625.0,
                "GREEN_METHANOL": 895.0, "BIO_METHANOL": 940.0, "AMMONIA": 995.0
            }
        },
        "AUDAM": {
            "name": "Port of Dampier (AUDAM)",
            "country": "Australia",
            "lat": -20.65, "lng": 116.70,
            "max_draft_m": 20.0,
            "avg_berth_wait_hrs": 13.0,
            "port_call_fee_usd": 23500.0,
            "bunker_barge_fee_usd": 5100.0,
            "prices_usd_mt": {
                "VLSFO": 640.0, "MGO": 785.0, "LNG": 620.0,
                "GREEN_METHANOL": 890.0, "BIO_METHANOL": 935.0, "AMMONIA": 990.0
            }
        },
        "ZADUR": {
            "name": "Port of Durban (ZADUR)",
            "country": "South Africa",
            "lat": -29.87, "lng": 31.02,
            "max_draft_m": 14.5,
            "avg_berth_wait_hrs": 14.0,
            "port_call_fee_usd": 15000.0,
            "bunker_barge_fee_usd": 3800.0,
            "prices_usd_mt": {
                "VLSFO": 635.0, "MGO": 780.0, "LNG": 615.0,
                "GREEN_METHANOL": 880.0, "BIO_METHANOL": 925.0, "AMMONIA": 985.0
            }
        },
        "ZACPT": {
            "name": "Port of Cape Town (ZACPT)",
            "country": "South Africa",
            "lat": -33.92, "lng": 18.42,
            "max_draft_m": 15.0,
            "avg_berth_wait_hrs": 8.0,
            "port_call_fee_usd": 16000.0,
            "bunker_barge_fee_usd": 4000.0,
            "prices_usd_mt": {
                "VLSFO": 630.0, "MGO": 775.0, "LNG": 610.0,
                "GREEN_METHANOL": 875.0, "BIO_METHANOL": 920.0, "AMMONIA": 980.0
            }
        },
        "PABLB": {
            "name": "Balboa / Panama Canal (PABLB)",
            "country": "Panama",
            "lat": 8.95, "lng": -79.57,
            "max_draft_m": 15.2,
            "avg_berth_wait_hrs": 10.0,
            "port_call_fee_usd": 26000.0,
            "bunker_barge_fee_usd": 5400.0,
            "prices_usd_mt": {
                "VLSFO": 615.0, "MGO": 755.0, "LNG": 560.0,
                "GREEN_METHANOL": 810.0, "BIO_METHANOL": 850.0, "AMMONIA": 915.0
            }
        },
        "BRSSZ": {
            "name": "Port of Santos (BRSSZ)",
            "country": "Brazil",
            "lat": -23.96, "lng": -46.33,
            "max_draft_m": 14.5,
            "avg_berth_wait_hrs": 9.5,
            "port_call_fee_usd": 17000.0,
            "bunker_barge_fee_usd": 4100.0,
            "prices_usd_mt": {
                "VLSFO": 610.0, "MGO": 750.0, "LNG": 570.0,
                "GREEN_METHANOL": 820.0, "BIO_METHANOL": 860.0, "AMMONIA": 930.0
            }
        }
    }

    def solve_bunkering_plan(
        self,
        corridor_id: str = "SIN_ROT",
        fuel_type: str = "GREEN_METHANOL",
        required_fuel_mt: float = 1200.0,
        tank_capacity_mt: float = 2000.0,
        current_tank_level_mt: float = 350.0
    ) -> Dict[str, Any]:
        """
        Computes optimal bunkering locations, procurement volumes, and price arbitrage.
        """
        # Corridor candidate ports
        corridor_candidates = {
            "SIN_ROT": ["SGSIN", "AEFUJ", "EGPSD", "GIB", "NLRTM"],
            "SHA_LAX": ["CNSHA", "KRPUS", "JPYOK", "USLAX"],
            "ROT_NYC": ["NLRTM", "BEANR", "DEHAM", "GIB", "USNYC"],
            "PER_SHA": ["AUPHE", "AUDAM", "SGSIN", "HKHKG", "CNSHA"],
            "HOU_ANT": ["USHOU", "USNYC", "GIB", "BEANR", "NLRTM"],
            "MUM_ROT": ["INNSA", "AEFUJ", "EGPSD", "GRPIR", "GIB", "NLRTM"],
            "COL_SGP": ["LKCMB", "INMAA", "MYPKG", "SGSIN"],
            "DUR_ROT": ["ZADUR", "ZACPT", "GIB", "NLRTM"],
            "SAN_ROT": ["BRSSZ", "PABLB", "GIB", "NLRTM"]
        }

        candidate_keys = corridor_candidates.get(corridor_id, ["SGSIN", "AEFUJ", "GIB", "NLRTM"])
        port_evaluations = []

        fuel_key = fuel_type.upper()
        if fuel_key not in ["VLSFO", "MGO", "LNG", "GREEN_METHANOL", "BIO_METHANOL", "AMMONIA"]:
            fuel_key = "GREEN_METHANOL"

        for p_key in candidate_keys:
            if p_key not in self.GLOBAL_BUNKER_HUBS:
                continue
            hub = self.GLOBAL_BUNKER_HUBS[p_key]
            unit_price = hub["prices_usd_mt"].get(fuel_key, 800.0)
            
            # Boil-off loss model for cryogenic LNG (0.12% per day)
            boil_off_loss_mt = (required_fuel_mt * 0.0012 * 18.0) if fuel_key == "LNG" else 0.0
            effective_fuel_required = required_fuel_mt + boil_off_loss_mt

            fuel_cost = effective_fuel_required * unit_price
            port_overhead = hub["port_call_fee_usd"] + hub["bunker_barge_fee_usd"]
            total_bunkering_cost = fuel_cost + port_overhead

            port_evaluations.append({
                "port_id": p_key,
                "name": hub["name"],
                "country": hub.get("country", ""),
                "coordinates": {"lat": hub["lat"], "lng": hub["lng"]},
                "fuel_type": fuel_key,
                "spot_price_usd_mt": unit_price,
                "fuel_procured_mt": round(effective_fuel_required, 1),
                "fuel_cost_usd": round(fuel_cost, 2),
                "port_overhead_usd": round(port_overhead, 2),
                "boil_off_loss_mt": round(boil_off_loss_mt, 2),
                "total_procurement_cost_usd": round(total_bunkering_cost, 2)
            })

        # Rank candidate ports by lowest total procurement cost
        port_evaluations.sort(key=lambda x: x["total_procurement_cost_usd"])

        optimal_port = port_evaluations[0] if port_evaluations else None
        worst_port = port_evaluations[-1] if port_evaluations else None

        savings_usd = (worst_port["total_procurement_cost_usd"] - optimal_port["total_procurement_cost_usd"]) if (worst_port and optimal_port) else 0.0
        savings_pct = round((savings_usd / worst_port["total_procurement_cost_usd"]) * 100.0, 2) if (worst_port and worst_port["total_procurement_cost_usd"] > 0) else 0.0

        return {
            "corridor_id": corridor_id,
            "fuel_type": fuel_key,
            "required_fuel_mt": required_fuel_mt,
            "optimal_bunker_port": optimal_port["name"] if optimal_port else "Unknown",
            "optimal_port_id": optimal_port["port_id"] if optimal_port else "",
            "minimum_total_cost_usd": optimal_port["total_procurement_cost_usd"] if optimal_port else 0.0,
            "arbitrage_savings_vs_worst_hub_usd": round(savings_usd, 2),
            "arbitrage_savings_pct": savings_pct,
            "procurement_strategy": f"Procure {optimal_port['fuel_procured_mt']} MT of {fuel_key} at {optimal_port['name']} to capture spot price arbitrage of ${savings_usd:,.0f} USD." if optimal_port else "",
            "port_rankings": port_evaluations,
            "timestamp": int(time.time())
        }


bunkering_solver = BunkeringArbitrageSolver()
