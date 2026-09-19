# GridPoint — Advanced Warehouse Location Optimization Platform

GridPoint is an enterprise-grade, high-performance web platform for e-commerce and logistics networks that optimizes regional fulfillment warehouse locations to minimize weighted delivery costs based on geographic coordinates and daily order volume.

Built with a decoupled **FastAPI (Python)** backend and **Vite / React 18 / Tailwind CSS / Leaflet** frontend, GridPoint provides a complete operational toolchain designed for logistics planners, supply chain engineers, and hackathon showcases.

---

## 🚀 Key Features & Capabilities

### Core Optimization
- **Weighted Geometric Centroids & K-Means:** Optimizes $K$ warehouse locations ($K \in [1..5]$) minimizing total weighted delivery distance:
  $$\text{Total Delivery Cost} = \sum_{i} (\text{distance}_i \times \text{daily\_orders}_i \times \text{cost\_per\_km\_order})$$
- **True Haversine Great-Circle Math:** Spherical trigonometry ($R = 6371.0\text{ km}$) for real-world latitude/longitude distances—no flat Euclidean approximations.
- **Before vs. After Benchmark:** Automatically contrasts a single central geometric median warehouse against the multi-hub optimized network to quantify distance, fuel, cost, and time savings.

### Critical Bonus Features
1. **Capacity Limits & Min-Regret Overflow Reassignment:**
   - Enforces user-defined warehouse capacity caps (e.g. 5,000 orders/facility).
   - When a hub is overloaded, excess demand nodes are dynamically shifted to the next-closest warehouse with spare capacity using penalty regret logic.
2. **Maximum Delivery Radius (SLA Boundary):**
   - Configurable radius slider (5 to 35 km).
   - Highlights constraint violations with animated visual halos on the map and flags them in the audit table.
3. **Vehicle Fleet Profiles & Fuel Modeling:**
   - Select between **Motorbikes/Scooters** (35 km/L, ₹102/L, 25-order batch), **Delivery Vans** (12 km/L, ₹90/L, 120-order batch), and **Medium Trucks** (5 km/L, ₹90/L, 500-order batch).
   - Fuel cost formula:
     $$\text{Fuel Cost} = \frac{\text{Round-Trip Distance}}{\text{Fuel Efficiency}} \times \text{Fuel Price}$$
4. **Traffic-Dependent Delay Multipliers:**
   - Real-time traffic condition toggle (**Light** $0.80\times$, **Normal** $1.00\times$, **Heavy** $1.65\times$).
   - Dynamically scales road speeds to estimate realistic delivery times.
5. **Customer Demand Elasticity Simulation:**
   - Real-time demand modifier slider ($-50\%$ slump to $+100\%$ festive surge) to instantly stress-test facility capacity.
6. **Infrastructure vs. Delivery Cost Trade-off:**
   - Fixed daily facility lease overhead (e.g. ₹50,000/day/hub).
   - Generates the complete $K = 1 \dots 5$ trade-off curve on the Results page:
     $$\text{Total Cost}(K) = (K \times \text{Fixed Cost}) + \text{Delivery Cost}(K) + \text{Fuel Cost}(K)$$
   - Pinpoints the mathematically optimal facility count.

---

## 📂 Project Architecture

```
gridpoint/
├── frontend/                     # Vite + React 18 Single-Page App with React Router
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Persistent navigation with live API health indicator
│   │   │   ├── LeafletMap.jsx    # Interactive Leaflet map with warehouse pins & routes
│   │   │   ├── MetricCard.jsx    # Reusable KPI cards with trends and icons
│   │   │   └── TradeoffChart.jsx # Recharts composed curve for CapEx vs OpEx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Landing page, quick start & BLR sample loader
│   │   │   ├── DataManagement.jsx# CSV drag & drop upload + inline editable table
│   │   │   ├── InteractiveMap.jsx# Full-viewport map with route & layer filters
│   │   │   ├── Optimization.jsx  # Control panel with sliders for all 6 bonus parameters
│   │   │   └── Results.jsx       # Before vs After benchmarks, trade-off curve & audit table
│   │   ├── context/
│   │   │   └── AppContext.jsx    # React Context state management
│   │   ├── utils/
│   │   │   ├── api.js            # REST API client to FastAPI
│   │   │   └── sampleData.js     # Authentic 16 Bengaluru tech/residential coordinates
│   │   ├── App.jsx               # React Router configuration
│   │   ├── main.jsx              # Entrypoint
│   │   └── index.css             # Tailwind CSS & Leaflet custom styling
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── backend/                      # High-performance FastAPI Python Backend
│   ├── main.py                   # REST endpoints, CORS & sample data routes
│   ├── models.py                 # Pydantic schemas for requests, responses & fleets
│   ├── optimization_engine.py    # Haversine math, weighted K-Means & capacity reallocation
│   ├── simulation_engine.py      # Demand sensitivity & fleet comparison scenarios
│   └── requirements.txt          # fastapi, uvicorn, numpy, scipy, scikit-learn, pandas
└── README.md
```

---

## ⚡ Setup & Quickstart Commands

### 1. Backend Setup (FastAPI)

In a new terminal:
```bash
# Navigate to backend directory
cd backend

# Install Python requirements
pip install -r requirements.txt

# Start the FastAPI development server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
- API Docs: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/api/health`

### 2. Frontend Setup (React / Vite)

In a second terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Launch Vite dev server
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 📊 Sample Bengaluru Dataset Included

GridPoint comes preloaded with 16 authentic Bengaluru delivery corridors:
- Koramangala Tech Hub (4,200 orders/day)
- Indiranagar 100ft Road (3,800 orders/day)
- Whitefield IT Corridor (5,200 orders/day)
- Electronic City Phase 1 (4,600 orders/day)
- HSR Layout Sector 1-7 (3,900 orders/day)
- Jayanagar, Malleshwaram, Hebbal, Marathahalli, Yelahanka, Bellandur, Sarjapur, Rajajinagar, Banashankari, Manyata Tech Park, BTM Layout.

---

## 📐 Mathematical Formulation

### Haversine Distance
$$d = 2 R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
with $R = 6371.0\text{ km}$.

### Capacity Regret Penalty
For neighborhood $i$ currently assigned to an overloaded hub $j$ with load $> C_{\max}$, regret penalty to alternate hub $k$ is:
$$\text{Penalty}(i, k) = d(i, k) - d(i, j)$$
The neighborhood with minimum penalty where $\text{load}_k + w_i \le C_{\max}$ is iteratively reassigned.

---

## 🏆 Hackathon Ready
- Zero placeholder logic or hardcoded mock results.
- Fully production-ready, clean, decoupled codebase.
