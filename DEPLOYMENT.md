# Руководство по деплою Messenger

Это руководство описывает как задеплоить приложение в production.

## 🚀 Быстрый старт (Docker)

### Предварительные требования
- Docker 20.10+
- Docker Compose 2.0+
- Домен с настроенными DNS записями (опционально для HTTPS)

### 1. Клонирование репозитория

```bash
git clone https://github.com/AlexeyVPN00/Message.git
cd Message
```

### 2. Настройка переменных окружения

Скопируйте `.env.example` в `.env`:

```bash
cp .env.example .env
```

Отредактируйте `.env` файл:

```env
# ОБЯЗАТЕЛЬНО ИЗМЕНИТЕ ЭТИ ЗНАЧЕНИЯ!
DB_USERNAME=postgres
DB_PASSWORD=your_super_secure_postgres_password_here
DB_DATABASE=messenger

REDIS_PASSWORD=your_super_secure_redis_password_here

JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

FRONTEND_URL=https://yourdomain.com
```

⚠️ **ВАЖНО**: Используйте сильные пароли в production!

### 3. Запуск приложения

```bash
docker-compose -f docker-compose.production.yml up -d
```

Проверка статуса:

```bash
docker-compose -f docker-compose.production.yml ps
```

Просмотр логов:

```bash
docker-compose -f docker-compose.production.yml logs -f
```

### 4. Проверка работоспособности

- Frontend: http://localhost
- Backend API: http://localhost/api
- WebSocket: http://localhost/socket.io

## 🔒 Настройка HTTPS (Let's Encrypt)

### Вариант 1: С Nginx на хосте

1. Установите Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
```

2. Получите сертификат:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

3. Настройте Nginx для проксирования на контейнер frontend (порт 80)

### Вариант 2: С Traefik

Добавьте Traefik сервис в `docker-compose.production.yml`:

```yaml
traefik:
  image: traefik:v2.10
  command:
    - --api.insecure=false
    - --providers.docker=true
    - --entrypoints.web.address=:80
    - --entrypoints.websecure.address=:443
    - --certificatesresolvers.letsencrypt.acme.email=your@email.com
    - --certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json
    - --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
    - ./letsencrypt:/letsencrypt
  networks:
    - messenger_network
```

## 📊 Мониторинг

### Проверка состояния контейнеров

```bash
docker-compose -f docker-compose.production.yml ps
```

### Логи

```bash
# Все сервисы
docker-compose -f docker-compose.production.yml logs -f

# Только backend
docker-compose -f docker-compose.production.yml logs -f backend

# Только frontend
docker-compose -f docker-compose.production.yml logs -f frontend
```

### Метрики ресурсов

```bash
docker stats
```

## 🔄 Обновление приложения

### 1. Получить последнюю версию

```bash
git pull origin main
```

### 2. Пересобрать и перезапустить контейнеры

```bash
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
```

### 3. Проверить логи

```bash
docker-compose -f docker-compose.production.yml logs -f
```

## 🗄️ Бэкапы базы данных

### Создание бэкапа

```bash
docker-compose -f docker-compose.production.yml exec postgres \
  pg_dump -U postgres messenger > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Восстановление из бэкапа

```bash
docker-compose -f docker-compose.production.yml exec -T postgres \
  psql -U postgres messenger < backup_20240101_120000.sql
```

### Автоматические бэкапы (cron)

Добавьте в crontab:

```bash
# Ежедневный бэкап в 3:00 AM
0 3 * * * cd /path/to/messenger && docker-compose -f docker-compose.production.yml exec -T postgres pg_dump -U postgres messenger > /backups/messenger_$(date +\%Y\%m\%d).sql
```

## 🛠️ Устранение неполадок

### Проблема: Контейнер backend не запускается

Проверьте логи:
```bash
docker-compose -f docker-compose.production.yml logs backend
```

Возможные причины:
- Неправильные переменные окружения в `.env`
- PostgreSQL еще не готов (подождите несколько секунд)
- Проблемы с подключением к БД

### Проблема: Frontend не отдает статику

Проверьте, что Nginx запущен:
```bash
docker-compose -f docker-compose.production.yml exec frontend nginx -t
```

Перезапустите frontend:
```bash
docker-compose -f docker-compose.production.yml restart frontend
```

### Проблема: WebSocket не подключается

Убедитесь, что nginx.conf настроен для проксирования WebSocket:
```nginx
location /socket.io {
    proxy_pass http://backend:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

## 🌐 Деплой на VPS (DigitalOcean, AWS, etc.)

### 1. Подключитесь к серверу

```bash
ssh root@your-server-ip
```

### 2. Установите Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 3. Установите Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 4. Клонируйте репозиторий и запустите

```bash
git clone https://github.com/AlexeyVPN00/Message.git
cd Message
cp .env.example .env
nano .env  # Отредактируйте переменные
docker-compose -f docker-compose.production.yml up -d
```

### 5. Настройте файрвол

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## 📈 Масштабирование

### Горизонтальное масштабирование backend

В `docker-compose.production.yml`:

```yaml
backend:
  # ...
  deploy:
    replicas: 3
```

### Использование внешних сервисов

- **База данных**: Managed PostgreSQL (AWS RDS, DigitalOcean Managed DB)
- **Кэш**: Managed Redis (AWS ElastiCache, Redis Cloud)
- **Хранилище файлов**: AWS S3, DigitalOcean Spaces
- **CDN**: CloudFlare, AWS CloudFront

## 🔐 Безопасность

### Чеклист безопасности:

- [ ] Используются сильные пароли для БД и Redis
- [ ] JWT_SECRET изменен на случайную строку (минимум 32 символа)
- [ ] HTTPS настроен с действительным сертификатом
- [ ] Файрвол настроен (открыты только 80, 443, и SSH порты)
- [ ] SSH доступ по ключу (не по паролю)
- [ ] Регулярные обновления системы
- [ ] Автоматические бэкапы настроены
- [ ] Rate limiting включен (уже есть в backend)
- [ ] CORS настроен правильно

## 📝 Полезные команды

```bash
# Остановить все сервисы
docker-compose -f docker-compose.production.yml down

# Остановить и удалить volumes (ОСТОРОЖНО: удалит все данные!)
docker-compose -f docker-compose.production.yml down -v

# Пересобрать все образы
docker-compose -f docker-compose.production.yml build --no-cache

# Посмотреть использование ресурсов
docker stats

# Очистить неиспользуемые образы и контейнеры
docker system prune -a

# Экспорт и импорт образов (для переноса)
docker save messenger_backend:latest | gzip > backend.tar.gz
docker load < backend.tar.gz
```

## 🆘 Поддержка

Если возникли проблемы:
1. Проверьте логи контейнеров
2. Проверьте переменные окружения в `.env`
3. Убедитесь, что порты не заняты другими сервисами
4. Создайте issue на GitHub: https://github.com/AlexeyVPN00/Message/issues

---

Made with ❤️ and Claude Code
