# Messenger - Веб-мессенджер с элементами социальной сети

Современный веб-мессенджер с функциями социальной сети, построенный на React + TypeScript + Node.js + PostgreSQL.

## Функциональность

- 💬 **Личные и групповые чаты** - real-time обмен сообщениями
- 📢 **Каналы** - создание собственных каналов (как в Telegram)
- 📰 **Новостная лента** - посты, лайки, комментарии
- 👤 **Профили пользователей** - с аватарами и контактной информацией
- 🔔 **Уведомления** - real-time уведомления о событиях
- 🎨 **Темы** - светлая и темная тема "миднайт"

## Технологический стек

### Frontend
- React 18 + TypeScript
- Vite
- Material-UI
- Zustand (state management)
- Socket.io (WebSocket client)
- React Router
- React Hook Form + Zod

### Backend
- Node.js + Express + TypeScript
- PostgreSQL (TypeORM)
- Redis (кэширование, сессии)
- Socket.io (WebSocket server)
- JWT (аутентификация)
- Multer + Sharp (загрузка файлов)

## Быстрый старт

### Предварительные требования

- Node.js 18+
- Docker и Docker Compose
- Git

### Установка

1. Клонировать репозиторий:
```bash
git clone <repository-url>
cd messenger
```

2. Запустить Docker контейнеры (PostgreSQL + Redis):
```bash
docker-compose up -d
```

3. Установить зависимости backend:
```bash
cd backend
npm install
```

4. Скопировать и настроить переменные окружения:
```bash
cp .env.example .env
# Отредактируйте .env файл при необходимости
```

5. Запустить миграции базы данных:
```bash
npm run migration:run
```

6. Запустить backend сервер:
```bash
npm run dev
```

7. В новом терминале, установить зависимости frontend:
```bash
cd frontend
npm install
```

8. Запустить frontend приложение:
```bash
npm run dev
```

9. Открыть браузер:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Структура проекта

```
messenger/
├── frontend/          # React приложение
├── backend/           # Express API
├── docker-compose.yml # PostgreSQL + Redis
└── README.md
```

## Разработка

### Backend

```bash
cd backend
npm run dev          # Запуск dev сервера
npm run build        # Сборка для production
npm run start        # Запуск production сервера
npm run migration:generate  # Создать миграцию
npm run migration:run       # Выполнить миграции
```

### Frontend

```bash
cd frontend
npm run dev          # Запуск dev сервера
npm run build        # Сборка для production
npm run preview      # Превью production сборки
```

### Docker

```bash
docker-compose up -d      # Запустить контейнеры
docker-compose down       # Остановить контейнеры
docker-compose logs       # Посмотреть логи
docker-compose ps         # Статус контейнеров
```

## Этапы реализации

- [x] Этап 1: Инфраструктура и базовая настройка
- [ ] Этап 2: Аутентификация (JWT)
- [ ] Этап 3: Профили пользователей
- [ ] Этап 4: Личные чаты 1-на-1
- [ ] Этап 5: Групповые чаты
- [ ] Этап 6: Каналы
- [ ] Этап 7: Новостная лента
- [ ] Этап 8: Уведомления
- [ ] Этап 9: Темы оформления
- [ ] Этап 10: Оптимизация и тестирование
- [ ] Этап 11: Деплой

## API Документация

После запуска backend сервера, API документация доступна по адресу:
- Swagger UI: http://localhost:5000/api-docs (будет добавлено позже)

## Лицензия

MIT

## Контакты

Для вопросов и предложений создайте issue в репозитории.
