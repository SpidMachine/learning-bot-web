import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LEARNING_API } from '../../core/api/learning-api.interface';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { Topic } from '../../shared/models/learning.models';

@Component({
  selector: 'app-topics',
  standalone: true,
  imports: [
    RouterLink,
    CardComponent,
    ProgressBarComponent,
    SkeletonComponent,
    EmptyStateComponent,
    DecimalPipe,
  ],
  template: `
    <div class="px-4 pt-6">
      <header class="mb-6">
        <h1 class="text-2xl font-bold">Темы</h1>
        <p class="text-sm text-[var(--tg-hint)]">Выберите тему для сессии</p>
      </header>

      @if (loading()) {
        @for (item of [1, 2, 3]; track item) {
          <div class="mb-4">
            <app-skeleton [lines]="3" />
          </div>
        }
      } @else if (topics().length === 0) {
        <app-empty-state
          emoji="📚"
          title="Темы пока недоступны"
          description="Загляните позже — контент скоро появится"
        />
      } @else {
        <div class="space-y-4">
          @for (topic of topics(); track topic.key) {
            <a [routerLink]="['/topics', topic.key]">
              <app-card>
                <div class="flex gap-4">
                  <span class="text-4xl">{{ topic.emoji }}</span>
                  <div class="flex-1">
                    <h2 class="font-semibold">{{ topic.title }}</h2>
                    @if (topic.answered) {
                      <div class="mt-3">
                        <div class="mb-1 flex justify-between text-xs text-[var(--tg-hint)]">
                          <span>{{ topic.correct }} / {{ topic.answered }} верно</span>
                          <span>{{ topic.accuracy | number: '1.0-0' }}%</span>
                        </div>
                        <app-progress-bar [value]="topic.accuracy ?? 0" />
                      </div>
                    } @else {
                      <p class="mt-1 text-sm text-[var(--tg-hint)]">Ещё не начинали</p>
                    }
                  </div>
                </div>
              </app-card>
            </a>
          }
        </div>
      }
    </div>
  `,
})
export class TopicsComponent implements OnInit {
  private readonly api = inject(LEARNING_API);

  readonly loading = signal(true);
  readonly topics = signal<Topic[]>([]);

  ngOnInit(): void {
    this.api.getTopics().subscribe({
      next: (res: Topic[]) => {
        this.topics.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
