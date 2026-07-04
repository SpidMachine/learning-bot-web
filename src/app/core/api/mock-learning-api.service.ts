import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { QuizPickRequestDto, StartSessionRequestDto } from '../../shared/models/api.dto';
import {
  AnswerResult,
  Dashboard,
  ProfileView,
  Question,
  Roadmap,
  Session,
  Topic,
} from '../../shared/models/learning.models';
import { LearningApi } from './learning-api.interface';

const MOCK_TOPICS: Topic[] = [
  { key: 'java_core', title: 'Java Core', emoji: '☕', answered: 12, correct: 9, accuracy: 75 },
  { key: 'spring', title: 'Spring', emoji: '🌱', answered: 8, correct: 5, accuracy: 62 },
  { key: 'devops', title: 'DevOps', emoji: '⚙️', answered: 0, correct: 0, accuracy: 0 },
];

const MOCK_QUESTION: Question = {
  id: 'spring_01',
  kind: 'quiz',
  topics: ['spring'],
  difficulty: 'medium',
  text: 'Что делает @Transactional?',
  options: [
    'Создаёт HTTP-транзакцию',
    'Оборачивает метод в транзакцию БД',
    'Кэширует результат',
    'Валидирует DTO',
  ],
  tags: ['interview'],
};

const MOCK_ROADMAP: Roadmap = {
  title: 'Java Learning Roadmap',
  subtitle: 'Путь от основ до production-ready разработчика',
  currentStageOrder: 2,
  stages: [
    {
      order: 1,
      key: 'java_core',
      title: 'Java Basics',
      emoji: '💻',
      color: '#a855f7',
      status: 'completed',
      topicKey: 'java_core',
      progress: 100,
      topics: ['Синтаксис и типы', 'ООП', 'Коллекции', 'Streams', 'Исключения'],
    },
    {
      order: 2,
      key: 'spring',
      title: 'Spring Framework',
      emoji: '🌱',
      color: '#3b82f6',
      status: 'active',
      topicKey: 'spring',
      progress: 45,
      topics: ['DI и IoC', '@Transactional', 'Spring Boot', 'REST API', 'Security'],
    },
    {
      order: 3,
      key: 'docker_k8s',
      title: 'Docker & K8s',
      emoji: '🐳',
      color: '#22c55e',
      status: 'locked',
      topicKey: 'docker_k8s',
      progress: 0,
      topics: ['Dockerfile', 'Compose', 'Pods', 'Deployments', 'Helm'],
    },
    {
      order: 4,
      key: 'cicd',
      title: 'CI/CD',
      emoji: '🔄',
      color: '#f97316',
      status: 'locked',
      topicKey: 'cicd',
      progress: 0,
      topics: ['GitHub Actions', 'Pipeline', 'Тесты в CI', 'Деплой', 'Артефакты'],
    },
    {
      order: 5,
      key: 'projects',
      title: 'Projects',
      emoji: '💡',
      color: '#eab308',
      status: 'locked',
      progress: 0,
      topics: ['Pet-проект', 'Code review', 'Документация', 'Портфолио'],
    },
    {
      order: 6,
      key: 'career',
      title: 'Career',
      emoji: '💼',
      color: '#ec4899',
      status: 'locked',
      progress: 0,
      topics: ['Собеседования', 'Open Source', 'Нетворкинг', 'Рост'],
    },
  ],
};

@Injectable()
export class MockLearningApiService implements LearningApi {
  private session: Session | null = null;

  getDashboard(): Observable<Dashboard> {
    const nextAction =
      this.session && !this.session.finished
        ? ({
            type: 'session' as const,
            label: 'Продолжить сессию',
            title: 'Сессия в процессе',
            subtitle: `Вопрос ${this.session.currentIndex} / ${this.session.total}`,
          })
        : ({
            type: 'topic' as const,
            label: 'Продолжить обучение',
            topicKey: 'spring',
            title: 'Spring Framework',
            subtitle: 'Следующий этап роудмапа',
          });

    return of({
      me: { id: 1, firstName: 'Тест', username: 'test_user' },
      stats: {
        totalAnswered: 20,
        totalCorrect: 14,
        accuracy: 70,
        streakDays: 5,
        dueForReview: 3,
        flashcardsDone: 2,
        weeklyGoal: 30,
        weekAnswered: 12,
      },
      session: this.session,
      achievements: ['Первый ответ', 'Серия 3 дня'],
      nextAction,
    }).pipe(delay(300));
  }

  getRoadmap(): Observable<Roadmap> {
    return of(MOCK_ROADMAP).pipe(delay(300));
  }

  getProfile(): Observable<ProfileView> {
    return of({
      me: { id: 1, firstName: 'Тест', username: 'test_user' },
      stats: {
        totalAnswered: 20,
        totalCorrect: 14,
        accuracy: 70,
        streakDays: 5,
        dueForReview: 3,
        flashcardsDone: 2,
        weeklyGoal: 30,
        weekAnswered: 12,
      },
      achievements: ['Первый ответ', 'Серия 3 дня'],
    }).pipe(delay(300));
  }

  getTopics(): Observable<Topic[]> {
    return of(MOCK_TOPICS).pipe(delay(300));
  }

  getCurrentSession(): Observable<Session | null> {
    return of(this.session).pipe(delay(200));
  }

  startSession(request: StartSessionRequestDto): Observable<Session> {
    this.session = {
      mode: request.mode ?? 'quiz',
      currentIndex: 1,
      total: 5,
      correctCount: 0,
      finished: false,
      currentQuestion: MOCK_QUESTION,
    };
    return of(this.session).pipe(delay(300));
  }

  submitAnswer(_itemId: string, selectedIndex: number): Observable<AnswerResult> {
    const correct = selectedIndex === 1;
    return of({
      correct,
      correctIndex: 1,
      explanation: correct
        ? 'Верно! @Transactional управляет транзакцией БД.'
        : 'Неверно. @Transactional оборачивает метод в транзакцию БД.',
      newAchievements: correct ? ['first_answer'] : [],
    }).pipe(delay(400));
  }

  pickQuiz(_request?: QuizPickRequestDto): Observable<Question> {
    return of(MOCK_QUESTION).pipe(delay(300));
  }

  getReviewQuiz(): Observable<Question> {
    return of(MOCK_QUESTION).pipe(delay(300));
  }

  getQuestion(itemId: string): Observable<Question> {
    return of({ ...MOCK_QUESTION, id: itemId }).pipe(delay(200));
  }

  getBookmarks(): Observable<Question[]> {
    return of([MOCK_QUESTION]).pipe(delay(200));
  }

  addBookmark(_itemId: string): Observable<void> {
    return of(void 0).pipe(delay(200));
  }
}
