import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'topics',
        loadComponent: () =>
          import('./features/topics/topics.component').then((m) => m.TopicsComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
    ],
  },
  {
    path: 'topics/:key',
    loadComponent: () =>
      import('./features/topics/topic-detail.component').then((m) => m.TopicDetailComponent),
  },
  {
    path: 'session',
    loadComponent: () =>
      import('./features/session/session.component').then((m) => m.SessionComponent),
  },
  {
    path: 'practice',
    loadComponent: () =>
      import('./features/practice/practice.component').then((m) => m.PracticeComponent),
  },
  { path: '**', redirectTo: '' },
];
