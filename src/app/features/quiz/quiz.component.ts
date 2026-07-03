import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LEARNING_API } from '../../core/api/learning-api.interface';
import { TelegramService } from '../../core/telegram/telegram.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { Quiz, QuizSubmitResult } from '../../shared/models/learning.models';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CardComponent, SkeletonComponent],
  template: `
    <div class="mx-auto min-h-screen max-w-lg bg-[var(--tg-bg)] px-4 pt-6 pb-28">
      @if (loading()) {
        <app-skeleton [lines]="5" />
      } @else if (result()) {
        <div class="flex flex-col items-center py-12 text-center">
          <span class="mb-4 text-6xl">{{ result()!.passed ? '🎉' : '📚' }}</span>
          <h1 class="text-2xl font-bold">
            {{ result()!.passed ? 'Отлично!' : 'Почти получилось' }}
          </h1>
          <p class="mt-2 text-[var(--tg-hint)]">
            Правильных ответов: {{ result()!.score }} из {{ result()!.total }}
          </p>
          <button
            type="button"
            class="mt-8 w-full rounded-xl bg-[var(--tg-button)] py-3 font-medium text-[var(--tg-button-text)]"
            (click)="goHome()"
          >
            На главную
          </button>
        </div>
      } @else if (quiz()) {
        <header class="mb-6">
          <p class="text-sm text-[var(--tg-hint)]">
            Вопрос {{ currentIndex() + 1 }} / {{ quiz()!.questions.length }}
          </p>
          <h1 class="text-xl font-bold">{{ quiz()!.title }}</h1>
        </header>

        <p class="mb-4 text-lg font-medium">{{ currentQuestion()?.text }}</p>

        <div class="space-y-3">
          @for (option of currentQuestion()?.options ?? []; track option.id) {
            <button type="button" (click)="selectOption(option.id)">
              <app-card>
                <div
                  class="flex items-center gap-3"
                  [class.ring-2]="selectedOption() === option.id"
                  [class.ring-[var(--tg-button)]]="selectedOption() === option.id"
                >
                  <div
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium"
                    [class.border-[var(--tg-button)]]="selectedOption() === option.id"
                    [class.bg-[var(--tg-button)]]="selectedOption() === option.id"
                    [class.text-[var(--tg-button-text)]]="selectedOption() === option.id"
                    [class.border-[var(--tg-hint)]]="selectedOption() !== option.id"
                  >
                    {{ option.id }}
                  </div>
                  <span>{{ option.text }}</span>
                </div>
              </app-card>
            </button>
          }
        </div>

        @if (!telegramAvailable()) {
          <div class="fixed bottom-0 left-0 right-0 border-t border-black/5 bg-[var(--tg-bg)] p-4 safe-bottom">
            <button
              type="button"
              class="w-full rounded-xl bg-[var(--tg-button)] py-3 font-medium text-[var(--tg-button-text)] disabled:opacity-50"
              [disabled]="!selectedOption()"
              (click)="submitOrNext()"
            >
              {{ isLastQuestion() ? 'Отправить' : 'Далее' }}
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class QuizComponent implements OnInit, OnDestroy {
  private readonly api = inject(LEARNING_API);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly telegram = inject(TelegramService);

  readonly loading = signal(true);
  readonly quiz = signal<Quiz | null>(null);
  readonly currentIndex = signal(0);
  readonly selectedOption = signal<number | null>(null);
  readonly answers = signal<Record<number, number>>({});
  readonly result = signal<QuizSubmitResult | null>(null);
  readonly telegramAvailable = signal(false);

  ngOnInit(): void {
    this.telegramAvailable.set(this.telegram.isAvailable());
    const quizId = Number(this.route.snapshot.paramMap.get('id'));

    this.telegram.showBackButton(() => this.router.navigate(['/courses']));

    this.api.getQuiz(quizId).subscribe({
      next: (res: Quiz) => {
        this.quiz.set(res);
        this.loading.set(false);
        this.updateMainButton();
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.telegram.hideMainButton();
    this.telegram.hideBackButton();
  }

  currentQuestion() {
    return this.quiz()?.questions[this.currentIndex()] ?? null;
  }

  isLastQuestion(): boolean {
    const quiz = this.quiz();
    return quiz ? this.currentIndex() >= quiz.questions.length - 1 : false;
  }

  selectOption(optionId: number): void {
    this.selectedOption.set(optionId);
    this.telegram.hapticImpact('light');
    this.updateMainButton();
  }

  submitOrNext(): void {
    const question = this.currentQuestion();
    const selected = this.selectedOption();

    if (!question || !selected) {
      return;
    }

    this.answers.update((current) => ({
      ...current,
      [question.id]: selected,
    }));

    if (!this.isLastQuestion()) {
      this.currentIndex.update((index) => index + 1);
      this.selectedOption.set(this.answers()[this.currentQuestion()?.id ?? 0] ?? null);
      this.updateMainButton();
      return;
    }

    this.submitQuiz();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  private updateMainButton(): void {
    if (!this.telegram.isAvailable()) {
      return;
    }

    const text = this.isLastQuestion() ? 'Отправить' : 'Далее';
    this.telegram.showMainButton(text, () => this.submitOrNext());

    if (this.selectedOption()) {
      this.telegram.showMainButton(text, () => this.submitOrNext());
    }
  }

  private submitQuiz(): void {
    const quiz = this.quiz();

    if (!quiz) {
      return;
    }

    this.telegram.setMainButtonLoading(true);

    this.api.submitQuiz(quiz.id, { answers: this.answers() }).subscribe({
      next: (res: QuizSubmitResult) => {
        this.telegram.setMainButtonLoading(false);
        this.telegram.hideMainButton();

        if (res.passed) {
          this.telegram.hapticSuccess();
        } else {
          this.telegram.hapticError();
        }

        this.result.set(res);
      },
      error: () => {
        this.telegram.setMainButtonLoading(false);
        this.telegram.hapticError();
      },
    });
  }
}
