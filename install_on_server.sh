#!/bin/bash

echo "=================================="
echo "🚀 Установка eramessage.ru"
echo "=================================="
echo ""

# Остановка старых сервисов
echo "🛑 Останавливаю старый сайт MediaHawk..."
systemctl stop apache2 2>/dev/null
systemctl stop nginx 2>/dev/null
systemctl disable apache2 2>/dev/null
systemctl disable nginx 2>/dev/null
pkill -f apache2 2>/dev/null
pkill -f nginx 2>/dev/null

# Удаление старых файлов
echo "🗑️  Удаляю старые файлы..."
rm -rf /var/www/*
rm -rf /etc/nginx/sites-enabled/*
rm -rf /etc/apache2/sites-enabled/* 2>/dev/null
rm -rf /etc/nginx/conf.d/*

echo "✅ Старый сайт удален!"
echo ""

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "🐳 Устанавливаю Docker..."
    curl -fsSL https://get.docker.com | sh
    apt install docker-compose git nano -y
    echo "✅ Docker установлен!"
else
    echo "✅ Docker уже установлен"
fi

echo ""
docker --version
docker-compose --version
echo ""

# Настройка файрвола
echo "🔒 Настраиваю файрвол..."
ufw allow 22/tcp 2>/dev/null
ufw allow 80/tcp 2>/dev/null
ufw allow 443/tcp 2>/dev/null
ufw --force enable 2>/dev/null
echo "✅ Файрвол настроен!"

echo ""
echo "=================================="
echo "✅ Сервер готов!"
echo "=================================="
echo ""
echo "Следующие шаги:"
echo "1. Загрузите проект на сервер"
echo "2. Перейдите в /root/messenger"
echo "3. Настройте .env файл"
echo "4. Запустите: docker-compose -f docker-compose.production.yml up -d --build"
echo ""
