# 🩺 AI Medical Diagnostic Assistant

A modern, full-stack web application that uses machine learning to predict diseases based on symptoms. Built with Flask backend and vanilla JavaScript frontend, featuring a professional UI and real-time symptom analysis.

![AI Medical Diagnostic Assistant](https://img.shields.io/badge/AI-Medical%20Assistant-blue?style=for-the-badge&logo=stethoscope)
![Python](https://img.shields.io/badge/Python-3.9+-green?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-2.3.3-red?style=flat-square&logo=flask)
![PyTorch](https://img.shields.io/badge/PyTorch-2.8.0-orange?style=flat-square&logo=pytorch)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## 🌟 Features

- **🤖 AI-Powered Diagnosis**: Neural network trained on medical symptom-disease dataset
- **💻 Modern Web Interface**: Responsive design with professional UI/UX
- **📊 Real-time Analysis**: Instant disease predictions with confidence scores
- **📱 Mobile Friendly**: Fully responsive design for all devices
- **📈 Multiple Predictions**: Shows top 3 most likely diseases
- **🔒 Safe Recommendations**: Medical disclaimers and professional advice prompts
- **💾 Export Results**: Download diagnosis results as text files
- **🚀 Easy Deployment**: Ready for Vercel, Netlify, or Docker deployment

## 🏗️ Architecture

```
ai-diagnostic-webapp/
├── backend/                 # Flask API server
│   ├── app.py              # Main Flask application
│   └── requirements.txt    # Python dependencies
├── frontend/               # Static web application
│   ├── public/
│   │   ├── index.html      # Main HTML file
│   │   ├── style.css       # Modern CSS styling
│   │   └── script.js       # JavaScript functionality
│   └── package.json        # Frontend configuration
├── docs/                   # Documentation
├── Dockerfile             # Container configuration
├── vercel.json            # Vercel deployment config
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9 or higher
- Git
- Modern web browser

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-diagnostic-webapp.git
cd ai-diagnostic-webapp
```

### 2. Set Up Backend

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip3 install -r requirements.txt

# Start the Flask server
python3 app.py
```

The backend will start on `http://localhost:5000`

### 3. Set Up Frontend

```bash
# Navigate to frontend directory (new terminal)
cd frontend

# Start a simple HTTP server
python3 -m http.server 8080
```

The frontend will be available at `http://localhost:8080`

## 🔧 Installation

### Local Development

1. **Backend Setup**:
   ```bash
   cd backend
   pip3 install pandas numpy torch flask flask-cors python-dateutil
   python3 app.py
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend/public
   python3 -m http.server 8080
   ```

### Docker Deployment

```bash
# Build the Docker image
docker build -t ai-diagnostic-webapp .

# Run the container
docker run -p 5000:5000 ai-diagnostic-webapp
```

### Vercel Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Follow the prompts to deploy

## 🎯 Usage

1. **Open the Application**: Navigate to `http://localhost:8080`
2. **Enter Patient Information**: Age and weight (optional)
3. **Add Symptoms**: 
   - Type symptoms manually or use quick-add buttons
   - Examples: "fever", "headache", "muscle ache", "nausea"
4. **Analyze**: Click "Analyze Symptoms" to get AI predictions
5. **Review Results**: View primary diagnosis, confidence score, and recommendations
6. **Export**: Download results as a text file

## 📊 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### `GET /api/health`
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "symptoms_loaded": true,
  "total_symptoms": 489,
  "total_diseases": 40
}
```

#### `GET /api/symptoms`
Get all available symptoms

**Response:**
```json
{
  "total_count": 489,
  "symptoms": ["fever", "headache", "..."],
  "categories": {
    "general": ["fever", "fatigue", "..."],
    "pain": ["headache", "chest pain", "..."],
    "...": "..."
  }
}
```

#### `POST /api/predict`
Predict disease based on symptoms

**Request:**
```json
{
  "symptoms": ["fever", "headache", "muscle ache"],
  "age": 25,
  "weight": 70
}
```

**Response:**
```json
{
  "primary_prediction": {
    "disease": "Common Cold",
    "confidence": 75.5
  },
  "top_predictions": [
    {"disease": "Common Cold", "confidence": 75.5},
    {"disease": "Flu", "confidence": 68.2}
  ],
  "matched_symptoms": ["fever", "headache"],
  "recommendation": {
    "level": "moderate_confidence",
    "urgency": "medium",
    "message": "...",
    "next_steps": ["..."]
  }
}
```

## 🧠 Machine Learning Model

### Dataset
- **Source**: Disease-Symptom dataset from GitHub
- **Size**: 489 symptoms, 40+ diseases
- **Type**: Binary classification (symptom present/absent)

### Model Architecture
- **Type**: Neural Network (PyTorch)
- **Layers**: 
  - Input: 489 features (symptoms)
  - Hidden: 128 → 64 neurons
  - Output: 40+ classes (diseases)
- **Training**: Adam optimizer, Cross-entropy loss
- **Accuracy**: Confidence scores provided for each prediction

### Symptom Categories
- **General**: fever, fatigue, weakness
- **Pain**: headache, muscle ache, joint pain
- **Digestive**: nausea, vomiting, stomach pain
- **Respiratory**: cough, shortness of breath, chest pain
- **Neurological**: dizziness, confusion, blurred vision
- **Skin**: rash, itching, discoloration

## 🔒 Medical Disclaimer

**⚠️ IMPORTANT MEDICAL DISCLAIMER:**

This application is for **educational and demonstration purposes only**. It should **NOT** be used as a substitute for professional medical advice, diagnosis, or treatment. 

- Always consult with qualified healthcare professionals
- This AI model has limitations and may not be accurate
- Emergency situations require immediate medical attention
- The predictions are based on limited data and algorithms

## 🌐 Deployment Options

### 1. Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

### 2. Netlify
- Drag and drop the `frontend/public` folder
- Set up serverless functions for the backend

### 3. Heroku
```bash
heroku create your-app-name
git push heroku main
```

### 4. Docker
```bash
docker build -t ai-diagnostic .
docker run -p 5000:5000 ai-diagnostic
```

## 🛠️ Development

### Adding New Features

1. **Backend**: Modify `backend/app.py`
2. **Frontend**: Edit files in `frontend/public/`
3. **Styling**: Update `frontend/public/style.css`
4. **JavaScript**: Modify `frontend/public/script.js`

### Testing

```bash
# Test backend
cd backend
python3 -c "import app; print('Backend imports work!')"

# Test API endpoints
curl http://localhost:5000/api/health
```

## 📈 Performance

- **Model Training**: ~1000 epochs, ~30 seconds
- **Prediction Time**: <100ms per request
- **Memory Usage**: ~200MB for model + dependencies
- **Concurrent Users**: 100+ (with proper hosting)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Disease-Symptom dataset from GitHub medical repositories
- PyTorch for the neural network framework
- Flask for the backend API
- Font Awesome for icons
- Inter font family for typography

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/ai-diagnostic-webapp/issues) page
2. Create a new issue with detailed description
3. Contact: your.email@example.com

## 🗺️ Roadmap

- [ ] Add more symptom categories
- [ ] Implement user authentication
- [ ] Add prediction history
- [ ] Mobile app version
- [ ] Integration with medical APIs
- [ ] Multi-language support
- [ ] Advanced ML models

---

**Made with ❤️ for hackathons and educational purposes**

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ai-diagnostic-webapp)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/ai-diagnostic-webapp)
