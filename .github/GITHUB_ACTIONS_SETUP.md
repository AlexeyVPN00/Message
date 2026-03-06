# 🚀 GitHub Actions Setup Guide

Этот проект настроен с полным CI/CD pipeline через GitHub Actions.

## 📋 Workflows

### 1. **CI - Continuous Integration** (`ci.yml`)
**Триггеры:** Push и Pull Request в `main` и `develop`

**Что делает:**
- ✅ Проверяет и собирает backend (TypeScript)
- ✅ Проверяет и собирает frontend (React/Vite)
- ✅ Запускает ESLint и Prettier
- ✅ Тестирует сборку Docker образов
- ✅ Сохраняет артефакты сборки

### 2. **CD - Deploy to Production** (`deploy.yml`)
**Триггеры:** Push в `main` или ручной запуск

**Что делает:**
- 🚀 Подключается к серверу по SSH
- 📦 Обновляет код из Git
- 🐳 Пересобирает и запускает Docker контейнеры
- ✅ Проверяет работоспособность после деплоя

### 3. **Docker Build & Push** (`docker-publish.yml`)
**Триггеры:** Push в `main`, теги `v*`, или ручной запуск

**Что делает:**
- 🐳 Собирает Docker образы для backend и frontend
- 📤 Публикует их в GitHub Container Registry
- 🏷️ Создает правильные теги версий

### 4. **PR Checks** (`pr-check.yml`)
**Триггеры:** Pull Request события

**Что делает:**
- 🔍 Проверяет качество кода
- 🏷️ Автоматически добавляет лейблы к PR
- 📊 Оценивает размер изменений

### 5. **Security Scans** (`security.yml`)
**Триггеры:** Push в `main`, PR, каждый понедельник в 2:00, или ручной запуск

**Что делает:**
- 🔒 Сканирует зависимости на уязвимости
- 🐳 Проверяет Docker образы с помощью Trivy
- 📝 Отправляет результаты в GitHub Security

## 🔧 Настройка Secrets

Для работы workflows необходимо настроить GitHub Secrets.

### Repository Secrets

Перейдите в **Settings → Secrets and variables → Actions** и добавьте:

#### 🔐 Deployment Secrets
```
SSH_PRIVATE_KEY          # SSH ключ для доступа к серверу
SSH_USER                 # Пользователь для SSH (например, root)
SERVER_HOST              # IP или домен сервера (185.246.118.162)
DEPLOY_PATH              # Путь к проекту на сервере (например, /opt/messenger)
```

#### 🗄️ Database Secrets
```
DB_USERNAME              # Имя пользователя PostgreSQL
DB_PASSWORD              # Пароль PostgreSQL
DB_DATABASE              # Название базы данных
```

#### 💾 Redis Secrets
```
REDIS_PASSWORD           # Пароль для Redis
```

#### 🔑 JWT Secrets
```
JWT_SECRET               # Секретный ключ для JWT (генерируйте криптостойкий)
JWT_ACCESS_EXPIRES_IN    # Время жизни access токена (например, 15m)
JWT_REFRESH_EXPIRES_IN   # Время жизни refresh токена (например, 7d)
```

#### 🌐 Frontend Secrets
```
FRONTEND_URL             # URL фронтенда (например, https://yourdomain.com)
VITE_API_URL             # URL API для фронтенда (например, https://api.yourdomain.com)
```

### Environment Secrets

Для production деплоя создайте environment:
1. Перейдите в **Settings → Environments**
2. Создайте environment `production`
3. Добавьте те же secrets, что указаны выше

## 🎯 Как использовать

### Автоматический деплой
1. Создайте Pull Request в `main`
2. Дождитесь прохождения всех проверок
3. Сделайте merge
4. Автоматически запустится деплой на production

### Ручной деплой
1. Перейдите в **Actions → CD - Deploy to Production**
2. Нажмите **Run workflow**
3. Выберите ветку `main`
4. Нажмите **Run workflow**

### Публикация Docker образов
Docker образы автоматически публикуются в GitHub Container Registry при:
- Push в `main`
- Создании тега версии (например, `v1.0.0`)

Или запустите вручную:
1. **Actions → Docker - Build and Push Images**
2. **Run workflow**

## 📊 Статусы и бейджи

Добавьте бейджи в README.md:

```markdown
![CI](https://github.com/USERNAME/REPO/workflows/CI%20-%20Continuous%20Integration/badge.svg)
![CD](https://github.com/USERNAME/REPO/workflows/CD%20-%20Deploy%20to%20Production/badge.svg)
![Security](https://github.com/USERNAME/REPO/workflows/Security%20-%20Vulnerability%20Scan/badge.svg)
```

## 🔍 Мониторинг

### Логи
Все логи доступны в разделе **Actions** → выберите нужный workflow run

### Артефакты
Собранные файлы хранятся 7 дней и доступны для скачивания

### Security Alerts
Результаты сканирования уязвимостей доступны в **Security → Code scanning alerts**

## 🛠️ Настройка SSH для деплоя

### 1. Генерация SSH ключа
```bash
ssh-keygen -t ed25519 -C "github-actions" -f github-actions-key
```

### 2. Добавление публичного ключа на сервер
```bash
ssh-copy-id -i github-actions-key.pub user@your-server.com
```

Или вручную:
```bash
cat github-actions-key.pub
# Скопируйте вывод и добавьте в ~/.ssh/authorized_keys на сервере
```

### 3. Добавление приватного ключа в GitHub Secrets
```bash
cat github-actions-key
# Скопируйте весь вывод и добавьте как SSH_PRIVATE_KEY
```

## 🎨 Автоматические лейблы для PR

Создайте файл [`.github/labeler.yml`](.github/labeler.yml) для автоматической маркировки PR на основе измененных файлов.

Доступные лейблы:
- `backend` - изменения в backend/
- `frontend` - изменения в frontend/
- `docker` - изменения в Docker файлах
- `documentation` - изменения в .md файлах
- `ci/cd` - изменения в .github/
- `dependencies` - изменения в package.json

## 📝 Генерация JWT_SECRET

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -hex 64

# Linux/Mac
head -c 64 /dev/urandom | base64
```

## 🐛 Troubleshooting

### Деплой не работает
1. Проверьте SSH_PRIVATE_KEY в secrets
2. Убедитесь, что публичный ключ добавлен на сервер
3. Проверьте DEPLOY_PATH - директория должна существовать

### Docker образы не публикуются
1. Убедитесь, что включены GitHub Packages в настройках репозитория
2. Проверьте permissions в workflow (должен быть `packages: write`)

### Проверки не проходят
1. Запустите локально: `npm run lint` и `npm run build`
2. Исправьте все ошибки перед push
3. Используйте `npx prettier --write .` для форматирования

## 🔄 Обновление workflows

После изменения workflow файлов они автоматически применятся при следующем push.

Для тестирования без push используйте:
```bash
# Локальное тестирование GitHub Actions
npm install -g act
act -l  # Список доступных actions
act push  # Симуляция push события
```

## 📚 Дополнительные ресурсы

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Hub](https://hub.docker.com/)
- [GitHub Container Registry](https://ghcr.io/)
