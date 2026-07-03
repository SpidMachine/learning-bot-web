import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { apiAuthInterceptor } from './core/api/api.interceptor';
import { HttpLearningApiService } from './core/api/http-learning-api.service';
import { LEARNING_API } from './core/api/learning-api.interface';
import { MockLearningApiService } from './core/api/mock-learning-api.service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiAuthInterceptor])),
    {
      provide: LEARNING_API,
      useClass: environment.useMocks ? MockLearningApiService : HttpLearningApiService,
    },
  ],
};
