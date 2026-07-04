import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav
      class="fixed bottom-0 left-0 right-0 z-50 border-t border-black/5 bg-[var(--tg-bg)]/95 backdrop-blur-md safe-bottom"
    >
      <div class="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        @for (item of items; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="text-[var(--tg-button)]"
            [routerLinkActiveOptions]="{ exact: item.path === '/' }"
            class="flex min-w-[72px] flex-col items-center gap-1 rounded-xl px-3 py-2 text-[var(--tg-hint)] transition-colors"
          >
            <span class="text-xl">{{ item.icon }}</span>
            <span class="text-xs font-medium">{{ item.label }}</span>
          </a>
        }
      </div>
    </nav>
  `,
})
export class BottomNavComponent {
  readonly items: NavItem[] = [
    { path: '/', label: 'Главная', icon: '🏠' },
    { path: '/topics', label: 'Темы', icon: '📚' },
    { path: '/profile', label: 'Профиль', icon: '👤' },
  ];
}
