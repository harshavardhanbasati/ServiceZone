Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Launching ServiceZone Full-Stack Servers" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; .\backend\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8080 --reload"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev -- --host 127.0.0.1"

Write-Host "`nServers launched in external windows!" -ForegroundColor Green
Write-Host "Frontend App:    http://localhost:5173" -ForegroundColor White
Write-Host "Backend API Docs: http://127.0.0.1:8080/docs" -ForegroundColor White
