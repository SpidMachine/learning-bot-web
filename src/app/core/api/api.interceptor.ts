import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TelegramService } from '../telegram/telegram.service';

export const apiAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const telegram = inject(TelegramService);
  const initData = telegram.initData;

  if (!initData || !req.url.startsWith(environment.apiBaseUrl)) {
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
