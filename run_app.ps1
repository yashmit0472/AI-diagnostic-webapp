Write-Host "🩺 Starting AI Medical Diagnostic Assistant"
Write-Host "==========================================="

# Function to cleanup background processes
function Cleanup {
    Write-Host "🛑 Stopping servers..."
    if ($backend) { Stop-Process -Id $backend.Id -Force }
    if ($frontend) { Stop-Process -Id $frontend.Id -Force }
    exit
}

# Register Ctrl+C handler
$null = Register-EngineEvent PowerShell.Exiting -Action { Cleanup }

Write-Host "🚀 Starting backend server..."
Set-Location "backend"
$backend = Start-Process "python" "app.py" -PassThru

Start-Sleep -Seconds 3

Write-Host "🌐 Starting frontend server..."
Set-Location "../frontend/public"
$frontend = Start-Process "python" "-m http.server 8080" -PassThru

Write-Host ""
Write-Host "✅ Application is running!"
Write-Host "📍 Frontend: http://localhost:8080"
Write-Host "📍 Backend:  http://localhost:5000"
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers"

# Keep script alive
while ($true) {
    Start-Sleep -Seconds 1
}

#run in windows
