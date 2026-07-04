import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LEARNING_API } from '../../core/api/learning-api.interface';
import { roadmapStatusLabel } from '../../core/api/next-action.util';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { RoadmapNode } from '../../shared/models/learning.models';

@Component({
  selector: 'app-topics',
  standalone: true,
  imports: [
    RouterLink,
    CardComponent,
    ProgressBarComponent,
    SkeletonComponent,
    EmptyStateComponent,
    DecimalPipe,
  ],
  template: `
    <div class="px-4 pt-6">
      <header class="mb-6">
        <h1 class="text-2xl font-bold">Темы</h1>
        <p class="text-sm text-[var(--tg-hint)]">
          <a routerLink="/roadmap" class="text-[var(--tg-link)]">Открыть роудмап →</a>
        </p>
      </header>

      @if (loading()) {
        @for (item of [1, 2, 3]; track item) {
          <div class="mb-4">
            <app-skeleton [lines]="3" />
          </div>
        }
      } @else if (nodes().length === 0) {
        <app-empty-state
          emoji="📚"
          title="Темы пока недоступны"
          description="Загляните позже — контент скоро появится"
        />
      } @else {
        <div class="space-y-4">
          @for (node of nodes(); track node.key) {
            <a [routerLink]="['/topics', node.key]">
              <app-card>
                <div class="flex gap-4">
                  <span class="text-4xl">{{ node.emoji }}</span>
                  <div class="flex-1">
                    <p class="text-xs text-[var(--tg-hint)]">{{ statusLabel(node.status) }}</p>
                    <h2 class="font-semibold">{{ node.title }}</h2>
                    <div class="mt-3">
                      <div class="mb-1 flex justify-between text-xs text-[var(--tg-hint)]">
                        <span>{{ node.percent | number: '1.0-0' }}%</span>
                      </div>
                      <app-progress-bar [value]="node.percent" />
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
export class TopicsComponent implements OnInit {
  private readonly api = inject(LEARNING_API);

  readonly loading = signal(true);
  readonly nodes = signal<RoadmapNode[]>([]);
  readonly statusLabel = roadmapStatusLabel;

  ngOnInit(): void {
    this.api.getRoadmap().subscribe({
      next: (res) => {
        this.nodes.set(res.nodes);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
