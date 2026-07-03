"""
Клавиатуры Telegram-бота с кнопкой Mini App.
Скопируйте в проект learning-bot-api или подключите как модуль.
"""

from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    ReplyKeyboardMarkup,
    WebAppInfo,
)

WEBAPP_URL = "https://spidmachine.github.io/learning-bot-web/"


def start_inline_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="📚 Открыть обучение",
                    web_app=WebAppInfo(url=WEBAPP_URL),
                )
            ]
        ]
    )


def main_reply_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [
                KeyboardButton(
                    text="📚 Открыть обучение",
                    web_app=WebAppInfo(url=WEBAPP_URL),
                )
            ]
        ],
        resize_keyboard=True,
    )
