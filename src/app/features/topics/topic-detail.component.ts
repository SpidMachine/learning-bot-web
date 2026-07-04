import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LEARNING_API } from '../../core/api/learning-api.interface';
import { CardComponent } from '../../shared/components/card/card.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { Topic } from '../../shared/models/learning.models';

@Component({
  selector: 'app-topic-detail',
  standalone: true,
  imports: [CardComponent, SkeletonComponent],
  template: `
    <div class="mx-auto min-h-screen max-w-lg bg-[var(--tg-bg)] px-4 pt-6 pb-8">
      @if (loading()) {
        <app-skeleton [lines]="4" />
      } @else if (topic()) {
        <header class="mb-6">
          <button type="button" class="mb-4 text-sm text-[var(--tg-link)]" (click)="goBack()">
            ← Назад
          </button>
          <div class="flex items-center gap-4">
            <span class="text-5xl">{{ topic()!.emoji }}</span>
            <div>
              <h1 class="text-2xl font-bold">{{ topic()!.title }}</h1>
              @if (topic()!.answered) {
                <p class="mt-1 text-sm text-[var(--tg-hint)]">
                  {{ topic()!.correct }} / {{ topic()!.answered }} верных ответов
                </p>
              }
            </div>
          </div>
        </header>

        <app-card>
          <p class="mb-4 text-sm text-[var(--tg-hint)]">
            Сессия из 5 вопросов по теме «{{ topic()!.title }}»
          </p>
          <button
            type="button"
            class="w-full rounded-xl bg-[var(--tg-button)] py-3 font-medium text-[var(--tg-button-text)] disabled:opacity-50"
            [disabled]="starting()"
            (click)="startSession()"
          >
            {{ starting() ? 'Запуск...' : 'Начать сессию' }}
          </button>
        </app-card>
      }
    </div>
  `,
})
export class TopicDetailComponent implements OnInit {
  private readonly api = inject(LEARNING_API);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly starting = signal(false);
  readonly topic = signal<Topic | null>(null);

  ngOnInit(): void {
    const topicKey = this.route.snapshot.paramMap.get('key') ?? '';

    this.api.getTopics().subscribe({
      next: (topics: Topic[]) => {
        this.topic.set(topics.find((item) => item.key === topicKey) ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  startSession(): void {
    const topic = this.topic();

    if (!topic) {
      return;
    }

    this.starting.set(true);

    this.api.startSession({ mode: 'quiz', topic: topic.key }).subscribe({
      next: () => {
        this.starting.set(false);
        this.router.navigate(['/session']);
      },
      error: () => {
        this.starting.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/topics']);
  }
}
