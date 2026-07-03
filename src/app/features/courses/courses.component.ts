import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LEARNING_API } from '../../core/api/learning-api.interface';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { Course } from '../../shared/models/learning.models';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [RouterLink, CardComponent, ProgressBarComponent, SkeletonComponent, EmptyStateComponent],
  template: `
    <div class="px-4 pt-6">
      <header class="mb-6">
        <h1 class="text-2xl font-bold">Курсы</h1>
        <p class="text-sm text-[var(--tg-hint)]">Выберите направление для обучения</p>
      </header>

      @if (loading()) {
        @for (item of [1, 2, 3]; track item) {
          <div class="mb-4">
            <app-skeleton [lines]="3" />
          </div>
        }
      } @else if (courses().length === 0) {
        <app-empty-state
          emoji="📚"
          title="Курсы пока недоступны"
          description="Загляните позже — контент скоро появится"
        />
      } @else {
        <div class="space-y-4">
          @for (course of courses(); track course.id) {
            <a [routerLink]="['/courses', course.id]">
              <app-card>
                <div class="flex gap-4">
                  <span class="text-4xl">{{ course.imageEmoji }}</span>
                  <div class="flex-1">
                    <h2 class="font-semibold">{{ course.title }}</h2>
                    <p class="mt-1 text-sm text-[var(--tg-hint)] line-clamp-2">
                      {{ course.description }}
                    </p>
                    <div class="mt-3">
                      <div class="mb-1 flex justify-between text-xs text-[var(--tg-hint)]">
                        <span>
                          {{ course.completedLessons }} / {{ course.lessonsCount }} уроков
                        </span>
                        <span>{{ course.progress }}%</span>
                      </div>
                      <app-progress-bar [value]="course.progress" />
                    </div>
                  </div>
                </div>
              </app-card>
            </a>
          }
        </div>
      }
    </div>
  `,
})
export class CoursesComponent implements OnInit {
  private readonly api = inject(LEARNING_API);

  readonly loading = signal(true);
  readonly courses = signal<Course[]>([]);

  ngOnInit(): void {
    this.api.getCourses().subscribe({
      next: (res: Course[]) => {
        this.courses.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
