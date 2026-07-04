import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environmentLocal } from '../../../environments/environment.local';
import { TelegramService } from '../telegram/telegram.service';

export const apiAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const telegram = inject(TelegramService);
  const initData = telegram.initData;

  if (!initData || !req.url.startsWith(environmentLocal.apiBaseUrl)) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        'X-Telegram-Init-Data': initData,
      },
    }),
  );
};
