import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { apiAuthInterceptor } from './core/api/api.interceptor';
import { learningApiFactory } from './core/api/learning-api.factory';
import { LEARNING_API } from './core/api/learning-api.interface';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiAuthInterceptor])),
    {
      provide: LEARNING_API,
      useFactory: learningApiFactory,
    },
  ],
};
