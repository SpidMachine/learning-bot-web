import { Component, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  template: `
    <div class="h-2 w-full overflow-hidden rounded-full bg-[var(--tg-secondary-bg)]">
      <div
        class="h-full rounded-full bg-[var(--tg-button)] transition-all duration-500"
        [style.width.%]="value()"
      ></div>
    </div>
  `,
})
export class ProgressBarComponent {
  readonly value = input(0);
}
