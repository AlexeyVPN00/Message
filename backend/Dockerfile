# Multi-stage build для оптимизации размера образа
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая dev для компиляции TypeScript)
RUN npm install

# Копируем исходный код
COPY . .

# Компилируем TypeScript
RUN chmod +x node_modules/.bin/* && npm run build

# Production образ
FROM node:20-alpine

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем только production зависимости
RUN npm install --only=production

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

# Health check для мониторинга состояния контейнера
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Запускаем приложение
CMD ["node", "dist/server.js"]
