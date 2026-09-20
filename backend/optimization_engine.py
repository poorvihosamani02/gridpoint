"""
GridPoint Optimization Engine
Mathematical core for:
- Haversine distance matrix
- Weighted K-Means with spherical geographic refinement
- Capacity-constrained assignment with regret-based overflow reallocation
- Fleet vehicle fuel calculations
- Traffic congestion time scaling
- Radius constraint checking
"""

import math
import numpy as np
from typing import List, Dict, Tuple, Any
from sklearn.cluster import KMeans
from scipy.optimize import minimize

from models import (
    Neighborhood,
    OptimizationSettings,
    WarehouseLocation,
    NeighborhoodAssignment,
    BeforeAfterComparison,
    OptimizationSummary,
    OptimizationResponse,
    TradeoffPoint,
    FLEET_PROFILES,
    TRAFFIC_MULTIPLIERS,
    FleetType,
    TrafficCondition
)


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Computes great-circle distance between two geographic coordinates in kilometers.
    Uses Haversine formula on WGS84 spherical approximation (R = 6371.0 km).
    """
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    
    # Clip numerical floating issues
    a = min(1.0, max(0.0, a))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


def compute_weighted_geometric_median(lats: np.ndarray, lngs: np.ndarray, weights: np.ndarray) -> Tuple[float, float]:
    """
    Finds geographic coordinate (lat, lng) minimizing sum of weighted Haversine distances.
    Initializes at weighted centroid and refines with Nelder-Mead / L-BFGS.
    """
    if len(lats) == 0:
        return 0.0, 0.0
    if len(lats) == 1:
        return float(lats[0]), float(lngs[0])

    sum_w = float(np.sum(weights))
    if sum_w <= 0:
        sum_w = 1.0
        weights = np.ones_like(weights)

    # Initial guess: weighted arithmetic centroid
    init_lat = float(np.sum(lats * weights) / sum_w)
    init_lng = float(np.sum(lngs * weights) / sum_w)

    def objective(point):
        p_lat, p_lng = point
        # Haversine sum
        dists = np.array([haversine_distance(p_lat, p_lng, lats[i], lngs[i]) for i in range(len(lats))])
        return np.sum(dists * weights)

    res = minimize(objective, [init_lat, init_lng], method="Nelder-Mead", options={"maxiter": 200, "xatol": 1e-4})
    if res.success:
        return float(res.x[0]), float(res.x[1])
    return init_lat, init_lng


def run_capacitated_kmeans(
    coords: np.ndarray,
    weights: np.ndarray,
    k: int,
    capacity_limit: int,
    neighborhood_names: List[str] = None,
    max_iters: int = 25
) -> Tuple[np.ndarray, np.ndarray, List[bool], List[int], List[Dict[str, Any]], np.ndarray, np.ndarray, np.ndarray]:
    """
    Calculates K warehouse locations minimizing weighted distance while respecting
    warehouse capacity limits via regret-based reallocation.
    
    If one warehouse is overloaded while others have spare capacity (CASE 1),
    orders are diverted to the nearest warehouse with remaining space.
    """
    n_points = len(coords)
    k = min(k, n_points)
    
    if neighborhood_names is None:
        neighborhood_names = [f"Corridor {i+1}" for i in range(n_points)]

    if k <= 1:
        med_lat, med_lng = compute_weighted_geometric_median(coords[:, 0], coords[:, 1], weights)
        centroids = np.array([[med_lat, med_lng]])
        assignments = np.zeros(n_points, dtype=int)
        reassigned = [False] * n_points
        reassigned_from = [-1] * n_points
        init_loads = np.array([float(np.sum(weights))])
        diverted_out = np.zeros(1)
        received_in = np.zeros(1)
        return centroids, assignments, reassigned, reassigned_from, [], init_loads, diverted_out, received_in

    # 1. Initial Weighted K-Means
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    initial_labels = kmeans.fit_predict(coords, sample_weight=weights)
    centroids = np.zeros((k, 2))

    for cluster_idx in range(k):
        mask = (initial_labels == cluster_idx)
        if np.any(mask):
            centroids[cluster_idx, 0], centroids[cluster_idx, 1] = compute_weighted_geometric_median(
                coords[mask, 0], coords[mask, 1], weights[mask]
            )
        else:
            rand_idx = np.random.randint(0, n_points)
            centroids[cluster_idx] = coords[rand_idx]

    # Iterative refinement of centroids & assignments
    for _ in range(max_iters):
        dist_matrix = np.zeros((n_points, k))
        for i in range(n_points):
            for j in range(k):
                dist_matrix[i, j] = haversine_distance(
                    coords[i, 0], coords[i, 1],
                    centroids[j, 0], centroids[j, 1]
                )

        new_labels = np.argmin(dist_matrix, axis=1)

        converged = True
        for cluster_idx in range(k):
            mask = (new_labels == cluster_idx)
            if np.any(mask):
                new_lat, new_lng = compute_weighted_geometric_median(
                    coords[mask, 0], coords[mask, 1], weights[mask]
                )
                shift = haversine_distance(centroids[cluster_idx, 0], centroids[cluster_idx, 1], new_lat, new_lng)
                if shift > 0.05:
                    converged = False
                centroids[cluster_idx] = [new_lat, new_lng]

        if converged:
            break

    # Distance matrix with final centroids
    dist_matrix = np.zeros((n_points, k))
    for i in range(n_points):
        for j in range(k):
            dist_matrix[i, j] = haversine_distance(
                coords[i, 0], coords[i, 1],
                centroids[j, 0], centroids[j, 1]
            )

    # 2. Capacity Constraint Enforcement with Smart Nearest-Warehouse Redistribution (CASE 1)
    assignments = np.argmin(dist_matrix, axis=1)
    reassigned_flags = [False] * n_points
    reassigned_from = [-1] * n_points

    warehouse_loads = np.zeros(k, dtype=float)
    for i in range(n_points):
        warehouse_loads[assignments[i]] += float(weights[i])

    initial_loads = warehouse_loads.copy()
    orders_diverted_out = np.zeros(k, dtype=float)
    orders_received_in = np.zeros(k, dtype=float)
    reallocation_events: List[Dict[str, Any]] = []

    max_reassign_attempts = 200
    attempts = 0

    # Continue redistributing as long as there is an overloaded hub AND an underloaded hub with spare space
    while np.any(warehouse_loads > capacity_limit) and np.any(warehouse_loads < capacity_limit) and attempts < max_reassign_attempts:
        attempts += 1

        overloaded_indices = [j for j in range(k) if warehouse_loads[j] > capacity_limit]
        underloaded_indices = [j for j in range(k) if warehouse_loads[j] < capacity_limit]

        if not overloaded_indices or not underloaded_indices:
            break

        # Pick the warehouse with highest excess demand
        over_wh = max(overloaded_indices, key=lambda j: warehouse_loads[j] - capacity_limit)
        
        # Candidates currently in over_wh
        candidates = [i for i in range(n_points) if assignments[i] == over_wh]
        if not candidates:
            break

        best_candidate = None
        best_target_wh = None
        min_penalty = float("inf")

        # Pass 1: Find candidate that fits strictly within available capacity of target warehouse
        for cand_idx in candidates:
            cand_weight = weights[cand_idx]
            curr_dist = dist_matrix[cand_idx, over_wh]

            for target_wh in underloaded_indices:
                available_space = capacity_limit - warehouse_loads[target_wh]
                if cand_weight <= available_space:
                    penalty = dist_matrix[cand_idx, target_wh] - curr_dist
                    if penalty < min_penalty:
                        min_penalty = penalty
                        best_candidate = cand_idx
                        best_target_wh = target_wh

        # Pass 2: If no candidate fits strictly, find the candidate whose move best levels the network
        if best_candidate is None:
            for cand_idx in candidates:
                cand_weight = weights[cand_idx]
                curr_dist = dist_matrix[cand_idx, over_wh]

                for target_wh in underloaded_indices:
                    new_target_load = warehouse_loads[target_wh] + cand_weight
                    if new_target_load < warehouse_loads[over_wh]:
                        penalty = dist_matrix[cand_idx, target_wh] - curr_dist
                        if penalty < min_penalty:
                            min_penalty = penalty
                            best_candidate = cand_idx
                            best_target_wh = target_wh

        if best_candidate is not None and best_target_wh is not None:
            cand_weight = float(weights[best_candidate])
            warehouse_loads[over_wh] -= cand_weight
            warehouse_loads[best_target_wh] += cand_weight
            orders_diverted_out[over_wh] += cand_weight
            orders_received_in[best_target_wh] += cand_weight

            reassigned_from[best_candidate] = over_wh
            assignments[best_candidate] = best_target_wh
            reassigned_flags[best_candidate] = True

            reallocation_events.append({
                "neighborhood_name": neighborhood_names[best_candidate],
                "orders": int(cand_weight),
                "from_hub_id": int(over_wh + 1),
                "from_hub_name": f"Hub {chr(65 + over_wh)}",
                "to_hub_id": int(best_target_wh + 1),
                "to_hub_name": f"Hub {chr(65 + best_target_wh)}",
                "dist_to_original_km": round(float(dist_matrix[best_candidate, over_wh]), 2),
                "dist_to_target_km": round(float(dist_matrix[best_candidate, best_target_wh]), 2),
                "extra_dist_km": round(float(dist_matrix[best_candidate, best_target_wh] - dist_matrix[best_candidate, over_wh]), 2)
            })
        else:
            break

    return (
        centroids,
        assignments,
        reassigned_flags,
        reassigned_from,
        reallocation_events,
        initial_loads,
        orders_diverted_out,
        orders_received_in
    )


def run_full_optimization(
    neighborhoods: List[Neighborhood],
    settings: OptimizationSettings
) -> OptimizationResponse:
    """
    Executes complete end-to-end optimization pipeline:
    1. Demand scaling
    2. Before (Single Baseline Warehouse) calculation
    3. After (K-Warehouse Capacitated Clustering) calculation
    4. Vehicle fleet and traffic metrics
    5. Radius violation checks
    6. Before vs. After delta analysis
    7. Infrastructure trade-off simulation across K=1..5
    """
    import time
    start_time = time.perf_counter()

    n_count = len(neighborhoods)
    if n_count == 0:
        raise ValueError("Neighborhood list cannot be empty.")

    # 1. Demand Scaling
    scaling_factor = max(0.5, 1.0 + (settings.demand_modifier_pct / 100.0))
    effective_orders = np.array([
        max(1, int(round(n.daily_orders * scaling_factor)))
        for n in neighborhoods
    ])
    coords = np.array([[n.lat, n.lng] for n in neighborhoods])

    fleet = FLEET_PROFILES[settings.fleet_type]
    traffic_mult = TRAFFIC_MULTIPLIERS[settings.traffic_condition]
    effective_speed = fleet.base_speed_km_h / traffic_mult

    # 2. Before (Single Central Warehouse Baseline)
    before_lat, before_lng = compute_weighted_geometric_median(
        coords[:, 0], coords[:, 1], effective_orders
    )

    before_weighted_dist = 0.0
    before_fuel_cost = 0.0
    before_delivery_cost = 0.0
    before_travel_time_hours = 0.0
    before_violations = 0

    for i in range(n_count):
        d = haversine_distance(before_lat, before_lng, coords[i, 0], coords[i, 1])
        orders = effective_orders[i]
        trips = math.ceil(orders / fleet.batch_capacity_orders)
        round_trip_dist = 2.0 * d * trips

        f_cost = (round_trip_dist / fleet.fuel_efficiency_km_l) * fleet.fuel_price_per_l
        deliv_cost = d * orders * settings.cost_per_km_order
        time_hrs = (d / effective_speed) * (orders / fleet.batch_capacity_orders)

        before_weighted_dist += (d * orders)
        before_fuel_cost += f_cost
        before_delivery_cost += deliv_cost
        before_travel_time_hours += time_hrs

        if d > settings.max_delivery_radius_km:
            before_violations += 1

    before_total_cost = (
        1 * settings.fixed_warehouse_cost_daily + before_delivery_cost + before_fuel_cost
    )

    # 3. After (Multi-Warehouse Capacitated Optimization)
    (
        centroids,
        assignments,
        reassigned_flags,
        reassigned_from,
        reallocation_events,
        initial_loads,
        orders_diverted_out,
        orders_received_in
    ) = run_capacitated_kmeans(
        coords=coords,
        weights=effective_orders,
        k=settings.num_warehouses,
        capacity_limit=settings.capacity_limit,
        neighborhood_names=[n.name for n in neighborhoods]
    )

    # Build Warehouse Location objects
    warehouses: List[WarehouseLocation] = []
    k_actual = len(centroids)

    warehouse_neighborhood_counts = np.zeros(k_actual, dtype=int)
    warehouse_order_totals = np.zeros(k_actual, dtype=int)

    for i in range(n_count):
        wh_idx = assignments[i]
        warehouse_neighborhood_counts[wh_idx] += 1
        warehouse_order_totals[wh_idx] += effective_orders[i]

    for j in range(k_actual):
        tot_orders = int(warehouse_order_totals[j])
        util_pct = round((tot_orders / settings.capacity_limit) * 100.0, 1)
        warehouses.append(WarehouseLocation(
            id=j + 1,
            name=f"Hub {chr(65 + j)} ({'Primary' if j == 0 else f'Center {j+1}'})",
            lat=float(round(centroids[j, 0], 6)),
            lng=float(round(centroids[j, 1], 6)),
            total_orders_assigned=tot_orders,
            capacity_limit=settings.capacity_limit,
            utilization_pct=util_pct,
            is_over_capacity=(tot_orders > settings.capacity_limit),
            assigned_neighborhood_count=int(warehouse_neighborhood_counts[j]),
            initial_unconstrained_orders=int(initial_loads[j]),
            orders_diverted_out=int(orders_diverted_out[j]),
            orders_received_in=int(orders_received_in[j]),
            available_capacity=max(0, settings.capacity_limit - tot_orders)
        ))

    # Build Neighborhood Assignments
    assignments_list: List[NeighborhoodAssignment] = []
    after_weighted_dist = 0.0
    after_fuel_cost = 0.0
    after_delivery_cost = 0.0
    after_travel_time_hours = 0.0
    after_violations = 0
    all_distances = []

    for i in range(n_count):
        n = neighborhoods[i]
        wh_idx = assignments[i]
        wh = warehouses[wh_idx]
        orders = int(effective_orders[i])

        dist = haversine_distance(wh.lat, wh.lng, n.lat, n.lng)
        all_distances.append(dist)

        trips = math.ceil(orders / fleet.batch_capacity_orders)
        round_trip_dist = 2.0 * dist * trips

        f_cost = (round_trip_dist / fleet.fuel_efficiency_km_l) * fleet.fuel_price_per_l
        deliv_cost = dist * orders * settings.cost_per_km_order
        time_mins = (dist / effective_speed) * 60.0

        is_violation = (dist > settings.max_delivery_radius_km)
        overshoot = max(0.0, dist - settings.max_delivery_radius_km) if is_violation else 0.0

        if is_violation:
            after_violations += 1

        after_weighted_dist += (dist * orders)
        after_fuel_cost += f_cost
        after_delivery_cost += deliv_cost
        after_travel_time_hours += (time_mins / 60.0) * trips

        orig_wh_idx = reassigned_from[i]
        orig_wh_id = int(orig_wh_idx + 1) if orig_wh_idx >= 0 else None
        orig_wh_name = f"Hub {chr(65 + orig_wh_idx)}" if orig_wh_idx >= 0 else None

        assignments_list.append(NeighborhoodAssignment(
            neighborhood_id=n.id,
            neighborhood_name=n.name,
            lat=n.lat,
            lng=n.lng,
            daily_orders_base=n.daily_orders,
            daily_orders_effective=orders,
            assigned_warehouse_id=wh.id,
            assigned_warehouse_name=wh.name,
            warehouse_lat=wh.lat,
            warehouse_lng=wh.lng,
            distance_km=round(dist, 2),
            delivery_time_mins=round(time_mins, 1),
            fuel_cost_daily=round(f_cost, 2),
            delivery_cost_daily=round(deliv_cost, 2),
            is_radius_violation=is_violation,
            radius_overshoot_km=round(overshoot, 2),
            is_overflow_reassigned=bool(reassigned_flags[i]),
            reassigned_from_hub_id=orig_wh_id,
            reassigned_from_hub_name=orig_wh_name
        ))

    # After Total Cost
    fixed_infra_cost = k_actual * settings.fixed_warehouse_cost_daily
    after_total_cost = fixed_infra_cost + after_delivery_cost + after_fuel_cost

    # 4. Deltas and Before vs. After
    dist_saved = max(0.0, before_weighted_dist - after_weighted_dist)
    dist_saved_pct = (dist_saved / before_weighted_dist * 100.0) if before_weighted_dist > 0 else 0.0

    cost_saved = max(0.0, before_delivery_cost - after_delivery_cost)
    cost_saved_pct = (cost_saved / before_delivery_cost * 100.0) if before_delivery_cost > 0 else 0.0

    tot_saved = before_total_cost - after_total_cost
    tot_saved_pct = (tot_saved / before_total_cost * 100.0) if before_total_cost > 0 else 0.0

    time_saved = max(0.0, before_travel_time_hours - after_travel_time_hours)
    time_saved_pct = (time_saved / before_travel_time_hours * 100.0) if before_travel_time_hours > 0 else 0.0

    before_after = BeforeAfterComparison(
        before_num_warehouses=1,
        before_warehouse_lat=round(before_lat, 6),
        before_warehouse_lng=round(before_lng, 6),
        before_total_weighted_distance_km=round(before_weighted_dist, 2),
        before_total_delivery_cost=round(before_delivery_cost, 2),
        before_total_fuel_cost=round(before_fuel_cost, 2),
        before_total_travel_time_hours=round(before_travel_time_hours, 2),
        before_radius_violations_count=before_violations,
        before_total_cost=round(before_total_cost, 2),

        after_num_warehouses=k_actual,
        after_total_weighted_distance_km=round(after_weighted_dist, 2),
        after_total_delivery_cost=round(after_delivery_cost, 2),
        after_total_fuel_cost=round(after_fuel_cost, 2),
        after_total_travel_time_hours=round(after_travel_time_hours, 2),
        after_radius_violations_count=after_violations,
        after_total_cost=round(after_total_cost, 2),

        distance_saved_km=round(dist_saved, 2),
        distance_saved_pct=round(dist_saved_pct, 1),
        delivery_cost_saved=round(cost_saved, 2),
        delivery_cost_saved_pct=round(cost_saved_pct, 1),
        total_cost_saved=round(tot_saved, 2),
        total_cost_saved_pct=round(tot_saved_pct, 1),
        time_saved_hours=round(time_saved, 2),
        time_saved_pct=round(time_saved_pct, 1)
    )

    # 5. Infrastructure Trade-off Simulation (K = 1 to 5)
    tradeoff_curve: List[TradeoffPoint] = []
    min_tot_cost = float("inf")
    optimal_k = 1

    for test_k in range(1, 6):
        t_cents, t_assigns, *_ = run_capacitated_kmeans(
            coords=coords,
            weights=effective_orders,
            k=test_k,
            capacity_limit=settings.capacity_limit
        )
        t_deliv_cost = 0.0
        t_fuel_cost = 0.0
        t_dist_sum = 0.0
        t_viol_count = 0

        for idx in range(n_count):
            t_wh = t_cents[t_assigns[idx]]
            t_d = haversine_distance(t_wh[0], t_wh[1], coords[idx, 0], coords[idx, 1])
            t_orders = effective_orders[idx]
            t_trips = math.ceil(t_orders / fleet.batch_capacity_orders)
            t_round_d = 2.0 * t_d * t_trips

            t_deliv_cost += (t_d * t_orders * settings.cost_per_km_order)
            t_fuel_cost += (t_round_d / fleet.fuel_efficiency_km_l) * fleet.fuel_price_per_l
            t_dist_sum += t_d
            if t_d > settings.max_delivery_radius_km:
                t_viol_count += 1

        t_fixed_cost = test_k * settings.fixed_warehouse_cost_daily
        t_total = t_fixed_cost + t_deliv_cost + t_fuel_cost

        if t_total < min_tot_cost:
            min_tot_cost = t_total
            optimal_k = test_k

        tradeoff_curve.append(TradeoffPoint(
            k=test_k,
            num_warehouses=test_k,
            fixed_cost=round(t_fixed_cost, 2),
            delivery_cost=round(t_deliv_cost, 2),
            fuel_cost=round(t_fuel_cost, 2),
            total_cost=round(t_total, 2),
            avg_distance_km=round(t_dist_sum / n_count, 2),
            radius_violations=t_viol_count,
            is_current_selection=(test_k == settings.num_warehouses),
            is_optimal_recommendation=False
        ))

    # Mark optimal recommendation
    for pt in tradeoff_curve:
        if pt.k == optimal_k:
            pt.is_optimal_recommendation = True

    # 6. Overall Summary
    total_cap = k_actual * settings.capacity_limit
    total_effective_orders = int(np.sum(effective_orders))
    cap_util = round((total_effective_orders / total_cap * 100.0), 1) if total_cap > 0 else 0.0

    all_warehouses_at_or_over_cap = all(w.total_orders_assigned >= settings.capacity_limit for w in warehouses)
    any_overloaded = any(w.is_over_capacity for w in warehouses)
    is_cap_exceeded = (total_effective_orders > total_cap) or (all_warehouses_at_or_over_cap and any_overloaded)
    deficit = max(0, total_effective_orders - total_cap)

    summary = OptimizationSummary(
        total_neighborhoods=n_count,
        total_daily_orders=total_effective_orders,
        active_warehouses=k_actual,
        total_capacity=total_cap,
        capacity_utilization_pct=cap_util,
        total_delivery_cost=round(after_delivery_cost, 2),
        total_fuel_cost=round(after_fuel_cost, 2),
        fixed_infrastructure_cost=round(fixed_infra_cost, 2),
        grand_total_cost=round(after_total_cost, 2),
        avg_delivery_distance_km=round(float(np.mean(all_distances)), 2),
        max_delivery_distance_km=round(float(np.max(all_distances)), 2),
        avg_delivery_time_mins=round(float(np.mean([a.delivery_time_mins for a in assignments_list])), 1),
        radius_violations_count=after_violations,
        overflow_reassignments_count=sum(reassigned_flags),
        fleet_type=settings.fleet_type.value,
        traffic_condition=settings.traffic_condition.value,
        demand_scaling_factor=round(scaling_factor, 2),
        is_total_capacity_exceeded=is_cap_exceeded,
        capacity_deficit_orders=deficit,
        reallocation_events=reallocation_events
    )

    elapsed_ms = round((time.perf_counter() - start_time) * 1000.0, 2)

    return OptimizationResponse(
        warehouses=warehouses,
        assignments=assignments_list,
        summary=summary,
        before_after=before_after,
        tradeoff_curve=tradeoff_curve,
        execution_time_ms=elapsed_ms
    )
