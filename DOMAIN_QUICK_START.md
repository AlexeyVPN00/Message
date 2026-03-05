# ⚡ Быстрая настройка домена - Шпаргалка

## 📋 Что вам нужно:
- ✅ Домен (уже куплен)
- ⬜ Сервер (VPS) - рекомендую DigitalOcean $6/месяц
- ⬜ 30 минут времени

---

## 🚀 Быстрый старт (5 шагов)

### 1️⃣ Создайте сервер на DigitalOcean

➡️ Перейдите: https://www.digitalocean.com/products/droplets
- **OS**: Ubuntu 22.04
- **Plan**: Basic $6/mo (1GB RAM)
- **Datacenter**: Frankfurt

**Получите IP адрес**, например: `123.45.67.89`

---

### 2️⃣ Настройте DNS (где купили домен)

**Добавьте 2 записи типа A**:

| Тип | Имя/Host | Значение/IP | TTL |
|-----|----------|-------------|-----|
| A | @ | 123.45.67.89 | 3600 |
| A | www | 123.45.67.89 | 3600 |

⏰ **Подождите 15-30 минут** пока DNS распространится

**Проверка**: `ping yourdomain.com` → должен вернуть ваш IP

---

### 3️⃣ Подключитесь к серверу и установите Docker

```bash
# Подключение
ssh root@123.45.67.89

# Установка Docker (одной командой)
curl -fsSL https://get.docker.com | sh

# Установка Docker Compose
apt install docker-compose git -y
```

---

### 4️⃣ Загрузите проект на сервер

**Вариант A: Если проект на GitHub**
```bash
git clone https://github.com/ваш-username/messenger.git
cd messenger
```

**Вариант B: Загрузка с вашего компьютера**

На вашем Windows компьютере (PowerShell):
```bash
scp -r c:\Users\outsi\Desktop\vibecoding\messenger root@123.45.67.89:/root/
```

Затем на сервере:
```bash
cd /root/messenger
```

---

### 5️⃣ Настройте и запустите

```bash
# Создайте .env из примера
cp .env.example .env

# Отредактируйте .env
nano .env
```

**Измените в .env**:
```env
DB_PASSWORD=ваш_надежный_пароль_БД
REDIS_PASSWORD=ваш_надежный_пароль_Redis
JWT_SECRET=случайная_строка_минимум_32_символа
FRONTEND_URL=https://yourdomain.com
```

Сохраните: `Ctrl+X` → `Y` → `Enter`

**Обновите nginx конфигурацию**:
```bash
nano nginx/nginx.conf
```

Замените:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

На ваш домен:
```nginx
server_name mymessenger.com www.mymessenger.com;
```

**Запустите приложение**:
```bash
# Запуск
docker-compose -f docker-compose.production.yml up -d --build

# Настройка файрвола
ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw enable

# Установка SSL (Let's Encrypt)
apt install certbot python3-certbot-nginx -y
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## ✅ Готово!

Откройте в браузере: **https://yourdomain.com**

---

## 🔍 Проверка статуса

```bash
# Статус контейнеров
docker-compose -f docker-compose.production.yml ps

# Логи
docker-compose -f docker-compose.production.yml logs -f

# Использование ресурсов
docker stats
```

---

## 🐛 Что-то не работает?

### Сайт не открывается?
```bash
# Проверка DNS
ping yourdomain.com

# Проверка контейнеров
docker ps

# Проверка портов
ufw status
```

### Backend не запускается?
```bash
# Смотрим логи
docker-compose -f docker-compose.production.yml logs backend

# Проверяем .env
cat .env
```

---

## 📞 Нужна помощь?

1. Проверьте логи: `docker-compose -f docker-compose.production.yml logs -f`
2. Прочитайте полную инструкцию: [DOMAIN_SETUP.md](DOMAIN_SETUP.md)
3. Проверьте чеклист в [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 💰 Стоимость

- **Сервер**: $6/месяц (DigitalOcean)
- **Домен**: ~800₽/год (~$10/год)
- **SSL**: Бесплатно (Let's Encrypt)

**Итого**: ~$7-8 в месяц

---

**Удачи! 🚀**
