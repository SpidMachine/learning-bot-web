/** DTO из docs/openapi.json (learning-bot-api v1.2.0) */

export interface MeDto {
  id: number;
  firstName: string;
  username?: string;
  miniAppUrl?: string;
}

export interface TopicDto {
  key: string;
  title: string;
  emoji: string;
}

export interface TopicStatsDto {
  title: string;
  answered: number;
  correct: number;
  accuracy: number;
}

export interface StatsDto {
  totalAnswered: number;
  totalCorrect: number;
  accuracy: number;
  streakDays: number;
  dueForReview: number;
  flashcardsDone: number;
  weeklyGoal: number;
  weekAnswered: number;
  dailyCounts: Record<string, number>;
  topicStats: TopicStatsDto[];
}

export interface QuestionDto {
  id: string;
  kind: string;
  topics: string[];
  difficulty: string;
  question: string;
  options: string[];
  tags: string[];
  snippet?: string;
}

export interface SessionDto {
  mode: string;
  currentIndex: number;
  total: number;
  correctCount: number;
  finished: boolean;
  currentQuestion?: QuestionDto;
}

export interface StartSessionRequestDto {
  mode?: string;
  topic?: string;
  subtopic?: string;
}

export interface QuizPickRequestDto {
  topic?: string;
  subtopic?: string;
  kind?: string;
  tag?: string;
}

export interface QuizPickDto {
  question: QuestionDto;
  source: string;
}

export interface AnswerRequestDto {
  itemId: string;
  selectedIndex: number;
}

export interface DocLinkDto {
  title: string;
  url: string;
}

export interface AnswerResultDto {
  correct: boolean;
  correctIndex: number;
  explanation: string;
  extendedExplanation?: string;
  wrongOptions?: string[];
  docLinks?: DocLinkDto[];
  newAchievements?: string[];
}

export interface SettingsDto {
  reminderHour: number;
  reminderEnabled: boolean;
  difficultyFilter: string;
  weeklyGoal: number;
  weekAnswered: number;
}

export interface UpdateSettingsRequestDto {
  reminderHour?: number;
  reminderEnabled?: boolean;
  difficultyFilter?: string;
  weeklyGoal?: number;
}

export interface ApiErrorDto {
  error: string;
  message: string;
}

export type RoadmapNextActionTypeDto =
  | 'session'
  | 'review'
  | 'quiz'
  | 'topic'
  | 'subtopic';

export interface RoadmapNextActionDto {
  type: RoadmapNextActionTypeDto;
  topic?: string;
  subtopic?: string;
  label: string;
  title?: string;
  subtitle?: string;
}

export type NextActionTypeDto = RoadmapNextActionTypeDto;

export interface NextActionDto extends RoadmapNextActionDto {
  /** @deprecated используйте topic */
  topicKey?: string;
}

export interface DashboardDto {
  me: MeDto;
  stats: StatsDto;
  session?: SessionDto | null;
  achievements: string[];
  nextAction: NextActionDto;
}

export type RoadmapNodeStatusDto = 'available' | 'in_progress' | 'completed';

export interface RoadmapNodeDto {
  key: string;
  title: string;
  emoji: string;
  percent: number;
  status: RoadmapNodeStatusDto;
  subtopicCount?: number;
  completedSubtopics?: number;
  currentSubtopicKey?: string;
}

export interface RoadmapDto {
  title?: string;
  subtitle?: string;
  nodes: RoadmapNodeDto[];
}

export interface TopicDetailDto {
  key: string;
  title: string;
  emoji: string;
  overallPercent: number;
  subtopicCount?: number;
  completedSubtopics?: number;
  currentSubtopicKey?: string;
}

export type SubtopicStatusDto = 'locked' | 'available' | 'in_progress' | 'completed';

export interface SubtopicTotalsDto {
  answered?: number;
  total?: number;
  correct?: number;
}

export interface SubtopicRoadmapNodeDto {
  key: string;
  title: string;
  emoji: string;
  description?: string;
  status: SubtopicStatusDto;
  percent: number;
  totals?: SubtopicTotalsDto;
  nextAction?: RoadmapNextActionDto;
}

export interface TopicRoadmapDto {
  topicKey: string;
  title: string;
  emoji: string;
  overallPercent: number;
  currentSubtopicKey?: string;
  subtopics: SubtopicRoadmapNodeDto[];
}

/** @deprecated legacy v1.0 — только для normalize */
export type RoadmapStageStatusDto = 'locked' | 'active' | 'completed';

/** @deprecated legacy v1.0 — только для normalize */
export interface RoadmapStageDto {
  order: number;
  key: string;
  title: string;
  emoji: string;
  color: string;
  status: RoadmapStageStatusDto;
  topics: string[];
  progress?: number;
  topicKey?: string;
}
