# learning-bot-web

Angular UI для Telegram Mini App сервиса [learning-bot-api](https://github.com/spidmachine/learning-bot-api).

Современный мобильный интерфейс для обучения: курсы, уроки, квизы и профиль с прогрессом — вместо чат-интерфейса в Telegram.

## Стек

- Angular 19 (standalone components, `@if` / `@for`)
- Tailwind CSS 3
- Telegram WebApp SDK (`telegram-web-app.js`)
- HTTP-клиент с авторизацией через `initData`

## Быстрый старт

```bash
npm install
npm start
```

Приложение откроется на `http://localhost:4200`.

По умолчанию:
- **В браузере** (`localhost:4200`) — mock-данные, без 401
- **В Telegram** — реальный API с `X-Telegram-Init-Data`

## Локальная разработка

### Вариант 1: Браузер (по умолчанию)

```bash
npm start
# откройте http://localhost:4200
```

Вне Telegram автоматически включаются **mock-данные** (`useMocksOutsideTelegram: true`). Сверху появится жёлтый баннер «Dev-режим».

### Вариант 2: Браузер + реальный API

Скопируйте `initData` из Telegram и сохраните в DevTools:

```javascript
localStorage.setItem('DEV_INIT_DATA', 'ваша_строка_initData');
location.reload();
```

Бэкенд должен принять эту строку. Чтобы сбросить:

```javascript
localStorage.removeItem('DEV_INIT_DATA');
location.reload();
```

### Вариант 3: Telegram + локальный бэкенд (без GitHub Pages)

**Важно:** если в BotFather указан URL GitHub Pages — всегда грузится **production** сборка с `api.example.com`. Для локальной разработки временно переключите URL на ngrok.

```bash
# Терминал 1 — бэкенд на :8080
# (learning-bot-api)

# Терминал 2 — фронт (dev, не production!)
npm run start:telegram

# Терминал 3 — туннель
ngrok http 4200
```

1. Скопируйте HTTPS URL из ngrok (например `https://abc123.ngrok-free.app`)
2. В **BotFather** временно замените Menu Button URL на этот адрес
3. Откройте Mini App из Telegram — запросы пойдут на `/api/v1` → proxy → `localhost:8080`
4. После разработки верните URL GitHub Pages в BotFather

Локальный конфиг: `src/environments/environment.local.ts` (скопируйте из `environment.local.example.ts`).

### Вариант 4: Telegram + ngrok (старый способ)

```bash
npm start
ngrok http 4200
```

URL от ngrok укажите в BotFather и откройте Mini App из Telegram — будет реальный `initData` и API.

### Вариант 4: Всегда mock

В `src/environments/environment.ts`:

```typescript
useMocks: true,
```

## Работа с двумя репозиториями в одном чате Cursor

Чтобы агент видел и фронт, и бэкенд:

1. Клонируйте оба репозитория **рядом** в одну папку:

```bash
mkdir learning-bot && cd learning-bot
git clone https://github.com/SpidMachine/learning-bot-web.git
git clone https://github.com/SpidMachine/learning-bot-api.git
```

2. Откройте workspace-файл в Cursor:

```bash
cursor learning-bot-web/learning-bot.code-workspace
```

Или: **File → Open Workspace from File** → `learning-bot.code-workspace`.

3. В чате Cursor будут доступны оба проекта. Правило `.cursor/rules/multi-repo.mdc` подсказывает агенту архитектуру.

> Для Cloud Agent оба репозитория должны быть доступны в одном workspace (приватный `learning-bot-api` — с авторизацией GitHub).

### Подключение к learning-bot-api

1. Запустите API на `http://localhost:8080`
2. Запустите фронт (proxy уже настроен в `angular.json`):

```bash
npm start
```

Конфигурация в `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: '/api/v1',
  useMocks: false,
};
```

Для работы без бэкенда установите `useMocks: true`.

## API-контракт

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/v1/me` | Профиль пользователя |
| GET | `/api/v1/courses` | Список курсов |
| GET | `/api/v1/courses/:id` | Курс с уроками |
| GET | `/api/v1/lessons/:id` | Контент урока |
| POST | `/api/v1/lessons/:id/complete` | Завершить урок |
| GET | `/api/v1/quizzes/:id` | Квиз |
| POST | `/api/v1/quizzes/:id/submit` | Отправить ответы |

Авторизация: заголовок `X-Telegram-Init-Data` с `Telegram.WebApp.initData`.

Контракт API: `docs/openapi.json` (копия из learning-bot-api).

## Настройка Telegram Mini App

### 1. Деплой (HTTPS обязателен)

**GitHub Pages** (рекомендуется для этого репозитория):

1. **Settings → Pages → Source:** GitHub Actions
2. После merge в `main` workflow задеплоит приложение
3. URL: `https://spidmachine.github.io/learning-bot-web/`
4. В BotFather укажите **именно этот URL** (со слэшем в конце — необязательно, но путь `/learning-bot-web/` обязателен)

> Если страница пустая — убедитесь, что в production-сборке задан `baseHref: /learning-bot-web/` (уже настроено в `angular.json`).

**Vercel:**

```bash
npm run build
# vercel deploy --prod
```

**GitHub Pages:** workflow в `.github/workflows/deploy.yml` — включите Pages в настройках репозитория.

### 2. BotFather

1. Откройте [@BotFather](https://t.me/BotFather)
2. `/mybots` → выберите бота → **Bot Settings** → **Menu Button** → укажите URL деплоя
3. Или `/newapp` для создания Mini App

### 3. Кнопка в боте (learning-bot-api)

Бот запускается только из бэкенда — отдельный Python-бот не нужен.

Добавьте в обработчик `/start` в **learning-bot-api**:

```python
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo

WEBAPP_URL = "https://spidmachine.github.io/learning-bot-web/"

def start_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(
            text="📚 Открыть обучение",
            web_app=WebAppInfo(url=WEBAPP_URL),
        )
    ]])

# в обработчике /start:
await message.answer("Привет! Открой обучение:", reply_markup=start_keyboard())
```

Menu Button в BotFather и эта inline-кнопка могут работать одновременно.

### 4. Dev-режим вне Telegram

В браузере SDK недоступен — приложение использует mock-пользователя и fallback-кнопки внизу экрана. Для полной проверки используйте ngrok:

```bash
ngrok http 4200
```

Зарегистрируйте HTTPS URL в BotFather и откройте Mini App из Telegram.

## Production build

```bash
npm run build
```

Артефакты: `dist/learning-bot-web/browser/`

В `src/environments/environment.prod.ts` укажите реальный `apiUrl` и `useMocks: false`.

## Структура

```
src/app/
  core/telegram/     # Telegram WebApp SDK
  core/api/          # HTTP + mock API
  features/          # Home, Courses, Lesson, Quiz, Profile
  shared/            # UI-компоненты и модели
  layout/            # Shell с bottom navigation
```

## Лицензия

MIT
