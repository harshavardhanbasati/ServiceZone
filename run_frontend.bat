@echo off
echo ========================================================
echo  Starting ServiceZone React/Vite Frontend on Port 5173...
echo ========================================================
cd /d "%~dp0\frontend"
npm run dev -- --host 127.0.0.1
pause
