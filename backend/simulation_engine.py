"""
GridPoint Simulation Engine
Performs scenarios and sensitivity analyses:
- Demand elasticity simulation (-50% to +100%)
- Fleet vehicle comparison (Bikes vs Vans vs Trucks)
- Coverage radius sensitivity analysis
"""

from typing import List, Dict, Any
import numpy as np

from models import (
    Neighborhood,
    OptimizationSettings,
    FleetType,
    TrafficCondition,
    FLEET_PROFILES,
    TRAFFIC_MULTIPLIERS
)
from optimization_engine import run_full_optimization, haversine_distance


def simulate_demand_sensitivity(
    neighborhoods: List[Neighborhood],
    base_settings: OptimizationSettings
) -> List[Dict[str, Any]]:
    """
    Simulates impact of demand shifts from -50% to +100% on delivery cost,
    fuel requirements, and capacity stress.
    """
    demand_steps = [-50, -30, -15, 0, 15, 30, 50, 75, 100]
    results = []

    for step in demand_steps:
        sim_settings = base_settings.model_copy(update={"demand_modifier_pct": float(step)})
        opt_res = run_full_optimization(neighborhoods, sim_settings)
        
        results.append({
            "demand_change_pct": step,
            "multiplier": round(1.0 + step / 100.0, 2),
            "total_daily_orders": opt_res.summary.total_daily_orders,
            "total_delivery_cost": opt_res.summary.total_delivery_cost,
            "total_fuel_cost": opt_res.summary.total_fuel_cost,
            "grand_total_cost": opt_res.summary.grand_total_cost,
            "capacity_utilization_pct": opt_res.summary.capacity_utilization_pct,
            "radius_violations": opt_res.summary.radius_violations_count,
            "overflow_reassignments": opt_res.summary.overflow_reassignments_count
        })

    return results


def simulate_fleet_comparison(
    neighborhoods: List[Neighborhood],
    base_settings: OptimizationSettings
) -> List[Dict[str, Any]]:
    """
    Compares logistics and financial performance across Bikes, Vans, and Trucks.
    """
    fleet_results = []
    fleets = [FleetType.BIKES, FleetType.VANS, FleetType.TRUCKS]

    for f_type in fleets:
        sim_settings = base_settings.model_copy(update={"fleet_type": f_type})
        opt_res = run_full_optimization(neighborhoods, sim_settings)
        profile = FLEET_PROFILES[f_type]

        fleet_results.append({
            "fleet_type": f_type.value,
            "fleet_name": profile.name,
            "efficiency_km_l": profile.fuel_efficiency_km_l,
            "fuel_price_per_l": profile.fuel_price_per_l,
            "base_speed_km_h": profile.base_speed_km_h,
            "batch_capacity": profile.batch_capacity_orders,
            "total_fuel_cost": opt_res.summary.total_fuel_cost,
            "avg_delivery_time_mins": opt_res.summary.avg_delivery_time_mins,
            "grand_total_cost": opt_res.summary.grand_total_cost,
            "fuel_saved_vs_trucks_pct": 0.0  # calculated below
        })

    # Calculate savings vs trucks baseline
    trucks_fuel = next((f["total_fuel_cost"] for f in fleet_results if f["fleet_type"] == "trucks"), 1.0)
    for f in fleet_results:
        if trucks_fuel > 0:
            f["fuel_saved_vs_trucks_pct"] = round(max(0.0, (trucks_fuel - f["total_fuel_cost"]) / trucks_fuel * 100.0), 1)

    return fleet_results
