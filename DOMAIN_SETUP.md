# 🌐 Настройка домена для мессенджера

## Пошаговая инструкция

### Шаг 1: Подготовка сервера

Если у вас еще нет сервера, создайте его на одном из хостингов:

#### Рекомендуемые хостинги:
- **DigitalOcean** - $6/месяц (рекомендую для начала)
- **AWS EC2** - от $10/месяц
- **Hetzner** - от €4/месяц (дешевле всех)

#### Создание сервера на DigitalOcean:

1. Зарегистрируйтесь на [DigitalOcean](https://www.digitalocean.com)
2. Create → Droplets
3. Выберите:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic - $6/mo (1 GB RAM / 25 GB SSD)
   - **Datacenter**: Frankfurt или Amsterdam (ближе к России)
   - **Authentication**: SSH Key (создайте на своем компьютере)
4. Create Droplet

**Вы получите IP адрес, например: `123.45.67.89`**

---

### Шаг 2: Настройка DNS записей

Зайдите в панель управления доменом и добавьте DNS записи.

#### Вариант A: Домен на **reg.ru**

1. Войдите на [reg.ru](https://www.reg.ru)
2. Перейдите: **Домены** → **Мои домены**
3. Выберите ваш домен → **Управление зоной DNS**
4. Нажмите **Добавить запись**
5. Создайте следующие записи:

```
Тип: A
Субдомен: @
IP-адрес: 123.45.67.89  (ваш IP сервера)
TTL: 3600

Тип: A
Субдомен: www
IP-адрес: 123.45.67.89  (ваш IP сервера)
TTL: 3600
```

#### Вариант B: Домен на **Cloudflare** (рекомендую - быстрее и с бесплатным CDN)

1. Войдите на [cloudflare.com](https://www.cloudflare.com)
2. Добавьте ваш домен (если еще не добавлен)
3. Перейдите: **DNS** → **Records**
4. Добавьте записи:

```
Type: A
Name: @
IPv4 address: 123.45.67.89
Proxy status: ✅ Proxied (оранжевое облако)
TTL: Auto

Type: A
Name: www
IPv4 address: 123.45.67.89
Proxy status: ✅ Proxied (оранжевое облако)
TTL: Auto
```

**Преимущества Cloudflare**:
- Бесплатный SSL сертификат
- Защита от DDoS
- CDN для ускорения сайта
- Автоматическая настройка HTTPS

#### Вариант C: Домен на **Namecheap**

1. Войдите на [namecheap.com](https://www.namecheap.com)
2. Domain List → **Manage**
3. **Advanced DNS** → **Add New Record**
4. Добавьте:

```
Type: A Record
Host: @
Value: 123.45.67.89
TTL: Automatic

Type: A Record
Host: www
Value: 123.45.67.89
TTL: Automatic
```

---

### Шаг 3: Проверка DNS (подождите 5-30 минут)

DNS записи распространяются от 5 минут до 48 часов (обычно 15-30 минут).

**Проверка на Windows**:
```bash
ping yourdomain.com
```

**Проверка на Linux/Mac**:
```bash
ping yourdomain.com
dig yourdomain.com
```

Если в ответе видите ваш IP - всё настроено правильно! ✅

---

### Шаг 4: Подключение к серверу

```bash
ssh root@123.45.67.89
```

Если используете Windows, можете использовать:
- **PowerShell** (встроенный SSH)
- **PuTTY** (скачать с [putty.org](https://www.putty.org))
- **MobaXterm** (рекомендую)

---

### Шаг 5: Установка необходимого ПО на сервер

```bash
# Обновление системы
apt update && apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установка Docker Compose
apt install docker-compose -y

# Установка Git
apt install git -y

# Проверка установки
docker --version
docker-compose --version
git --version
```

---

### Шаг 6: Загрузка проекта на сервер

#### Вариант 1: Через Git (рекомендую)

```bash
# Если проект уже на GitHub:
git clone https://github.com/ваш-username/messenger.git
cd messenger
```

#### Вариант 2: Загрузка файлов вручную

Если проекта нет на GitHub, загрузите файлы с помощью SCP:

**На вашем компьютере (Windows PowerShell)**:
```bash
scp -r c:\Users\outsi\Desktop\vibecoding\messenger root@123.45.67.89:/root/
```

Затем на сервере:
```bash
cd /root/messenger
```

---

### Шаг 7: Настройка переменных окружения

```bash
# Создайте файл .env из примера
cp .env.example .env

# Отредактируйте .env
nano .env
```

**Измените следующие значения в .env**:

```env
# ОБЯЗАТЕЛЬНО измените эти значения!
DB_PASSWORD=ваш_надежный_пароль_БД_12345
REDIS_PASSWORD=ваш_надежный_пароль_Redis_54321
JWT_SECRET=случайная_строка_минимум_32_символа_abcdef123456

# Укажите ваш домен (с https://)
FRONTEND_URL=https://yourdomain.com
```

**Генерация случайного JWT_SECRET**:
```bash
# На сервере выполните:
openssl rand -base64 32
# Скопируйте результат в JWT_SECRET
```

**Сохранить и выйти из nano**:
- Нажмите `Ctrl + X`
- Затем `Y` (yes)
- Затем `Enter`

---

### Шаг 8: Настройка Nginx для вашего домена

Откройте конфигурацию Nginx:
```bash
nano nginx/nginx.conf
```

Измените строку:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

На ваш домен:
```nginx
server_name mymessenger.com www.mymessenger.com;
```

Сохраните (`Ctrl + X` → `Y` → `Enter`)

---

### Шаг 9: Проверка Dockerfile

Убедитесь, что у вас есть Dockerfile в папках backend и frontend.

**Проверка**:
```bash
ls backend/Dockerfile
ls frontend/Dockerfile
```

Если файлов нет, создам их для вас (скажите, и я создам).

---

### Шаг 10: Запуск приложения

```bash
# Запуск в production режиме
docker-compose -f docker-compose.production.yml up -d --build

# Проверка статуса
docker-compose -f docker-compose.production.yml ps

# Просмотр логов
docker-compose -f docker-compose.production.yml logs -f
```

**Ожидаемый вывод**:
```
NAME                  STATUS    PORTS
messenger_postgres    Up        5432/tcp
messenger_redis       Up        6379/tcp
messenger_backend     Up        5000/tcp
messenger_frontend    Up        0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

---

### Шаг 11: Настройка файрвола (безопасность)

```bash
# Включаем файрвол
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

# Проверка статуса
ufw status
```

---

### Шаг 12: Настройка HTTPS (SSL сертификат)

#### Вариант A: Автоматический SSL с Let's Encrypt (рекомендую)

```bash
# Установка Certbot
apt install certbot python3-certbot-nginx -y

# Получение SSL сертификата
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Следуйте инструкциям:
# 1. Введите ваш email
# 2. Согласитесь с условиями (Y)
# 3. Выберите: Redirect (2) - автоматическое перенаправление HTTP → HTTPS
```

**Автоматическое обновление сертификата**:
```bash
# Certbot автоматически добавляет задачу в cron
# Проверка:
certbot renew --dry-run
```

#### Вариант B: Если используете Cloudflare

Если домен на Cloudflare с включенным Proxy (оранжевое облако):
- SSL настраивается автоматически
- Ничего дополнительно делать не нужно!

---

### Шаг 13: Проверка работы

Откройте в браузере:
```
https://yourdomain.com
```

**Должно работать**:
- ✅ Сайт открывается по HTTPS
- ✅ Регистрация работает
- ✅ Отправка сообщений работает
- ✅ WebSocket подключается

---

### Шаг 14: Создание тестовых пользователей (опционально)

```bash
# Войдите в контейнер backend
docker exec -it messenger_backend sh

# Запустите seed скрипт
npm run seed

# Выход
exit
```

Теперь можно войти с тестовыми аккаунтами:
- `user1@test.com` / `user123`
- `user2@test.com` / `user123`

---

## 🔧 Полезные команды

### Просмотр логов
```bash
# Все сервисы
docker-compose -f docker-compose.production.yml logs -f

# Только backend
docker-compose -f docker-compose.production.yml logs -f backend

# Только frontend
docker-compose -f docker-compose.production.yml logs -f frontend
```

### Перезапуск сервисов
```bash
# Перезапуск всех сервисов
docker-compose -f docker-compose.production.yml restart

# Перезапуск только backend
docker-compose -f docker-compose.production.yml restart backend
```

### Обновление приложения
```bash
# Получить последнюю версию с GitHub
git pull origin main

# Пересобрать и перезапустить
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build
```

### Остановка приложения
```bash
docker-compose -f docker-compose.production.yml down
```

### Полная очистка (ОСТОРОЖНО: удалит все данные!)
```bash
docker-compose -f docker-compose.production.yml down -v
```

---

## 🐛 Устранение проблем

### Проблема: Сайт не открывается

**Проверка 1**: DNS настроен правильно?
```bash
ping yourdomain.com
```

**Проверка 2**: Контейнеры запущены?
```bash
docker-compose -f docker-compose.production.yml ps
```

**Проверка 3**: Порты открыты?
```bash
ufw status
netstat -tulpn | grep :80
netstat -tulpn | grep :443
```

### Проблема: SSL не работает

```bash
# Проверка сертификата
certbot certificates

# Обновление сертификата
certbot renew

# Проверка Nginx конфигурации
nginx -t
```

### Проблема: Backend не подключается к БД

```bash
# Проверьте логи
docker-compose -f docker-compose.production.yml logs postgres
docker-compose -f docker-compose.production.yml logs backend

# Проверьте переменные в .env
cat .env
```

---

## 📊 Мониторинг

### Использование ресурсов
```bash
docker stats
```

### Проверка места на диске
```bash
df -h
```

### Логи системы
```bash
journalctl -u docker -f
```

---

## 🔒 Безопасность

### Чеклист безопасности

- [ ] Сильные пароли для БД и Redis в `.env`
- [ ] JWT_SECRET изменен на случайную строку
- [ ] HTTPS настроен и работает
- [ ] Файрвол включен (ufw enable)
- [ ] SSH доступ только по ключу (не паролю)
- [ ] Регулярные обновления системы: `apt update && apt upgrade`
- [ ] Автоматические бэкапы БД настроены

### Настройка SSH ключа (рекомендую)

```bash
# На сервере
nano /etc/ssh/sshd_config

# Измените:
PasswordAuthentication no
PermitRootLogin prohibit-password

# Перезапустите SSH
systemctl restart sshd
```

---

## 📦 Бэкапы

### Создание бэкапа БД

```bash
# Создать бэкап
docker exec messenger_postgres pg_dump -U postgres messenger > backup_$(date +%Y%m%d).sql

# Восстановление
docker exec -i messenger_postgres psql -U postgres messenger < backup_20240101.sql
```

### Автоматический бэкап (cron)

```bash
# Открыть crontab
crontab -e

# Добавить строку (бэкап каждый день в 3:00)
0 3 * * * docker exec messenger_postgres pg_dump -U postgres messenger > /root/backups/backup_$(date +\%Y\%m\%d).sql
```

---

## ✅ Итоговый чеклист

- [ ] Сервер создан и доступен по SSH
- [ ] Docker и Docker Compose установлены
- [ ] DNS записи настроены (A записи для @ и www)
- [ ] DNS распространился (ping работает)
- [ ] Проект загружен на сервер
- [ ] Файл .env настроен (пароли изменены!)
- [ ] Nginx конфигурация обновлена (server_name)
- [ ] Приложение запущено (docker-compose up)
- [ ] Файрвол настроен (порты 80, 443, 22)
- [ ] SSL сертификат получен (Let's Encrypt)
- [ ] Сайт открывается по HTTPS
- [ ] Регистрация работает
- [ ] Чаты работают
- [ ] WebSocket подключается

---

## 🆘 Помощь

Если что-то не получается:

1. Проверьте логи: `docker-compose -f docker-compose.production.yml logs -f`
2. Проверьте статус: `docker-compose -f docker-compose.production.yml ps`
3. Проверьте файрвол: `ufw status`
4. Проверьте DNS: `ping yourdomain.com`

---

**Поздравляю! Ваш мессенджер теперь доступен всему миру! 🎉**

Доступ: **https://yourdomain.com**
