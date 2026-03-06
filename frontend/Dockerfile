# Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Устанавливаем переменные окружения для production build
ENV VITE_API_URL=/api
ENV VITE_WS_URL=

# Билдим приложение
RUN chmod +x node_modules/.bin/* && npm run build

# Production образ с nginx
FROM nginx:alpine

# Копируем собранное приложение
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем nginx конфигурацию
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
