@echo off
echo =========================================
echo   Stopping All Servers...
echo =========================================
echo.

echo [1/2] Stopping Backend (port 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    echo   Killing PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [2/2] Stopping Frontend (port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo   Killing PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [SUCCESS] All servers stopped!
echo.
echo Note: Docker containers are still running.
echo Use "docker-compose down" to stop them.
echo.
pause
