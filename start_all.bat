@echo off
echo Starting ServiceZone Full-Stack Platform...
start "ServiceZone Backend (Port 8080)" cmd /k "run_backend.bat"
start "ServiceZone Frontend (Port 5173)" cmd /k "run_frontend.bat"
echo Both servers launched in separate windows!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://localhost:8080/docs
