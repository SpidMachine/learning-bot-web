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
        path: 'roadmap',
        loadComponent: () =>
          import('./features/roadmap/roadmap.component').then((m) => m.RoadmapComponent),
      },
      {
        path: 'topics',
        redirectTo: 'roadmap',
        pathMatch: 'full',
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
  {
    path: 'quiz',
    loadComponent: () =>
      import('./features/quiz/quiz-pick.component').then((m) => m.QuizPickComponent),
  },
  { path: '**', redirectTo: '' },
];
