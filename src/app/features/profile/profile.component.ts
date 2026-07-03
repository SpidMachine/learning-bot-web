import { Component, inject, OnInit, signal } from '@angular/core';
import { LEARNING_API } from '../../core/api/learning-api.interface';
import { CardComponent } from '../../shared/components/card/card.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { UserProfile } from '../../shared/models/learning.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CardComponent, SkeletonComponent],
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
          <h1 class="text-2xl font-bold">
            {{ profile()!.firstName }} {{ profile()!.lastName ?? '' }}
          </h1>
          @if (profile()!.username) {
            <p class="text-sm text-[var(--tg-hint)]">{{ formatUsername(profile()!.username!) }}</p>
          }
        </header>

        <div class="mb-6 grid grid-cols-3 gap-3">
          <div class="rounded-2xl bg-[var(--tg-secondary-bg)] p-4 text-center">
            <p class="text-2xl font-bold text-[var(--tg-button)]">{{ profile()!.xp }}</p>
            <p class="text-xs text-[var(--tg-hint)]">XP</p>
          </div>
          <div class="rounded-2xl bg-[var(--tg-secondary-bg)] p-4 text-center">
            <p class="text-2xl font-bold text-[var(--tg-accent)]">{{ profile()!.streak }}</p>
            <p class="text-xs text-[var(--tg-hint)]">Streak</p>
          </div>
          <div class="rounded-2xl bg-[var(--tg-secondary-bg)] p-4 text-center">
            <p class="text-2xl font-bold text-[var(--tg-success)]">
              {{ profile()!.completedLessons }}
            </p>
            <p class="text-xs text-[var(--tg-hint)]">Уроков</p>
          </div>
        </div>

        <section>
          <h2 class="mb-3 text-lg font-semibold">Достижения</h2>
          <div class="space-y-3">
            @for (achievement of profile()!.achievements; track achievement.id) {
              <app-card [disabled]="!achievement.unlocked">
                <div class="flex items-center gap-4">
                  <span class="text-3xl" [class.grayscale]="!achievement.unlocked">
                    {{ achievement.emoji }}
                  </span>
                  <div class="flex-1">
                    <p class="font-semibold">{{ achievement.title }}</p>
                    <p class="text-sm text-[var(--tg-hint)]">{{ achievement.description }}</p>
                  </div>
                  @if (achievement.unlocked) {
                    <span class="text-[var(--tg-success)]">✓</span>
                  } @else {
                    <span class="text-xs text-[var(--tg-hint)]">🔒</span>
                  }
                </div>
              </app-card>
            }
          </div>
        </section>
      }
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  private readonly api = inject(LEARNING_API);

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

  initials(): string {
    const profile = this.profile();

    if (!profile) {
      return '?';
    }

    const first = profile.firstName.charAt(0);
    const last = profile.lastName?.charAt(0) ?? '';

    return (first + last).toUpperCase();
  }

  formatUsername(username: string): string {
    return `@${username}`;
  }
}
