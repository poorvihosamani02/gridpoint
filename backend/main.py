"""
GridPoint FastAPI Application Server
Provides REST API endpoints for warehouse location optimization,
fleet simulation, sensitivity scenarios, and sample datasets.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

from models import (
    OptimizationRequest,
    OptimizationResponse,
    OptimizationSettings,
    Neighborhood,
    FleetType,
    TrafficCondition,
    FLEET_PROFILES,
    TRAFFIC_MULTIPLIERS
)
from optimization_engine import run_full_optimization
from simulation_engine import simulate_demand_sensitivity, simulate_fleet_comparison

app = FastAPI(
    title="GridPoint Optimization Engine",
    description="High-performance backend for warehouse location optimization, vehicle fuel modeling, and logistics capacity simulation.",
    version="1.0.0"
)

# CORS setup for Vite / React client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SAMPLE_BENGALURU_DATA = [
    {"id": "BLR-01", "name": "Koramangala Tech Hub", "lat": 12.9352, "lng": 77.6245, "daily_orders": 4200},
    {"id": "BLR-02", "name": "Indiranagar 100ft Road", "lat": 12.9784, "lng": 77.6408, "daily_orders": 3800},
    {"id": "BLR-03", "name": "Whitefield IT Corridor", "lat": 12.9698, "lng": 77.7500, "daily_orders": 5200},
    {"id": "BLR-04", "name": "Electronic City Phase 1", "lat": 12.8452, "lng": 77.6602, "daily_orders": 4600},
    {"id": "BLR-05", "name": "HSR Layout Sector 1-7", "lat": 12.9121, "lng": 77.6446, "daily_orders": 3900},
    {"id": "BLR-06", "name": "Jayanagar 4th Block", "lat": 12.9308, "lng": 77.5838, "daily_orders": 2900},
    {"id": "BLR-07", "name": "Malleshwaram Heritage", "lat": 13.0031, "lng": 77.5643, "daily_orders": 2700},
    {"id": "BLR-08", "name": "Hebbal Flyover Zone", "lat": 13.0358, "lng": 77.5970, "daily_orders": 3100},
    {"id": "BLR-09", "name": "Marathahalli Bridge", "lat": 12.9591, "lng": 77.6974, "daily_orders": 3600},
    {"id": "BLR-10", "name": "Yelahanka New Town", "lat": 13.1007, "lng": 77.5963, "daily_orders": 2400},
    {"id": "BLR-11", "name": "Bellandur Outer Ring", "lat": 12.9260, "lng": 77.6762, "daily_orders": 4100},
    {"id": "BLR-12", "name": "Sarjapur Road Junction", "lat": 12.9081, "lng": 77.6891, "daily_orders": 3300},
    {"id": "BLR-13", "name": "Rajajinagar Industrial", "lat": 12.9982, "lng": 77.5530, "daily_orders": 2500},
    {"id": "BLR-14", "name": "Banashankari Stage 2", "lat": 12.9150, "lng": 77.5736, "daily_orders": 2800},
    {"id": "BLR-15", "name": "Manyata Tech Park Hub", "lat": 13.0489, "lng": 77.6200, "daily_orders": 3400},
    {"id": "BLR-16", "name": "BTM Layout 2nd Stage", "lat": 12.9166, "lng": 77.6101, "daily_orders": 3100}
]


@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "GridPoint Optimization Engine",
        "version": "1.0.0",
        "algorithms": [
            "Haversine Great-Circle Distance",
            "Weighted K-Means Facility Location",
            "Capacitated Regret-Based Reallocation",
            "Vehicle Fleet Fuel Dynamics",
            "Traffic Multiplier Transit Modeling"
        ]
    }


@app.get("/api/sample-data", response_model=List[Neighborhood])
def get_sample_bengaluru_data():
    """Returns canonical 16-point Bengaluru e-commerce delivery demand dataset."""
    return [Neighborhood(**item) for item in SAMPLE_BENGALURU_DATA]


@app.post("/api/optimize", response_model=OptimizationResponse)
def optimize_network(request: OptimizationRequest):
    """
    Primary endpoint: optimizes warehouse locations, assigns demand,
    computes Before vs. After savings, and evaluates 1..5 warehouse trade-offs.
    """
    if not request.neighborhoods:
        raise HTTPException(status_code=400, detail="Neighborhood dataset must contain at least one location.")
    
    try:
        response = run_full_optimization(request.neighborhoods, request.settings)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization computation error: {str(e)}")


@app.post("/api/simulate-demand")
def simulate_demand(request: OptimizationRequest):
    """Evaluates sensitivity of delivery network across -50% to +100% demand scale."""
    if not request.neighborhoods:
        raise HTTPException(status_code=400, detail="Neighborhoods list is empty.")
    try:
        return simulate_demand_sensitivity(request.neighborhoods, request.settings)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")


@app.post("/api/simulate-fleet")
def simulate_fleet(request: OptimizationRequest):
    """Simulates delivery costs, trip loads, and transit times across vehicle fleets."""
    if not request.neighborhoods:
        raise HTTPException(status_code=400, detail="Neighborhoods list is empty.")
    try:
        return simulate_fleet_comparison(request.neighborhoods, request.settings)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fleet simulation error: {str(e)}")


import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Serve built frontend static files if dist folder exists (Single-service deployment mode)
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
