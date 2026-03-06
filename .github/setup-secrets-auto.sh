#!/bin/bash
# Автоматическая настройка GitHub Secrets через GitHub CLI
# Требуется: gh CLI (https://cli.github.com/)

set -e

echo "🔐 Автоматическая настройка GitHub Actions Secrets"
echo "=================================================="
echo ""

# Проверка GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) не установлен"
    echo "📦 Установите: https://cli.github.com/"
    echo ""
    echo "Альтернатива: используйте GITHUB_SECRETS.txt для ручной настройки"
    exit 1
fi

# Проверка авторизации
if ! gh auth status &> /dev/null; then
    echo "🔑 Требуется авторизация в GitHub"
    gh auth login
fi

echo "✅ GitHub CLI готов"
echo ""

# Функция для добавления secret
add_secret() {
    local name=$1
    local value=$2
    echo "$value" | gh secret set "$name"
    echo "  ✅ $name"
}

echo "📝 Добавление secrets..."
echo ""

# Deployment
add_secret "SSH_PRIVATE_KEY" "$(cat ~/.ssh/github-actions-eramessage)"
add_secret "SSH_USER" "root"
add_secret "SERVER_HOST" "185.246.118.162"
add_secret "DEPLOY_PATH" "/opt/messenger"

# Database
add_secret "DB_USERNAME" "messenger_user"
add_secret "DB_PASSWORD" "OYjPuKKHnutP3kLk1ld4JVOu7uRMXVFO"
add_secret "DB_DATABASE" "messenger_db"

# Redis
add_secret "REDIS_PASSWORD" "KLuJGDkMv7FRYObVE8FsBXd09CeCbXOy"

# JWT
add_secret "JWT_SECRET" "85afb9802088f8a1d9dc00e3d7ce124cf58b97dd0af34c4e2b6f59dd668d59a1eeea95dd6860385aa12dd7f4c2688b00f44748469ec2784e4aeb8f0b4ac756d0"
add_secret "JWT_ACCESS_EXPIRES_IN" "15m"
add_secret "JWT_REFRESH_EXPIRES_IN" "7d"

# Frontend
add_secret "FRONTEND_URL" "https://eramessage.ru"
add_secret "VITE_API_URL" "https://eramessage.ru/api"

echo ""
echo "✅ Все secrets успешно добавлены!"
echo ""
echo "📋 Следующий шаг:"
echo "   Создайте production environment:"
echo "   https://github.com/AlexeyVPN00/Message/settings/environments"
echo ""
echo "🚀 После этого сделайте push и деплой запустится автоматически!"
