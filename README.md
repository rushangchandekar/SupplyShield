# ⚡ SupplyShield — Supply Chain Risk Intelligence Platform

> A full-stack web application that predicts supply chain disruptions using real-time data ingestion, ML-powered risk scoring, interactive map visualizations, and actionable contingency recommendations — with a freemium subscription model.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18.2+-61DAFB?style=flat&logo=react&logoColor=black)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5+-F7931E?style=flat&logo=scikit-learn&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat&logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [API Documentation](#-api-documentation)
- [Data Sources](#-data-sources)
- [ML Model](#-ml-model)
- [Freemium Model](#-freemium-model)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌐 Overview

**SupplyShield** is a real-time supply chain risk intelligence platform designed for businesses operating in the Indian market. It ingests live data from government APIs, weather services, and logistics feeds to:

- **Predict** disruptions before they happen
- **Score** risk across procurement, transport, and import/export segments
- **Visualize** supply networks on an interactive map with risk overlays
- **Recommend** contingency actions (increase inventory, diversify suppliers, switch routes)

The platform uses a **freemium model** — free users get a macro-level risk dashboard, while premium users unlock category-level insights for Food, Clothing, Stationery, and Toys.

---

## ✨ Features

### 🆓 Free Tier
| Feature | Description |
|---------|-------------|
| 📊 Risk Dashboard | Overall risk score (0–100) with real-time gauge |
| 📈 Segment Scores | Procurement, Transport, Import/Export breakdown |
| 📉 Risk Trend | 14-day trend chart with segment overlays |
| 🌾 Mandi Prices | Live commodity prices from data.gov.in |
| 🏪 eNAM Markets | Market price feeds from eNAM portal |
| 🌦️ Weather Signals | Disruption severity from OpenWeatherMap |
| 💡 Recommendations | Top 3 contingency recommendations |
| 🗺️ Supply Map | Risk point overlays on Leaflet map |
| 🔍 Bottlenecks | Basic bottleneck identification |

### ⭐ Premium Tier (₹2,999/month)
| Feature | Description |
|---------|-------------|
| 🍽️👔📝🧸 Category Insights | Deep analysis for Food, Clothing, Stationery, Toys |
| 📊 Trade Data | Import/export statistics with country breakdown |
| 🚚 Logistics Corridors | Real-time corridor congestion & delay data |
| 🗺️ Corridor Visualization | Transport routes on map with risk colors |
| 🔍 Advanced Bottlenecks | Multi-factor bottleneck detection with explanations |
| 📡 Radar Analysis | Contributing risk factor radar charts |
| 💡 Full Recommendations | Category-specific, unlimited recommendations |
| 📊 Explainability | ML feature importance & contribution scores |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │Dashboard │ │Supply Map│ │ Signals  │ │Categories│            │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘            │
│       └─────────────┴────────────┴─────────────┘                 │
│                          ↕ Axios + JWT                           │
├──────────────────────────────────────────────────────────────────┤
│                     BACKEND (FastAPI + Python)                    │
│  ┌─────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │Auth API │  │ Dashboard API│  │Data Ingest API│                │
│  └────┬────┘  └──────┬───────┘  └──────┬───────┘                │
│       │              │                  │                         │
│  ┌────▼────┐  ┌──────▼───────┐  ┌──────▼───────────┐            │
│  │Auth Svc │  │ Risk Service │  │  Integrations     │            │
│  │(JWT+BCR)│  │(Orchestrator)│  │┌─────┬─────┬────┐│            │
│  └────┬────┘  └──────┬───────┘  ││Mandi│eNAM │Weth││            │
│       │              │          ││Trade│Logis │    ││            │
│       │       ┌──────▼───────┐  │└─────┴─────┴────┘│            │
│       │       │   ML Engine  │  └──────────────────┘            │
│       │       │(RF + GBR     │                                   │
│       │       │ Ensemble)    │                                   │
│       │       └──────┬───────┘                                   │
│  ┌────▼──────────────▼───────────────────────────┐               │
│  │              SQLite Database                   │               │
│  │  Users | Signals | RiskScores | Recommendations│               │
│  └───────────────────────────────────────────────┘               │
└──────────────────────────────────────────────────────────────────┘
                          ↕
┌──────────────────────────────────────────────────────────────────┐
│                    EXTERNAL DATA SOURCES                          │
│  data.gov.in │ eNAM Portal │ OpenWeatherMap │ Logistics APIs     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18, Vite 5 | UI framework & build tool |
| **Charts** | Recharts | Area, Bar, Radar, Line charts |
| **Maps** | Leaflet.js | Interactive supply chain map |
| **HTTP Client** | Axios | API calls with JWT interceptors |
| **Styling** | Vanilla CSS | Custom glassmorphism dark/light theme |
| **Auth** | Clerk | OAuth & email authentication |
| **Backend** | FastAPI (Python) | REST API server |
| **ML/Analytics** | scikit-learn, NumPy, Pandas | Risk prediction models |
| **Database** | SQLite (SQLAlchemy ORM) | Data persistence |
| **HTTP** | httpx (async) | External API integration |

---

## 📁 Project Structure

```
supply-chain-risk/
│
├── backend/                        # FastAPI Backend
│   ├── main.py                     # Application entry point
│   ├── config.py                   # Environment & settings (pydantic-settings)
│   ├── database.py                 # SQLAlchemy engine & session
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Environment template
│   │
│   ├── models/                     # SQLAlchemy ORM Models
│   │   ├── __init__.py
│   │   ├── user.py                 # User + SubscriptionTier enum
│   │   ├── signal.py               # Raw signal data from APIs
│   │   ├── risk_score.py           # Computed risk scores
│   │   ├── recommendation.py       # Contingency actions
│   │   ├── subscription.py         # User subscriptions
│   │   └── category.py             # Product categories
│   │
│   ├── schemas/                    # Pydantic Request/Response Models
│   │   ├── __init__.py
│   │   ├── user.py                 # UserCreate, UserLogin, TokenResponse
│   │   └── risk.py                 # RiskScore, Dashboard, MapData schemas
│   │
│   ├── routers/                    # API Route Handlers
│   │   ├── __init__.py
│   │   ├── auth.py                 # POST /register, /login, /upgrade
│   │   ├── dashboard.py            # GET /summary, /category, /signals, /map-data
│   │   └── data_ingestion.py       # GET /mandi, /enam, /trade, /weather, /logistics
│   │
│   ├── services/                   # Business Logic Layer
│   │   ├── __init__.py
│   │   ├── auth_service.py         # JWT creation, password hashing, user auth
│   │   └── risk_service.py         # Risk computation orchestrator
│   │
│   ├── integrations/               # External API Clients
│   │   ├── __init__.py
│   │   ├── mandi_api.py            # data.gov.in mandi commodity prices
│   │   ├── enam_api.py             # eNAM market price feeds
│   │   ├── trade_api.py            # Import/export trade statistics
│   │   ├── weather_api.py          # OpenWeatherMap disruption signals
│   │   └── logistics_api.py        # Transport delay & congestion indicators
│   │
│   └── ml/                         # Machine Learning Models
│       ├── __init__.py
│       └── risk_model.py           # RandomForest + GBR ensemble with explainability
│
├── frontend/                       # React Frontend (Vite)
│   ├── index.html                  # HTML entry with Leaflet CDN & Inter font
│   ├── package.json                # Node.js dependencies
│   ├── vite.config.js              # Vite config with API proxy to :8000
│   ├── vercel.json                 # Vercel SPA rewrite rules
│   │
│   └── src/
│       ├── main.jsx                # React DOM render + Clerk provider
│       ├── App.jsx                 # Root component with routing & auth gating
│       ├── index.css               # Full design system (40KB+ dark/light theme)
│       │
│       ├── context/
│       │   ├── AuthContext.jsx     # Clerk-based auth state & premium check
│       │   └── ThemeContext.jsx    # Dark/light mode toggle with persistence
│       │
│       ├── services/
│       │   └── api.js              # Axios instance, Clerk token interceptor
│       │
│       ├── components/
│       │   ├── Navbar.jsx          # Navigation with auth-aware actions
│       │   ├── ScoreGauge.jsx      # Animated SVG circular risk gauge
│       │   └── RiskBadge.jsx       # Color-coded risk level badges
│       │
│       └── pages/
│           ├── LandingPage.jsx     # Marketing landing page (signed-out)
│           ├── Dashboard.jsx       # Main risk dashboard with charts
│           ├── SupplyMap.jsx       # Interactive Leaflet map
│           ├── Signals.jsx         # Live data feed from all sources
│           ├── Categories.jsx      # Premium category-level insights
│           └── Pricing.jsx         # Free vs Premium plan comparison
│
└── README.md                       # This file
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/supply-chain-risk.git
cd supply-chain-risk
```

### 2️⃣ Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment (optional — app works with defaults)
copy .env.example .env
# Edit .env with your API keys if available

# Start the server
python main.py
```

✅ Backend runs at **http://localhost:8000**
📖 API docs at **http://localhost:8000/docs** (Swagger UI)

### 3️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

✅ Frontend runs at **http://localhost:5173**

> **Note:** The Vite dev server automatically proxies `/api` requests to the backend at `localhost:8000`.

### 4️⃣ API Keys (Optional)

The app works **without any API keys** using structured fallback data that mirrors real API formats. To enable live data, add keys to `backend/.env`:

| Variable | Source | Signup |
|----------|--------|--------|
| `WEATHER_API_KEY` | OpenWeatherMap | [Free tier](https://openweathermap.org/api) |
| `GOV_DATA_API_KEY` | Open Government Data | [Free registration](https://data.gov.in/) |
| `LOGISTICS_API_URL` | Enterprise provider | Optional |

---

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Create new account | ❌ |
| `POST` | `/api/auth/login` | Login & get JWT token | ❌ |
| `GET` | `/api/auth/me` | Get current user profile | ✅ |
| `POST` | `/api/auth/upgrade` | Upgrade to premium | ✅ |

### Dashboard Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/dashboard/summary` | Full risk dashboard data | Optional |
| `GET` | `/api/dashboard/category/{name}` | Category-level insights | ✅ Premium |
| `GET` | `/api/dashboard/signals` | Live signals from all sources | Optional |
| `GET` | `/api/dashboard/map-data` | Map points & corridors | Optional |
| `GET` | `/api/dashboard/risk-trend?days=14` | Historical risk trend | ❌ |

### Raw Data Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/data/mandi?commodity=Wheat&state=Maharashtra` | Mandi commodity prices |
| `GET` | `/api/data/enam?commodity=Onion` | eNAM market prices |
| `GET` | `/api/data/trade?commodity=Textiles&country=China` | Import/export trade data |
| `GET` | `/api/data/weather` | Weather for 10 supply chain hubs |
| `GET` | `/api/data/logistics?mode=rail` | Logistics corridor data |

### Example: Register & Get Dashboard

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "secret123"}'

# Use the returned token
curl http://localhost:8000/api/dashboard/summary \
  -H "Authorization: Bearer <your-token>"
```

---

## 📊 Data Sources

| Source | Type | Data Provided | Update Frequency |
|--------|------|---------------|-----------------|
| **data.gov.in** | REST API | Mandi commodity prices (wheat, rice, cotton, etc.) | Daily |
| **eNAM Portal** | REST API | Market price feeds from APMCs across India | Daily |
| **data.gov.in** | REST API | Import/export trade statistics by commodity & country | Monthly |
| **OpenWeatherMap** | REST API | Weather conditions for 10 major supply chain hubs | Real-time |
| **Enterprise Logistics** | REST API (configurable) | Transport corridor delays, congestion levels | Real-time |

### Supply Chain Hubs Monitored
Mumbai, Delhi, Chennai, Kolkata, Bangalore, Ahmedabad, Hyderabad, Pune, Lucknow, Jaipur

### Logistics Corridors Tracked
- Delhi–Mumbai Western Corridor (Rail)
- Delhi–Kolkata Eastern Corridor (Rail)
- Delhi–Jaipur–Ahmedabad Highway (Road)
- Delhi–Bangalore National Highway (Road)
- JNPT Mumbai & Chennai Port (Sea)
- Delhi IGI & Mumbai CSIA (Air Cargo)

---

## 🤖 ML Model

### Algorithm
**Ensemble approach** combining:
1. **Random Forest Classifier** (100 trees, max_depth=8) — risk level classification
2. **Gradient Boosting Regressor** (100 trees, max_depth=5) — continuous risk score prediction

### Scoring Formula
```
Final Score = 0.6 × ML Prediction + 0.4 × Weighted Heuristic
```

This hybrid approach ensures:
- ML captures non-linear patterns in data
- Weighted heuristic provides **explainable baseline** scores
- Scores are always interpretable (0–100 scale)

### Features Used

| Feature | Description | Weight (Procurement) |
|---------|-------------|---------------------|
| `price_volatility` | Commodity price standard deviation / mean | 0.30 |
| `supply_demand_ratio` | Market supply vs demand ratio | 0.25 |
| `weather_severity` | Max disruption severity across hubs | 0.15 |
| `seasonal_factor` | Month-based seasonal risk | 0.15 |
| `historical_disruption_rate` | Past disruption frequency | 0.15 |
| `logistics_delay` | Max transport delay hours (normalized) | 0.30 (Transport) |
| `congestion_level` | Max corridor congestion | 0.25 (Transport) |
| `trade_volume_change` | Trade volume % change | 0.30 (Import/Export) |

### Risk Levels

| Level | Score Range | Color |
|-------|------------|-------|
| 🟢 Low | 0 – 25 | Green |
| 🟡 Medium | 25 – 50 | Amber |
| 🟠 High | 50 – 75 | Orange |
| 🔴 Critical | 75 – 100 | Red |

### Explainability
Each risk score includes:
- **Contributing factors** with individual values, weights, and contributions
- **ML feature importance** from Random Forest
- **Model version** tracking

---

## 💰 Freemium Model

### Subscription Tiers

| | Free | Premium (₹2,999/mo) |
|--|------|---------------------|
| Overall Dashboard | ✅ | ✅ |
| 3 Segment Scores | ✅ | ✅ |
| Risk Trend Charts | ✅ | ✅ |
| Mandi & eNAM Feeds | ✅ | ✅ |
| Weather Signals | ✅ | ✅ |
| Recommendations | Top 3 | Unlimited |
| Category Insights | ❌ | ✅ Food, Clothing, Stationery, Toys |
| Trade Data | ❌ | ✅ |
| Logistics Corridors | ❌ | ✅ |
| Map Corridors | ❌ | ✅ |
| Radar Analysis | ❌ | ✅ |
| Bottleneck Details | Basic | Advanced with explanations |

### Implementation
- **Clerk authentication** handles sign-up, sign-in, and session management
- Clerk session tokens are attached to API requests via Axios interceptors
- Premium status tracked via `localStorage` (demo mode — no payment gateway)
- Frontend gates premium features with `useAuth().isPremium` check
- Upgrade endpoint at `POST /api/auth/upgrade`

---

## 🖥️ Screenshots

### Landing Page
- Full-viewport hero with animated gradient blobs and floating particles
- Interactive dashboard mockup with animated SVG risk gauge
- Floating real-time alert cards (weather, prices, logistics)
- Animated stats counter, 6 feature cards, 3-step "How It Works" flow
- Data sources strip, Free vs Premium pricing comparison, and CTA
- Scroll-triggered reveal animations throughout

### Dashboard
- Real-time risk gauges for Overall, Procurement, Transport, Import/Export
- 14-day trend chart with area + line overlays
- Data source status with live record counts
- Bottleneck cards with multi-factor analysis
- Priority-ranked contingency recommendations
- Contributing factors bar chart (explainability)

### Supply Map
- Interactive Leaflet map centered on India
- Color-coded risk circle markers for each hub
- Transport corridor lines (solid=road, dashed=air/sea)
- Popup details on click (weather, prices, delays)
- Risk point detail table

### Live Signals
- Filterable by source (Mandi, eNAM, Weather, Trade, Logistics)
- Styled data tables per source type
- Weather cards with disruption severity indicators
- Congestion progress bars for logistics corridors

### Categories (Premium)
- Category selection cards (Food, Clothing, Stationery, Toys)
- Radar chart for risk factor analysis
- Price comparison bar charts
- Category-specific recommendations

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Rushang** — Built as part of the SB Jain Institute project.

---

<p align="center">
  <strong>⚡ SupplyShield</strong> — Predict. Protect. Prosper.
</p>
