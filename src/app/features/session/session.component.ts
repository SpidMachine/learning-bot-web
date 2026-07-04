import { DecimalPipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LEARNING_API } from '../../core/api/learning-api.interface';
import { TelegramService } from '../../core/telegram/telegram.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { AnswerResult, Question, Session } from '../../shared/models/learning.models';

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [
    CardComponent,
    SkeletonComponent,
    ProgressBarComponent,
    EmptyStateComponent,
    DecimalPipe,
  ],
  template: `
    <div class="mx-auto min-h-screen max-w-lg bg-[var(--tg-bg)] px-4 pt-6 pb-28">
      @if (loading()) {
        <app-skeleton [lines]="5" />
      } @else if (!session()) {
        <app-empty-state
          emoji="🎯"
          title="Нет активной сессии"
          description="Выберите тему и начните сессию из 5 вопросов"
        />
        <button
          type="button"
          class="mt-6 w-full rounded-xl bg-[var(--tg-button)] py-3 font-medium text-[var(--tg-button-text)]"
          (click)="goTopics()"
        >
          К темам
        </button>
      } @else if (session()!.finished) {
        <div class="flex flex-col items-center py-12 text-center">
          <span class="mb-4 text-6xl">🎉</span>
          <h1 class="text-2xl font-bold">Сессия завершена</h1>
          <p class="mt-2 text-[var(--tg-hint)]">
            Правильных ответов: {{ session()!.correctCount }} из {{ session()!.total }}
          </p>
          @if (newAchievements().length > 0) {
            <div class="mt-6 w-full rounded-2xl bg-[var(--tg-secondary-bg)] p-4 text-left">
              <p class="mb-2 text-sm font-semibold">Новые достижения</p>
              @for (achievement of newAchievements(); track achievement) {
                <p class="text-sm">🏆 {{ achievement }}</p>
              }
            </div>
          }
          <button
            type="button"
            class="mt-8 w-full rounded-xl bg-[var(--tg-button)] py-3 font-medium text-[var(--tg-button-text)]"
            (click)="goHome()"
          >
            На главную
          </button>
        </div>
      } @else if (answerResult()) {
        <div class="py-6">
          <div class="mb-6 text-center">
            <span class="text-5xl">{{ answerResult()!.correct ? '✅' : '❌' }}</span>
            <h1 class="mt-4 text-xl font-bold">
              {{ answerResult()!.correct ? 'Верно!' : 'Неверно' }}
            </h1>
          </div>
          <app-card>
            <p class="text-sm leading-relaxed">{{ answerResult()!.explanation }}</p>
            @if (answerResult()!.extendedExplanation) {
              <p class="mt-3 text-sm text-[var(--tg-hint)]">
                {{ answerResult()!.extendedExplanation }}
              </p>
            }
          </app-card>
          @if (!telegramAvailable()) {
            <button
              type="button"
              class="mt-6 w-full rounded-xl bg-[var(--tg-button)] py-3 font-medium text-[var(--tg-button-text)]"
              (click)="continueAfterAnswer()"
            >
              Далее
            </button>
          }
        </div>
      } @else if (currentQuestion()) {
        <header class="mb-6">
          <p class="text-sm text-[var(--tg-hint)]">
            Вопрос {{ session()!.currentIndex }} / {{ session()!.total }}
          </p>
          <div class="mt-2">
            <app-progress-bar
              [value]="((session()!.currentIndex - 1) / session()!.total) * 100"
            />
          </div>
          <p class="mt-1 text-xs text-[var(--tg-hint)]">
            Верно: {{ session()!.correctCount }} · Точность сессии
            {{ sessionAccuracy() | number: '1.0-0' }}%
          </p>
        </header>

        @if (currentQuestion()!.snippet) {
          <pre
            class="mb-4 overflow-x-auto rounded-xl bg-[var(--tg-secondary-bg)] p-3 text-xs"
          >{{ currentQuestion()!.snippet }}</pre>
        }

        <p class="mb-4 text-lg font-medium">{{ currentQuestion()!.text }}</p>

        <div class="space-y-3">
          @for (option of currentQuestion()!.options; track $index) {
            <button type="button" (click)="selectOption($index)">
              <app-card>
                <div
                  class="flex items-center gap-3"
                  [class.ring-2]="selectedIndex() === $index"
                  [class.ring-[var(--tg-button)]]="selectedIndex() === $index"
                >
                  <div
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium"
                    [class.border-[var(--tg-button)]]="selectedIndex() === $index"
                    [class.bg-[var(--tg-button)]]="selectedIndex() === $index"
                    [class.text-[var(--tg-button-text)]]="selectedIndex() === $index"
                    [class.border-[var(--tg-hint)]]="selectedIndex() !== $index"
                  >
                    {{ $index + 1 }}
                  </div>
                  <span>{{ option }}</span>
                </div>
              </app-card>
            </button>
          }
        </div>

        @if (!telegramAvailable()) {
          <div
            class="fixed bottom-0 left-0 right-0 border-t border-black/5 bg-[var(--tg-bg)] p-4 safe-bottom"
          >
            <button
              type="button"
              class="w-full rounded-xl bg-[var(--tg-button)] py-3 font-medium text-[var(--tg-button-text)] disabled:opacity-50"
              [disabled]="selectedIndex() === null || submitting()"
              (click)="submitAnswer()"
            >
              {{ submitting() ? 'Проверка...' : 'Ответить' }}
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class SessionComponent implements OnInit, OnDestroy {
  private readonly api = inject(LEARNING_API);
  private readonly router = inject(Router);
  private readonly telegram = inject(TelegramService);

  readonly loading = signal(true);
  readonly session = signal<Session | null>(null);
  readonly selectedIndex = signal<number | null>(null);
  readonly submitting = signal(false);
  readonly answerResult = signal<AnswerResult | null>(null);
  readonly newAchievements = signal<string[]>([]);
  readonly telegramAvailable = signal(false);

  ngOnInit(): void {
    this.telegramAvailable.set(this.telegram.isAvailable());
    this.telegram.showBackButton(() => this.router.navigate(['/topics']));
    this.loadSession();
  }

  ngOnDestroy(): void {
    this.telegram.hideMainButton();
    this.telegram.hideBackButton();
  }

  currentQuestion(): Question | undefined {
    return this.session()?.currentQuestion;
  }

  sessionAccuracy(): number {
    const session = this.session();

    if (!session || session.currentIndex <= 1) {
      return session?.correctCount ? 100 : 0;
    }

    return (session.correctCount / (session.currentIndex - 1)) * 100;
  }

  selectOption(index: number): void {
    this.selectedIndex.set(index);
    this.telegram.hapticImpact('light');
    this.updateMainButton();
  }

  submitAnswer(): void {
    const question = this.currentQuestion();
    const selected = this.selectedIndex();

    if (!question || selected === null || this.submitting()) {
      return;
    }

    this.submitting.set(true);
    this.telegram.setMainButtonLoading(true);

    this.api.submitAnswer(question.id, selected).subscribe({
      next: (res: AnswerResult) => {
        this.submitting.set(false);
        this.telegram.setMainButtonLoading(false);
        this.telegram.hideMainButton();

        if (res.correct) {
          this.telegram.hapticSuccess();
        } else {
          this.telegram.hapticError();
        }

        if (res.newAchievements?.length) {
          this.newAchievements.update((items) => [...items, ...res.newAchievements!]);
        }

        this.answerResult.set(res);
        this.updateMainButtonForContinue();
      },
      error: () => {
        this.submitting.set(false);
        this.telegram.setMainButtonLoading(false);
        this.telegram.hapticError();
      },
    });
  }

  continueAfterAnswer(): void {
    this.answerResult.set(null);
    this.selectedIndex.set(null);
    this.loadSession();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  goTopics(): void {
    this.router.navigate(['/topics']);
  }

  private loadSession(): void {
    this.loading.set(true);

    this.api.getCurrentSession().subscribe({
      next: (res: Session | null) => {
        this.session.set(res);
        this.loading.set(false);
        this.updateMainButton();
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private updateMainButton(): void {
    if (!this.telegram.isAvailable() || this.answerResult()) {
      return;
    }

    const canSubmit = this.selectedIndex() !== null && !this.submitting();
    this.telegram.showMainButton('Ответить', () => this.submitAnswer());

    if (!canSubmit) {
      this.telegram.hideMainButton();
      this.telegram.showMainButton('Ответить', () => this.submitAnswer());
    }
  }

  private updateMainButtonForContinue(): void {
    if (!this.telegram.isAvailable()) {
      return;
    }

    this.telegram.showMainButton('Далее', () => this.continueAfterAnswer());
  }
}
