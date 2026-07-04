import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TelegramService } from './core/telegram/telegram.service';
import { DevBannerComponent } from './shared/components/dev-banner/dev-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DevBannerComponent],
  template: `
    <app-dev-banner />
    <router-outlet />
  `,
})
export class AppComponent implements OnInit {
  private readonly telegram = inject(TelegramService);

  ngOnInit(): void {
    this.telegram.init();
  }
}
