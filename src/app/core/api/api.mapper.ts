import {
  AnswerResultDto,
  DashboardDto,
  QuestionDto,
  QuizPickDto,
  RoadmapDto,
  RoadmapStageDto,
  SessionDto,
  StatsDto,
  TopicDto,
  TopicStatsDto,
} from '../../shared/models/api.dto';
import {
  AnswerResult,
  Dashboard,
  NextAction,
  Question,
  Roadmap,
  RoadmapStage,
  Session,
  Topic,
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

export function mapDashboard(dto: DashboardDto): Dashboard {
  return {
    me: mapMe(dto.me),
    stats: mapStats(dto.stats),
    session: dto.session ? mapSession(dto.session) : null,
    achievements: dto.achievements,
    nextAction: mapNextAction(dto.nextAction),
  };
}

export function mapNextAction(dto?: DashboardDto['nextAction']): NextAction {
  if (!dto?.type) {
    return {
      type: 'topic',
      label: 'Начать обучение',
      title: 'Выберите тему',
    };
  }

  return {
    type: dto.type,
    label: dto.label ?? 'Продолжить',
    topicKey: dto.topicKey,
    title: dto.title,
    subtitle: dto.subtitle,
  };
}

export function mapRoadmap(dto: RoadmapDto): Roadmap {
  return {
    title: dto.title ?? 'Learning Roadmap',
    subtitle: dto.subtitle,
    currentStageOrder: dto.currentStageOrder,
    stages: (dto.stages ?? []).map(mapRoadmapStage),
  };
}

export function mapRoadmapStage(dto: RoadmapStageDto): RoadmapStage {
  return {
    order: dto.order,
    key: dto.key,
    title: dto.title,
    emoji: dto.emoji,
    color: dto.color,
    status: dto.status,
    topics: dto.topics,
    progress: dto.progress,
    topicKey: dto.topicKey,
  };
}
