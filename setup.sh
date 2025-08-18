#!/bin/bash

# AI Medical Diagnostic Assistant - Setup Script
# This script sets up the entire application for development or deployment

echo "🩺 AI Medical Diagnostic Assistant - Setup Script"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

print_success "Python 3 found: $(python3 --version)"

# Check if pip3 is installed
if ! command -v pip3 &> /dev/null; then
    print_error "pip3 is not installed. Please install pip3."
    exit 1
fi

print_success "pip3 found: $(pip3 --version)"

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed successfully!"
else
    print_error "Failed to install backend dependencies."
    exit 1
fi

cd ..

# Test backend imports
print_status "Testing backend imports..."
python3 -c "
try:
    import pandas, numpy, torch, flask
    print('✅ All backend imports successful!')
except ImportError as e:
    print(f'❌ Import error: {e}')
    exit(1)
"

if [ $? -ne 0 ]; then
    print_error "Backend import test failed."
    exit 1
fi

print_success "Backend setup complete!"

# Create run scripts
print_status "Creating run scripts..."

# Backend run script
cat > run_backend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting AI Diagnostic Backend..."
cd backend
python3 app.py
EOF

chmod +x run_backend.sh

# Frontend run script
cat > run_frontend.sh << 'EOF'
#!/bin/bash
echo "🌐 Starting Frontend Server..."
cd frontend/public
echo "Frontend available at: http://localhost:8080"
python3 -m http.server 8080
EOF

chmod +x run_frontend.sh

# Full application run script
cat > run_app.sh << 'EOF'
#!/bin/bash
echo "🩺 Starting AI Medical Diagnostic Assistant"
echo "==========================================="

# Function to cleanup background processes
cleanup() {
    echo "🛑 Stopping servers..."
    jobs -p | xargs -r kill
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "🚀 Starting backend server..."
cd backend && python3 app.py &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

echo "🌐 Starting frontend server..."
cd ../frontend/public && python3 -m http.server 8080 &
FRONTEND_PID=$!

echo ""
echo "✅ Application is running!"
echo "📍 Frontend: http://localhost:8080"
echo "📍 Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for background processes
wait
EOF

chmod +x run_app.sh

print_success "Run scripts created!"

# Initialize Git repository if not already initialized
if [ ! -d ".git" ]; then
    print_status "Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: AI Medical Diagnostic Assistant"
    print_success "Git repository initialized!"
else
    print_warning "Git repository already exists."
fi

# Create deployment instructions
cat > DEPLOYMENT.md << 'EOF'
# 🚀 Deployment Guide

## Local Development

### Option 1: Run Everything Together
```bash
./run_app.sh
```

### Option 2: Run Separately
```bash
# Terminal 1 - Backend
./run_backend.sh

# Terminal 2 - Frontend  
./run_frontend.sh
```

## Cloud Deployment

### 1. Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

### 2. Heroku
```bash
heroku create your-app-name
git push heroku main
```

### 3. Docker
```bash
docker build -t ai-diagnostic .
docker run -p 5000:5000 ai-diagnostic
```

### 4. Netlify
- Deploy frontend: Drag `frontend/public` folder to Netlify
- Deploy backend: Use Netlify Functions or external service

## Environment Variables

Set these if needed:
- `FLASK_ENV=production`
- `PORT=5000`

## Health Check

Visit these URLs after deployment:
- Frontend: `https://your-domain.com`
- Backend: `https://your-domain.com/api/health`
EOF

print_success "Deployment guide created!"

# Final summary
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "📁 Project Structure:"
echo "   ├── backend/           # Flask API"
echo "   ├── frontend/public/   # Web Interface" 
echo "   ├── run_app.sh         # Start everything"
echo "   ├── run_backend.sh     # Start backend only"
echo "   └── run_frontend.sh    # Start frontend only"
echo ""
echo "🚀 To start the application:"
echo "   ./run_app.sh"
echo ""
echo "📖 Read DEPLOYMENT.md for hosting instructions"
echo ""
print_success "Ready for hackathon! 🏆"
