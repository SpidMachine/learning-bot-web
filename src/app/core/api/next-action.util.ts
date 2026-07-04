import { NextAction } from '../../shared/models/learning.models';

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
