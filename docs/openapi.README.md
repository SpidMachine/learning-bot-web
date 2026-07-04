# OpenAPI sync

Скопируйте `openapi.json` из репозитория **learning-bot-api** в этот файл:

```
docs/openapi.json
```

После обновления сверьте:
- `src/app/shared/models/api.dto.ts`
- `src/app/core/api/api.mapper.ts`
- `src/app/core/api/http-learning-api.service.ts`

Контракт также описан в `.cursor/rules/learning-bot-api-contract.mdc`.

## Текущий контракт (кратко)

- **Base URL:** `http://localhost:8080/api/v1`
- **Auth:** `X-Telegram-Init-Data: <Telegram.WebApp.initData>`
