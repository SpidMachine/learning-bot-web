import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <div class="animate-pulse space-y-3">
      @for (line of linesArray(); track $index) {
        <div
          class="h-4 rounded-lg bg-[var(--tg-secondary-bg)]"
          [style.width.%]="line"
        ></div>
      }
    </div>
  `,
})
export class SkeletonComponent {
  readonly lines = input(3);

  linesArray(): number[] {
    const count = this.lines();
    const widths = [100, 85, 70, 90, 60];

    return Array.from({ length: count }, (_, index) => widths[index % widths.length]);
  }
}
