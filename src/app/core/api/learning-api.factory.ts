import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HttpLearningApiService } from './http-learning-api.service';
import { LearningApi } from './learning-api.interface';
import { MockLearningApiService } from './mock-learning-api.service';
import { hasValidTelegramInitData } from '../telegram/telegram.utils';

export function learningApiFactory(): LearningApi {
  const useMocks =
    environment.useMocks ||
    (environment.useMocksOutsideTelegram && !hasValidTelegramInitData());

  if (useMocks) {
    return new MockLearningApiService();
  }

  return new HttpLearningApiService(inject(HttpClient));
}
