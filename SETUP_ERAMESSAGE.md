# 🚀 Полная инструкция по запуску eramessage.ru

## 📋 Ваши данные:

```
Домен: eramessage.ru
IP сервера: 45.87.246.77
ОС: Ubuntu 22.04 (после переустановки)
```

---

## Шаг 1: Переустановка ОС на сервере ⚙️

1. Зайдите в **личный кабинет хостинга**
2. Найдите сервер **vm214503** (IP: 45.87.246.77)
3. Нажмите **"Переустановить ОС"** или **"Reinstall"**
4. Выберите: **Ubuntu 22.04 LTS x64**
5. Подтвердите переустановку
6. **Сохраните новый root пароль!** (придет на email или в ЛК)

⏰ Ждите 3-5 минут пока переустановится.

---

## Шаг 2: Настройка DNS для eramessage.ru 🌐

Зайдите в панель управления доменом (где купили eramessage.ru).

### Добавьте 2 DNS записи:

```
Запись 1:
Тип: A
Имя (Host): @
Значение (IP): 45.87.246.77
TTL: 3600

Запись 2:
Тип: A
Имя (Host): www
Значение (IP): 45.87.246.77
TTL: 3600
```

### Где это сделать:

**Если купили на reg.ru**:
- Мои домены → eramessage.ru → Управление зоной DNS → Добавить запись

**Если на Cloudflare**:
- DNS → Records → Add record

**Если на другом**:
- Найдите раздел DNS / DNS Records / Управление DNS

⏰ **Подождите 15-30 минут** пока DNS распространится.

**Проверка**: `ping eramessage.ru` → должен вернуть 45.87.246.77

---

## Шаг 3: Подключение к серверу и установка Docker 🐳

Откройте **PowerShell** на вашем компьютере:

```bash
# Подключитесь к серверу
ssh root@45.87.246.77

# Введите новый пароль (который получили после переустановки)
```

После подключения выполните команды:

```bash
# Обновление системы
apt update && apt upgrade -y

# Установка Docker (одной командой)
curl -fsSL https://get.docker.com | sh

# Установка Docker Compose и Git
apt install docker-compose git nano -y

# Проверка
docker --version
docker-compose --version
```

Должно показать версии Docker и Docker Compose ✅

---

## Шаг 4: Загрузка проекта на сервер 📦

### Вариант A: Загрузка с вашего компьютера (рекомендую)

**На вашем Windows компьютере** откройте **новое окно PowerShell**:

```bash
# Загрузите проект на сервер
scp -r c:\Users\outsi\Desktop\vibecoding\messenger root@45.87.246.77:/root/
```

Введите пароль root, подождите загрузки.

### Вариант B: Через Git (если проект на GitHub)

**На сервере**:
```bash
git clone https://github.com/ваш-username/messenger.git
cd messenger
```

---

## Шаг 5: Настройка переменных окружения 🔧

**На сервере**:

```bash
cd /root/messenger

# Создайте .env файл
cp .env.example .env

# Откройте для редактирования
nano .env
```

### Вставьте следующее содержимое:

```env
# Database Configuration
DB_USERNAME=postgres
DB_PASSWORD=EraMsgDB_2024_SecurePass!@#
DB_DATABASE=messenger

# Redis Configuration
REDIS_PASSWORD=EraRedis_2024_SecurePass!@#

# JWT Configuration (сгенерирован случайно)
JWT_SECRET=f8k2L9mP4nQ7rT0vX3zB6cE1gH5jK8mN2pR4sU7wY0aD3fG6hJ9lM1oQ4tV7xZ0
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=https://eramessage.ru

# AWS S3 (опционально, для production файлов)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET=
```

**Сохранить**: нажмите `Ctrl+X`, затем `Y`, затем `Enter`

---

## Шаг 6: Настройка Nginx для eramessage.ru 🌍

```bash
# Откройте конфигурацию Nginx
nano nginx/nginx.conf
```

Найдите строку с `server_name` и измените на:

```nginx
server_name eramessage.ru www.eramessage.ru;
```

Полная конфигурация должна выглядеть так:

```nginx
server {
    listen 80;
    server_name eramessage.ru www.eramessage.ru;

    # Проксирование на frontend
    location / {
        proxy_pass http://frontend:80;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Проксирование API на backend
    location /api {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket проксирование
    location /socket.io {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Загрузка файлов
    client_max_body_size 10M;
}
```

**Сохранить**: `Ctrl+X` → `Y` → `Enter`

---

## Шаг 7: Настройка файрвола 🔒

```bash
# Разрешите порты
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS

# Включите файрвол
ufw --force enable

# Проверка
ufw status
```

Должно показать:
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

---

## Шаг 8: Запуск мессенджера! 🚀

```bash
cd /root/messenger

# Запуск всех сервисов
docker-compose -f docker-compose.production.yml up -d --build
```

Это займет 5-10 минут (первый раз Docker собирает образы).

### Проверка статуса:

```bash
docker-compose -f docker-compose.production.yml ps
```

Должно показать:
```
NAME                  STATUS    PORTS
messenger_postgres    Up        5432/tcp
messenger_redis       Up        6379/tcp
messenger_backend     Up        5000/tcp
messenger_frontend    Up        0.0.0.0:80->80/tcp, :::80->80/tcp
```

Все должны быть **Up** (работают) ✅

### Просмотр логов:

```bash
# Все сервисы
docker-compose -f docker-compose.production.yml logs -f

# Только backend (если есть ошибки)
docker-compose -f docker-compose.production.yml logs -f backend

# Выход из логов: Ctrl+C
```

---

## Шаг 9: Проверка работы 🌐

Откройте браузер: **http://eramessage.ru**

Должен открыться ваш мессенджер! ✅

Если не открывается:
1. Проверьте DNS: `ping eramessage.ru`
2. Проверьте контейнеры: `docker ps`
3. Проверьте логи: `docker-compose -f docker-compose.production.yml logs -f`

---

## Шаг 10: Установка SSL (HTTPS) 🔐

```bash
# Установите Certbot
apt install certbot python3-certbot-nginx -y

# Получите бесплатный SSL сертификат от Let's Encrypt
certbot --nginx -d eramessage.ru -d www.eramessage.ru
```

**Следуйте инструкциям**:
1. Введите ваш email
2. Согласитесь с условиями: `Y`
3. Получать новости (опционально): `N`
4. Автоматический редирект HTTP → HTTPS: выберите `2` (Redirect)

### Проверка:

Откройте: **https://eramessage.ru**

Должен работать HTTPS с зеленым замочком! 🔒✅

### Автоматическое обновление сертификата:

```bash
# Проверка автообновления
certbot renew --dry-run
```

Certbot автоматически обновит сертификат каждые 90 дней.

---

## Шаг 11: Создание тестовых пользователей (опционально) 👥

```bash
# Войдите в контейнер backend
docker exec -it messenger_backend sh

# Запустите seed скрипт
npm run seed

# Выход
exit
```

**Тестовые аккаунты для входа**:
```
Email: admin@test.com    | Пароль: admin123
Email: user1@test.com    | Пароль: user123
Email: user2@test.com    | Пароль: user123
Email: test@test.com     | Пароль: test123
```

---

## ✅ ГОТОВО! Ваш мессенджер запущен!

Откройте: **https://eramessage.ru**

### Что должно работать:

- ✅ Регистрация новых пользователей
- ✅ Вход в систему
- ✅ Создание личных чатов
- ✅ Отправка сообщений в реальном времени
- ✅ Групповые чаты
- ✅ Загрузка аватаров
- ✅ Добавление в контакты
- ✅ Редактирование профиля
- ✅ Светлая/темная тема
- ✅ Индикатор "печатает..."
- ✅ Онлайн/офлайн статус

---

## 🔧 Полезные команды

### Просмотр логов:
```bash
docker-compose -f docker-compose.production.yml logs -f
```

### Перезапуск:
```bash
docker-compose -f docker-compose.production.yml restart
```

### Остановка:
```bash
docker-compose -f docker-compose.production.yml down
```

### Повторный запуск:
```bash
docker-compose -f docker-compose.production.yml up -d
```

### Использование ресурсов:
```bash
docker stats
```

### Место на диске:
```bash
df -h
```

---

## 📊 Мониторинг

### Проверка работы сервисов:
```bash
docker-compose -f docker-compose.production.yml ps
```

### Логи PostgreSQL:
```bash
docker-compose -f docker-compose.production.yml logs -f postgres
```

### Логи Backend:
```bash
docker-compose -f docker-compose.production.yml logs -f backend
```

---

## 🗄️ Создание бэкапа базы данных

```bash
# Создать бэкап
docker exec messenger_postgres pg_dump -U postgres messenger > backup_$(date +%Y%m%d).sql

# Восстановление из бэкапа
docker exec -i messenger_postgres psql -U postgres messenger < backup_20240101.sql
```

### Автоматический бэкап (каждый день в 3:00 AM):

```bash
# Открыть crontab
crontab -e

# Добавить строку:
0 3 * * * docker exec messenger_postgres pg_dump -U postgres messenger > /root/backups/backup_$(date +\%Y\%m\%d).sql

# Создать папку для бэкапов
mkdir -p /root/backups
```

---

## 🐛 Устранение неполадок

### Проблема: Сайт не открывается

```bash
# Проверка 1: DNS настроен?
ping eramessage.ru

# Проверка 2: Контейнеры запущены?
docker ps

# Проверка 3: Nginx работает?
docker-compose -f docker-compose.production.yml logs frontend

# Проверка 4: Backend работает?
docker-compose -f docker-compose.production.yml logs backend
```

### Проблема: Backend не запускается

```bash
# Смотрим логи
docker-compose -f docker-compose.production.yml logs backend

# Проверяем подключение к БД
docker-compose -f docker-compose.production.yml logs postgres

# Проверяем .env
cat .env
```

### Проблема: SSL не работает

```bash
# Проверка сертификата
certbot certificates

# Обновление сертификата
certbot renew

# Проверка Nginx
nginx -t
```

---

## 🎉 Поздравляю!

Ваш мессенджер **eramessage.ru** теперь доступен всему миру!

**Доступ**: https://eramessage.ru

**Характеристики**:
- 50-100 пользователей
- 10-20 одновременно онлайн
- Реальное время (WebSocket)
- HTTPS безопасность
- Работает 24/7

---

## 📞 Если нужна помощь

1. Проверьте логи: `docker-compose -f docker-compose.production.yml logs -f`
2. Проверьте статус: `docker-compose -f docker-compose.production.yml ps`
3. Проверьте DNS: `ping eramessage.ru`
4. Прочитайте полную документацию: [DEPLOYMENT.md](DEPLOYMENT.md)

---

**Удачи с запуском! 🚀**
