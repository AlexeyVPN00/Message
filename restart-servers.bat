@echo off
echo =========================================
echo   Restarting Servers...
echo =========================================
echo.

REM Остановка процессов на портах 3000 и 5000
echo [1/3] Stopping existing servers...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Killing process on port 3000 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    echo Killing process on port 5000 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

timeout /t 2 >nul

echo.
echo [2/3] Starting Backend...
cd /d "%~dp0backend"
start "Messenger Backend" cmd /k "npm run dev"
timeout /t 5 >nul

echo.
echo [3/3] Starting Frontend...
cd /d "%~dp0frontend"
start "Messenger Frontend" cmd /k "npm run dev"

echo.
echo [SUCCESS] Servers restarted!
echo.
timeout /t 3
