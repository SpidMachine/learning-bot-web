/** DTO из docs/openapi.json (learning-bot-api) */

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
}

export interface QuizPickRequestDto {
  topic?: string;
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
