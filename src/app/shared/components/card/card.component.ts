import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div
      class="rounded-2xl border border-black/5 bg-[var(--tg-secondary-bg)] p-4 shadow-sm transition active:scale-[0.98]"
      [class.opacity-60]="disabled()"
    >
      <ng-content />
    </div>
  `,
})
export class CardComponent {
  readonly disabled = input(false);
}
