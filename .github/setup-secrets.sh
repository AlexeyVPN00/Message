#!/bin/bash
# GitHub Actions Secrets Setup Script
# Этот скрипт помогает настроить все необходимые secrets для GitHub Actions

set -e

echo "🔐 GitHub Actions Secrets Setup"
echo "================================"
echo ""

# Проверка наличия GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) не установлен"
    echo "📦 Установите: https://cli.github.com/"
    exit 1
fi

# Проверка авторизации
if ! gh auth status &> /dev/null; then
    echo "🔑 Требуется авторизация в GitHub"
    gh auth login
fi

echo "✅ GitHub CLI готов к работе"
echo ""

# Функция для безопасного ввода secret
add_secret() {
    local secret_name=$1
    local description=$2
    local default_value=$3

    echo "📝 $description"
    if [ -n "$default_value" ]; then
        read -p "   Значение [$default_value]: " secret_value
        secret_value=${secret_value:-$default_value}
    else
        read -sp "   Значение (скрыто): " secret_value
        echo ""
    fi

    if [ -n "$secret_value" ]; then
        echo "$secret_value" | gh secret set "$secret_name"
        echo "   ✅ $secret_name сохранен"
    else
        echo "   ⏭️  Пропущено"
    fi
    echo ""
}

# Функция для генерации случайного пароля
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Функция для генерации JWT secret
generate_jwt_secret() {
    openssl rand -hex 64
}

echo "🔧 Настройка Deployment Secrets"
echo "--------------------------------"

add_secret "SERVER_HOST" "IP адрес или домен сервера" "185.246.118.162"
add_secret "SSH_USER" "SSH пользователь" "root"
add_secret "DEPLOY_PATH" "Путь к проекту на сервере" "/opt/messenger"

echo "📝 SSH Private Key"
echo "   Добавьте ваш приватный SSH ключ"
echo "   Создать новый: ssh-keygen -t ed25519 -C 'github-actions' -f github-actions-key"
read -p "   Путь к приватному ключу (или Enter для пропуска): " ssh_key_path

if [ -n "$ssh_key_path" ] && [ -f "$ssh_key_path" ]; then
    gh secret set SSH_PRIVATE_KEY < "$ssh_key_path"
    echo "   ✅ SSH_PRIVATE_KEY сохранен"
    echo ""
    echo "   📋 Не забудьте добавить публичный ключ на сервер:"
    echo "   ssh-copy-id -i ${ssh_key_path}.pub $SSH_USER@$SERVER_HOST"
else
    echo "   ⏭️  Пропущено - добавьте вручную через GitHub UI"
fi
echo ""

echo "🗄️  Настройка Database Secrets"
echo "------------------------------"

add_secret "DB_USERNAME" "PostgreSQL username" "messenger_user"
add_secret "DB_DATABASE" "PostgreSQL database name" "messenger_db"

echo "   Сгенерировать случайный пароль? [y/N]"
read -p "   > " generate_db_pass
if [[ "$generate_db_pass" =~ ^[Yy]$ ]]; then
    db_password=$(generate_password)
    echo "$db_password" | gh secret set DB_PASSWORD
    echo "   ✅ DB_PASSWORD: $db_password"
else
    add_secret "DB_PASSWORD" "PostgreSQL password"
fi
echo ""

echo "💾 Настройка Redis Secrets"
echo "-------------------------"

echo "   Сгенерировать случайный пароль? [y/N]"
read -p "   > " generate_redis_pass
if [[ "$generate_redis_pass" =~ ^[Yy]$ ]]; then
    redis_password=$(generate_password)
    echo "$redis_password" | gh secret set REDIS_PASSWORD
    echo "   ✅ REDIS_PASSWORD: $redis_password"
else
    add_secret "REDIS_PASSWORD" "Redis password"
fi
echo ""

echo "🔑 Настройка JWT Secrets"
echo "-----------------------"

echo "   Сгенерировать случайный JWT secret? [Y/n]"
read -p "   > " generate_jwt
if [[ ! "$generate_jwt" =~ ^[Nn]$ ]]; then
    jwt_secret=$(generate_jwt_secret)
    echo "$jwt_secret" | gh secret set JWT_SECRET
    echo "   ✅ JWT_SECRET сгенерирован"
else
    add_secret "JWT_SECRET" "JWT secret key"
fi

add_secret "JWT_ACCESS_EXPIRES_IN" "JWT access token expires in" "15m"
add_secret "JWT_REFRESH_EXPIRES_IN" "JWT refresh token expires in" "7d"
echo ""

echo "🌐 Настройка Frontend Secrets"
echo "----------------------------"

add_secret "FRONTEND_URL" "Frontend URL (https://yourdomain.com)"
add_secret "VITE_API_URL" "API URL для Vite (https://api.yourdomain.com или http://185.246.118.162:5000)"
echo ""

echo "✅ Настройка завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Проверьте secrets: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/settings/secrets/actions"
echo "   2. Создайте environment 'production' в Settings → Environments"
echo "   3. Добавьте публичный SSH ключ на сервер"
echo "   4. Запустите первый деплой вручную через GitHub Actions"
echo ""
echo "🚀 Готово к использованию!"
