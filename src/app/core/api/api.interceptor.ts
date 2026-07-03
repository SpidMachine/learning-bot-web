import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TelegramService } from '../telegram/telegram.service';

export const apiAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const telegram = inject(TelegramService);
  const initData = telegram.initData;

  if (!initData) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `tma ${initData}`,
      },
    }),
  );
};
