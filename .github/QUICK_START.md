# ⚡ Quick Start - GitHub Actions

Быстрое руководство по запуску CI/CD за 5 минут.

## 🔥 Шаг 1: Генерация секретов (30 сек)

```bash
# JWT Secret
openssl rand -hex 64

# Database Password
openssl rand -base64 32

# Redis Password
openssl rand -base64 32
```

## 🔑 Шаг 2: SSH ключ (1 мин)

```bash
# 1. Генерация
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions-key

# 2. Добавление на сервер
ssh-copy-id -i ~/.ssh/github-actions-key.pub root@185.246.118.162

# 3. Показать приватный ключ для GitHub
cat ~/.ssh/github-actions-key
# Скопируйте весь вывод
```

## 📝 Шаг 3: Настройка Secrets в GitHub (2 мин)

Перейдите: https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions

Нажмите **New repository secret** для каждого:

| Secret | Значение |
|--------|----------|
| `SSH_PRIVATE_KEY` | *содержимое из cat ~/.ssh/github-actions-key* |
| `SSH_USER` | `root` |
| `SERVER_HOST` | `185.246.118.162` |
| `DEPLOY_PATH` | `/opt/messenger` |
| `DB_USERNAME` | `messenger_user` |
| `DB_PASSWORD` | *из openssl rand -base64 32* |
| `DB_DATABASE` | `messenger_db` |
| `REDIS_PASSWORD` | *из openssl rand -base64 32* |
| `JWT_SECRET` | *из openssl rand -hex 64* |
| `JWT_ACCESS_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | `https://yourdomain.com` |
| `VITE_API_URL` | `https://yourdomain.com/api` |

## 🌍 Шаг 4: Создание Environment (30 сек)

1. Перейдите: https://github.com/YOUR_USERNAME/YOUR_REPO/settings/environments
2. Нажмите **New environment**
3. Введите: `production`
4. Нажмите **Configure environment**

## 🚀 Шаг 5: Первый деплой (1 мин)

```bash
# Коммит и пуш
git add .github/
git commit -m "feat: Add GitHub Actions CI/CD"
git push origin main
```

✅ **Готово!** Откройте вкладку **Actions** и наблюдайте за процессом.

## 📊 Что произойдет

```
Push в main
    ↓
1. ✅ CI - Проверка кода
    ↓
2. ✅ Docker - Сборка образов
    ↓
3. ✅ Deploy - Деплой на сервер
    ↓
4. ✅ Security - Сканирование
    ↓
🎉 Приложение запущено!
```

## 🎯 Проверка работы

```bash
# Проверка здоровья приложения
curl https://yourdomain.com/health

# Или
curl http://185.246.118.162/health
```

## 🔧 Автоматическая настройка (альтернатива)

Вместо ручной настройки используйте скрипт:

```bash
# Требует GitHub CLI (gh)
.github/setup-secrets.sh
```

## 📚 Дополнительно

Полная документация: [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md)

## 🆘 Troubleshooting

### Деплой падает с SSH ошибкой
```bash
# Проверьте подключение
ssh root@185.246.118.162

# Проверьте ключ на сервере
cat ~/.ssh/authorized_keys
```

### Workflows не запускаются
- Проверьте, что файлы в `.github/workflows/` с расширением `.yml`
- Убедитесь, что push был в ветку `main`

### Docker образы не публикуются
- Settings → Actions → General → Workflow permissions
- Выберите: "Read and write permissions"

---

**Время на настройку: ~5 минут** ⏱️

**Результат: Полностью автоматизированный CI/CD** 🎉
