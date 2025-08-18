from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import pickle
import os
from datetime import datetime
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for model and data
model = None
symptom_columns = []
idx_to_disease = {}
disease_to_idx = {}

class DiseaseClassifier(nn.Module):
    def __init__(self, input_size, num_classes):
        super(DiseaseClassifier, self).__init__()
        self.fc1 = nn.Linear(input_size, 128)
        self.dropout = nn.Dropout(0.3)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, num_classes)
    
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = self.dropout(x)
        x = torch.relu(self.fc2(x))
        x = self.fc3(x)
        return x

def load_model_and_data():
    """Load the trained model and dataset"""
    global model, symptom_columns, idx_to_disease, disease_to_idx
    
    try:
        # Load dataset
        sym_url = 'https://raw.githubusercontent.com/rahul15197/Disease-Detection-based-on-Symptoms/master/Dataset/dis_sym_dataset_comb.csv'
        df_sym = pd.read_csv(sym_url)
        
        # Prepare data mappings
        symptom_columns = list(df_sym.columns[1:])
        diseases = df_sym['label_dis'].unique().tolist()
        disease_to_idx = {d: i for i, d in enumerate(diseases)}
        idx_to_disease = {i: d for d, i in disease_to_idx.items()}
        
        # Initialize and train model
        input_size = len(symptom_columns)
        num_classes = len(diseases)
        model = DiseaseClassifier(input_size, num_classes)
        
        # Train the model
        X = df_sym[symptom_columns].values.astype(np.float32)
        y = np.array([disease_to_idx[d] for d in df_sym['label_dis']])
        
        criterion = nn.CrossEntropyLoss()
        optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
        
        X_tensor = torch.tensor(X, dtype=torch.float32)
        y_tensor = torch.tensor(y, dtype=torch.long)
        
        logger.info("Training model...")
        for epoch in range(1000):  # Reduced for faster startup
            optimizer.zero_grad()
            outputs = model(X_tensor)
            loss = criterion(outputs, y_tensor)
            loss.backward()
            optimizer.step()
            
            if (epoch + 1) % 100 == 0:
                logger.info(f"Epoch [{epoch + 1}/1000], Loss: {loss.item():.4f}")
        
        logger.info("Model loaded and trained successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return False

@app.route('/')
def home():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "AI Diagnostic API is running",
        "timestamp": datetime.now().isoformat(),
        "total_symptoms": len(symptom_columns)
    })

@app.route('/api/symptoms', methods=['GET'])
def get_symptoms():
    """Get all available symptoms"""
    try:
        # Group symptoms by category for better UX
        symptoms_data = {
            "total_count": len(symptom_columns),
            "symptoms": symptom_columns,
            "categories": {
                "general": [s for s in symptom_columns if any(word in s.lower() for word in ['fever', 'fatigue', 'weakness', 'tired'])],
                "pain": [s for s in symptom_columns if 'pain' in s.lower() or 'ache' in s.lower()],
                "digestive": [s for s in symptom_columns if any(word in s.lower() for word in ['nausea', 'vomit', 'stomach', 'diarrhea', 'bloating'])],
                "respiratory": [s for s in symptom_columns if any(word in s.lower() for word in ['cough', 'breath', 'throat', 'chest'])],
                "neurological": [s for s in symptom_columns if any(word in s.lower() for word in ['headache', 'dizziness', 'confusion', 'vision'])],
                "skin": [s for s in symptom_columns if any(word in s.lower() for word in ['rash', 'skin', 'itch', 'red'])]
            }
        }
        return jsonify(symptoms_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/predict', methods=['POST'])
def predict_disease():
    """Predict disease based on symptoms"""
    try:
        data = request.get_json()
        symptoms_input = data.get('symptoms', [])
        age = data.get('age', 25)
        weight = data.get('weight', 70)
        
        if not symptoms_input:
            return jsonify({"error": "No symptoms provided"}), 400
        
        # Normalize symptoms
        normalized_symptoms = [sym.lower().strip() for sym in symptom_columns]
        input_symptoms = [sym.lower().strip() for sym in symptoms_input]
        
        # Create input vector
        vec = np.zeros(len(symptom_columns), dtype=np.float32)
        matched_symptoms = []
        
        for i, sym in enumerate(normalized_symptoms):
            if sym in input_symptoms:
                vec[i] = 1
                matched_symptoms.append(sym)
        
        if not matched_symptoms:
            return jsonify({
                "error": "No matching symptoms found",
                "suggestion": "Please check symptom spelling or use symptoms from the available list"
            }), 400
        
        # Predict
        input_vec = torch.tensor(vec).unsqueeze(0)
        with torch.no_grad():
            outputs = model(input_vec)
            probabilities = torch.softmax(outputs, dim=1)
            pred_idx = torch.argmax(outputs, dim=1).item()
            confidence = probabilities[0][pred_idx].item() * 100
            
            # Get top 3 predictions
            top_probs, top_indices = torch.topk(probabilities[0], 3)
            top_predictions = [
                {
                    "disease": idx_to_disease[idx.item()],
                    "confidence": prob.item() * 100
                }
                for prob, idx in zip(top_probs, top_indices)
            ]
        
        # Generate recommendation
        primary_disease = idx_to_disease[pred_idx]
        recommendation = generate_recommendation(primary_disease, confidence, age, weight)
        
        result = {
            "primary_prediction": {
                "disease": primary_disease,
                "confidence": confidence
            },
            "top_predictions": top_predictions,
            "matched_symptoms": matched_symptoms,
            "total_symptoms_matched": len(matched_symptoms),
            "recommendation": recommendation,
            "timestamp": datetime.now().isoformat(),
            "patient_info": {
                "age": age,
                "weight": weight
            }
        }
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

def generate_recommendation(disease, confidence, age, weight):
    """Generate medical recommendation based on prediction"""
    if confidence < 30:
        return {
            "level": "low_confidence",
            "message": f"Very low confidence prediction ({confidence:.1f}%). This indicates insufficient symptom information or a rare condition. Please consult a healthcare professional immediately for proper diagnosis.",
            "urgency": "high",
            "next_steps": [
                "Consult a healthcare provider",
                "Provide more detailed symptom information",
                "Consider if symptoms have worsened"
            ]
        }
    elif confidence < 60:
        return {
            "level": "moderate_confidence",
            "message": f"Moderate confidence prediction ({confidence:.1f}%) suggests {disease}. This requires professional medical evaluation for confirmation.",
            "urgency": "medium",
            "next_steps": [
                "Schedule appointment with healthcare provider",
                "Monitor symptoms closely",
                "Note any symptom changes"
            ]
        }
    else:
        return {
            "level": "high_confidence",
            "message": f"High confidence prediction ({confidence:.1f}%) indicates {disease}. Please consult a healthcare professional for proper diagnosis and treatment.",
            "urgency": "medium",
            "next_steps": [
                "Consult healthcare provider for confirmation",
                "Discuss treatment options",
                "Follow medical advice"
            ],
            "disclaimer": "This is an AI prediction and should not replace professional medical diagnosis"
        }

@app.route('/api/health', methods=['GET'])
def health_check():
    """Detailed health check"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "symptoms_loaded": len(symptom_columns) > 0,
        "total_symptoms": len(symptom_columns),
        "total_diseases": len(idx_to_disease),
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    logger.info("Starting AI Diagnostic API...")
    
    if load_model_and_data():
        logger.info("Starting Flask server...")
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        logger.error("Failed to load model. Exiting...")
        exit(1)
