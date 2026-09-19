"""
GridPoint Data Models
Pydantic schemas for neighborhood data, optimization parameters, fleet configs,
and optimization results.
"""

from enum import Enum
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field


class FleetType(str, Enum):
    BIKES = "bikes"
    VANS = "vans"
    TRUCKS = "trucks"


class TrafficCondition(str, Enum):
    LIGHT = "light"
    NORMAL = "normal"
    HEAVY = "heavy"


class FleetSpecs(BaseModel):
    name: str
    fuel_efficiency_km_l: float  # km per liter
    fuel_price_per_l: float      # INR per liter
    base_speed_km_h: float       # km/h in normal traffic
    batch_capacity_orders: int   # max orders a single vehicle trip carries


FLEET_PROFILES: Dict[FleetType, FleetSpecs] = {
    FleetType.BIKES: FleetSpecs(
        name="Motorbikes / Scooters",
        fuel_efficiency_km_l=35.0,
        fuel_price_per_l=102.0,
        base_speed_km_h=32.0,
        batch_capacity_orders=25
    ),
    FleetType.VANS: FleetSpecs(
        name="Delivery Vans",
        fuel_efficiency_km_l=12.0,
        fuel_price_per_l=90.0,
        base_speed_km_h=25.0,
        batch_capacity_orders=120
    ),
    FleetType.TRUCKS: FleetSpecs(
        name="Medium Freight Trucks",
        fuel_efficiency_km_l=5.0,
        fuel_price_per_l=90.0,
        base_speed_km_h=18.0,
        batch_capacity_orders=500
    )
}

TRAFFIC_MULTIPLIERS: Dict[TrafficCondition, float] = {
    TrafficCondition.LIGHT: 0.80,   # 20% faster transit
    TrafficCondition.NORMAL: 1.00,  # standard transit
    TrafficCondition.HEAVY: 1.65    # 65% slower transit due to congestion
}


class Neighborhood(BaseModel):
    id: Union[str, int]
    name: str
    lat: float = Field(..., ge=-90.0, le=90.0)
    lng: float = Field(..., ge=-180.0, le=180.0)
    daily_orders: int = Field(..., ge=0)


class OptimizationSettings(BaseModel):
    num_warehouses: int = Field(default=3, ge=1, le=5)
    capacity_limit: int = Field(default=5000, ge=100, le=50000)
    max_delivery_radius_km: float = Field(default=15.0, ge=1.0, le=100.0)
    fleet_type: FleetType = Field(default=FleetType.VANS)
    traffic_condition: TrafficCondition = Field(default=TrafficCondition.NORMAL)
    demand_modifier_pct: float = Field(default=0.0, ge=-50.0, le=100.0)
    fixed_warehouse_cost_daily: float = Field(default=50000.0, ge=0.0)
    cost_per_km_order: float = Field(default=1.5, ge=0.1)


class OptimizationRequest(BaseModel):
    neighborhoods: List[Neighborhood]
    settings: OptimizationSettings = Field(default_factory=OptimizationSettings)


class WarehouseLocation(BaseModel):
    id: int
    name: str
    lat: float
    lng: float
    total_orders_assigned: int
    capacity_limit: int
    utilization_pct: float
    is_over_capacity: bool
    assigned_neighborhood_count: int


class NeighborhoodAssignment(BaseModel):
    neighborhood_id: Union[str, int]
    neighborhood_name: str
    lat: float
    lng: float
    daily_orders_base: int
    daily_orders_effective: int
    assigned_warehouse_id: int
    assigned_warehouse_name: str
    warehouse_lat: float
    warehouse_lng: float
    distance_km: float
    delivery_time_mins: float
    fuel_cost_daily: float
    delivery_cost_daily: float
    is_radius_violation: bool
    radius_overshoot_km: float
    is_overflow_reassigned: bool


class BeforeAfterComparison(BaseModel):
    before_num_warehouses: int
    before_warehouse_lat: float
    before_warehouse_lng: float
    before_total_weighted_distance_km: float
    before_total_delivery_cost: float
    before_total_fuel_cost: float
    before_total_travel_time_hours: float
    before_radius_violations_count: int
    before_total_cost: float

    after_num_warehouses: int
    after_total_weighted_distance_km: float
    after_total_delivery_cost: float
    after_total_fuel_cost: float
    after_total_travel_time_hours: float
    after_radius_violations_count: int
    after_total_cost: float

    distance_saved_km: float
    distance_saved_pct: float
    delivery_cost_saved: float
    delivery_cost_saved_pct: float
    total_cost_saved: float
    total_cost_saved_pct: float
    time_saved_hours: float
    time_saved_pct: float


class TradeoffPoint(BaseModel):
    k: int
    num_warehouses: int
    fixed_cost: float
    delivery_cost: float
    fuel_cost: float
    total_cost: float
    avg_distance_km: float
    radius_violations: int
    is_current_selection: bool = False
    is_optimal_recommendation: bool = False


class OptimizationSummary(BaseModel):
    total_neighborhoods: int
    total_daily_orders: int
    active_warehouses: int
    total_capacity: int
    capacity_utilization_pct: float
    total_delivery_cost: float
    total_fuel_cost: float
    fixed_infrastructure_cost: float
    grand_total_cost: float
    avg_delivery_distance_km: float
    max_delivery_distance_km: float
    avg_delivery_time_mins: float
    radius_violations_count: int
    overflow_reassignments_count: int
    fleet_type: str
    traffic_condition: str
    demand_scaling_factor: float


class OptimizationResponse(BaseModel):
    warehouses: List[WarehouseLocation]
    assignments: List[NeighborhoodAssignment]
    summary: OptimizationSummary
    before_after: BeforeAfterComparison
    tradeoff_curve: List[TradeoffPoint]
    execution_time_ms: float
