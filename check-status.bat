@echo off
title Messenger Status Monitor
color 0A

:monitor
cls
echo =========================================
echo   Messenger Status Monitor
echo   %date% %time%
echo =========================================
echo.

REM Проверка Backend
echo [Backend - Port 5000]
curl -s http://localhost:5000/health >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Status: [32mONLINE[0m
    curl -s http://localhost:5000/health
) else (
    echo Status: [91mOFFLINE[0m
)

echo.
echo -----------------------------------------
echo.

REM Проверка Frontend
echo [Frontend - Port 3000]
curl -s http://localhost:3000 >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Status: [32mONLINE[0m
) else (
    echo Status: [91mOFFLINE[0m
)

echo.
echo -----------------------------------------
echo.

REM Проверка PostgreSQL
echo [PostgreSQL - Port 5433]
netstat -an | findstr "5433" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Status: [32mONLINE[0m
) else (
    echo Status: [91mOFFLINE[0m
)

echo.
echo -----------------------------------------
echo.

REM Проверка Redis
echo [Redis - Port 6380]
netstat -an | findstr "6380" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Status: [32mONLINE[0m
) else (
    echo Status: [91mOFFLINE[0m
)

echo.
echo =========================================
echo.
echo Actions:
echo   1 - Open Frontend (http://localhost:3000)
echo   2 - Open Backend Health (http://localhost:5000/health)
echo   3 - Restart All Servers
echo   R - Refresh Status
echo   Q - Quit
echo.

set /p action="Enter choice: "

if /i "%action%"=="1" start http://localhost:3000 && goto monitor
if /i "%action%"=="2" start http://localhost:5000/health && goto monitor
if /i "%action%"=="3" call "%~dp0restart-servers.bat" && goto monitor
if /i "%action%"=="R" goto monitor
if /i "%action%"=="Q" exit
goto monitor
