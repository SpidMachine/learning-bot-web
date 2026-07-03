export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  emoji: string;
}

export interface LessonSummary {
  id: number;
  title: string;
  order: number;
  completed: boolean;
  quizId?: number;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  progress: number;
  lessonsCount: number;
  completedLessons: number;
  imageEmoji: string;
}

export interface CourseDetail extends Course {
  lessons: LessonSummary[];
}

export interface UserProfile {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  xp: number;
  streak: number;
  completedLessons: number;
  achievements: Achievement[];
  continueLesson?: LessonSummary & { courseTitle: string; courseId: number };
}

export interface Lesson {
  id: number;
  courseId: number;
  title: string;
  content: string[];
  nextLessonId?: number;
  quizId?: number;
}

export interface QuizOption {
  id: number;
  text: string;
}

export interface QuizQuestion {
  id: number;
  text: string;
  options: QuizOption[];
}

export interface QuizQuestionWithAnswer extends QuizQuestion {
  correctOptionId: number;
}

export interface Quiz {
  id: number;
  title: string;
  questions: QuizQuestion[];
}

export interface QuizSubmitRequest {
  answers: Record<number, number>;
}

export interface QuizSubmitResult {
  score: number;
  total: number;
  passed: boolean;
  correctAnswers: Record<number, number>;
}
