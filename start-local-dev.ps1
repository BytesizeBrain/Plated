# PowerShell script to start both frontend and backend for local development
# Run this from the project root directory

Write-Host "🚀 Starting Plated Local Development Environment..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js v18+ first." -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "✅ Python version: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed. Please install Python 3.8+ first." -ForegroundColor Red
    Write-Host "   Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📦 Checking dependencies..." -ForegroundColor Cyan
Write-Host ""

# Check if backend dependencies are installed
if (-not (Test-Path "backend/venv")) {
    Write-Host "⚠️  Backend virtual environment not found. Creating..." -ForegroundColor Yellow
    cd backend
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
    cd ..
}

# Check if frontend dependencies are installed
if (-not (Test-Path "frontend/Plated/node_modules")) {
    Write-Host "⚠️  Frontend dependencies not found. Installing..." -ForegroundColor Yellow
    cd frontend/Plated
    npm install
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
    cd ../..
}

Write-Host ""
Write-Host "🔧 Starting servers..." -ForegroundColor Cyan
Write-Host ""

# Function to start backend
$backendJob = Start-Job -ScriptBlock {
    cd $using:PWD
    cd backend
    & .\venv\Scripts\Activate.ps1
    $env:ENV = "dev"
    python app.py
}

Write-Host "✅ Backend server starting... (Job ID: $($backendJob.Id))" -ForegroundColor Green
Write-Host "   Backend will be available at: http://localhost:5000" -ForegroundColor Cyan

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Function to start frontend
$frontendJob = Start-Job -ScriptBlock {
    cd $using:PWD
    cd frontend/Plated
    npm run dev
}

Write-Host "✅ Frontend server starting... (Job ID: $($frontendJob.Id))" -ForegroundColor Green
Write-Host "   Frontend will be available at: http://localhost:5173" -ForegroundColor Cyan

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🎉 Development servers are starting!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "📍 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "📍 Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 To test the application:" -ForegroundColor Yellow
Write-Host "   1. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host "   2. Click 'Get Started' or 'Sign In'" -ForegroundColor White
Write-Host "   3. Click 'Continue with Mock Login (Testing)'" -ForegroundColor White
Write-Host "   4. Complete your profile and start testing!" -ForegroundColor White
Write-Host ""
Write-Host "📊 To view server logs:" -ForegroundColor Yellow
Write-Host "   Backend:  Receive-Job -Id $($backendJob.Id) -Keep" -ForegroundColor White
Write-Host "   Frontend: Receive-Job -Id $($frontendJob.Id) -Keep" -ForegroundColor White
Write-Host ""
Write-Host "🛑 To stop servers:" -ForegroundColor Yellow
Write-Host "   Press Ctrl+C or run: Stop-Job -Id $($backendJob.Id),$($frontendJob.Id); Remove-Job -Id $($backendJob.Id),$($frontendJob.Id)" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Wait for user input
Write-Host "⏳ Servers are running in the background..." -ForegroundColor Cyan
Write-Host "   Press 'Q' to stop all servers and exit" -ForegroundColor Yellow
Write-Host "   Press 'L' to view logs" -ForegroundColor Yellow
Write-Host ""

# Monitor jobs and wait for user input
$continue = $true
while ($continue) {
    if ($Host.UI.RawUI.KeyAvailable) {
        $key = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyUp")
        if ($key.Character -eq 'q' -or $key.Character -eq 'Q') {
            $continue = $false
        } elseif ($key.Character -eq 'l' -or $key.Character -eq 'L') {
            Write-Host ""
            Write-Host "━━━ BACKEND LOGS ━━━" -ForegroundColor Cyan
            Receive-Job -Id $backendJob.Id -Keep | Select-Object -Last 20
            Write-Host ""
            Write-Host "━━━ FRONTEND LOGS ━━━" -ForegroundColor Cyan
            Receive-Job -Id $frontendJob.Id -Keep | Select-Object -Last 20
            Write-Host ""
        }
    }
    
    # Check if jobs are still running
    $backendState = (Get-Job -Id $backendJob.Id).State
    $frontendState = (Get-Job -Id $frontendJob.Id).State
    
    if ($backendState -eq 'Failed') {
        Write-Host "❌ Backend server failed!" -ForegroundColor Red
        Receive-Job -Id $backendJob.Id
        $continue = $false
    }
    
    if ($frontendState -eq 'Failed') {
        Write-Host "❌ Frontend server failed!" -ForegroundColor Red
        Receive-Job -Id $frontendJob.Id
        $continue = $false
    }
    
    Start-Sleep -Milliseconds 500
}

# Cleanup
Write-Host ""
Write-Host "🛑 Stopping servers..." -ForegroundColor Yellow
Stop-Job -Id $backendJob.Id, $frontendJob.Id
Remove-Job -Id $backendJob.Id, $frontendJob.Id
Write-Host "✅ All servers stopped" -ForegroundColor Green
Write-Host ""
Write-Host "👋 Goodbye!" -ForegroundColor Cyan

