import { Router } from '@angular/router';
import { Observable, switchMap, of } from 'rxjs';
import { LearningApi } from './learning-api.interface';
import { NextAction, Session, UserStats } from '../../shared/models/learning.models';
import { StartSessionRequestDto } from '../../shared/models/api.dto';

export function getNextActionRoute(action: NextAction): string | string[] {
  switch (action.type) {
    case 'session':
      return '/session';
    case 'review':
      return '/practice';
    case 'quiz':
      return '/quiz';
    case 'topic':
      return action.topic ?? action.topicKey
        ? ['/topics', action.topic ?? action.topicKey!]
        : '/roadmap';
    case 'subtopic':
      return action.topic ?? action.topicKey
        ? ['/topics', action.topic ?? action.topicKey!]
        : '/roadmap';
    default:
      return '/roadmap';
  }
}

export function inferNextAction(session: Session | null, stats: UserStats): NextAction {
  if (session && !session.finished) {
    return {
      type: 'session',
      label: 'Продолжить сессию',
      title: 'Сессия в процессе',
      subtitle: `Вопрос ${session.currentIndex} / ${session.total}`,
    };
  }

  if (stats.dueForReview > 0) {
    return {
      type: 'review',
      label: 'Повторение',
      title: 'Закрепи знания',
      subtitle: `${stats.dueForReview} вопросов на повтор`,
    };
  }

  return {
    type: 'topic',
    label: 'Начать обучение',
    title: 'Выберите тему',
    subtitle: 'Откройте роудмап',
  };
}

/** Активная сессия важнее nextAction от API — иначе лишний POST /sessions */
export function resolveNextAction(
  nextAction: NextAction,
  session: Session | null,
  stats: UserStats,
): NextAction {
  if (session && !session.finished) {
    return inferNextAction(session, stats);
  }

  return nextAction;
}

export function startOrResumeSession(
  api: LearningApi,
  router: Router,
  request: StartSessionRequestDto,
  callbacks?: { onError?: (message: string) => void; onFinally?: () => void },
): void {
  api
    .getCurrentSession()
    .pipe(
      switchMap((current: Session | null) => {
        if (current && !current.finished) {
          return of({ resumed: true as const });
        }

        return api.startSession(request).pipe(
          switchMap(() => of({ resumed: false as const })),
        );
      }),
    )
    .subscribe({
      next: () => {
        router.navigate(['/session']);
        callbacks?.onFinally?.();
      },
      error: (error: { status?: number; message?: string }) => {
        if (error?.status === 0 || error?.status === 524) {
          callbacks?.onError?.(
            'Бэкенд не ответил вовремя. Убедитесь, что learning-bot-api запущен на :8080.',
          );
        } else {
          callbacks?.onError?.('Не удалось начать сессию. Попробуйте ещё раз.');
        }

        callbacks?.onFinally?.();
      },
    });
}

export function startFromNextAction(
  api: LearningApi,
  router: Router,
  action: NextAction,
  session: Session | null = null,
  stats?: UserStats,
  callbacks?: { onError?: (message: string) => void; onFinally?: () => void },
): void {
  const resolved = resolveNextAction(
    action,
    session,
    stats ?? {
      totalAnswered: 0,
      totalCorrect: 0,
      accuracy: 0,
      streakDays: 0,
      dueForReview: 0,
      flashcardsDone: 0,
      weeklyGoal: 0,
      weekAnswered: 0,
    },
  );

  if (resolved.type === 'session') {
    router.navigate(['/session']);
    callbacks?.onFinally?.();
    return;
  }

  if (resolved.type === 'subtopic') {
    const topic = resolved.topic ?? resolved.topicKey;
    const subtopic = resolved.subtopic;

    if (!topic || !subtopic) {
      const route = getNextActionRoute(resolved);

      if (Array.isArray(route)) {
        router.navigate(route);
      } else {
        router.navigate([route]);
      }

      callbacks?.onFinally?.();
      return;
    }

    startOrResumeSession(api, router, { mode: 'quiz', topic, subtopic }, callbacks);
    return;
  }

  const route = getNextActionRoute(resolved);

  if (Array.isArray(route)) {
    router.navigate(route);
  } else {
    router.navigate([route]);
  }

  callbacks?.onFinally?.();
}

export function startSubtopicSession(
  api: LearningApi,
  router: Router,
  topic: string,
  subtopic: string,
  callbacks?: { onError?: (message: string) => void; onFinally?: () => void },
): void {
  startOrResumeSession(api, router, { mode: 'quiz', topic, subtopic }, callbacks);
}

export function nextActionIcon(type?: NextAction['type']): string {
  switch (type) {
    case 'session':
      return '🎯';
    case 'review':
      return '🔁';
    case 'quiz':
      return '❓';
    case 'subtopic':
      return '📖';
    case 'topic':
      return '📚';
    default:
      return '▶️';
  }
}

export function roadmapStatusLabel(status: string): string {
  switch (status) {
    case 'completed':
      return 'Завершено';
    case 'in_progress':
      return 'В процессе';
    case 'available':
      return 'Доступно';
    case 'locked':
      return 'Заблокировано';
    default:
      return status;
  }
}

export function subtopicCtaLabel(status: string): string {
  switch (status) {
    case 'in_progress':
      return 'Продолжить';
    case 'completed':
      return 'Повторить';
    case 'available':
      return 'Начать сессию';
    default:
      return 'Начать';
  }
}
