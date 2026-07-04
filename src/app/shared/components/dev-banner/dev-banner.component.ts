import { Component, inject } from '@angular/core';
import { environmentLocal } from '../../../../environments/environment.local';
import { TelegramService } from '../../../core/telegram/telegram.service';

@Component({
  selector: 'app-dev-banner',
  standalone: true,
  template: `
    @if (telegram.isBrowserDevMode) {
      <div
        class="fixed left-0 right-0 top-0 z-[100] bg-amber-500 px-3 py-2 text-center text-xs font-medium text-black safe-top"
      >
        Dev-режим: mock-данные (откройте через Telegram для реального API)
      </div>
    }
  `,
})
export class DevBannerComponent {
  readonly environment = environmentLocal;
  readonly telegram = inject(TelegramService);
}
