import {
  DashboardDto,
  MeDto,
  NextActionDto,
  RoadmapDto,
  RoadmapStageDto,
  SessionDto,
  StatsDto,
} from '../../shared/models/api.dto';

const STAGE_COLORS = ['#a855f7', '#3b82f6', '#22c55e', '#f97316', '#eab308', '#ec4899'];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
}

function normalizeMe(raw: unknown): MeDto {
  const data = asRecord(raw);

  return {
    id: asNumber(data['id']),
    firstName: asString(data['firstName'] ?? data['first_name'], 'Ученик'),
    username: asString(data['username']) || undefined,
    miniAppUrl: asString(data['miniAppUrl'] ?? data['mini_app_url']) || undefined,
  };
}

function normalizeStats(raw: unknown): StatsDto {
  const data = asRecord(raw);

  return {
    totalAnswered: asNumber(data['totalAnswered'] ?? data['total_answered']),
    totalCorrect: asNumber(data['totalCorrect'] ?? data['total_correct']),
    accuracy: asNumber(data['accuracy']),
    streakDays: asNumber(data['streakDays'] ?? data['streak_days']),
    dueForReview: asNumber(data['dueForReview'] ?? data['due_for_review']),
    flashcardsDone: asNumber(data['flashcardsDone'] ?? data['flashcards_done']),
    weeklyGoal: asNumber(data['weeklyGoal'] ?? data['weekly_goal'], 20),
    weekAnswered: asNumber(data['weekAnswered'] ?? data['week_answered']),
    dailyCounts: (data['dailyCounts'] ?? data['daily_counts'] ?? {}) as Record<string, number>,
    topicStats: asArray(data['topicStats'] ?? data['topic_stats']) as StatsDto['topicStats'],
  };
}

function normalizeSession(raw: unknown): SessionDto | null {
  if (!raw) {
    return null;
  }

  return raw as SessionDto;
}

function normalizeNextAction(raw: unknown): NextActionDto | undefined {
  const data = asRecord(raw);
  const type = asString(data['type']);

  if (!type) {
    return undefined;
  }

  return {
    type: type as NextActionDto['type'],
    label: asString(data['label'], 'Продолжить'),
    topicKey: asString(data['topicKey'] ?? data['topic_key']) || undefined,
    title: asString(data['title']) || undefined,
    subtitle: asString(data['subtitle']) || undefined,
  };
}

function normalizeStageTopics(raw: unknown): string[] {
  return asArray(raw)
    .map((item) => {
      if (typeof item === 'string') {
        return item;
      }

      const topic = asRecord(item);
      return asString(topic['title'] ?? topic['name'] ?? topic['label']);
    })
    .filter((item) => item.length > 0);
}

function normalizeStage(raw: unknown, index: number): RoadmapStageDto {
  const data = asRecord(raw);
  const order = asNumber(data['order'], index + 1);
  const key = asString(data['key'] ?? data['id'], `stage_${order}`);
  const statusRaw = asString(data['status'], 'locked');

  return {
    order,
    key,
    title: asString(data['title'] ?? data['name'], `Этап ${order}`),
    emoji: asString(data['emoji'] ?? data['icon'], '📚'),
    color: asString(data['color'], STAGE_COLORS[index % STAGE_COLORS.length]),
    status: (['locked', 'active', 'completed'].includes(statusRaw)
      ? statusRaw
      : 'locked') as RoadmapStageDto['status'],
    topics: normalizeStageTopics(data['topics'] ?? data['items'] ?? data['bullets']),
    progress: data['progress'] !== undefined ? asNumber(data['progress']) : undefined,
    topicKey: asString(data['topicKey'] ?? data['topic_key'] ?? data['key']) || undefined,
  };
}

export function normalizeDashboardDto(raw: unknown): DashboardDto {
  const root = asRecord(raw);
  const data = asRecord(root['data'] ?? root);

  return {
    me: normalizeMe(data['me'] ?? data['user']),
    stats: normalizeStats(data['stats']),
    session: normalizeSession(data['session']),
    achievements: asArray(data['achievements']).map((item) => asString(item)).filter(Boolean),
    nextAction: normalizeNextAction(data['nextAction'] ?? data['next_action']) ?? {
      type: 'topic',
      label: 'Начать обучение',
      title: 'Выберите тему',
    },
  };
}

export function normalizeRoadmapDto(raw: unknown): RoadmapDto {
  const root = asRecord(raw);
  const data = asRecord(root['data'] ?? root);
  const stagesRaw = asArray(data['stages'] ?? data['milestones'] ?? data['items'] ?? data['steps']);

  return {
    title: asString(data['title'], 'Learning Roadmap'),
    subtitle: asString(data['subtitle']) || undefined,
    currentStageOrder: data['currentStageOrder'] !== undefined
      ? asNumber(data['currentStageOrder'] ?? data['current_stage_order'])
      : undefined,
    stages: stagesRaw.map((stage, index) => normalizeStage(stage, index)),
  };
}

export { STAGE_COLORS };
