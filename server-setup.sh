#!/bin/bash

echo "=================================="
echo "🚀 Запуск eramessage.ru на сервере"
echo "=================================="
echo ""

# Переход в директорию проекта
cd /root/messenger || exit 1

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "🐳 Устанавливаю Docker..."
    curl -fsSL https://get.docker.com | sh
    apt install docker-compose git nano ufw -y
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
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
echo "✅ Файрвол настроен!"

echo ""
echo "🐳 Запускаю Docker контейнеры..."
echo "Это займет 5-10 минут при первом запуске..."
echo ""

# Останавливаем старые контейнеры (если есть)
docker-compose -f docker-compose.production.yml down 2>/dev/null

# Запускаем новые контейнеры
docker-compose -f docker-compose.production.yml up -d --build

echo ""
echo "⏳ Ждем пока контейнеры запустятся..."
sleep 10

# Проверка статуса
echo ""
echo "📊 Статус контейнеров:"
docker-compose -f docker-compose.production.yml ps

echo ""
echo "=================================="
echo "✅ Развертывание завершено!"
echo "=================================="
echo ""
echo "🌐 Ваш сайт должен быть доступен по адресу:"
echo "   http://eramessage.ru"
echo ""
echo "📝 Полезные команды:"
echo "   Просмотр логов: docker-compose -f docker-compose.production.yml logs -f"
echo "   Перезапуск:     docker-compose -f docker-compose.production.yml restart"
echo "   Остановка:      docker-compose -f docker-compose.production.yml down"
echo ""
echo "🔐 Следующий шаг: настройка SSL (HTTPS)"
echo "   Выполните команду:"
echo "   apt install certbot python3-certbot-nginx -y"
echo "   certbot --nginx -d eramessage.ru -d www.eramessage.ru"
echo ""
