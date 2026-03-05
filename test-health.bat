@echo off
title Health Check - Messenger
color 0B

:check
cls
echo =========================================
echo   Health Check - %time%
echo =========================================
echo.

echo Testing Backend Health...
echo.
curl -s http://localhost:5000/health
echo.
echo.

echo Testing Frontend...
echo.
curl -s -o nul -w "HTTP Status: %%{http_code}\n" http://localhost:3000
echo.
echo.

echo =========================================
echo Press any key to check again (Ctrl+C to exit)
pause >nul
goto check
