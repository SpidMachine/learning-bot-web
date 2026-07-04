import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environmentLocal } from '../../../environments/environment.local';
import { TelegramService } from '../telegram/telegram.service';

export const apiAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const telegram = inject(TelegramService);
  const initData = telegram.initData;
  const apiPath = environmentLocal.apiBaseUrl.startsWith('http')
    ? new URL(environmentLocal.apiBaseUrl).pathname
    : environmentLocal.apiBaseUrl;
  const isApiRequest = req.url.startsWith(apiPath) || req.url.includes('/api/v1/');

  if (!initData || !isApiRequest) {
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
