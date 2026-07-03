import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TelegramService } from './core/telegram/telegram.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent implements OnInit {
  private readonly telegram = inject(TelegramService);

  ngOnInit(): void {
    this.telegram.init();
  }
}
