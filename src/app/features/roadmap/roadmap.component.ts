import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LEARNING_API } from '../../core/api/learning-api.interface';
import { roadmapStatusLabel } from '../../core/api/next-action.util';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { Roadmap, RoadmapNode } from '../../shared/models/learning.models';

@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [SkeletonComponent, EmptyStateComponent, DecimalPipe, ProgressBarComponent],
  template: `
    <div class="roadmap-page min-h-screen pb-28">
      @if (loading()) {
        <div class="px-4 pt-6">
          <app-skeleton [lines]="6" />
        </div>
      } @else if (error()) {
        <div class="px-4 pt-6">
          <app-empty-state
            emoji="⚠️"
            title="Не удалось загрузить роудмап"
            [description]="error()!"
          />
        </div>
      } @else if (roadmap()) {
        <header class="roadmap-header px-4 pb-6 pt-6 text-center">
          <p class="text-xs font-semibold uppercase tracking-widest text-[var(--tg-hint)]">
            Learning Path
          </p>
          <h1 class="mt-2 text-2xl font-bold text-[var(--tg-text)]">
            {{ roadmap()!.title ?? 'Роудмап' }}
          </h1>
          @if (roadmap()!.subtitle) {
            <p class="mt-2 text-sm text-[var(--tg-hint)]">{{ roadmap()!.subtitle }}</p>
          }
        </header>

        <div class="relative px-4">
          <div class="road-line" aria-hidden="true"></div>

          @if (roadmap()!.nodes.length === 0) {
            <app-empty-state
              emoji="🗺️"
              title="Темы пока не настроены"
              description="Загляните позже — контент скоро появится"
            />
          }

          @for (node of roadmap()!.nodes; track node.key; let i = $index) {
            <div class="node-row mb-5 flex gap-3">
              <div class="node-track shrink-0">
                <div
                  class="node-pin"
                  [class.node-pin--completed]="node.status === 'completed'"
                  [class.node-pin--active]="node.status === 'in_progress'"
                  [class.node-pin--available]="node.status === 'available'"
                >
                  @if (node.status === 'completed') {
                    <span>✓</span>
                  } @else {
                    <span>{{ node.emoji }}</span>
                  }
                </div>
                @if (i < roadmap()!.nodes.length - 1) {
                  <div class="node-connector"></div>
                }
              </div>

              <button type="button" class="node-card flex-1 text-left" (click)="openTopic(node)">
                <div class="node-card__inner">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0 flex-1">
                      <p class="text-[10px] font-bold uppercase tracking-wider text-[var(--tg-hint)]">
                        {{ statusLabel(node.status) }}
                      </p>
                      <h2 class="text-base font-bold leading-tight">{{ node.title }}</h2>
                    </div>
                    <span class="text-2xl">{{ node.emoji }}</span>
                  </div>

                  <div class="mt-3">
                    <div class="mb-1 flex justify-between text-xs text-[var(--tg-hint)]">
                      <span>Прогресс</span>
                      <span>{{ node.percent | number: '1.0-0' }}%</span>
                    </div>
                    <app-progress-bar [value]="node.percent" />
                  </div>

                  @if (node.subtopicCount !== undefined) {
                    <p class="mt-2 text-xs text-[var(--tg-hint)]">
                      Подтем: {{ node.completedSubtopics ?? 0 }} / {{ node.subtopicCount }}
                    </p>
                  }

                  @if (node.currentSubtopicKey) {
                    <p class="mt-1 text-xs font-medium text-[var(--tg-button)]">
                      Текущая: {{ node.currentSubtopicKey }}
                    </p>
                  }
                </div>
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .roadmap-page {
      background:
        radial-gradient(ellipse at 20% 0%, rgba(99, 102, 241, 0.12), transparent 50%),
        var(--tg-bg);
    }

    .roadmap-header {
      background: linear-gradient(180deg, rgba(99, 102, 241, 0.06) 0%, transparent 100%);
    }

    .road-line {
      position: absolute;
      left: 1.65rem;
      top: 0;
      bottom: 2rem;
      width: 3px;
      border-radius: 999px;
      background: repeating-linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.12) 0,
        rgba(255, 255, 255, 0.12) 8px,
        transparent 8px,
        transparent 16px
      );
      opacity: 0.6;
    }

    .node-track {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 2.5rem;
      position: relative;
      z-index: 1;
    }

    .node-pin {
      display: flex;
      height: 2.5rem;
      width: 2.5rem;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      font-size: 1rem;
      font-weight: 700;
      color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .node-pin--completed {
      background: #22c55e;
    }

    .node-pin--active {
      background: #3b82f6;
      animation: pulse-node 2s ease-in-out infinite;
    }

    .node-pin--available {
      background: #6366f1;
    }

    .node-connector {
      width: 3px;
      flex: 1;
      min-height: 1.25rem;
      margin: 0.25rem 0;
      border-radius: 999px;
      background: rgba(99, 102, 241, 0.35);
    }

    .node-card {
      border-radius: 1rem;
      border: 2px solid rgba(99, 102, 241, 0.25);
      background: var(--tg-secondary-bg);
      transition: transform 0.15s ease;
    }

    .node-card:active {
      transform: scale(0.98);
    }

    .node-card__inner {
      padding: 0.875rem;
    }

    @keyframes pulse-node {
      0%,
      100% {
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.35);
      }
      50% {
        box-shadow: 0 0 0 8px transparent;
      }
    }
  `,
})
export class RoadmapComponent implements OnInit {
  private readonly api = inject(LEARNING_API);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly roadmap = signal<Roadmap | null>(null);
  readonly statusLabel = roadmapStatusLabel;

  ngOnInit(): void {
    this.api.getRoadmap().subscribe({
      next: (res: Roadmap) => {
        this.roadmap.set(res);
        this.loading.set(false);
        this.error.set(null);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Проверьте, что бэкенд запущен и эндпоинт /api/v1/roadmap доступен.');
      },
    });
  }

  openTopic(node: RoadmapNode): void {
    this.router.navigate(['/topics', node.key]);
  }
}
