# SupplyShield — Supply Chain Risk Intelligence Platform

A full-stack web application for real-time supply chain disruption prediction, risk scoring, and contingency recommendations.

## Architecture

```
supply-chain-risk/
├── backend/                    # FastAPI (Python)
│   ├── main.py                 # App entry point
│   ├── config.py               # Configuration & env vars
│   ├── database.py             # SQLAlchemy setup
│   ├── models/                 # PostgreSQL models
│   │   ├── user.py             # Users & subscriptions
│   │   ├── signal.py           # Raw API signals
│   │   ├── risk_score.py       # Computed risk scores
│   │   ├── recommendation.py   # Contingency actions
│   │   ├── subscription.py     # Subscription plans
│   │   └── category.py         # Product categories
│   ├── schemas/                # Pydantic schemas
│   ├── routers/                # API endpoints
│   │   ├── auth.py             # Register, Login, Upgrade
│   │   ├── dashboard.py        # Risk dashboard & categories
│   │   └── data_ingestion.py   # Raw data endpoints
│   ├── services/               # Business logic
│   │   ├── auth_service.py     # JWT auth, bcrypt
│   │   └── risk_service.py     # Risk scoring orchestration
│   ├── integrations/           # External API clients
│   │   ├── mandi_api.py        # data.gov.in mandi prices
│   │   ├── enam_api.py         # eNAM market feeds
│   │   ├── trade_api.py        # Import/Export trade data
│   │   ├── weather_api.py      # OpenWeatherMap
│   │   └── logistics_api.py    # Transport delay indicators
│   └── ml/                     # Machine Learning
│       └── risk_model.py       # RandomForest + GBR ensemble
│
├── frontend/                   # React.js (Vite)
│   ├── src/
│   │   ├── App.jsx             # Root with routing
│   │   ├── index.css           # Full design system
│   │   ├── context/            # Auth context
│   │   ├── services/           # API client
│   │   ├── components/         # Reusable UI
│   │   │   ├── Navbar.jsx
│   │   │   ├── ScoreGauge.jsx
│   │   │   └── RiskBadge.jsx
│   │   └── pages/
│   │       ├── Dashboard.jsx   # Main risk dashboard
│   │       ├── SupplyMap.jsx   # Leaflet map visualization
│   │       ├── Signals.jsx     # Live signal feed
│   │       ├── Categories.jsx  # Premium category insights
│   │       ├── Pricing.jsx     # Freemium plan comparison
│   │       ├── Login.jsx
│   │       └── Register.jsx
│   └── index.html
```

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+ (running)

### 1. Database Setup

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE supply_chain_risk;"
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate    # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
copy .env.example .env
# Edit .env with your API keys

# Run the server
python main.py
# or: uvicorn main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the dev server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. API Keys (Optional but Recommended)

Add these to `backend/.env`:

| Variable | Source | Notes |
|---|---|---|
| `WEATHER_API_KEY` | [OpenWeatherMap](https://openweathermap.org/api) | Free tier available |
| `GOV_DATA_API_KEY` | [data.gov.in](https://data.gov.in/) | Free registration |
| `LOGISTICS_API_URL` | Enterprise logistics provider | Optional |

> **Note:** The application works without API keys using structured fallback data that mirrors the real API format, so you can explore the full experience immediately.

## Features

### Free Tier
- ✅ Macro supply chain risk dashboard
- ✅ Overall risk score (0-100 gauge)
- ✅ Segment scores: Procurement, Transport, Import/Export
- ✅ 14-day risk trend chart
- ✅ Mandi & eNAM price feeds
- ✅ Weather disruption signals
- ✅ Basic recommendations (top 3)
- ✅ Supply chain map (risk points)

### Premium Tier
- ✅ Category-level insights: Food, Clothing, Stationery, Toys
- ✅ Import/Export trade data access
- ✅ Logistics corridor monitoring
- ✅ Supply network corridor visualization on map
- ✅ Advanced bottleneck detection with explanations
- ✅ Category-specific recommendations
- ✅ Radar chart risk factor analysis
- ✅ Full recommendation engine

## Data Sources

| Source | Type | Integration |
|---|---|---|
| data.gov.in | Mandi/Commodity Prices | REST API |
| eNAM | Market Price Feeds | REST API |
| data.gov.in | Import/Export Trade | REST API |
| OpenWeatherMap | Weather Disruptions | REST API |
| Enterprise Logistics | Transport Delays | Enterprise API-ready |

## ML Model

- **Algorithm:** Random Forest Classifier + Gradient Boosting Regressor ensemble
- **Scoring:** 60% ML prediction + 40% weighted heuristic (explainable baseline)
- **Features:** Price volatility, weather severity, logistics delay, trade volume change, congestion level, supply-demand ratio, seasonal factor, historical disruption rate
- **Risk Levels:** Low (0-25), Medium (25-50), High (50-75), Critical (75-100)
- **Explainability:** Feature weights, contribution scores, and ML feature importance surfaced in UI

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Vite, Recharts, Leaflet, Axios |
| Backend | FastAPI, Python 3.10+ |
| ML | scikit-learn, pandas, numpy |
| Database | PostgreSQL, SQLAlchemy |
| Auth | JWT (python-jose), bcrypt (passlib) |
| HTTP Client | httpx (async) |
