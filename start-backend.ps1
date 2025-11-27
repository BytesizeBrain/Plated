# PowerShell script to start the backend server
# Run this from the project root directory

Write-Host "🚀 Starting Backend Server..." -ForegroundColor Green
Write-Host ""

# Navigate to backend directory
Set-Location -Path "backend"

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "❌ Virtual environment not found!" -ForegroundColor Red
    Write-Host "   Please run: python -m venv venv" -ForegroundColor Yellow
    exit 1
}

# Activate virtual environment
Write-Host "📦 Activating virtual environment..." -ForegroundColor Cyan
& .\venv\Scripts\Activate.ps1

# Set environment variable for dev mode
$env:ENV = "dev"
Write-Host "✅ ENV=dev set for development mode" -ForegroundColor Green

# Check if dependencies are installed
Write-Host "📦 Checking dependencies..." -ForegroundColor Cyan
$pipList = pip list
if ($pipList -notmatch "Flask") {
    Write-Host "⚠️  Dependencies may not be installed. Installing..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🎉 Starting Flask Backend Server" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "📍 Backend API: http://localhost:5000" -ForegroundColor Cyan
Write-Host "📍 Health Check: http://localhost:5000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Dev Login Endpoint Available: POST /dev/login" -ForegroundColor Yellow
Write-Host ""
Write-Host "🛑 Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Start Flask application
python app.py

