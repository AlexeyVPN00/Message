@echo off
chcp 65001 >nul
echo ================================
echo 🚀 Развертывание на eramessage.ru
echo ================================
echo.

set SERVER_IP=185.246.118.162
set PROJECT_PATH=c:\Users\outsi\Desktop\vibecoding\messenger

echo 📦 Загружаю проект на сервер...
echo Это может занять несколько минут...
echo.

scp -r "%PROJECT_PATH%" root@%SERVER_IP%:/root/

echo.
echo ✅ Проект загружен на сервер!
echo.
echo Следующий шаг: подключитесь к серверу командой:
echo ssh root@%SERVER_IP%
echo.
pause
