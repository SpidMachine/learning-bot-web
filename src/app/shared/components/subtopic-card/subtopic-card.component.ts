import { DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';
import { subtopicCtaLabel } from '../../../core/api/next-action.util';
import { SubtopicRoadmapNode } from '../../../shared/models/learning.models';

@Component({
  selector: 'app-subtopic-card',
  standalone: true,
  imports: [CardComponent, ProgressBarComponent, DecimalPipe],
  template: `
    <app-card [disabled]="subtopic().status === 'locked'">
      <div class="flex items-start gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
          [class.bg-[var(--tg-button)]]="subtopic().status === 'in_progress'"
          [class.text-[var(--tg-button-text)]]="subtopic().status === 'in_progress'"
          [class.bg-[var(--tg-secondary-bg)]]="subtopic().status !== 'in_progress'"
        >
          @if (subtopic().status === 'completed') {
            <span class="text-[var(--tg-success)]">✓</span>
          } @else if (subtopic().status === 'locked') {
            <span class="opacity-50">🔒</span>
          } @else {
            <span>{{ subtopic().emoji }}</span>
          }
        </div>

        <div class="min-w-0 flex-1">
          <h3 class="font-semibold">{{ subtopic().title }}</h3>
          @if (subtopic().description) {
            <p class="mt-1 text-sm text-[var(--tg-hint)]">{{ subtopic().description }}</p>
          }

          @if (subtopic().status !== 'locked') {
            <div class="mt-3">
              <div class="mb-1 flex justify-between text-xs text-[var(--tg-hint)]">
                <span>Прогресс</span>
                <span>{{ subtopic().percent | number: '1.0-0' }}%</span>
              </div>
              <app-progress-bar [value]="subtopic().percent" />
            </div>
          }

          @if (subtopic().status === 'locked') {
            <p class="mt-3 text-xs text-[var(--tg-hint)]">Завершите предыдущую подтему</p>
          } @else {
            <button
              type="button"
              class="mt-3 w-full rounded-xl bg-[var(--tg-button)] py-2.5 text-sm font-medium text-[var(--tg-button-text)] disabled:opacity-50"
              [disabled]="actionLoading()"
              (click)="action.emit(subtopic())"
            >
              {{ actionLoading() ? 'Запуск...' : ctaLabel(subtopic().status) }}
            </button>
          }
        </div>
      </div>
    </app-card>
  `,
})
export class SubtopicCardComponent {
  readonly subtopic = input.required<SubtopicRoadmapNode>();
  readonly actionLoading = input(false);
  readonly action = output<SubtopicRoadmapNode>();

  readonly ctaLabel = subtopicCtaLabel;
}
