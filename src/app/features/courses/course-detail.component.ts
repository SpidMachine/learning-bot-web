import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LEARNING_API } from '../../core/api/learning-api.interface';
import { TelegramService } from '../../core/telegram/telegram.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { CourseDetail } from '../../shared/models/learning.models';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [RouterLink, CardComponent, ProgressBarComponent, SkeletonComponent],
  template: `
    <div class="mx-auto min-h-screen max-w-lg bg-[var(--tg-bg)] px-4 pt-6 pb-8">
      @if (loading()) {
        <app-skeleton [lines]="5" />
      } @else if (course()) {
        <header class="mb-6">
          <button
            type="button"
            class="mb-4 text-sm text-[var(--tg-link)]"
            (click)="goBack()"
          >
            ← Назад
          </button>
          <div class="flex items-center gap-4">
            <span class="text-5xl">{{ course()!.imageEmoji }}</span>
            <div>
              <h1 class="text-2xl font-bold">{{ course()!.title }}</h1>
              <p class="mt-1 text-sm text-[var(--tg-hint)]">{{ course()!.description }}</p>
            </div>
          </div>
          <div class="mt-4">
            <app-progress-bar [value]="course()!.progress" />
            <p class="mt-1 text-xs text-[var(--tg-hint)]">
              {{ course()!.completedLessons }} из {{ course()!.lessonsCount }} уроков завершено
            </p>
          </div>
        </header>

        <section>
          <h2 class="mb-3 text-lg font-semibold">Уроки</h2>
          <div class="space-y-3">
            @for (lesson of course()!.lessons; track lesson.id) {
              <a [routerLink]="['/lessons', lesson.id]">
                <app-card [disabled]="false">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                      [class.bg-[var(--tg-success)]]="lesson.completed"
                      [class.text-white]="lesson.completed"
                      [class.bg-[var(--tg-secondary-bg)]]="!lesson.completed"
                      [class.text-[var(--tg-hint)]]="!lesson.completed"
                    >
                      @if (lesson.completed) {
                        ✓
                      } @else {
                        {{ lesson.order }}
                      }
                    </div>
                    <div class="flex-1">
                      <p class="font-medium">{{ lesson.title }}</p>
                      @if (lesson.quizId) {
                        <p class="text-xs text-[var(--tg-hint)]">С квизом</p>
                      }
                    </div>
                    <span class="text-[var(--tg-button)]">→</span>
                  </div>
                </app-card>
              </a>
            }
          </div>
        </section>
      }
    </div>
  `,
})
export class CourseDetailComponent implements OnInit, OnDestroy {
  private readonly api = inject(LEARNING_API);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly telegram = inject(TelegramService);

  readonly loading = signal(true);
  readonly course = signal<CourseDetail | null>(null);

  ngOnInit(): void {
    const courseId = Number(this.route.snapshot.paramMap.get('id'));

    this.telegram.showBackButton(() => this.goBack());

    this.api.getCourse(courseId).subscribe({
      next: (res: CourseDetail) => {
        this.course.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.telegram.hideBackButton();
  }

  goBack(): void {
    this.router.navigate(['/courses']);
  }
}
