import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LEARNING_API } from '../../core/api/learning-api.interface';
import { startSubtopicSession } from '../../core/api/next-action.util';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { SubtopicCardComponent } from '../../shared/components/subtopic-card/subtopic-card.component';
import { SubtopicRoadmapNode, TopicDetail, TopicRoadmap } from '../../shared/models/learning.models';

@Component({
  selector: 'app-topic-detail',
  standalone: true,
  imports: [
    SkeletonComponent,
    EmptyStateComponent,
    ProgressBarComponent,
    SubtopicCardComponent,
    DecimalPipe,
  ],
  template: `
    <div class="mx-auto min-h-screen max-w-lg bg-[var(--tg-bg)] px-4 pt-6 pb-8">
      @if (loading()) {
        <app-skeleton [lines]="6" />
      } @else if (error()) {
        <app-empty-state emoji="⚠️" title="Тема не найдена" [description]="error()!" />
      } @else if (detail() && roadmap()) {
        <header class="mb-6">
          <button type="button" class="mb-4 text-sm text-[var(--tg-link)]" (click)="goBack()">
            ← Назад к роудмапу
          </button>
          <div class="flex items-center gap-4">
            <span class="text-5xl">{{ detail()!.emoji }}</span>
            <div class="flex-1">
              <h1 class="text-2xl font-bold">{{ detail()!.title }}</h1>
              <div class="mt-3">
                <div class="mb-1 flex justify-between text-xs text-[var(--tg-hint)]">
                  <span>Общий прогресс</span>
                  <span>{{ detail()!.overallPercent | number: '1.0-0' }}%</span>
                </div>
                <app-progress-bar [value]="detail()!.overallPercent" />
              </div>
              @if (detail()!.subtopicCount !== undefined) {
                <p class="mt-2 text-sm text-[var(--tg-hint)]">
                  Подтем: {{ detail()!.completedSubtopics ?? 0 }} / {{ detail()!.subtopicCount }}
                </p>
              }
            </div>
          </div>
        </header>

        <section>
          <h2 class="mb-3 text-lg font-semibold">Подтемы</h2>

          @if (roadmap()!.subtopics.length === 0) {
            <app-empty-state
              emoji="📖"
              title="Подтемы скоро появятся"
              description="Контент для этой темы в разработке"
            />
          } @else {
            <div class="space-y-4">
              @for (subtopic of roadmap()!.subtopics; track subtopic.key) {
                <app-subtopic-card
                  [subtopic]="subtopic"
                  [actionLoading]="startingKey() === subtopic.key"
                  (action)="onSubtopicAction($event)"
                />
              }
            </div>
          }
        </section>
      }
    </div>
  `,
})
export class TopicDetailComponent implements OnInit {
  private readonly api = inject(LEARNING_API);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly startingKey = signal<string | null>(null);
  readonly detail = signal<TopicDetail | null>(null);
  readonly roadmap = signal<TopicRoadmap | null>(null);

  private topicKey = '';

  ngOnInit(): void {
    this.topicKey = this.route.snapshot.paramMap.get('key') ?? '';

    forkJoin({
      detail: this.api.getTopicDetail(this.topicKey),
      roadmap: this.api.getTopicRoadmap(this.topicKey),
    }).subscribe({
      next: ({ detail, roadmap }) => {
        this.detail.set(detail);
        this.roadmap.set(roadmap);
        this.loading.set(false);
        this.error.set(null);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Не удалось загрузить тему. Проверьте API /topics/{key}.');
      },
    });
  }

  onSubtopicAction(subtopic: SubtopicRoadmapNode): void {
    if (subtopic.status === 'locked') {
      return;
    }

    this.startingKey.set(subtopic.key);

    startSubtopicSession(this.api, this.router, this.topicKey, subtopic.key, {
      onError: (message: string) => {
        this.startingKey.set(null);
        this.error.set(message);
      },
      onFinally: () => {
        this.startingKey.set(null);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/roadmap']);
  }
}
