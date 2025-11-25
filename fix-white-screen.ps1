# Fix White Screen Issue - Creates missing frontend .env file
# Run this script from the project root

Write-Host "🔧 Fixing White Screen Issue..." -ForegroundColor Cyan
Write-Host ""

# Check if frontend directory exists
if (-Not (Test-Path "frontend/Plated")) {
    Write-Host "❌ Error: frontend/Plated directory not found!" -ForegroundColor Red
    Write-Host "   Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

# Create .env file
$envPath = "frontend/Plated/.env"
$envContent = @"
# Local Development Environment Variables
VITE_API_BASE_URL=http://localhost:5000
VITE_AUTH_MODE=oauth
"@

Write-Host "📝 Creating $envPath..." -ForegroundColor Yellow

# Check if file already exists
if (Test-Path $envPath) {
    Write-Host "⚠️  .env file already exists!" -ForegroundColor Yellow
    $response = Read-Host "Do you want to overwrite it? (y/n)"
    if ($response -ne "y") {
        Write-Host "❌ Cancelled. No changes made." -ForegroundColor Red
        exit 0
    }
}

# Write the file
try {
    $envContent | Out-File -FilePath $envPath -Encoding UTF8 -NoNewline
    Write-Host "✅ Created $envPath" -ForegroundColor Green
} catch {
    Write-Host "❌ Error creating .env file: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Fix applied successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Restart the frontend dev server:" -ForegroundColor White
Write-Host "   cd frontend/Plated" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Navigate to http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "3. Click 'Sign In' → 'Continue with Mock Login'" -ForegroundColor White
Write-Host ""
Write-Host "4. Go to Feed page - should work without white screen!" -ForegroundColor White
Write-Host ""
Write-Host "📄 For details, see: COMPREHENSIVE_AUDIT_REPORT.md" -ForegroundColor Cyan

