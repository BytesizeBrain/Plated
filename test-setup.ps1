# PowerShell script to test local development setup
# Run this to verify everything is configured correctly

Write-Host "🧪 Testing Plated Development Setup..." -ForegroundColor Cyan
Write-Host ""

$allTestsPassed = $true

# Test 1: Check Node.js
Write-Host "Test 1: Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Node.js is NOT installed" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 2: Check Python
Write-Host "Test 2: Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "  ✅ Python is installed: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Python is NOT installed" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 3: Check backend virtual environment
Write-Host "Test 3: Checking backend virtual environment..." -ForegroundColor Yellow
if (Test-Path "backend/venv") {
    Write-Host "  ✅ Virtual environment exists" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Virtual environment not found" -ForegroundColor Yellow
    Write-Host "     Run: cd backend && python -m venv venv" -ForegroundColor Gray
    $allTestsPassed = $false
}

# Test 4: Check backend dependencies
Write-Host "Test 4: Checking backend dependencies..." -ForegroundColor Yellow
if (Test-Path "backend/requirements.txt") {
    Write-Host "  ✅ requirements.txt exists" -ForegroundColor Green
    if (Test-Path "backend/venv") {
        $activateScript = "backend/venv/Scripts/Activate.ps1"
        if (Test-Path $activateScript) {
            # Try to check if Flask is installed
            $checkFlask = & "$activateScript; pip list" 2>&1 | Select-String "Flask"
            if ($checkFlask) {
                Write-Host "  ✅ Flask is installed" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  Flask not found in virtual environment" -ForegroundColor Yellow
                Write-Host "     Run: cd backend && .\venv\Scripts\Activate.ps1 && pip install -r requirements.txt" -ForegroundColor Gray
            }
        }
    }
} else {
    Write-Host "  ❌ requirements.txt not found" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 5: Check frontend dependencies
Write-Host "Test 5: Checking frontend dependencies..." -ForegroundColor Yellow
if (Test-Path "frontend/Plated/package.json") {
    Write-Host "  ✅ package.json exists" -ForegroundColor Green
    if (Test-Path "frontend/Plated/node_modules") {
        Write-Host "  ✅ node_modules exists" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  node_modules not found" -ForegroundColor Yellow
        Write-Host "     Run: cd frontend/Plated && npm install" -ForegroundColor Gray
    }
} else {
    Write-Host "  ❌ package.json not found" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 6: Check backend environment file
Write-Host "Test 6: Checking backend environment configuration..." -ForegroundColor Yellow
if (Test-Path "backend/env.development.local") {
    Write-Host "  ✅ env.development.local exists" -ForegroundColor Green
    $envContent = Get-Content "backend/env.development.local" -Raw
    if ($envContent -match "SECRET_KEY") {
        Write-Host "  ✅ SECRET_KEY is configured" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  SECRET_KEY not found in env file" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠️  env.development.local not found (using defaults)" -ForegroundColor Yellow
}

# Test 7: Check if ports are available
Write-Host "Test 7: Checking if ports are available..." -ForegroundColor Yellow

$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    Write-Host "  ⚠️  Port 5000 is already in use" -ForegroundColor Yellow
    Write-Host "     Backend may already be running or port is occupied" -ForegroundColor Gray
} else {
    Write-Host "  ✅ Port 5000 is available" -ForegroundColor Green
}

$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    Write-Host "  ⚠️  Port 5173 is already in use" -ForegroundColor Yellow
    Write-Host "     Frontend may already be running or port is occupied" -ForegroundColor Gray
} else {
    Write-Host "  ✅ Port 5173 is available" -ForegroundColor Green
}

# Test 8: Test backend health (if running)
Write-Host "Test 8: Testing backend connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Backend is running and healthy!" -ForegroundColor Green
    }
} catch {
    Write-Host "  ℹ️  Backend is not running (this is OK if you haven't started it yet)" -ForegroundColor Gray
}

# Test 9: Test frontend connection (if running)
Write-Host "Test 9: Testing frontend connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Frontend is running!" -ForegroundColor Green
    }
} catch {
    Write-Host "  ℹ️  Frontend is not running (this is OK if you haven't started it yet)" -ForegroundColor Gray
}

# Summary
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
if ($allTestsPassed) {
    Write-Host "✅ All critical tests passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You're ready to start development!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To start both servers, run:" -ForegroundColor Yellow
    Write-Host "  .\start-local-dev.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Or start them separately:" -ForegroundColor Yellow
    Write-Host "  Terminal 1: .\start-backend.ps1" -ForegroundColor White
    Write-Host "  Terminal 2: .\start-frontend.ps1" -ForegroundColor White
} else {
    Write-Host "⚠️  Some tests failed. Please fix the issues above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Cyan
    Write-Host "  1. Install Node.js: https://nodejs.org/" -ForegroundColor White
    Write-Host "  2. Install Python: https://www.python.org/downloads/" -ForegroundColor White
    Write-Host "  3. Create virtual environment: cd backend && python -m venv venv" -ForegroundColor White
    Write-Host "  4. Install backend deps: cd backend && .\venv\Scripts\Activate.ps1 && pip install -r requirements.txt" -ForegroundColor White
    Write-Host "  5. Install frontend deps: cd frontend/Plated && npm install" -ForegroundColor White
}
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

