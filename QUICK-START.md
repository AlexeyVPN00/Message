# 🚀 Быстрый запуск Messenger

## 📋 Требования

- ✅ Node.js v18+
- ✅ Docker Desktop
- ✅ Git

## ⚡ Самый быстрый способ

### Windows

Просто запустите:
```bash
start-dev.bat
```

Этот скрипт:
- Запустит Backend на http://localhost:5000
- Запустит Frontend на http://localhost:3000
- Откроет браузер автоматически
- Покажет монитор статуса

---

## 🛠️ Полезные скрипты

### 1. **start-dev.bat** - Запуск всех серверов
Запускает Backend и Frontend в отдельных окнах терминала.

### 2. **check-status.bat** - Монитор статуса
Показывает статус всех сервисов в реальном времени:
- ✅ Backend API (порт 5000)
- ✅ Frontend (порт 3000)
- ✅ PostgreSQL (порт 5433)
- ✅ Redis (порт 6380)

**Действия в мониторе:**
- `1` - Открыть Frontend
- `2` - Открыть Backend Health
- `3` - Перезапустить все серверы
- `R` - Обновить статус
- `Q` - Выход

### 3. **restart-servers.bat** - Перезапуск серверов
Останавливает и перезапускает Backend и Frontend.

### 4. **stop-servers.bat** - Остановка серверов
Останавливает все Node.js процессы на портах 3000 и 5000.

---

## 🔧 Ручной запуск

### 1. Запустите Docker контейнеры
```bash
docker-compose up -d
```

### 2. Запустите Backend
```bash
cd backend
npm install
npm run dev
```

### 3. Запустите Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 URL-адреса

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health
- **PostgreSQL:** localhost:5433
- **Redis:** localhost:6380

**Доступ из локальной сети:**
- http://192.168.1.104:3000
- http://172.16.0.1:3000

---

## 🧪 Тестовые данные

### Существующий пользователь:
- **Email:** test@example.com
- **Password:** Test1234
- **Username:** testuser

### Новый пользователь:
Зарегистрируйтесь через http://localhost:3000/register

---

## ❓ Решение проблем

### Порт уже занят
```bash
# Остановите все серверы
stop-servers.bat

# Или вручную найдите процесс
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

### Docker контейнеры не запускаются
```bash
docker-compose down
docker-compose up -d --force-recreate
```

### База данных не подключается
```bash
# Сбросьте БД
docker exec messenger_postgres psql -U postgres -c "DROP DATABASE messenger;"
docker exec messenger_postgres psql -U postgres -c "CREATE DATABASE messenger;"

# Перезапустите backend
restart-servers.bat
```

### Белый экран в браузере
1. Откройте DevTools (F12)
2. Перейдите в Console
3. Нажмите Ctrl+Shift+R для полного обновления
4. Проверьте статус: `check-status.bat`

---

## 📚 Документация

- [TESTING.md](TESTING.md) - Подробное руководство по тестированию
- [DEPLOYMENT.md](DEPLOYMENT.md) - Инструкции по деплою
- [OPTIMIZATION.md](backend/OPTIMIZATION.md) - Оптимизация производительности

---

## 🆘 Нужна помощь?

1. Запустите **check-status.bat** - проверьте какие сервисы не работают
2. Посмотрите логи в окнах терминалов Backend/Frontend
3. Проверьте Docker: `docker-compose ps`
4. Убедитесь что Node.js установлен: `node --version`

---

**Приятной работы!** 🎉
