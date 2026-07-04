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
      return action.topicKey ? ['/topics', action.topicKey] : '/topics';
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
