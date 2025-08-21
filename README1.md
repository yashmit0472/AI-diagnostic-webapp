## Project Overview

AI Medical Diagnostic Assistant is a full-stack web application that uses machine learning to predict diseases based on symptoms. The application consists of a Flask backend with a PyTorch neural network and a vanilla JavaScript frontend.

**Key Features:**
- Neural network trained on 489 symptoms and 40+ diseases
- Real-time symptom analysis with confidence scores
- Professional medical UI with symptom categorization
- Export functionality for results
- Medical disclaimers and safety recommendations

## Architecture

### Backend (Flask + PyTorch)
- **Location**: `backend/app.py`
- **Framework**: Flask with Flask-CORS for API endpoints
- **ML Model**: Custom PyTorch neural network (DiseaseClassifier)
- **Data**: Downloads medical dataset from GitHub on startup
- **Model Architecture**: 489 inputs → 128 → 64 → 40+ outputs
- **Training**: 1000 epochs with Adam optimizer on startup

### Frontend (Vanilla JS + HTML/CSS)
- **Location**: `frontend/public/`
- **Technology**: Pure HTML, CSS, JavaScript (no frameworks)
- **API Communication**: Fetch API calls to backend
- **Key Features**: Symptom input, real-time analysis, result visualization

### Key Files Structure
```
backend/
├── app.py              # Main Flask application with ML model
└── requirements.txt    # Python dependencies

frontend/public/
├── index.html         # Main UI with symptom input and results
├── script.js          # Frontend logic and API communication  
├── style.css          # Professional medical UI styling

Root files:
├── run_app.sh         # Start both backend and frontend
├── run_backend.sh     # Start only backend
├── run_frontend.sh    # Start only frontend
├── Dockerfile         # Container configuration
└── vercel.json        # Vercel deployment config
```

## Development Commands

### Starting the Application

**Quick Start (Recommended):**
```bash
./run_app.sh
```
- Starts backend on port 5001 and frontend on port 8080
- Includes process cleanup on Ctrl+C

**Separate Services:**
```bash
# Backend only
./run_backend.sh
# or
cd backend && python3 app.py

# Frontend only  
./run_frontend.sh
# or
cd frontend/public && python3 -m http.server 8080
```

### Development Workflow

**Backend Development:**
```bash
cd backend
pip3 install -r requirements.txt
python3 app.py
```

**Frontend Development:**
```bash
cd frontend
npm run dev  # Uses python3 -m http.server 8080
```

**Testing API Endpoints:**
```bash
# Health check
curl http://localhost:5001/api/health

# Get symptoms list
curl http://localhost:5001/api/symptoms

# Test prediction
curl -X POST http://localhost:5001/api/predict \
  -H "Content-Type: application/json" \
  -d '{"symptoms": ["fever", "headache"], "age": 25, "weight": 70}'
```

### Package Management

**Backend Dependencies:**
```bash
pip3 install -r backend/requirements.txt
```

**Key Python packages:**
- Flask 2.3.3, Flask-CORS 4.0.0
- torch 2.8.0 (PyTorch)
- pandas 2.3.1, numpy 2.0.2
- gunicorn 21.2.0 (production)

**Frontend has no build process** - it's vanilla JavaScript served statically.

## Key Implementation Details

### Machine Learning Model
- **Training happens on startup** - no pre-trained model files
- **Dataset**: Downloaded from GitHub medical repository on each startup
- **Input Processing**: Binary vector (489 features) representing symptom presence
- **Output**: Confidence scores for 40+ diseases with top-3 predictions

### API Communication
- **Backend Port**: 5001 (hardcoded in app.py line 249)
- **Frontend API calls**: Point to `http://localhost:5001`
- **CORS enabled** for cross-origin requests between frontend/backend

### Development Considerations
- **Model training takes ~30 seconds on startup** - expect delay when starting backend
- **No database** - all data is loaded from CSV on startup
- **Symptoms are case-insensitive** and normalized in backend
- **Frontend has demo mode** when backend is unavailable

## Deployment

### Local Testing
```bash
docker build -t ai-diagnostic .
docker run -p 5000:5000 ai-diagnostic
```

### Production Deployment
**Vercel (configured):**
```bash
vercel --prod
```

**Other platforms:**
- Frontend: Deploy `frontend/public/` as static site
- Backend: Deploy Flask app with Python runtime

### Environment Variables
- `FLASK_ENV=production`
- `PORT=5000` (for production)
- `PYTHONPATH=backend` (Vercel specific)

## Important Notes for Development

1. **Port Configuration**: Backend uses port 5001 in development, 5000 in production
2. **Model Training**: Happens on every backend startup - not persistent
3. **API Dependencies**: Frontend gracefully degrades to demo mode if backend unavailable
4. **Medical Disclaimers**: Always maintained throughout UI - critical for safety
5. **Symptom Matching**: Uses fuzzy matching and normalization in backend
6. **No Authentication**: Current implementation has no user authentication

## Common Development Tasks

**Adding new symptoms**: Modify the dataset URL or local symptom processing in `backend/app.py`
**UI changes**: Edit `frontend/public/index.html`, `style.css`, or `script.js`
**API changes**: Modify routes in `backend/app.py`
**Model improvements**: Adjust `DiseaseClassifier` class or training parameters

## Debugging

**Backend issues:**
```bash
cd backend
python3 -c "import app; print('Imports work')"
```

**Frontend issues:**
- Check browser console for API connection errors
- Verify backend is running on correct port
- Check CORS headers in network tab

**Model issues:**
- Check console logs for dataset download status
- Verify symptom matching in `/api/predict` responses
- Monitor training loss during startup
