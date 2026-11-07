@echo off
echo ========================================================
echo  Starting ServiceZone FastAPI Backend on Port 8080...
echo ========================================================
cd /d "%~dp0"
.\backend\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8080 --reload
pause
