import { Component, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { TelegramService } from '../../../core/telegram/telegram.service';

@Component({
  selector: 'app-dev-banner',
  standalone: true,
  template: `
    @if (!environment.production) {
      <div
        class="fixed left-0 right-0 top-0 z-[100] bg-amber-500 px-3 py-2 text-center text-xs font-medium text-black safe-top"
      >
        Dev · API: {{ environment.apiBaseUrl }}
        @if (telegram.isBrowserDevMode) {
          · mock-данные (нет initData)
        }
      </div>
    }
  `,
})
export class DevBannerComponent {
  readonly environment = environment;
  readonly telegram = inject(TelegramService);
}
