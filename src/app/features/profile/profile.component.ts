import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { LEARNING_API } from '../../core/api/learning-api.interface';
import { CardComponent } from '../../shared/components/card/card.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { ProfileView } from '../../shared/models/learning.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CardComponent, SkeletonComponent, DecimalPipe],
  template: `
    <div class="px-4 pt-6">
      @if (loading()) {
        <app-skeleton [lines]="5" />
      } @else if (profile()) {
        <header class="mb-6 text-center">
          <div
            class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--tg-button)] text-3xl font-bold text-[var(--tg-button-text)]"
          >
            {{ initials() }}
          </div>
          <h1 class="text-2xl font-bold">{{ profile()!.me.firstName }}</h1>
          @if (profile()!.me.username) {
            <p class="text-sm text-[var(--tg-hint)]">
              {{ formatUsername(profile()!.me.username!) }}
            </p>
          }
        </header>

        <div class="mb-6 grid grid-cols-3 gap-3">
          <div class="rounded-2xl bg-[var(--tg-secondary-bg)] p-4 text-center">
            <p class="text-2xl font-bold text-[var(--tg-button)]">
              {{ profile()!.stats.totalAnswered }}
            </p>
            <p class="text-xs text-[var(--tg-hint)]">Ответов</p>
          </div>
          <div class="rounded-2xl bg-[var(--tg-secondary-bg)] p-4 text-center">
            <p class="text-2xl font-bold text-[var(--tg-accent)]">
              {{ profile()!.stats.accuracy | number: '1.0-0' }}%
            </p>
            <p class="text-xs text-[var(--tg-hint)]">Точность</p>
          </div>
          <div class="rounded-2xl bg-[var(--tg-secondary-bg)] p-4 text-center">
            <p class="text-2xl font-bold text-[var(--tg-success)]">
              {{ profile()!.stats.streakDays }}
            </p>
            <p class="text-xs text-[var(--tg-hint)]">Streak</p>
          </div>
        </div>

        <div class="mb-6 rounded-2xl bg-[var(--tg-secondary-bg)] p-4">
          <div class="mb-2 flex justify-between text-sm">
            <span class="text-[var(--tg-hint)]">Цель на неделю</span>
            <span>
              {{ profile()!.stats.weekAnswered }} / {{ profile()!.stats.weeklyGoal }}
            </span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-black/10">
            <div
              class="h-full rounded-full bg-[var(--tg-button)]"
              [style.width.%]="weeklyProgress()"
            ></div>
          </div>
        </div>

        <section>
          <h2 class="mb-3 text-lg font-semibold">Достижения</h2>
          @if (profile()!.achievements.length === 0) {
            <p class="text-sm text-[var(--tg-hint)]">Пока нет достижений — отвечайте на вопросы!</p>
          } @else {
            <div class="space-y-3">
              @for (achievement of profile()!.achievements; track achievement) {
                <app-card>
                  <div class="flex items-center gap-4">
                    <span class="text-2xl">🏆</span>
                    <p class="font-medium">{{ achievement }}</p>
                  </div>
                </app-card>
              }
            </div>
          }
        </section>
      }
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  private readonly api = inject(LEARNING_API);

  readonly loading = signal(true);
  readonly profile = signal<ProfileView | null>(null);

  ngOnInit(): void {
    this.api.getProfile().subscribe({
      next: (res: ProfileView) => {
        this.profile.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  initials(): string {
    const profile = this.profile();

    if (!profile) {
      return '?';
    }

    return profile.me.firstName.charAt(0).toUpperCase();
  }

  formatUsername(username: string): string {
    return `@${username}`;
  }

  weeklyProgress(): number {
    const profile = this.profile();

    if (!profile || profile.stats.weeklyGoal === 0) {
      return 0;
    }

    return Math.min(100, (profile.stats.weekAnswered / profile.stats.weeklyGoal) * 100);
  }
}
