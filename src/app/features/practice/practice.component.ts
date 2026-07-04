import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LEARNING_API } from '../../core/api/learning-api.interface';
import { TelegramService } from '../../core/telegram/telegram.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { AnswerResult, Question } from '../../shared/models/learning.models';

@Component({
  selector: 'app-practice',
  standalone: true,
  imports: [CardComponent, SkeletonComponent, EmptyStateComponent],
  template: `
    <div class="mx-auto min-h-screen max-w-lg bg-[var(--tg-bg)] px-4 pt-6 pb-28">
      @if (loading()) {
        <app-skeleton [lines]="5" />
      } @else if (empty()) {
        <app-empty-state
          emoji="🔁"
          title="Нет вопросов на повторение"
          description="Ответьте на больше вопросов — они появятся в очереди spaced repetition"
        />
        <button
          type="button"
          class="mt-6 w-full rounded-xl bg-[var(--tg-button)] py-3 font-medium text-[var(--tg-button-text)]"
          (click)="goHome()"
        >
          На главную
        </button>
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
          </app-card>
          @if (!telegramAvailable()) {
            <button
              type="button"
              class="mt-6 w-full rounded-xl bg-[var(--tg-button)] py-3 font-medium text-[var(--tg-button-text)]"
              (click)="loadNext()"
            >
              Следующий вопрос
            </button>
          }
        </div>
      } @else if (question()) {
        <header class="mb-6">
          <p class="text-sm text-[var(--tg-hint)]">Повторение</p>
          <h1 class="text-xl font-bold">Вопрос на закрепление</h1>
        </header>

        @if (question()!.snippet) {
          <pre
            class="mb-4 overflow-x-auto rounded-xl bg-[var(--tg-secondary-bg)] p-3 text-xs"
          >{{ question()!.snippet }}</pre>
        }

        <p class="mb-4 text-lg font-medium">{{ question()!.text }}</p>

        <div class="space-y-3">
          @for (option of question()!.options; track $index) {
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
export class PracticeComponent implements OnInit, OnDestroy {
  private readonly api = inject(LEARNING_API);
  private readonly router = inject(Router);
  private readonly telegram = inject(TelegramService);

  readonly loading = signal(true);
  readonly empty = signal(false);
  readonly question = signal<Question | null>(null);
  readonly selectedIndex = signal<number | null>(null);
  readonly submitting = signal(false);
  readonly answerResult = signal<AnswerResult | null>(null);
  readonly telegramAvailable = signal(false);

  ngOnInit(): void {
    this.telegramAvailable.set(this.telegram.isAvailable());
    this.telegram.showBackButton(() => this.router.navigate(['/']));
    this.loadQuestion();
  }

  ngOnDestroy(): void {
    this.telegram.hideMainButton();
    this.telegram.hideBackButton();
  }

  selectOption(index: number): void {
    this.selectedIndex.set(index);
    this.telegram.hapticImpact('light');
    this.updateMainButton();
  }

  submitAnswer(): void {
    const question = this.question();
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

        this.answerResult.set(res);
        this.updateMainButtonForNext();
      },
      error: () => {
        this.submitting.set(false);
        this.telegram.setMainButtonLoading(false);
        this.telegram.hapticError();
      },
    });
  }

  loadNext(): void {
    this.answerResult.set(null);
    this.selectedIndex.set(null);
    this.loadQuestion();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  private loadQuestion(): void {
    this.loading.set(true);
    this.empty.set(false);

    this.api.getReviewQuiz().subscribe({
      next: (res: Question) => {
        this.question.set(res);
        this.loading.set(false);
        this.updateMainButton();
      },
      error: (error) => {
        this.loading.set(false);

        if (error.status === 404) {
          this.empty.set(true);
          return;
        }
      },
    });
  }

  private updateMainButton(): void {
    if (!this.telegram.isAvailable() || this.answerResult()) {
      return;
    }

    this.telegram.showMainButton('Ответить', () => this.submitAnswer());
  }

  private updateMainButtonForNext(): void {
    if (!this.telegram.isAvailable()) {
      return;
    }

    this.telegram.showMainButton('Следующий вопрос', () => this.loadNext());
  }
}
