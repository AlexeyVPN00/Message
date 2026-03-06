# GitHub Actions Workflows

Этот каталог содержит все CI/CD workflows для автоматизации разработки и деплоя.

## 📁 Структура workflows

| Workflow | Файл | Описание |
|----------|------|----------|
| **CI** | `ci.yml` | Сборка и тестирование при каждом push/PR |
| **CD** | `deploy.yml` | Автоматический деплой на production |
| **Docker** | `docker-publish.yml` | Публикация Docker образов в GHCR |
| **PR Checks** | `pr-check.yml` | Проверки кода в Pull Requests |
| **Security** | `security.yml` | Сканирование на уязвимости |

## 🚦 Статусы workflows

```markdown
![CI](../../actions/workflows/ci.yml/badge.svg)
![CD](../../actions/workflows/deploy.yml/badge.svg)
![Security](../../actions/workflows/security.yml/badge.svg)
```

## 🔄 Workflow Flow

### Push в main
```
1. CI ✓ → Проверка и сборка
2. Docker Build ✓ → Публикация образов
3. Deploy ✓ → Деплой на production
4. Security Scan ✓ → Проверка безопасности
```

### Pull Request
```
1. PR Checks ✓ → Качество кода
2. CI ✓ → Сборка и тестирование
3. PR Labeler ✓ → Автоматические лейблы
4. Size Check ✓ → Анализ размера изменений
```

## ⚡ Быстрый старт

### 1. Настройте secrets
```bash
# Используйте скрипт автоматической настройки
.github/setup-secrets.sh

# Или настройте вручную через GitHub UI
# Settings → Secrets and variables → Actions
```

### 2. Создайте environment 'production'
```
Settings → Environments → New environment → "production"
```

### 3. Первый деплой
```bash
git push origin main
# или
# Actions → CD - Deploy to Production → Run workflow
```

## 📋 Необходимые Secrets

### Deployment
- `SSH_PRIVATE_KEY` - SSH ключ для доступа к серверу
- `SSH_USER` - Пользователь SSH
- `SERVER_HOST` - IP/домен сервера
- `DEPLOY_PATH` - Путь к проекту на сервере

### Database
- `DB_USERNAME` - PostgreSQL user
- `DB_PASSWORD` - PostgreSQL password
- `DB_DATABASE` - Database name

### Redis
- `REDIS_PASSWORD` - Redis password

### JWT
- `JWT_SECRET` - JWT secret key
- `JWT_ACCESS_EXPIRES_IN` - Access token lifetime
- `JWT_REFRESH_EXPIRES_IN` - Refresh token lifetime

### Frontend
- `FRONTEND_URL` - Frontend URL
- `VITE_API_URL` - Backend API URL

## 🎯 Использование

### Автоматический деплой
Просто сделайте push или merge в `main` - деплой запустится автоматически.

### Ручной деплой
1. Перейдите в **Actions**
2. Выберите **CD - Deploy to Production**
3. **Run workflow** → выберите `main` → **Run workflow**

### Публикация версии
```bash
git tag v1.0.0
git push origin v1.0.0
```
Docker образы автоматически опубликуются с тегом `v1.0.0`.

## 🔍 Мониторинг

### Логи
**Actions** → выберите workflow run → просмотрите каждый job

### Артефакты
**Actions** → workflow run → **Artifacts** (хранятся 7 дней)

### Security Alerts
**Security** → **Code scanning alerts**

## 🐛 Отладка

### Локальное тестирование workflows
```bash
# Установите act
npm install -g act

# Список всех workflows
act -l

# Запустить CI локально
act push

# Запустить с конкретным событием
act pull_request
```

### Просмотр логов в реальном времени
```bash
# Установите GitHub CLI
gh run watch

# Или просмотрите последний run
gh run view --log
```

## 📝 Модификация workflows

### Добавление нового шага
1. Отредактируйте нужный `.yml` файл
2. Добавьте новый step:
```yaml
- name: Название шага
  run: команда
```
3. Commit и push - изменения применятся автоматически

### Добавление нового workflow
1. Создайте новый файл `.github/workflows/my-workflow.yml`
2. Определите trigger и jobs
3. Push - workflow активируется

### Тестирование изменений
```bash
# Создайте feature branch
git checkout -b feature/update-ci

# Внесите изменения
# Протестируйте через PR

# После проверки - merge в main
```

## 🔐 Безопасность

### Secrets
- ✅ Никогда не коммитьте secrets в код
- ✅ Используйте GitHub Secrets
- ✅ Регулярно ротируйте ключи

### Permissions
Workflows имеют минимально необходимые permissions:
```yaml
permissions:
  contents: read      # Чтение кода
  packages: write     # Публикация Docker образов
  pull-requests: write # Комментарии в PR
```

## 📚 Ресурсы

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [GitHub CLI](https://cli.github.com/)
- [Act - Local Testing](https://github.com/nektos/act)

## ❓ FAQ

**Q: Workflow не запускается**
A: Проверьте triggers в `on:` секции. Убедитесь, что push/PR идет в правильную ветку.

**Q: Деплой падает с ошибкой SSH**
A: Проверьте `SSH_PRIVATE_KEY` в secrets и убедитесь, что публичный ключ добавлен на сервер.

**Q: Docker образы не публикуются**
A: Убедитесь, что GitHub Packages включены в настройках репозитория.

**Q: Как пропустить workflow для конкретного commit?**
A: Добавьте `[skip ci]` или `[ci skip]` в сообщение коммита.

**Q: Как запретить автоматический деплой?**
A: Удалите `push:` trigger из `deploy.yml` - останется только ручной запуск.

## 🎨 Кастомизация

### Изменение Node.js версии
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'  # Измените на нужную
```

### Добавление тестов
```yaml
- name: Run tests
  working-directory: ./backend
  run: npm test
```

### Настройка расписания
```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Каждый день в 2:00 UTC
```

---

**Готово к использованию!** 🚀
