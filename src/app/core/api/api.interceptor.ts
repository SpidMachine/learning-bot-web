import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, timeout, throwError } from 'rxjs';
import { environmentLocal } from '../../../environments/environment.local';
import { TelegramService } from '../telegram/telegram.service';

const API_TIMEOUT_MS = 30_000;

export const apiAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const telegram = inject(TelegramService);
  const initData = telegram.initData;
  const apiPath = environmentLocal.apiBaseUrl.startsWith('http')
    ? new URL(environmentLocal.apiBaseUrl).pathname
    : environmentLocal.apiBaseUrl;
  const isApiRequest = req.url.startsWith(apiPath) || req.url.includes('/api/v1/');

  const authedReq =
    initData && isApiRequest
      ? req.clone({
          setHeaders: {
            'X-Telegram-Init-Data': initData,
          },
        })
      : req;

  if (!isApiRequest) {
    return next(authedReq);
  }

  return next(authedReq).pipe(
    timeout(API_TIMEOUT_MS),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        return throwError(() => error);
      }

      return throwError(() => ({
        status: 0,
        message: 'Превышено время ожидания ответа API (30 с). Проверьте, что бэкенд запущен на :8080.',
      }));
    }),
  );
};
