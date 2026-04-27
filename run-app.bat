@echo off
cd /d "%~dp0"

echo ====================================
echo   EMC Artisan E-Portfolio Server
echo ====================================
echo.
echo Starting the Node.js server...
echo Server will be available at: http://localhost:5000
echo Frontend will be available at: http://localhost:5173
echo.
echo Opening your browser in 3 seconds...
echo.
echo Press Ctrl+C to stop the server
echo.
start http://localhost:5173
timeout /t 3 /nobreak
npm.cmd run dev
