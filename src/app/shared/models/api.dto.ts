/** DTO ответов learning-bot-api. Синхронизировать с docs/openapi.json */

export interface ApiAchievementDto {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  emoji: string;
}

export interface ApiLessonSummaryDto {
  id: number;
  title: string;
  order: number;
  completed: boolean;
  quizId?: number;
}

export interface ApiContinueLessonDto extends ApiLessonSummaryDto {
  courseId: number;
  courseTitle: string;
}

export interface ApiCourseDto {
  id: number;
  title: string;
  description: string;
  progress: number;
  lessonsCount: number;
  completedLessons: number;
  imageEmoji: string;
}

export interface ApiCourseDetailDto extends ApiCourseDto {
  lessons: ApiLessonSummaryDto[];
}

export interface ApiUserProfileDto {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  xp: number;
  streak: number;
  completedLessons: number;
  achievements: ApiAchievementDto[];
  continueLesson?: ApiContinueLessonDto;
}

export interface ApiLessonDto {
  id: number;
  courseId: number;
  title: string;
  content: string[] | string;
  nextLessonId?: number;
  quizId?: number;
}

export interface ApiQuizOptionDto {
  id: number;
  text: string;
}

export interface ApiQuizQuestionDto {
  id: number;
  text: string;
  options: ApiQuizOptionDto[];
}

export interface ApiQuizDto {
  id: number;
  title: string;
  questions: ApiQuizQuestionDto[];
}

export interface ApiQuizSubmitRequestDto {
  answers: Record<string, number>;
}

export interface ApiQuizSubmitResultDto {
  score: number;
  total: number;
  passed: boolean;
  correctAnswers: Record<string, number> | Record<number, number>;
}
