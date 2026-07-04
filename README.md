# learning-bot-web

Angular UI для Telegram Mini App сервиса [learning-bot-api](https://github.com/spidmachine/learning-bot-api).

Современный мобильный интерфейс для обучения: курсы, уроки, квизы и профиль с прогрессом — вместо чат-интерфейса в Telegram.

## Стек

- Angular 19 (standalone components, `@if` / `@for`)
- Tailwind CSS 3
- Telegram WebApp SDK (`telegram-web-app.js`)
- HTTP-клиент с авторизацией через `X-Telegram-Init-Data`

## Быстрый старт (браузер)

```bash
npm install
npm start
```

Откройте `http://localhost:4200`.

Вне Telegram автоматически используются **mock-данные** (жёлтый баннер «Dev-режим»).

---

## Локальная разработка: Telegram + API

Для проверки в Telegram нужны **HTTPS** и реальный `initData`. Используем **Cloudflare Tunnel** (`cloudflared`).

### Три терминала

**Терминал 1 — бэкенд**

```bash
# learning-bot-api на порту 8080
```

Проверка (401 — это нормально, бэкенд жив):

```powershell
curl http://127.0.0.1:8080/api/v1/topics
```

**Терминал 2 — фронт**

```bash
npm run start:telegram
```

Проверка: `http://localhost:4200` открывается в браузере.

**Терминал 3 — туннель**

```bash
npm run tunnel
```

Или напрямую:

```bash
npx cloudflared tunnel --url http://127.0.0.1:4200
```

Скопируйте URL вида `https://xxxx.trycloudflare.com`.

### BotFather

1. `/mybots` → ваш бот → **Bot Settings** → **Menu Button**
2. Временно укажите URL из cloudflared (не GitHub Pages)
3. Откройте Mini App из Telegram

После разработки верните URL GitHub Pages.

### Как идут запросы

```
Telegram → cloudflared → localhost:4200 → /api/v1 → proxy → 127.0.0.1:8080
```

### Важно

| Ситуация | Что происходит |
|----------|----------------|
| BotFather → GitHub Pages | Production-сборка, API = `api.example.com` |
| BotFather → cloudflared URL | Dev-сборка, API = ваш локальный бэкенд |
| URL туннеля меняется | После перезапуска `cloudflared` обновите BotFather |
| `curl` без заголовка → 401 | Нормально — нужен `X-Telegram-Init-Data` |

---

## Другие режимы разработки

### Браузер + реальный API (без Telegram)

1. Запустите бэкенд на `:8080`
2. `npm start`
3. В DevTools:

```javascript
localStorage.setItem('DEV_INIT_DATA', 'строка_из_Telegram.WebApp.initData');
location.reload();
```

Получить `initData`: откройте Mini App в **Telegram Desktop** → Inspect → Console:

```javascript
copy(Telegram.WebApp.initData)
```

Сброс:

```javascript
localStorage.removeItem('DEV_INIT_DATA');
location.reload();
```

### Только mock (без бэкенда)

В `src/environments/environment.ts`:

```typescript
useMocks: true,
```

### Локальный конфиг

```bash
cp src/environments/environment.local.example.ts src/environments/environment.local.ts
```

Файл `environment.local.ts` в `.gitignore` — для личных настроек.

---

## Устранение проблем

| Симптом | Решение |
|---------|---------|
| `502 Bad Gateway` в Telegram | Проверьте `localhost:4200` и перезапустите `npm run tunnel` |
| `ECONNREFUSED ::1:8080` | Запустите бэкенд; proxy уже на `127.0.0.1:8080` |
| `api.example.com` в запросах | В BotFather указан GitHub Pages — переключите на cloudflared |
| 401 в Telegram | Проверьте заголовок `X-Telegram-Init-Data` в Network |
| `Invalid CORS request` | Перезапустите `npm run start:telegram` (proxy убирает Origin для бэкенда) |
| Пустая страница на GitHub Pages | Нужен `baseHref: /learning-bot-web/` (уже в `angular.json`) |

---

## API-контракт

**Base URL:** `http://localhost:8080/api/v1`  
**Auth:** заголовок `X-Telegram-Init-Data` (`Telegram.WebApp.initData`)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/v1/me` | Профиль Telegram-пользователя |
| GET | `/api/v1/topics` | Список тем |
| GET | `/api/v1/stats` | Статистика обучения |
| GET | `/api/v1/achievements` | Разблокированные достижения |
| GET | `/api/v1/sessions/current` | Текущая сессия (5 вопросов) |
| POST | `/api/v1/sessions` | Начать сессию |
| POST | `/api/v1/quiz/answers` | Отправить ответ |
| POST | `/api/v1/quiz/pick` | Случайный вопрос |
| POST | `/api/v1/quiz/review` | Вопрос на повторение |
| GET | `/api/v1/quiz/items/:itemId` | Вопрос по ID |
| GET/POST | `/api/v1/bookmarks`, `/api/v1/bookmarks/:itemId` | Закладки |
| GET/PATCH | `/api/v1/settings` | Настройки пользователя |

Контракт: `docs/openapi.json` (копия из learning-bot-api).

---

## Production (GitHub Pages)

1. **Settings → Pages → Source:** GitHub Actions
2. URL: `https://spidmachine.github.io/learning-bot-web/`
3. В `src/environments/environment.prod.ts` укажите реальный API:

```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://ваш-api.example.com/api/v1',
  useMocks: false,
  useMocksOutsideTelegram: false,
};
```

4. Сборка:

```bash
npm run build
```

Артефакты: `dist/learning-bot-web/browser/`

---

## Кнопка Mini App в боте (learning-bot-api)

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
```

Для локальной разработки подставьте URL из cloudflared.

---

## Работа с двумя репозиториями в Cursor

```bash
mkdir learning-bot && cd learning-bot
git clone https://github.com/SpidMachine/learning-bot-web.git
git clone https://github.com/SpidMachine/learning-bot-api.git
cursor learning-bot-web/learning-bot.code-workspace
```

Правила: `.cursor/rules/multi-repo.mdc`, `.cursor/rules/learning-bot-api-contract.mdc`

---

## Структура

```
src/app/
  core/telegram/     # Telegram WebApp SDK
  core/api/          # HTTP + mock API
  features/          # Home, Courses, Lesson, Quiz, Profile
  shared/            # UI-компоненты и модели
  layout/            # Shell с bottom navigation
```

## Скрипты

| Команда | Назначение |
|---------|------------|
| `npm start` | Браузер, mock вне Telegram |
| `npm run start:telegram` | Dev для Telegram + cloudflared |
| `npm run tunnel` | Cloudflare Tunnel на порт 4200 |
| `npm run build` | Production-сборка |

## Лицензия

MIT
