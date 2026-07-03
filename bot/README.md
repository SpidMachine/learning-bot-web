# Интеграция Mini App в Telegram-бот

URL Mini App (GitHub Pages):

```
https://spidmachine.github.io/learning-bot-web/
```

## Быстрый запуск этого бота

```bash
cd bot
pip install -r requirements.txt
cp .env.example .env
# В .env укажите BOT_TOKEN от @BotFather
python main.py
```

После `/start` пользователь увидит:
- inline-кнопку «📚 Открыть обучение»
- reply-кнопку внизу экрана (дублирует Menu Button)

## Вставка в существующий бот (aiogram 3)

Скопируйте [`keyboards.py`](keyboards.py) и добавьте в обработчик `/start`:

```python
from keyboards import start_inline_keyboard, main_reply_keyboard

@router.message(CommandStart())
async def cmd_start(message: Message):
    await message.answer(
        "Привет! Открой обучение:",
        reply_markup=start_inline_keyboard(),
    )
    await message.answer(
        "Кнопка внизу экрана:",
        reply_markup=main_reply_keyboard(),
    )
```

## Java (Spring + telegrambots)

```java
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import org.telegram.telegrambots.meta.api.objects.webapp.WebAppInfo;

private static final String WEBAPP_URL = "https://spidmachine.github.io/learning-bot-web/";

public InlineKeyboardMarkup createWebAppKeyboard() {
    InlineKeyboardButton button = InlineKeyboardButton.builder()
        .text("📚 Открыть обучение")
        .webApp(new WebAppInfo(WEBAPP_URL))
        .build();

    return InlineKeyboardMarkup.builder()
        .keyboardRow(List.of(button))
        .build();
}
```
