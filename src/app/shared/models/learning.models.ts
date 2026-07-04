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

export interface HomeDashboard {
  me: UserMe;
  stats: UserStats;
  session: Session | null;
  achievements: string[];
}

export interface ProfileView {
  me: UserMe;
  stats: UserStats;
  achievements: string[];
}
