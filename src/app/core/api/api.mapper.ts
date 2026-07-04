import {
  AnswerResultDto,
  DashboardDto,
  QuestionDto,
  QuizPickDto,
  RoadmapDto,
  RoadmapNodeDto,
  RoadmapNextActionDto,
  SessionDto,
  StatsDto,
  SubtopicRoadmapNodeDto,
  TopicDetailDto,
  TopicDto,
  TopicRoadmapDto,
  TopicStatsDto,
} from '../../shared/models/api.dto';
import {
  AnswerResult,
  Dashboard,
  NextAction,
  Question,
  Roadmap,
  RoadmapNode,
  Session,
  SubtopicRoadmapNode,
  Topic,
  TopicDetail,
  TopicRoadmap,
  UserMe,
  UserStats,
} from '../../shared/models/learning.models';

export function mapQuestion(dto: QuestionDto & { text?: string }): Question {
  return {
    id: dto.id,
    kind: dto.kind,
    topics: dto.topics ?? [],
    difficulty: dto.difficulty,
    text: dto.question ?? dto.text ?? '',
    options: dto.options ?? [],
    tags: dto.tags ?? [],
    snippet: dto.snippet,
  };
}

export function mapSession(dto: SessionDto): Session {
  return {
    mode: dto.mode,
    currentIndex: dto.currentIndex,
    total: dto.total,
    correctCount: dto.correctCount,
    finished: dto.finished,
    currentQuestion: dto.currentQuestion ? mapQuestion(dto.currentQuestion) : undefined,
  };
}

export function mapTopic(dto: TopicDto, stats?: TopicStatsDto): Topic {
  return {
    key: dto.key,
    title: dto.title,
    emoji: dto.emoji,
    answered: stats?.answered,
    correct: stats?.correct,
    accuracy: stats?.accuracy,
  };
}

export function mapStats(dto?: Partial<StatsDto>): UserStats {
  return {
    totalAnswered: dto?.totalAnswered ?? 0,
    totalCorrect: dto?.totalCorrect ?? 0,
    accuracy: dto?.accuracy ?? 0,
    streakDays: dto?.streakDays ?? 0,
    dueForReview: dto?.dueForReview ?? 0,
    flashcardsDone: dto?.flashcardsDone ?? 0,
    weeklyGoal: dto?.weeklyGoal ?? 20,
    weekAnswered: dto?.weekAnswered ?? 0,
  };
}

export function mapMe(dto?: { id?: number; firstName?: string; username?: string }): UserMe {
  return {
    id: dto?.id ?? 0,
    firstName: dto?.firstName ?? 'Ученик',
    username: dto?.username,
  };
}

export function mapAnswerResult(dto: AnswerResultDto): AnswerResult {
  return {
    correct: dto.correct,
    correctIndex: dto.correctIndex,
    explanation: dto.explanation,
    extendedExplanation: dto.extendedExplanation,
    wrongOptions: dto.wrongOptions,
    newAchievements: dto.newAchievements,
  };
}

export function mapQuizPick(dto: QuizPickDto): Question {
  return mapQuestion(dto.question);
}

export function mapNextAction(dto?: RoadmapNextActionDto | DashboardDto['nextAction']): NextAction {
  if (!dto?.type) {
    return {
      type: 'topic',
      label: 'Начать обучение',
      title: 'Выберите тему',
    };
  }

  const topic = dto.topic ?? ('topicKey' in dto ? dto.topicKey : undefined);

  return {
    type: dto.type,
    label: dto.label ?? 'Продолжить',
    topic,
    topicKey: topic,
    subtopic: dto.subtopic,
    title: dto.title,
    subtitle: dto.subtitle,
  };
}

export function mapDashboard(dto: DashboardDto): Dashboard {
  return {
    me: mapMe(dto.me),
    stats: mapStats(dto.stats),
    session: dto.session ? mapSession(dto.session) : null,
    achievements: dto.achievements ?? [],
    nextAction: mapNextAction(dto.nextAction),
  };
}

export function mapRoadmapNode(dto: RoadmapNodeDto): RoadmapNode {
  return {
    key: dto.key,
    title: dto.title,
    emoji: dto.emoji,
    percent: dto.percent,
    status: dto.status,
    subtopicCount: dto.subtopicCount,
    completedSubtopics: dto.completedSubtopics,
    currentSubtopicKey: dto.currentSubtopicKey,
  };
}

export function mapRoadmap(dto: RoadmapDto): Roadmap {
  return {
    title: dto.title,
    subtitle: dto.subtitle,
    nodes: (dto.nodes ?? []).map(mapRoadmapNode),
  };
}

export function mapTopicDetail(dto: TopicDetailDto): TopicDetail {
  return {
    key: dto.key,
    title: dto.title,
    emoji: dto.emoji,
    overallPercent: dto.overallPercent,
    subtopicCount: dto.subtopicCount,
    completedSubtopics: dto.completedSubtopics,
    currentSubtopicKey: dto.currentSubtopicKey,
  };
}

export function mapSubtopicNode(dto: SubtopicRoadmapNodeDto): SubtopicRoadmapNode {
  return {
    key: dto.key,
    title: dto.title,
    emoji: dto.emoji,
    description: dto.description,
    status: dto.status,
    percent: dto.percent,
    totals: dto.totals,
    nextAction: dto.nextAction ? mapNextAction(dto.nextAction) : undefined,
  };
}

export function mapTopicRoadmap(dto: TopicRoadmapDto): TopicRoadmap {
  return {
    topicKey: dto.topicKey,
    title: dto.title,
    emoji: dto.emoji,
    overallPercent: dto.overallPercent,
    currentSubtopicKey: dto.currentSubtopicKey,
    subtopics: (dto.subtopics ?? []).map(mapSubtopicNode),
  };
}
