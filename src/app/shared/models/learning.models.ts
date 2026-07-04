export interface UserMe {
  id: number;
  firstName: string;
  username?: string;
}

export interface Topic {
  key: string;
  title: string;
  emoji: string;
  answered?: number;
  correct?: number;
  accuracy?: number;
}

export interface UserStats {
  totalAnswered: number;
  totalCorrect: number;
  accuracy: number;
  streakDays: number;
  dueForReview: number;
  flashcardsDone: number;
  weeklyGoal: number;
  weekAnswered: number;
}

export interface Question {
  id: string;
  kind: string;
  topics: string[];
  difficulty: string;
  text: string;
  options: string[];
  tags: string[];
  snippet?: string;
}

export interface Session {
  mode: string;
  currentIndex: number;
  total: number;
  correctCount: number;
  finished: boolean;
  currentQuestion?: Question;
}

export interface AnswerResult {
  correct: boolean;
  correctIndex: number;
  explanation: string;
  extendedExplanation?: string;
  wrongOptions?: string[];
  newAchievements?: string[];
}

export type NextActionType = 'session' | 'review' | 'quiz' | 'topic';

export interface NextAction {
  type: NextActionType;
  label: string;
  topicKey?: string;
  title?: string;
  subtitle?: string;
}

export interface Dashboard {
  me: UserMe;
  stats: UserStats;
  session: Session | null;
  achievements: string[];
  nextAction: NextAction;
}

/** @deprecated Используйте Dashboard */
export type HomeDashboard = Dashboard;

export interface ProfileView {
  me: UserMe;
  stats: UserStats;
  achievements: string[];
}

export type RoadmapStageStatus = 'locked' | 'active' | 'completed';

export interface RoadmapStage {
  order: number;
  key: string;
  title: string;
  emoji: string;
  color: string;
  status: RoadmapStageStatus;
  topics: string[];
  progress?: number;
  topicKey?: string;
}

export interface Roadmap {
  title: string;
  subtitle?: string;
  stages: RoadmapStage[];
  currentStageOrder?: number;
}
