# learning-bot-web

Angular UI для Telegram Mini App сервиса [learning-bot-api](https://github.com/spidmachine/learning-bot-api).

Современный мобильный интерфейс для обучения: курсы, уроки, квизы и профиль с прогрессом — вместо чат-интерфейса в Telegram.

## Стек

- Angular 19 (standalone components, `@if` / `@for`)
- Tailwind CSS 4
- Telegram WebApp SDK (`telegram-web-app.js`)
- HTTP-клиент с авторизацией через `initData`

## Быстрый старт

```bash
npm install
npm start
```

Приложение откроется на `http://localhost:4200`.

По умолчанию включён **mock-режим** (`environment.useMocks: true`) — UI работает без backend.

### Подключение к learning-bot-api

1. Запустите API на `http://localhost:8080`
2. В `src/environments/environment.ts` установите:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  useMocks: false,
};
```

3. Запустите с прокси:

```bash
ng serve --proxy-config proxy.conf.json
```

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

Авторизация: заголовок `Authorization: tma <initData>`. Backend должен валидировать `initData` через HMAC с bot token.

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
