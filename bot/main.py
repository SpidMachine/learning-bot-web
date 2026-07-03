"""
Минимальный Telegram-бот с кнопкой Mini App.

Запуск:
  pip install aiogram python-dotenv
  cp .env.example .env   # укажите BOT_TOKEN
  python main.py
"""

import asyncio
import logging
import os

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from dotenv import load_dotenv

from handlers import router

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def main() -> None:
  token = os.getenv("BOT_TOKEN")

  if not token:
    raise RuntimeError("Укажите BOT_TOKEN в файле .env")

  bot = Bot(token=token, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
  dp = Dispatcher()
  dp.include_router(router)

  logger.info("Бот запущен")
  await dp.start_polling(bot)


if __name__ == "__main__":
  asyncio.run(main())
