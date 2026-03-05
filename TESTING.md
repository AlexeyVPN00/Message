# Руководство по тестированию приложения

## 📋 Предварительные требования

Убедитесь, что установлены:
- [x] Node.js 18+ (`node --version`)
- [x] npm или yarn (`npm --version`)
- [x] Docker Desktop (`docker --version`)
- [x] Docker Compose (`docker-compose --version`)

## 🔧 Шаг 1: Подготовка environment

### Backend .env

Создайте файл `backend/.env`:

```bash
cd backend
cp .env.example .env
```

Содержимое `backend/.env`:
```env
# Server
PORT=5000
NODE_ENV=development

# Database (для Docker)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=messenger

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-for-development
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Frontend .env

Создайте файл `frontend/.env`:

```bash
cd ../frontend
cp .env.example .env
```

Содержимое `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
```

## 🐳 Шаг 2: Запуск Docker (PostgreSQL + Redis)

Вернитесь в корневую директорию:

```bash
cd ..
docker-compose up -d
```

Проверьте, что контейнеры запущены:

```bash
docker-compose ps
```

Должно показать:
```
NAME                    STATUS
messenger_postgres      Up
messenger_redis         Up
```

## 📦 Шаг 3: Установка зависимостей

### Backend

```bash
cd backend
npm install
```

Если возникают ошибки с установкой, попробуйте:
```bash
npm install --legacy-peer-deps
```

### Frontend

```bash
cd ../frontend
npm install
```

## 🗄️ Шаг 4: Инициализация базы данных

### Проверка подключения к PostgreSQL

```bash
docker exec -it messenger_postgres psql -U postgres -d messenger -c "SELECT version();"
```

### Автоматическая миграция

TypeORM автоматически создаст таблицы при первом запуске backend.

Либо можно выполнить вручную через TypeORM CLI (если настроено).

## ▶️ Шаг 5: Запуск приложения

### Терминал 1: Backend

```bash
cd backend
npm run dev
```

Должно появиться:
```
🚀 Server is running on http://localhost:5000
✅ Database connected
✅ Redis connected
🔌 Socket.io server started
```

### Терминал 2: Frontend

```bash
cd frontend
npm run dev
```

Должно появиться:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## 🧪 Шаг 6: Тестирование функционала

Откройте браузер: **http://localhost:3000**

### 1. Регистрация нового пользователя

1. Нажмите **"Регистрация"**
2. Заполните форму:
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `password123`
   - Confirm Password: `password123`
3. Нажмите **"Зарегистрироваться"**

✅ **Ожидаемый результат**: Редирект на главную страницу, вы авторизованы

### 2. Создание и редактирование профиля

1. Нажмите **"Мой профиль"**
2. Нажмите **"Редактировать профиль"**
3. Заполните:
   - Имя: `Test`
   - Фамилия: `User`
   - О себе: `Hello, I'm testing this messenger!`
4. Загрузите аватар (любое изображение)
5. Нажмите **"Сохранить"**

✅ **Ожидаемый результат**: Профиль обновлен, аватар отображается

### 3. Тестирование чатов

#### A. Создать второго пользователя

1. Откройте **Incognito/приватное окно**
2. Зарегистрируйте второго пользователя:
   - Email: `test2@example.com`
   - Username: `testuser2`
   - Password: `password123`

#### B. Начать личный чат

1. В первом окне: **"Открыть чаты"**
2. Нажмите кнопку **"+"** (создать чат)
3. Найдите пользователя `testuser2`
4. Отправьте сообщение: `Hello from user 1!`

✅ **Ожидаемый результат**:
- Сообщение отправлено
- В окне user2 появился новый чат
- Real-time доставка работает

#### C. Индикатор "печатает..."

1. В окне user1 начните печатать
2. В окне user2 должен появиться: **"testuser печатает..."**

✅ **Ожидаемый результат**: Индикатор появляется и исчезает

#### D. Групповой чат

1. Создайте третьего пользователя: `testuser3`
2. В окне user1: нажмите **GroupAdd** (создать группу)
3. Заполните:
   - Название: `Test Group`
   - Описание: `Group for testing`
   - Выберите участников: `testuser2`, `testuser3`
4. Создайте группу
5. Отправьте сообщение в группу

✅ **Ожидаемый результат**: Все участники видят группу и сообщения

### 4. Тестирование каналов

1. Перейдите в **"Каналы"**
2. Нажмите **"+"** (создать канал)
3. Заполните:
   - Название: `Test Channel`
   - Описание: `Channel for announcements`
   - Приватный: `false`
4. Создайте канал
5. Создайте пост в канале: `Welcome to Test Channel!`

✅ **Ожидаемый результат**: Канал создан, пост опубликован

6. В окне user2: зайдите в **"Каналы"**
7. Найдите `Test Channel` и подпишитесь
8. Проверьте, что пост виден

✅ **Ожидаемый результат**: Подписка работает, посты видны

### 5. Тестирование ленты

1. Перейдите в **"Лента"**
2. Создайте пост: `This is my first post! #testing`
3. Добавьте изображение (опционально)
4. Опубликуйте

✅ **Ожидаемый результат**: Пост появился в ленте

5. В окне user2: перейдите в **"Лента"**
6. Найдите пост user1
7. Нажмите **❤️** (лайк)
8. Добавьте комментарий: `Great post!`

✅ **Ожидаемый результат**:
- Лайк добавлен, счетчик увеличился
- Комментарий появился
- User1 получил уведомление о лайке и комментарии

### 6. Тестирование уведомлений

1. Перейдите в **"Уведомления"**
2. Проверьте, что есть уведомления о:
   - Лайках
   - Комментариях
   - Новых сообщениях
3. Нажмите на уведомление

✅ **Ожидаемый результат**: Уведомление отмечается как прочитанное

4. Проверьте **badge** с красным счетчиком в navbar

✅ **Ожидаемый результат**: Счетчик показывает количество непрочитанных

### 7. Тестирование тем

1. Нажмите на иконку **🌙** (переключатель темы) в правом верхнем углу
2. Тема изменится на темную "Миднайт"
3. Нажмите еще раз - вернется светлая

✅ **Ожидаемый результат**:
- Тема переключается плавно
- Сохраняется после перезагрузки страницы

### 8. Тестирование WebSocket

1. В окне user1: откройте DevTools (F12)
2. Перейдите на вкладку **Network** -> **WS** (WebSocket)
3. Найдите подключение к `localhost:5000/socket.io`
4. Отправьте сообщение в чат

✅ **Ожидаемый результат**: Видны WebSocket frames с сообщениями

## 🔍 Проверка работоспособности API

### Через curl/Postman

```bash
# Health check
curl http://localhost:5000/

# Регистрация
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api@test.com",
    "username": "apiuser",
    "password": "password123"
  }'

# Логин
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api@test.com",
    "password": "password123"
  }'

# Получить профиль (замените YOUR_TOKEN)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🐛 Распространенные проблемы

### Проблема 1: Backend не запускается

**Ошибка**: `Error: connect ECONNREFUSED ::1:5432`

**Решение**:
```bash
# Проверьте, что Docker контейнеры запущены
docker-compose ps

# Перезапустите контейнеры
docker-compose restart
```

### Проблема 2: Frontend не подключается к Backend

**Ошибка**: `Network Error` в консоли браузера

**Решение**:
1. Проверьте, что backend запущен на порту 5000
2. Проверьте `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_WS_URL=http://localhost:5000
   ```
3. Перезапустите frontend: `npm run dev`

### Проблема 3: Database connection failed

**Ошибка**: `ER_ACCESS_DENIED_ERROR` или `Connection refused`

**Решение**:
```bash
# Проверьте логи PostgreSQL
docker-compose logs postgres

# Проверьте backend/.env - пароль должен совпадать с docker-compose.yml
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=messenger
```

### Проблема 4: WebSocket не подключается

**Решение**:
1. Откройте DevTools -> Console
2. Найдите ошибки Socket.io
3. Проверьте `frontend/.env`:
   ```env
   VITE_WS_URL=http://localhost:5000
   ```
4. Проверьте CORS в `backend/src/app.ts`

### Проблема 5: CORS errors

**Ошибка**: `Access-Control-Allow-Origin`

**Решение**: В `backend/src/app.ts` проверьте:
```typescript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

## 📊 Monitoring

### Логи Backend

```bash
# В терминале где запущен backend
# Вы увидите все HTTP запросы и WebSocket события
```

### Логи Frontend

Откройте DevTools (F12):
- **Console**: JavaScript ошибки
- **Network**: HTTP запросы
- **WS**: WebSocket frames
- **Application** -> **Local Storage**: Проверьте сохраненную тему

### Логи Docker

```bash
# PostgreSQL
docker-compose logs -f postgres

# Redis
docker-compose logs -f redis
```

## ✅ Чеклист тестирования

- [ ] Backend запускается без ошибок
- [ ] Frontend запускается без ошибок
- [ ] PostgreSQL подключена
- [ ] Redis подключен
- [ ] Регистрация работает
- [ ] Логин работает
- [ ] Профили создаются и редактируются
- [ ] Аватары загружаются
- [ ] Личные чаты работают
- [ ] Групповые чаты работают
- [ ] Real-time сообщения доставляются
- [ ] Индикатор "печатает..." работает
- [ ] Каналы создаются
- [ ] Подписка на каналы работает
- [ ] Лента постов работает
- [ ] Лайки работают
- [ ] Комментарии работают
- [ ] Уведомления приходят
- [ ] Badge с счетчиком работает
- [ ] Темы переключаются
- [ ] WebSocket подключен
- [ ] Нет ошибок в консоли

## 🎯 Production тестирование

Для тестирования production сборки:

```bash
# Остановите dev сервера

# Запустите production Docker
docker-compose -f docker-compose.production.yml up -d

# Откройте http://localhost
```

## 📝 Отчет о багах

Если нашли баг:
1. Опишите шаги для воспроизведения
2. Скриншоты/видео
3. Логи из консоли
4. Создайте Issue на GitHub

---

Happy Testing! 🧪✨
