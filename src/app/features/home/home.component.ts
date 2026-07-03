import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LEARNING_API } from '../../core/api/learning-api.interface';
import { TelegramService } from '../../core/telegram/telegram.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { UserProfile } from '../../shared/models/learning.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CardComponent, ProgressBarComponent, SkeletonComponent],
  template: `
    <div class="px-4 pt-6">
      @if (loading()) {
        <app-skeleton [lines]="4" />
      } @else if (profile()) {
        <header class="mb-6">
          <p class="text-sm text-[var(--tg-hint)]">Добро пожаловать</p>
          <h1 class="text-2xl font-bold text-[var(--tg-text)]">
            {{ greeting() }}, {{ profile()!.firstName }}!
          </h1>
        </header>

        <div class="mb-6 grid grid-cols-3 gap-3">
          <div class="rounded-2xl bg-[var(--tg-secondary-bg)] p-3 text-center">
            <p class="text-2xl font-bold text-[var(--tg-button)]">{{ profile()!.streak }}</p>
            <p class="text-xs text-[var(--tg-hint)]">дней подряд</p>
          </div>
          <div class="rounded-2xl bg-[var(--tg-secondary-bg)] p-3 text-center">
            <p class="text-2xl font-bold text-[var(--tg-accent)]">{{ profile()!.xp }}</p>
            <p class="text-xs text-[var(--tg-hint)]">XP</p>
          </div>
          <div class="rounded-2xl bg-[var(--tg-secondary-bg)] p-3 text-center">
            <p class="text-2xl font-bold text-[var(--tg-success)]">
              {{ profile()!.completedLessons }}
            </p>
            <p class="text-xs text-[var(--tg-hint)]">уроков</p>
          </div>
        </div>

        @if (profile()!.continueLesson) {
          <section class="mb-6">
            <h2 class="mb-3 text-lg font-semibold">Продолжить обучение</h2>
            <a [routerLink]="['/lessons', profile()!.continueLesson!.id]">
              <app-card>
                <div class="flex items-center gap-4">
                  <span class="text-3xl">📖</span>
                  <div class="flex-1">
                    <p class="text-xs text-[var(--tg-hint)]">
                      {{ profile()!.continueLesson!.courseTitle }}
                    </p>
                    <p class="font-semibold">{{ profile()!.continueLesson!.title }}</p>
                    <div class="mt-2">
                      <app-progress-bar [value]="40" />
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
            <a routerLink="/courses" class="text-sm text-[var(--tg-link)]">Все курсы</a>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <a routerLink="/courses">
              <app-card>
                <span class="text-2xl">📚</span>
                <p class="mt-2 font-medium">Курсы</p>
                <p class="text-xs text-[var(--tg-hint)]">Выбрать направление</p>
              </app-card>
            </a>
            <a routerLink="/profile">
              <app-card>
                <span class="text-2xl">🏆</span>
                <p class="mt-2 font-medium">Достижения</p>
                <p class="text-xs text-[var(--tg-hint)]">Ваш прогресс</p>
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
  private readonly telegram = inject(TelegramService);

  readonly loading = signal(true);
  readonly profile = signal<UserProfile | null>(null);

  ngOnInit(): void {
    this.api.getProfile().subscribe({
      next: (res: UserProfile) => {
        this.profile.set(res);
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
