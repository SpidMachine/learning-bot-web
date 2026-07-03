import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import {
  Course,
  CourseDetail,
  Lesson,
  Quiz,
  QuizQuestionWithAnswer,
  QuizSubmitRequest,
  QuizSubmitResult,
  UserProfile,
} from '../../shared/models/learning.models';
import { LearningApi } from './learning-api.interface';

const MOCK_COURSES: Course[] = [
  {
    id: 1,
    title: 'Основы Python',
    description: 'Изучите синтаксис, типы данных и базовые конструкции языка',
    progress: 40,
    lessonsCount: 5,
    completedLessons: 2,
    imageEmoji: '🐍',
  },
  {
    id: 2,
    title: 'Английский A1',
    description: 'Базовая лексика и простые фразы для повседневного общения',
    progress: 0,
    lessonsCount: 4,
    completedLessons: 0,
    imageEmoji: '🇬🇧',
  },
  {
    id: 3,
    title: 'Финансовая грамотность',
    description: 'Бюджет, сбережения и основы инвестирования',
    progress: 75,
    lessonsCount: 4,
    completedLessons: 3,
    imageEmoji: '💰',
  },
];

const MOCK_LESSONS: Record<number, Lesson> = {
  1: {
    id: 1,
    courseId: 1,
    title: 'Что такое Python?',
    content: [
      'Python — высокоуровневый язык программирования с простым и читаемым синтаксисом.',
      'Он используется в веб-разработке, анализе данных, машинном обучении и автоматизации.',
      'Первая программа на Python — классическое «Hello, World!»:',
      '```python\nprint("Hello, World!")\n```',
    ],
    nextLessonId: 2,
    quizId: 1,
  },
  2: {
    id: 2,
    courseId: 1,
    title: 'Переменные и типы',
    content: [
      'Переменная — именованная область памяти для хранения данных.',
      'Основные типы: int, float, str, bool.',
      'Пример:',
      '```python\nage = 25\nname = "Анна"\nis_student = True\n```',
    ],
    nextLessonId: 3,
    quizId: 2,
  },
  3: {
    id: 3,
    courseId: 1,
    title: 'Условия и циклы',
    content: [
      'Условный оператор if позволяет выполнять код при определённом условии.',
      'Циклы for и while повторяют блок кода несколько раз.',
      '```python\nfor i in range(3):\n    print(i)\n```',
    ],
    nextLessonId: 4,
  },
};

const MOCK_QUIZZES: Record<number, { id: number; title: string; questions: QuizQuestionWithAnswer[] }> = {
  1: {
    id: 1,
    title: 'Проверка: Основы Python',
    questions: [
      {
        id: 1,
        text: 'Какой тип данных у значения 42?',
        options: [
          { id: 1, text: 'int' },
          { id: 2, text: 'str' },
          { id: 3, text: 'float' },
          { id: 4, text: 'bool' },
        ],
        correctOptionId: 1,
      },
      {
        id: 2,
        text: 'Как вывести текст в консоль?',
        options: [
          { id: 1, text: 'echo()' },
          { id: 2, text: 'print()' },
          { id: 3, text: 'console.log()' },
          { id: 4, text: 'write()' },
        ],
        correctOptionId: 2,
      },
    ],
  },
  2: {
    id: 2,
    title: 'Проверка: Переменные',
    questions: [
      {
        id: 3,
        text: 'Какой тип у True?',
        options: [
          { id: 1, text: 'int' },
          { id: 2, text: 'str' },
          { id: 3, text: 'bool' },
          { id: 4, text: 'None' },
        ],
        correctOptionId: 3,
      },
    ],
  },
};

@Injectable()
export class MockLearningApiService implements LearningApi {
  private completedLessons = new Set<number>([1]);

  getProfile(): Observable<UserProfile> {
    return of({
      id: 1,
      firstName: 'Тест',
      lastName: 'Пользователь',
      username: 'test_user',
      xp: 320,
      streak: 5,
      completedLessons: this.completedLessons.size,
      achievements: [
        {
          id: 'first_lesson',
          title: 'Первый шаг',
          description: 'Завершите первый урок',
          unlocked: true,
          emoji: '🎯',
        },
        {
          id: 'streak_3',
          title: 'На волне',
          description: '3 дня подряд',
          unlocked: true,
          emoji: '🔥',
        },
        {
          id: 'streak_7',
          title: 'Неделя силы',
          description: '7 дней подряд',
          unlocked: false,
          emoji: '⭐',
        },
      ],
      continueLesson: {
        id: 2,
        title: 'Переменные и типы',
        order: 2,
        completed: false,
        quizId: 2,
        courseTitle: 'Основы Python',
        courseId: 1,
      },
    }).pipe(delay(400));
  }

  getCourses(): Observable<Course[]> {
    return of(MOCK_COURSES).pipe(delay(400));
  }

  getCourse(id: number): Observable<CourseDetail> {
    const course = MOCK_COURSES.find((item) => item.id === id);

    if (!course) {
      throw new Error(`Course ${id} not found`);
    }

    const lessons = Object.values(MOCK_LESSONS)
      .filter((lesson) => lesson.courseId === id)
      .sort((a, b) => a.id - b.id)
      .map((lesson, index) => ({
        id: lesson.id,
        title: lesson.title,
        order: index + 1,
        completed: this.completedLessons.has(lesson.id),
        quizId: lesson.quizId,
      }));

    return of({ ...course, lessons }).pipe(delay(400));
  }

  getLesson(id: number): Observable<Lesson> {
    const lesson = MOCK_LESSONS[id];

    if (!lesson) {
      throw new Error(`Lesson ${id} not found`);
    }

    return of(lesson).pipe(delay(300));
  }

  completeLesson(id: number): Observable<void> {
    this.completedLessons.add(id);
    return of(void 0).pipe(delay(300));
  }

  getQuiz(id: number): Observable<Quiz> {
    const quiz = MOCK_QUIZZES[id];

    if (!quiz) {
      throw new Error(`Quiz ${id} not found`);
    }

    const sanitized: Quiz = {
      id: quiz.id,
      title: quiz.title,
      questions: quiz.questions.map(({ correctOptionId: _correct, ...question }) => question),
    };

    return of(sanitized).pipe(delay(300));
  }

  submitQuiz(id: number, request: QuizSubmitRequest): Observable<QuizSubmitResult> {
    const quiz = MOCK_QUIZZES[id];

    if (!quiz) {
      throw new Error(`Quiz ${id} not found`);
    }

    let score = 0;
    const correctAnswers: Record<number, number> = {};

    for (const question of quiz.questions) {
      correctAnswers[question.id] = question.correctOptionId;

      if (request.answers[question.id] === question.correctOptionId) {
        score += 1;
      }
    }

    return of({
      score,
      total: quiz.questions.length,
      passed: score >= Math.ceil(quiz.questions.length * 0.6),
      correctAnswers,
    }).pipe(delay(500));
  }
}
