import {
  DashboardDto,
  MeDto,
  NextActionDto,
  RoadmapDto,
  RoadmapNodeDto,
  SessionDto,
  StatsDto,
  SubtopicRoadmapNodeDto,
  SubtopicTotalsDto,
  TopicDetailDto,
  TopicRoadmapDto,
} from '../../shared/models/api.dto';

const NODE_COLORS = ['#a855f7', '#3b82f6', '#22c55e', '#f97316', '#eab308', '#ec4899'];

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

function isBlank(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === 'string' && value.trim().length === 0);
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

  const topic = asString(data['topic'] ?? data['topicKey'] ?? data['topic_key']) || undefined;

  return {
    type: type as NextActionDto['type'],
    label: asString(data['label'], 'Продолжить'),
    topic,
    topicKey: topic,
    subtopic: asString(data['subtopic'] ?? data['subtopicKey'] ?? data['subtopic_key']) || undefined,
    title: asString(data['title']) || undefined,
    subtitle: asString(data['subtitle']) || undefined,
  };
}

function mapLegacyStatus(status: string): RoadmapNodeDto['status'] {
  if (status === 'completed') {
    return 'completed';
  }

  if (status === 'active' || status === 'in_progress') {
    return 'in_progress';
  }

  return 'available';
}

function normalizeRoadmapNode(raw: unknown, index: number): RoadmapNodeDto {
  const data = asRecord(raw);
  const key = asString(data['key'] ?? data['topicKey'] ?? data['topic_key'] ?? data['id'], `topic_${index}`);
  const statusRaw = asString(data['status'], 'available');

  return {
    key,
    title: asString(data['title'] ?? data['name'], key),
    emoji: asString(data['emoji'] ?? data['icon'], '📚'),
    percent: asNumber(data['percent'] ?? data['progress'] ?? data['overallPercent'] ?? data['overall_percent']),
    status: (['available', 'in_progress', 'completed'].includes(statusRaw)
      ? statusRaw
      : mapLegacyStatus(statusRaw)) as RoadmapNodeDto['status'],
    subtopicCount:
      data['subtopicCount'] !== undefined || data['subtopic_count'] !== undefined
        ? asNumber(data['subtopicCount'] ?? data['subtopic_count'])
        : undefined,
    completedSubtopics:
      data['completedSubtopics'] !== undefined || data['completed_subtopics'] !== undefined
        ? asNumber(data['completedSubtopics'] ?? data['completed_subtopics'])
        : undefined,
    currentSubtopicKey:
      asString(data['currentSubtopicKey'] ?? data['current_subtopic_key']) || undefined,
  };
}

function normalizeTotals(raw: unknown): SubtopicTotalsDto | undefined {
  if (!raw) {
    return undefined;
  }

  const data = asRecord(raw);

  return {
    answered: data['answered'] !== undefined ? asNumber(data['answered']) : undefined,
    total: data['total'] !== undefined ? asNumber(data['total']) : undefined,
    correct: data['correct'] !== undefined ? asNumber(data['correct']) : undefined,
  };
}

function normalizeSubtopicNode(raw: unknown, index: number): SubtopicRoadmapNodeDto {
  const data = asRecord(raw);
  const key = asString(data['key'] ?? data['id'], `subtopic_${index}`);
  const statusRaw = asString(data['status'], 'locked');

  return {
    key,
    title: asString(data['title'] ?? data['name'], `Подтема ${index + 1}`),
    emoji: asString(data['emoji'] ?? data['icon'], '📖'),
    description: asString(data['description']) || undefined,
    status: (['locked', 'available', 'in_progress', 'completed'].includes(statusRaw)
      ? statusRaw
      : 'locked') as SubtopicRoadmapNodeDto['status'],
    percent: asNumber(data['percent'] ?? data['progress']),
    totals: normalizeTotals(data['totals']),
    nextAction: normalizeNextAction(data['nextAction'] ?? data['next_action']),
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
  const nodesRaw = asArray(data['nodes'] ?? data['topics'] ?? data['stages'] ?? data['items']);

  const nodes = nodesRaw.map((node, index) => normalizeRoadmapNode(node, index));

  return {
    title: asString(data['title'], 'Learning Roadmap') || undefined,
    subtitle: asString(data['subtitle']) || undefined,
    nodes,
  };
}

export function normalizeTopicDetailDto(raw: unknown, topicKey: string): TopicDetailDto {
  const root = asRecord(raw);
  const data = asRecord(root['data'] ?? root);

  return {
    key: asString(data['key'] ?? data['topicKey'] ?? data['topic_key'], topicKey),
    title: asString(data['title'], topicKey),
    emoji: asString(data['emoji'] ?? data['icon'], '📚'),
    overallPercent: asNumber(data['overallPercent'] ?? data['overall_percent'] ?? data['percent']),
    subtopicCount:
      data['subtopicCount'] !== undefined || data['subtopic_count'] !== undefined
        ? asNumber(data['subtopicCount'] ?? data['subtopic_count'])
        : undefined,
    completedSubtopics:
      data['completedSubtopics'] !== undefined || data['completed_subtopics'] !== undefined
        ? asNumber(data['completedSubtopics'] ?? data['completed_subtopics'])
        : undefined,
    currentSubtopicKey:
      asString(data['currentSubtopicKey'] ?? data['current_subtopic_key']) || undefined,
  };
}

export function normalizeTopicRoadmapDto(raw: unknown, topicKey: string): TopicRoadmapDto {
  const root = asRecord(raw);
  const data = asRecord(root['data'] ?? root);
  const subtopicsRaw = asArray(data['subtopics'] ?? data['nodes'] ?? data['items']);

  return {
    topicKey: asString(data['topicKey'] ?? data['topic_key'] ?? data['key'], topicKey),
    title: asString(data['title'], topicKey),
    emoji: asString(data['emoji'] ?? data['icon'], '📚'),
    overallPercent: asNumber(data['overallPercent'] ?? data['overall_percent'] ?? data['percent']),
    currentSubtopicKey:
      asString(data['currentSubtopicKey'] ?? data['current_subtopic_key']) || undefined,
    subtopics: subtopicsRaw.map((item, index) => normalizeSubtopicNode(item, index)),
  };
}

export function topicDtoToRoadmapNode(
  topic: { key: string; title: string; emoji: string },
  stats?: { answered?: number; correct?: number; accuracy?: number },
  index = 0,
): RoadmapNodeDto {
  const percent = stats?.accuracy ?? 0;
  let status: RoadmapNodeDto['status'] = 'available';

  if (percent >= 80) {
    status = 'completed';
  } else if ((stats?.answered ?? 0) > 0) {
    status = 'in_progress';
  }

  return {
    key: topic.key,
    title: topic.title,
    emoji: topic.emoji,
    percent,
    status,
  };
}

export { NODE_COLORS as STAGE_COLORS, isBlank };
