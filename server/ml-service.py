#!/usr/bin/env python3
import json
import sys
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os
from datetime import datetime

class MSRiskPredictor:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.model_version = "1.0.0"
        self.feature_names = ['sleep_quality', 'sleep_duration', 'fatigue_level', 'mood_score', 'activity_steps']
        
        # Initialize with a pre-trained model or train a synthetic one
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize the Random Forest model with synthetic training data"""
        # Generate synthetic training data for MS relapse prediction
        np.random.seed(42)
        n_samples = 1000
        
        # Generate features
        X = np.random.rand(n_samples, 5)
        X[:, 0] = X[:, 0] * 4 + 1  # sleep_quality: 1-5
        X[:, 1] = X[:, 1] * 10 + 2  # sleep_duration: 2-12 hours
        X[:, 2] = X[:, 2] * 4 + 1  # fatigue_level: 1-5
        X[:, 3] = X[:, 3] * 4 + 1  # mood_score: 1-5
        X[:, 4] = X[:, 4] * 8000 + 1000  # activity_steps: 1000-9000
        
        # Generate labels based on realistic MS risk factors
        y = np.zeros(n_samples)
        for i in range(n_samples):
            risk_score = 0
            # Poor sleep quality increases risk
            risk_score += (6 - X[i, 0]) * 0.15
            # Short sleep duration increases risk
            if X[i, 1] < 6:
                risk_score += (6 - X[i, 1]) * 0.1
            # High fatigue increases risk
            risk_score += (X[i, 2] - 1) * 0.2
            # Low mood increases risk
            risk_score += (6 - X[i, 3]) * 0.15
            # Low activity increases risk
            if X[i, 4] < 3000:
                risk_score += (3000 - X[i, 4]) / 1000 * 0.1
            
            # Add some noise
            risk_score += np.random.normal(0, 0.05)
            
            # Convert to binary classification (0: low/medium risk, 1: high risk)
            y[i] = 1 if risk_score > 0.7 else 0
        
        # Train the model
        self.scaler.fit(X)
        X_scaled = self.scaler.transform(X)
        
        self.model = RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2
        )
        self.model.fit(X_scaled, y)
    
    def predict_risk(self, features):
        """Predict relapse risk from input features"""
        if self.model is None:
            raise ValueError("Model not initialized")
        
        # Prepare features array
        feature_array = np.array([[
            features['sleepQuality'],
            features['sleepDuration'],
            features['fatigueLevel'],
            features['moodScore'],
            features['activitySteps']
        ]])
        
        # Scale features
        feature_array_scaled = self.scaler.transform(feature_array)
        
        # Get probability of high risk
        probability = self.model.predict_proba(feature_array_scaled)[0][1]
        
        # Convert to risk score (0-100)
        risk_score = probability * 100
        
        return risk_score
    
    def get_risk_category(self, risk_score):
        """Convert risk score to category"""
        if risk_score <= 30:
            return "Low"
        elif risk_score <= 70:
            return "Medium"
        else:
            return "High"
    
    def generate_suggestion(self, risk_category, features):
        """Generate personalized suggestion based on risk and features"""
        suggestions = {
            "Low": [
                "Great job maintaining your routine! Keep up the good hydration and consider a gentle 10-minute walk.",
                "You're doing well today. Consider some light stretching or mindfulness practice.",
                "Excellent progress! Maybe try a new healthy recipe or social activity."
            ],
            "Medium": [
                "Take it easy today. Focus on gentle activities and stress management techniques.",
                "Consider some light stretching, deep breathing, or a short rest period.",
                "Your body might need extra care today. Prioritize hydration and gentle movement."
            ],
            "High": [
                "Rest is important today. Focus on mindfulness, gentle breathing, and staying hydrated.",
                "Consider reaching out to your support network and prioritize self-care activities.",
                "Take time to rest and recharge. Voice journaling might help process how you're feeling."
            ]
        }
        
        base_suggestions = suggestions.get(risk_category, suggestions["Low"])
        
        # Add personalized elements based on features
        if features['fatigueLevel'] >= 4:
            return "Your fatigue levels are elevated. " + base_suggestions[0].replace("Great job", "Consider resting and")
        elif features['moodScore'] <= 2:
            return "Your mood seems low today. " + base_suggestions[-1]
        elif features['sleepQuality'] <= 2:
            return "Poor sleep detected. " + base_suggestions[1]
        else:
            return np.random.choice(base_suggestions)

def main():
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        features = json.loads(input_data)
        
        # Initialize predictor
        predictor = MSRiskPredictor()
        
        # Make prediction
        risk_score = predictor.predict_risk(features)
        risk_category = predictor.get_risk_category(risk_score)
        suggestion = predictor.generate_suggestion(risk_category, features)
        
        # Return results
        result = {
            "riskScore": float(risk_score),
            "riskCategory": risk_category,
            "suggestion": suggestion,
            "modelVersion": predictor.model_version,
            "timestamp": datetime.now().isoformat()
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "error": str(e),
            "riskScore": 50.0,
            "riskCategory": "Medium",
            "suggestion": "Unable to calculate risk at this time. Please try again later.",
            "modelVersion": "1.0.0",
            "timestamp": datetime.now().isoformat()
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
