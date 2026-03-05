# 🚀 Быстрое развертывание eramessage.ru

## ✅ Уже готово:
- [x] Проект закоммичен в Git
- [x] .env файл создан с безопасными паролями
- [x] Nginx настроен для eramessage.ru
- [x] Docker конфигурация готова
- [x] Скрипты для развертывания созданы

---

## 📋 Что нужно сделать СЕЙЧАС:

### Шаг 1: Настройте DNS (ВАЖНО!)

Зайдите в панель управления доменом **eramessage.ru** и добавьте 2 записи:

```
A    @      185.246.118.162
A    www    185.246.118.162
```

⏰ **Подождите 15-30 минут** после добавления.

Проверка: откройте cmd и выполните `ping eramessage.ru` — должен вернуть 45.87.246.77

---

### Шаг 2: Загрузите проект на сервер

**На вашем компьютере** откройте PowerShell и выполните:

```powershell
cd c:\Users\outsi\Desktop\vibecoding\messenger
.\deploy-to-server.bat
```

Введите пароль root от сервера, когда попросит.

---

### Шаг 3: Подключитесь к серверу

```powershell
ssh root@185.246.118.162
```

Введите пароль root.

---

### Шаг 4: Запустите установку на сервере

После подключения к серверу выполните:

```bash
cd /root/messenger
chmod +x server-setup.sh
./server-setup.sh
```

Скрипт автоматически:
- Установит Docker
- Настроит файрвол
- Запустит все контейнеры (PostgreSQL, Redis, Backend, Frontend)

⏰ **Ждите 5-10 минут** пока соберутся Docker образы.

---

### Шаг 5: Проверьте работу

Откройте в браузере: **http://eramessage.ru**

Должна открыться главная страница мессенджера! 🎉

---

### Шаг 6: Настройте SSL (HTTPS)

**На сервере** выполните:

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d eramessage.ru -d www.eramessage.ru
```

Следуйте инструкциям certbot:
1. Введите ваш email
2. Согласитесь с условиями: `Y`
3. Автоматический редирект HTTP → HTTPS: выберите `2`

После этого откройте: **https://eramessage.ru** 🔒

---

### Шаг 7: Создайте тестовых пользователей

**На сервере** выполните:

```bash
docker exec -it messenger_backend sh
npm run seed
exit
```

**Тестовые аккаунты для входа:**
```
admin@test.com    / admin123
user1@test.com    / user123
user2@test.com    / user123
```

---

## 🎉 ГОТОВО!

Ваш мессенджер работает на **https://eramessage.ru**

---

## 📊 Полезные команды

### Просмотр логов:
```bash
cd /root/messenger
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

### Проверка статуса:
```bash
docker-compose -f docker-compose.production.yml ps
```

### Использование ресурсов:
```bash
docker stats
```

---

## 🐛 Если что-то не работает

### Проверьте DNS:
```bash
ping eramessage.ru
```

### Проверьте контейнеры:
```bash
docker ps
```

### Проверьте логи backend:
```bash
docker-compose -f docker-compose.production.yml logs backend
```

### Проверьте логи frontend:
```bash
docker-compose -f docker-compose.production.yml logs frontend
```

---

## 📞 Помощь

Полная документация:
- [SETUP_ERAMESSAGE.md](SETUP_ERAMESSAGE.md) - подробная инструкция
- [QUICK_COMMANDS_ERAMESSAGE.md](QUICK_COMMANDS_ERAMESSAGE.md) - быстрая шпаргалка

---

**Удачи! 🚀**
