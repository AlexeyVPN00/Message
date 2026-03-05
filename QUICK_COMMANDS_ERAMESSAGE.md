# ⚡ Быстрые команды для eramessage.ru

## 🎯 Краткая шпаргалка

### Ваши данные:
```
IP сервера: 185.246.118.162
Домен: eramessage.ru
Пароль root: toxP0vOl610L
```

---

## 1️⃣ Настройка DNS (в панели домена)

Добавьте 2 записи:

```
A    @      185.246.118.162
A    www    185.246.118.162
```

---

## 2️⃣ Подключение к серверу

```bash
ssh root@185.246.118.162
# Пароль: toxP0vOl610L
```

---

## 3️⃣ Установка Docker (на сервере)

```bash
curl -fsSL https://get.docker.com | sh
apt install docker-compose git nano -y
```

---

## 4️⃣ Загрузка проекта

### С вашего компьютера (PowerShell):
```bash
scp -r c:\Users\outsi\Desktop\vibecoding\messenger root@185.246.118.162:/root/
# Пароль: toxP0vOl610L
```

### На сервере:
```bash
cd /root/messenger
```

---

## 5️⃣ Настройка .env

```bash
cp .env.example .env
nano .env
```

Измените:
- `DB_PASSWORD` → сильный пароль
- `REDIS_PASSWORD` → сильный пароль
- `JWT_SECRET` → случайная строка (32+ символа)
- `FRONTEND_URL=https://eramessage.ru`

Генерация JWT_SECRET:
```bash
openssl rand -base64 32
```

---

## 6️⃣ Файрвол

```bash
ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw --force enable
```

---

## 7️⃣ ЗАПУСК! 🚀

```bash
cd /root/messenger
docker-compose -f docker-compose.production.yml up -d --build
```

Проверка:
```bash
docker-compose -f docker-compose.production.yml ps
```

---

## 8️⃣ SSL (HTTPS)

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d eramessage.ru -d www.eramessage.ru
```

---

## 9️⃣ Тестовые пользователи

```bash
docker exec -it messenger_backend sh
npm run seed
exit
```

Логины:
- user1@test.com / user123
- admin@test.com / admin123

---

## ✅ Готово!

Откройте: **https://eramessage.ru**

---

## 🔧 Полезные команды

### Логи:
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

### Статус:
```bash
docker ps
```

### Использование ресурсов:
```bash
docker stats
```

---

## 🐛 Проблемы?

### Сайт не открывается:
```bash
ping eramessage.ru
docker ps
docker-compose -f docker-compose.production.yml logs -f
```

### Backend не работает:
```bash
docker-compose -f docker-compose.production.yml logs backend
```

### PostgreSQL проблемы:
```bash
docker-compose -f docker-compose.production.yml logs postgres
```

---

## 📊 Бэкап БД

### Создать:
```bash
docker exec messenger_postgres pg_dump -U postgres messenger > backup.sql
```

### Восстановить:
```bash
docker exec -i messenger_postgres psql -U postgres messenger < backup.sql
```

---

**Полная инструкция**: [SETUP_ERAMESSAGE.md](SETUP_ERAMESSAGE.md)
