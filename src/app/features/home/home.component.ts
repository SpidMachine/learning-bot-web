import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { startFromNextAction, nextActionIcon } from '../../core/api/next-action.util';
import { LEARNING_API } from '../../core/api/learning-api.interface';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { Dashboard } from '../../shared/models/learning.models';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-home',
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
      @if (loading()) {
        <app-skeleton [lines]="4" />
      } @else if (error()) {
        <app-empty-state
          emoji="⚠️"
          title="Не удалось загрузить главную"
          [description]="error()!"
        />
      } @else if (dashboard()) {
        <header class="mb-6">
          <p class="text-sm text-[var(--tg-hint)]">Добро пожаловать</p>
          <h1 class="text-2xl font-bold text-[var(--tg-text)]">
            {{ greeting() }}, {{ dashboard()!.me.firstName }}!
          </h1>
        </header>

        <div class="mb-6 grid grid-cols-3 gap-3">
          <div class="rounded-2xl bg-[var(--tg-secondary-bg)] p-3 text-center">
            <p class="text-2xl font-bold text-[var(--tg-button)]">
              {{ dashboard()!.stats.streakDays }}
            </p>
            <p class="text-xs text-[var(--tg-hint)]">дней подряд</p>
          </div>
          <div class="rounded-2xl bg-[var(--tg-secondary-bg)] p-3 text-center">
            <p class="text-2xl font-bold text-[var(--tg-accent)]">
              {{ dashboard()!.stats.accuracy | number: '1.0-0' }}%
            </p>
            <p class="text-xs text-[var(--tg-hint)]">точность</p>
          </div>
          <div class="rounded-2xl bg-[var(--tg-secondary-bg)] p-3 text-center">
            <p class="text-2xl font-bold text-[var(--tg-success)]">
              {{ dashboard()!.stats.totalAnswered }}
            </p>
            <p class="text-xs text-[var(--tg-hint)]">ответов</p>
          </div>
        </div>

        <section class="mb-6">
          <h2 class="mb-3 text-lg font-semibold">Продолжить</h2>
          <button type="button" class="w-full text-left" (click)="continueLearning()">
            <app-card>
              <div class="flex items-center gap-4">
                <span class="text-3xl">{{ nextActionIcon(dashboard()!.nextAction.type) }}</span>
                <div class="flex-1">
                  <p class="font-semibold">{{ dashboard()!.nextAction.label }}</p>
                  @if (dashboard()!.nextAction.title) {
                    <p class="text-sm text-[var(--tg-text)]">
                      {{ dashboard()!.nextAction.title }}
                    </p>
                  }
                  @if (dashboard()!.nextAction.subtitle) {
                    <p class="text-xs text-[var(--tg-hint)]">
                      {{ dashboard()!.nextAction.subtitle }}
                    </p>
                  }
                  @if (dashboard()!.session && !dashboard()!.session!.finished) {
                    <div class="mt-2">
                      <app-progress-bar
                        [value]="
                          (dashboard()!.session!.currentIndex / dashboard()!.session!.total) * 100
                        "
                      />
                    </div>
                  }
                </div>
                <span class="text-[var(--tg-button)]">→</span>
              </div>
            </app-card>
          </button>
        </section>

        <section>
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-lg font-semibold">Быстрые действия</h2>
            <a routerLink="/roadmap" class="text-sm text-[var(--tg-link)]">Роудмап</a>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <a routerLink="/roadmap">
              <app-card>
                <span class="text-2xl">🗺️</span>
                <p class="mt-2 font-medium">Роудмап</p>
                <p class="text-xs text-[var(--tg-hint)]">Путь обучения</p>
              </app-card>
            </a>
            <a routerLink="/practice">
              <app-card>
                <span class="text-2xl">🔁</span>
                <p class="mt-2 font-medium">Повторение</p>
                <p class="text-xs text-[var(--tg-hint)]">
                  {{ dashboard()!.stats.dueForReview }} на повтор
                </p>
              </app-card>
            </a>
          </div>
        </section>
      }
    </div>
  `,
})
export class HomeComponent implements OnInit {
  private readonly api = inject(LEARNING_API);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly dashboard = signal<Dashboard | null>(null);

  readonly nextActionIcon = nextActionIcon;

  ngOnInit(): void {
    this.api.getDashboard().subscribe({
      next: (res: Dashboard) => {
        this.dashboard.set(res);
        this.loading.set(false);
        this.error.set(null);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Проверьте, что бэкенд запущен и эндпоинт /api/v1/dashboard доступен.');
      },
    });
  }

  continueLearning(): void {
    const dashboard = this.dashboard();

    if (!dashboard?.nextAction) {
      this.router.navigate(['/roadmap']);
      return;
    }

    startFromNextAction(this.api, this.router, dashboard.nextAction, () => {
      this.error.set('Не удалось начать сессию. Попробуйте ещё раз.');
    });
  }

  greeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) {
      return 'Доброе утро';
    }

    if (hour < 18) {
      return 'Добрый день';
    }

    return 'Добрый вечер';
  }
}
