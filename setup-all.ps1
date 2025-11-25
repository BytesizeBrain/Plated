# PowerShell script to set up and run both frontend and backend
# Usage: .\setup-all.ps1

Write-Host "🚀 Plated Application - Complete Setup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Function to check if a command exists
function Test-Command {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Cyan

if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "   Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Command "python")) {
    Write-Host "❌ Python is not installed!" -ForegroundColor Red
    Write-Host "   Please install Python from https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Node.js version: $(node --version)" -ForegroundColor Green
Write-Host "✅ npm version: $(npm --version)" -ForegroundColor Green
Write-Host "✅ Python version: $(python --version)" -ForegroundColor Green
Write-Host ""

# Step 1: Install Frontend Dependencies
Write-Host "📦 Step 1: Installing Frontend Dependencies..." -ForegroundColor Cyan
Write-Host ""

$frontendPath = "frontend\Plated"
if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Frontend directory not found: $frontendPath" -ForegroundColor Red
    exit 1
}

Set-Location $frontendPath

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm packages (this may take a few minutes)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install frontend dependencies!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Frontend dependencies installed!" -ForegroundColor Green
} else {
    Write-Host "✅ Frontend dependencies already installed (node_modules exists)" -ForegroundColor Green
}

Write-Host ""

# Step 2: Install Backend Dependencies
Write-Host "📦 Step 2: Installing Backend Dependencies..." -ForegroundColor Cyan
Write-Host ""

Set-Location ..\..\backend

if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✅ Virtual environment created!" -ForegroundColor Green
}

Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

if (-not (Test-Path "venv\Scripts\pip.exe")) {
    Write-Host "❌ Virtual environment activation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Installing Python packages (may take a few minutes)..." -ForegroundColor Yellow
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies installed!" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "To run the application, open TWO terminal windows:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Terminal 1 (Frontend):" -ForegroundColor Cyan
Write-Host "  cd frontend\Plated" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 2 (Backend):" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "  python app.py" -ForegroundColor White
Write-Host ""
Write-Host "Then open your browser to: http://localhost:5173" -ForegroundColor Green
Write-Host ""

# Return to original directory
Set-Location ..\..

