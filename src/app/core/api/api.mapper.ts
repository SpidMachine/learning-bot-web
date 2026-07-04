import {
  ApiCourseDetailDto,
  ApiCourseDto,
  ApiLessonDto,
  ApiQuizDto,
  ApiQuizSubmitRequestDto,
  ApiQuizSubmitResultDto,
  ApiUserProfileDto,
} from '../../shared/models/api.dto';
import {
  Course,
  CourseDetail,
  Lesson,
  Quiz,
  QuizSubmitRequest,
  QuizSubmitResult,
  UserProfile,
} from '../../shared/models/learning.models';

function normalizeContent(content: string[] | string): string[] {
  if (Array.isArray(content)) {
    return content;
  }

  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function normalizeCorrectAnswers(
  answers: Record<string, number> | Record<number, number>,
): Record<number, number> {
  return Object.entries(answers).reduce<Record<number, number>>((acc, [key, value]) => {
    acc[Number(key)] = value;
    return acc;
  }, {});
}

export function mapUserProfile(dto: ApiUserProfileDto): UserProfile {
  return {
    id: dto.id,
    firstName: dto.firstName,
    lastName: dto.lastName,
    username: dto.username,
    xp: dto.xp,
    streak: dto.streak,
    completedLessons: dto.completedLessons,
    achievements: dto.achievements,
    continueLesson: dto.continueLesson,
  };
}

export function mapCourse(dto: ApiCourseDto): Course {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    progress: dto.progress,
    lessonsCount: dto.lessonsCount,
    completedLessons: dto.completedLessons,
    imageEmoji: dto.imageEmoji,
  };
}

export function mapCourseDetail(dto: ApiCourseDetailDto): CourseDetail {
  return {
    ...mapCourse(dto),
    lessons: dto.lessons,
  };
}

export function mapLesson(dto: ApiLessonDto): Lesson {
  return {
    id: dto.id,
    courseId: dto.courseId,
    title: dto.title,
    content: normalizeContent(dto.content),
    nextLessonId: dto.nextLessonId,
    quizId: dto.quizId,
  };
}

export function mapQuiz(dto: ApiQuizDto): Quiz {
  return {
    id: dto.id,
    title: dto.title,
    questions: dto.questions,
  };
}

export function mapQuizSubmitRequest(request: QuizSubmitRequest): ApiQuizSubmitRequestDto {
  const answers = Object.entries(request.answers).reduce<Record<string, number>>(
    (acc, [questionId, optionId]) => {
      acc[questionId] = optionId;
      return acc;
    },
    {},
  );

  return { answers };
}

export function mapQuizSubmitResult(dto: ApiQuizSubmitResultDto): QuizSubmitResult {
  return {
    score: dto.score,
    total: dto.total,
    passed: dto.passed,
    correctAnswers: normalizeCorrectAnswers(dto.correctAnswers),
  };
}
