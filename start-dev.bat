@echo off
echo =========================================
echo   Starting Messenger Development Server
echo =========================================
echo.

REM Проверка Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not found in PATH!
    echo Please install Node.js or add it to PATH
    pause
    exit /b 1
)

echo [1/4] Checking Docker containers...
docker-compose ps

echo.
echo [2/4] Starting Backend...
cd backend
start "Messenger Backend" cmd /k "npm run dev"
timeout /t 5 >nul

echo.
echo [3/4] Starting Frontend...
cd ..\frontend
start "Messenger Frontend" cmd /k "npm run dev"

echo.
echo [4/4] Opening browser...
timeout /t 8 >nul
start http://localhost:3000

echo.
echo =========================================
echo   Servers Started!
echo =========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to open status monitor...
pause >nul

start "" cmd /k "%~dp0check-status.bat"
