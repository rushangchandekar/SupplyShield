# SupplyShield — Supply Chain Risk Intelligence Platform

Real-time supply chain disruption prediction, risk scoring, and contingency recommendations.

## Quick Start

### Backend
```bash
cd backend
# activate your existing venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
Backend runs at http://localhost:8000 (API docs at /docs)

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at http://localhost:5173

## Features
- Real-time data from data.gov.in, eNAM, OpenWeatherMap, logistics APIs
- ML risk scoring (RandomForest + GBR ensemble)
- Interactive Leaflet supply chain map
- Freemium model: Free dashboard + Premium category insights
- Bottleneck detection with explainability
- Contingency recommendations engine
