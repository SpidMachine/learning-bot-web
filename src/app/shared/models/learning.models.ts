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

export type NextActionType = 'session' | 'review' | 'quiz' | 'topic' | 'subtopic';

export interface NextAction {
  type: NextActionType;
  label: string;
  topic?: string;
  subtopic?: string;
  /** @deprecated используйте topic */
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

export type RoadmapNodeStatus = 'available' | 'in_progress' | 'completed';

export interface RoadmapNode {
  key: string;
  title: string;
  emoji: string;
  percent: number;
  status: RoadmapNodeStatus;
  subtopicCount?: number;
  completedSubtopics?: number;
  currentSubtopicKey?: string;
}

export interface Roadmap {
  title?: string;
  subtitle?: string;
  nodes: RoadmapNode[];
}

export interface TopicDetail {
  key: string;
  title: string;
  emoji: string;
  overallPercent: number;
  subtopicCount?: number;
  completedSubtopics?: number;
  currentSubtopicKey?: string;
}

export type SubtopicStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface SubtopicTotals {
  answered?: number;
  total?: number;
  correct?: number;
}

export interface SubtopicRoadmapNode {
  key: string;
  title: string;
  emoji: string;
  description?: string;
  status: SubtopicStatus;
  percent: number;
  totals?: SubtopicTotals;
  nextAction?: NextAction;
}

export interface TopicRoadmap {
  topicKey: string;
  title: string;
  emoji: string;
  overallPercent: number;
  currentSubtopicKey?: string;
  subtopics: SubtopicRoadmapNode[];
}
