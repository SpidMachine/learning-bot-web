import { Router } from '@angular/router';
import { LearningApi } from './learning-api.interface';
import { NextAction, Session, UserStats } from '../../shared/models/learning.models';

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

export function startFromNextAction(
  api: LearningApi,
  router: Router,
  action: NextAction,
  onError?: () => void,
): void {
  if (action.type === 'subtopic') {
    const topic = action.topic ?? action.topicKey;
    const subtopic = action.subtopic;

    if (!topic || !subtopic) {
      const route = getNextActionRoute(action);

      if (Array.isArray(route)) {
        router.navigate(route);
      } else {
        router.navigate([route]);
      }

      return;
    }

    api.startSession({ mode: 'quiz', topic, subtopic }).subscribe({
      next: () => {
        router.navigate(['/session']);
      },
      error: () => {
        onError?.();
      },
    });

    return;
  }

  if (action.type === 'session') {
    router.navigate(['/session']);
    return;
  }

  const route = getNextActionRoute(action);

  if (Array.isArray(route)) {
    router.navigate(route);
    return;
  }

  router.navigate([route]);
}

export function startSubtopicSession(
  api: LearningApi,
  router: Router,
  topic: string,
  subtopic: string,
  onError?: () => void,
): void {
  api.startSession({ mode: 'quiz', topic, subtopic }).subscribe({
    next: () => {
      router.navigate(['/session']);
    },
    error: () => {
      onError?.();
    },
  });
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
