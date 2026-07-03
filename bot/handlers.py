"""
Обработчики команд бота.
"""

from aiogram import Router
from aiogram.filters import Command, CommandStart
from aiogram.types import Message

from keyboards import main_reply_keyboard, start_inline_keyboard

router = Router()


@router.message(CommandStart())
async def cmd_start(message: Message) -> None:
    await message.answer(
        "Привет! Нажми кнопку ниже, чтобы открыть обучение в удобном интерфейсе 👇",
        reply_markup=start_inline_keyboard(),
    )
    await message.answer(
        "Или используй кнопку внизу экрана:",
        reply_markup=main_reply_keyboard(),
    )


@router.message(Command("app"))
async def cmd_app(message: Message) -> None:
    await message.answer(
        "Открыть Mini App:",
        reply_markup=start_inline_keyboard(),
    )
