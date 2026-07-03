import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LEARNING_API } from '../../core/api/learning-api.interface';
import { TelegramService } from '../../core/telegram/telegram.service';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { Lesson } from '../../shared/models/learning.models';

@Component({
  selector: 'app-lesson',
  standalone: true,
  imports: [SkeletonComponent],
  template: `
    <div class="mx-auto min-h-screen max-w-lg bg-[var(--tg-bg)] px-4 pt-6 pb-28">
      @if (loading()) {
        <app-skeleton [lines]="6" />
      } @else if (lesson()) {
        <header class="mb-6">
          <p class="text-sm text-[var(--tg-hint)]">Урок {{ currentStep() + 1 }} / {{ totalSteps() }}</p>
          <h1 class="text-2xl font-bold">{{ lesson()!.title }}</h1>
        </header>

        <article class="prose-lesson">
          <p class="text-base leading-relaxed text-[var(--tg-text)] whitespace-pre-wrap">
            {{ currentContent() }}
          </p>
        </article>

        @if (!telegramAvailable()) {
          <div class="fixed bottom-0 left-0 right-0 border-t border-black/5 bg-[var(--tg-bg)] p-4 safe-bottom">
            <div class="mx-auto flex max-w-lg gap-3">
              @if (currentStep() > 0) {
                <button
                  type="button"
                  class="flex-1 rounded-xl bg-[var(--tg-secondary-bg)] py-3 font-medium"
                  (click)="prevStep()"
                >
                  Назад
                </button>
              }
              <button
                type="button"
                class="flex-1 rounded-xl bg-[var(--tg-button)] py-3 font-medium text-[var(--tg-button-text)]"
                (click)="nextStep()"
              >
                {{ isLastStep() ? 'Завершить' : 'Далее' }}
              </button>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class LessonComponent implements OnInit, OnDestroy {
  private readonly api = inject(LEARNING_API);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly telegram = inject(TelegramService);

  readonly loading = signal(true);
  readonly lesson = signal<Lesson | null>(null);
  readonly currentStep = signal(0);
  readonly telegramAvailable = signal(false);

  ngOnInit(): void {
    this.telegramAvailable.set(this.telegram.isAvailable());
    const lessonId = Number(this.route.snapshot.paramMap.get('id'));

    this.telegram.showBackButton(() => this.router.navigate(['/courses', this.lesson()?.courseId ?? 1]));

    this.api.getLesson(lessonId).subscribe({
      next: (res: Lesson) => {
        this.lesson.set(res);
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

  totalSteps(): number {
    return this.lesson()?.content.length ?? 0;
  }

  currentContent(): string {
    const lesson = this.lesson();

    if (!lesson) {
      return '';
    }

    return lesson.content[this.currentStep()] ?? '';
  }

  isLastStep(): boolean {
    return this.currentStep() >= this.totalSteps() - 1;
  }

  prevStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update((step) => step - 1);
      this.telegram.hapticImpact('light');
      this.updateMainButton();
    }
  }

  nextStep(): void {
    if (!this.isLastStep()) {
      this.currentStep.update((step) => step + 1);
      this.telegram.hapticImpact('light');
      this.updateMainButton();
      return;
    }

    this.completeLesson();
  }

  private updateMainButton(): void {
    if (!this.telegram.isAvailable()) {
      return;
    }

    const text = this.isLastStep() ? 'Завершить урок' : 'Далее';
    this.telegram.showMainButton(text, () => this.nextStep());
  }

  private completeLesson(): void {
    const lesson = this.lesson();

    if (!lesson) {
      return;
    }

    this.telegram.setMainButtonLoading(true);

    this.api.completeLesson(lesson.id).subscribe({
      next: () => {
        this.telegram.setMainButtonLoading(false);
        this.telegram.hapticSuccess();

        if (lesson.quizId) {
          this.router.navigate(['/quizzes', lesson.quizId]);
          return;
        }

        if (lesson.nextLessonId) {
          this.router.navigate(['/lessons', lesson.nextLessonId]);
          return;
        }

        this.router.navigate(['/courses', lesson.courseId]);
      },
      error: () => {
        this.telegram.setMainButtonLoading(false);
        this.telegram.hapticError();
      },
    });
  }
}
