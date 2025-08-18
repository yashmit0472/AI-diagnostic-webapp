#!/bin/bash
echo "🌐 Starting Frontend Server..."
cd frontend/public
echo "Frontend available at: http://localhost:8080"
python3 -m http.server 8080
