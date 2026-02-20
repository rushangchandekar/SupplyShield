"""
ML Risk Scoring Model
Uses scikit-learn for explainable risk prediction with feature importance.
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import logging
from typing import Dict, List, Any, Tuple
from datetime import datetime

logger = logging.getLogger(__name__)


class SupplyChainRiskModel:
    """
    Explainable risk scoring model for supply chain disruption prediction.
    Uses a combination of weighted heuristic scoring and ML-based classification.
    """

    FEATURE_NAMES = [
        "price_volatility",
        "weather_severity",
        "logistics_delay",
        "trade_volume_change",
        "congestion_level",
        "supply_demand_ratio",
        "seasonal_factor",
        "historical_disruption_rate",
    ]

    SEGMENT_WEIGHTS = {
        "procurement": {
            "price_volatility": 0.30,
            "weather_severity": 0.15,
            "supply_demand_ratio": 0.25,
            "seasonal_factor": 0.15,
            "historical_disruption_rate": 0.15,
            "logistics_delay": 0.0,
            "trade_volume_change": 0.0,
            "congestion_level": 0.0,
        },
        "transport": {
            "logistics_delay": 0.30,
            "congestion_level": 0.25,
            "weather_severity": 0.20,
            "seasonal_factor": 0.10,
            "historical_disruption_rate": 0.15,
            "price_volatility": 0.0,
            "supply_demand_ratio": 0.0,
            "trade_volume_change": 0.0,
        },
        "import_export": {
            "trade_volume_change": 0.30,
            "price_volatility": 0.20,
            "logistics_delay": 0.15,
            "congestion_level": 0.10,
            "seasonal_factor": 0.10,
            "historical_disruption_rate": 0.15,
            "weather_severity": 0.0,
            "supply_demand_ratio": 0.0,
        }
    }

    def __init__(self):
        self.scaler = StandardScaler()
        self.classifier = RandomForestClassifier(
            n_estimators=100,
            max_depth=8,
            random_state=42,
            n_jobs=-1
        )
        self.regressor = GradientBoostingRegressor(
            n_estimators=100,
            max_depth=5,
            random_state=42
        )
        self.is_trained = False
        self.model_version = "v1.0.0"
        self._train_initial_model()

    def _train_initial_model(self):
        """Train the model with synthetic historical data as bootstrap."""
        np.random.seed(42)
        n_samples = 1000

        # Generate synthetic training data
        X = np.random.rand(n_samples, len(self.FEATURE_NAMES))

        # Create labels based on weighted features (matching domain logic)
        risk_scores = np.zeros(n_samples)
        for i in range(n_samples):
            risk_scores[i] = (
                X[i, 0] * 0.20 +  # price_volatility
                X[i, 1] * 0.15 +  # weather_severity
                X[i, 2] * 0.20 +  # logistics_delay
                X[i, 3] * 0.15 +  # trade_volume_change
                X[i, 4] * 0.10 +  # congestion_level
                X[i, 5] * 0.10 +  # supply_demand_ratio
                X[i, 6] * 0.05 +  # seasonal_factor
                X[i, 7] * 0.05    # historical_disruption_rate
            ) * 100

        # Create risk level labels
        labels = np.digitize(risk_scores, bins=[25, 50, 75]) # 0=low, 1=med, 2=high, 3=critical

        # Train
        X_scaled = self.scaler.fit_transform(X)
        self.classifier.fit(X_scaled, labels)
        self.regressor.fit(X_scaled, risk_scores)
        self.is_trained = True
        logger.info("Initial risk model trained successfully")

    def compute_risk_score(
        self,
        features: Dict[str, float],
        segment: str = "procurement"
    ) -> Dict[str, Any]:
        """
        Compute risk score for a supply chain segment.
        Returns score, risk level, contributing factors, and feature weights.
        """
        # Build feature vector
        feature_vector = np.array([
            features.get(name, 0.0) for name in self.FEATURE_NAMES
        ]).reshape(1, -1)

        # Weighted heuristic score (explainable baseline)
        weights = self.SEGMENT_WEIGHTS.get(segment, self.SEGMENT_WEIGHTS["procurement"])
        weighted_score = sum(
            features.get(name, 0.0) * weight
            for name, weight in weights.items()
        ) * 100

        # ML prediction (if trained)
        ml_score = weighted_score
        if self.is_trained:
            X_scaled = self.scaler.transform(feature_vector)
            ml_score = float(self.regressor.predict(X_scaled)[0])
            ml_class = int(self.classifier.predict(X_scaled)[0])

        # Blend: 60% ML, 40% heuristic
        final_score = min(max(0.6 * ml_score + 0.4 * weighted_score, 0), 100)

        # Risk level
        risk_level = self._score_to_level(final_score)

        # Feature importance (explainability)
        contributing_factors = {}
        feature_weights_out = {}
        for i, name in enumerate(self.FEATURE_NAMES):
            value = features.get(name, 0.0)
            weight = weights.get(name, 0.0)
            contribution = value * weight * 100
            if contribution > 0:
                contributing_factors[name] = {
                    "value": round(value, 4),
                    "weight": round(weight, 4),
                    "contribution": round(contribution, 2),
                }
                feature_weights_out[name] = round(weight, 4)

        # ML feature importance
        if self.is_trained:
            importances = self.classifier.feature_importances_
            for i, name in enumerate(self.FEATURE_NAMES):
                if name in contributing_factors:
                    contributing_factors[name]["ml_importance"] = round(importances[i], 4)

        return {
            "score": round(final_score, 2),
            "risk_level": risk_level,
            "contributing_factors": contributing_factors,
            "feature_weights": feature_weights_out,
            "model_version": self.model_version,
            "weighted_score": round(weighted_score, 2),
            "ml_score": round(ml_score, 2),
            "computed_at": datetime.utcnow().isoformat()
        }

    def predict_bottlenecks(
        self,
        signals: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Identify bottlenecks from collected signals.
        Returns ranked list of potential bottlenecks with explanations.
        """
        bottlenecks = []

        # Group signals by region
        region_signals: Dict[str, List] = {}
        for signal in signals:
            region = signal.get("region", signal.get("city", signal.get("state", "Unknown")))
            if region not in region_signals:
                region_signals[region] = []
            region_signals[region].append(signal)

        for region, r_signals in region_signals.items():
            # Calculate risk factors from signals
            weather_risk = max(
                (s.get("disruption_severity", 0) for s in r_signals if s.get("source") == "weather"),
                default=0
            )
            logistics_risk = max(
                (s.get("congestion_level", 0) for s in r_signals if s.get("source") == "logistics"),
                default=0
            )
            price_risk = 0
            for s in r_signals:
                if s.get("source") in ["mandi", "enam"]:
                    modal = s.get("modal_price", 0)
                    max_p = s.get("max_price", 0)
                    if max_p > 0:
                        price_risk = max(price_risk, (max_p - modal) / max_p)

            combined_risk = (weather_risk * 0.3 + logistics_risk * 0.4 + price_risk * 0.3)

            if combined_risk > 0.2:
                explanations = []
                if weather_risk > 0.3:
                    explanations.append(f"Weather disruption severity: {weather_risk:.1%}")
                if logistics_risk > 0.3:
                    explanations.append(f"Logistics congestion: {logistics_risk:.1%}")
                if price_risk > 0.2:
                    explanations.append(f"Price volatility detected: {price_risk:.1%}")

                bottlenecks.append({
                    "region": region,
                    "combined_risk": round(combined_risk * 100, 2),
                    "risk_level": self._score_to_level(combined_risk * 100),
                    "factors": {
                        "weather": round(weather_risk, 3),
                        "logistics": round(logistics_risk, 3),
                        "price": round(price_risk, 3),
                    },
                    "explanations": explanations,
                    "signal_count": len(r_signals),
                })

        # Sort by risk
        bottlenecks.sort(key=lambda x: x["combined_risk"], reverse=True)
        return bottlenecks

    @staticmethod
    def _score_to_level(score: float) -> str:
        if score >= 75:
            return "critical"
        elif score >= 50:
            return "high"
        elif score >= 25:
            return "medium"
        return "low"


# Singleton instance
risk_model = SupplyChainRiskModel()
