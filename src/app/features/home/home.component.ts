import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LEARNING_API } from '../../core/api/learning-api.interface';
import { CardComponent } from '../../shared/components/card/card.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { HomeDashboard } from '../../shared/models/learning.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CardComponent, ProgressBarComponent, SkeletonComponent, DecimalPipe],
  template: `
    <div class="px-4 pt-6">
      @if (loading()) {
        <app-skeleton [lines]="4" />
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

        @if (dashboard()!.session && !dashboard()!.session!.finished) {
          <section class="mb-6">
            <h2 class="mb-3 text-lg font-semibold">Продолжить сессию</h2>
            <a routerLink="/session">
              <app-card>
                <div class="flex items-center gap-4">
                  <span class="text-3xl">🎯</span>
                  <div class="flex-1">
                    <p class="text-xs text-[var(--tg-hint)]">
                      Вопрос {{ dashboard()!.session!.currentIndex }} / {{ dashboard()!.session!.total }}
                    </p>
                    <p class="font-semibold line-clamp-2">
                      {{ dashboard()!.session!.currentQuestion?.text }}
                    </p>
                    <div class="mt-2">
                      <app-progress-bar
                        [value]="(dashboard()!.session!.currentIndex / dashboard()!.session!.total) * 100"
                      />
                    </div>
                  </div>
                  <span class="text-[var(--tg-button)]">→</span>
                </div>
              </app-card>
            </a>
          </section>
        }

        <section>
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-lg font-semibold">Быстрые действия</h2>
            <a routerLink="/topics" class="text-sm text-[var(--tg-link)]">Все темы</a>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <a routerLink="/topics">
              <app-card>
                <span class="text-2xl">📚</span>
                <p class="mt-2 font-medium">Темы</p>
                <p class="text-xs text-[var(--tg-hint)]">Начать сессию</p>
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

  readonly loading = signal(true);
  readonly dashboard = signal<HomeDashboard | null>(null);

  ngOnInit(): void {
    this.api.getHomeDashboard().subscribe({
      next: (res: HomeDashboard) => {
        this.dashboard.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
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
