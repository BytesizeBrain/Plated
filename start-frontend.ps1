# PowerShell script to start the frontend server
# Run this from the project root directory

Write-Host "🚀 Starting Frontend Server..." -ForegroundColor Green
Write-Host ""

# Navigate to frontend directory
Set-Location -Path "frontend/Plated"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "❌ Dependencies not found!" -ForegroundColor Red
    Write-Host "   Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🎉 Starting Vite Development Server" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "📍 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Make sure backend is running on http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "🛑 Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Start Vite dev server
npm run dev

