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
