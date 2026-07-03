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
        path: 'courses',
        loadComponent: () =>
          import('./features/courses/courses.component').then((m) => m.CoursesComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
    ],
  },
  {
    path: 'courses/:id',
    loadComponent: () =>
      import('./features/courses/course-detail.component').then((m) => m.CourseDetailComponent),
  },
  {
    path: 'lessons/:id',
    loadComponent: () => import('./features/lesson/lesson.component').then((m) => m.LessonComponent),
  },
  {
    path: 'quizzes/:id',
    loadComponent: () => import('./features/quiz/quiz.component').then((m) => m.QuizComponent),
  },
  { path: '**', redirectTo: '' },
];
