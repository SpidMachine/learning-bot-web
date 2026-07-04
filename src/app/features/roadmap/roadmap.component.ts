import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LEARNING_API } from '../../core/api/learning-api.interface';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { Roadmap, RoadmapStage } from '../../shared/models/learning.models';

@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [SkeletonComponent, EmptyStateComponent, DecimalPipe],
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
          <h1 class="mt-2 text-2xl font-bold text-[var(--tg-text)]">{{ roadmap()!.title }}</h1>
          @if (roadmap()!.subtitle) {
            <p class="mt-2 text-sm text-[var(--tg-hint)]">{{ roadmap()!.subtitle }}</p>
          }
          <div class="motivation-badge mx-auto mt-4 max-w-xs rounded-2xl border border-dashed border-white/20 px-4 py-2 text-xs text-[var(--tg-hint)]">
            ✨ Шаг за шагом. Наслаждайся путём!
          </div>
        </header>

        <div class="relative px-4">
          <div class="road-line" aria-hidden="true"></div>

          @if (roadmap()!.stages.length === 0) {
            <app-empty-state
              emoji="🗺️"
              title="Этапы пока не настроены"
              description="Загляните позже или начните с раздела тем"
            />
          }

          @for (stage of roadmap()!.stages; track stage.key; let i = $index) {
            <div
              class="stage-row mb-6 flex gap-3"
              [class.stage-row--right]="i % 2 === 1"
            >
              <div class="stage-track shrink-0">
                <div
                  class="stage-pin"
                  [style.background-color]="stage.color"
                  [class.stage-pin--locked]="stage.status === 'locked'"
                  [class.stage-pin--active]="stage.status === 'active'"
                  [class.stage-pin--completed]="stage.status === 'completed'"
                >
                  @if (stage.status === 'completed') {
                    <span>✓</span>
                  } @else if (stage.status === 'locked') {
                    <span>🔒</span>
                  } @else {
                    <span>{{ stage.order }}</span>
                  }
                </div>
                @if (i < roadmap()!.stages.length - 1) {
                  <div class="stage-connector" [style.background-color]="stage.color + '55'"></div>
                }
              </div>

              <button
                type="button"
                class="stage-card flex-1 text-left"
                [class.stage-card--locked]="stage.status === 'locked'"
                [style.--stage-color]="stage.color"
                [disabled]="stage.status === 'locked'"
                (click)="openStage(stage)"
              >
                <div class="stage-card__inner">
                  <div class="flex items-start gap-3">
                    <span class="text-3xl">{{ stage.emoji }}</span>
                    <div class="min-w-0 flex-1">
                      <p class="text-[10px] font-bold uppercase tracking-wider opacity-70">
                        Этап {{ stage.order }}
                      </p>
                      <h2 class="text-base font-bold leading-tight">{{ stage.title }}</h2>
                      @if (stage.progress !== undefined && stage.status !== 'locked') {
                        <div class="mt-2">
                          <div class="mb-1 flex justify-between text-[10px] opacity-70">
                            <span>Прогресс</span>
                            <span>{{ stage.progress | number: '1.0-0' }}%</span>
                          </div>
                          <div class="h-1.5 overflow-hidden rounded-full bg-black/20">
                            <div
                              class="h-full rounded-full transition-all"
                              [style.width.%]="stage.progress"
                              [style.background-color]="stage.color"
                            ></div>
                          </div>
                        </div>
                      }
                    </div>
                  </div>

                  <ul class="mt-3 space-y-1">
                    @for (topic of stage.topics; track topic) {
                      <li class="flex items-start gap-2 text-xs text-[var(--tg-hint)]">
                        <span class="mt-1 h-1 w-1 shrink-0 rounded-full bg-current opacity-60"></span>
                        <span>{{ topic }}</span>
                      </li>
                    }
                  </ul>

                  @if (stage.status === 'active') {
                    <p class="mt-3 text-xs font-semibold" [style.color]="stage.color">
                      Текущий этап →
                    </p>
                  }
                </div>
              </button>
            </div>
          }
        </div>

        <footer class="mx-4 mb-4 rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-3 text-center text-xs text-[var(--tg-hint)]">
          🏆 Не просто учись — строй что-то крутое!
        </footer>
      }
    </div>
  `,
  styles: `
    .roadmap-page {
      background:
        radial-gradient(ellipse at 20% 0%, rgba(99, 102, 241, 0.15), transparent 50%),
        radial-gradient(ellipse at 80% 30%, rgba(168, 85, 247, 0.1), transparent 40%),
        var(--tg-bg);
    }

    .roadmap-header {
      background: linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, transparent 100%);
    }

    .motivation-badge {
      background: rgba(255, 255, 255, 0.04);
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
        rgba(255, 255, 255, 0.15) 0,
        rgba(255, 255, 255, 0.15) 8px,
        transparent 8px,
        transparent 16px
      );
      opacity: 0.5;
    }

    .stage-row--right {
      flex-direction: row-reverse;
    }

    .stage-row--right .stage-card__inner {
      text-align: right;
    }

    .stage-row--right .stage-card ul li {
      flex-direction: row-reverse;
      text-align: right;
    }

    .stage-track {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 2.5rem;
      position: relative;
      z-index: 1;
    }

    .stage-pin {
      display: flex;
      height: 2.5rem;
      width: 2.5rem;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      font-size: 0.875rem;
      font-weight: 700;
      color: white;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    }

    .stage-pin--locked {
      opacity: 0.45;
      filter: grayscale(0.5);
    }

    .stage-pin--active {
      animation: pulse-pin 2s ease-in-out infinite;
    }

    .stage-connector {
      width: 3px;
      flex: 1;
      min-height: 1.5rem;
      margin: 0.25rem 0;
      border-radius: 999px;
    }

    .stage-card {
      border-radius: 1rem;
      border: 2px solid color-mix(in srgb, var(--stage-color) 70%, transparent);
      background: color-mix(in srgb, var(--stage-color) 8%, var(--tg-secondary-bg));
      transition: transform 0.15s ease, opacity 0.15s ease;
    }

    .stage-card:not(:disabled):active {
      transform: scale(0.98);
    }

    .stage-card--locked {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .stage-card__inner {
      padding: 0.875rem;
    }

    @keyframes pulse-pin {
      0%,
      100% {
        box-shadow: 0 0 0 0 color-mix(in srgb, var(--stage-color, #6366f1) 40%, transparent);
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

  openStage(stage: RoadmapStage): void {
    if (stage.status === 'locked') {
      return;
    }

    const topicKey = stage.topicKey ?? stage.key;
    this.router.navigate(['/topics', topicKey]);
  }
}
