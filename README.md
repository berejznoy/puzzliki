# Пазлики

Интерактивная игра-пазл на Next.js с поддержкой PWA.

## Разработка

```bash
npm install
npm run dev
```

Откройте http://localhost:3000

## Развёртывание с Docker

### Быстрый старт

```bash
docker-compose up -d --build
```

Приложение будет доступно на http://localhost

### SSL/HTTPS

Для включения HTTPS:

1. Поместите сертификаты в `nginx/ssl/`:
   - `nginx/ssl/cert.pem`
   - `nginx/ssl/key.pem`

2. Обновите `nginx/nginx.conf` для HTTPS

### Команды

```bash
# Сборка и запуск
docker-compose up -d --build

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Пересборка без кэша
docker-compose build --no-cache
```

## Структура проекта

```
├── app/                    # Next.js App Router
│   ├── components/         # React компоненты
│   ├── utils/              # Утилиты
│   └── globals.css         # Стили
├── public/                 # Статические файлы
│   ├── manifest.json       # PWA манифест
│   ├── sw.js               # Service Worker
│   └── icon-*.png          # PWA иконки
├── nginx/                  # Nginx конфигурация
├── Dockerfile              # Docker образ
└── docker-compose.yml      # Docker Compose
```
