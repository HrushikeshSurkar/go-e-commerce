Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Starting Go E-Commerce Full Stack    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$WorkspaceRoot = $PSScriptRoot

# 1. Start Backend in a new terminal window
Write-Host "[1/3] Launching Go Backend on http://localhost:8080..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$WorkspaceRoot\backend'; Write-Host '--- Go Backend Server ---' -ForegroundColor Yellow; go run main.go"

# 2. Start Angular Website in a new terminal window
Write-Host "[2/3] Launching Angular Web App on http://localhost:4200..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$WorkspaceRoot\frontend\website'; Write-Host '--- Angular Website ---' -ForegroundColor Yellow; npm start"

# 3. Check for Android Studio or connected Android device
Write-Host "[3/3] Checking Android Mobile App project..." -ForegroundColor Green
$AndroidProject = Join-Path $WorkspaceRoot "frontend\mobile-app"
Write-Host "Android Project located at: $AndroidProject" -ForegroundColor White
Write-Host "To run the Android app, open '$AndroidProject' in Android Studio and click Run (▶)." -ForegroundColor Yellow

Write-Host "`nAll processes initiated. Check the opened terminal windows." -ForegroundColor Cyan
