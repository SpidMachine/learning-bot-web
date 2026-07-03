import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span class="mb-4 text-5xl">{{ emoji() }}</span>
      <h3 class="mb-2 text-lg font-semibold text-[var(--tg-text)]">{{ title() }}</h3>
      <p class="max-w-xs text-sm text-[var(--tg-hint)]">{{ description() }}</p>
    </div>
  `,
})
export class EmptyStateComponent {
  readonly emoji = input('📭');
  readonly title = input('Ничего не найдено');
  readonly description = input('Попробуйте позже');
}
