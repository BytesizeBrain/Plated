# PowerShell script to start the Plated development server
# Usage: .\start-dev.ps1

Write-Host "Starting Plated development server..." -ForegroundColor Green
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Check if port 5173 is already in use
$portInUse = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "⚠️  Port 5173 is already in use!" -ForegroundColor Yellow
    Write-Host "Please stop the other process or the server may already be running." -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Continue anyway? (y/n)"
    if ($response -ne "y") {
        exit
    }
}

Write-Host "🚀 Starting Vite dev server..." -ForegroundColor Cyan
Write-Host "📍 Server will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "📍 Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start the server
npm run dev

