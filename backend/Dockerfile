# Multi-stage build для оптимизации размера образа
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Компилируем TypeScript
RUN npm run build

# Production образ
FROM node:18-alpine

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем только production зависимости
RUN npm ci --only=production

# Копируем скомпилированный код из builder
COPY --from=builder /app/dist ./dist

# Создаем директорию для uploads
RUN mkdir -p /app/uploads

# Создаем non-root пользователя
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

# Открываем порт
EXPOSE 5000

# Запускаем приложение
CMD ["node", "dist/server.js"]
