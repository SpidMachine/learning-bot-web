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
  TopicDetail,
  TopicRoadmap,
} from '../../shared/models/learning.models';
import { LearningApi } from './learning-api.interface';

const MOCK_TOPICS: Topic[] = [
  { key: 'java_core', title: 'Java Core', emoji: '☕', answered: 40, correct: 32, accuracy: 85 },
  { key: 'spring', title: 'Spring', emoji: '🌱', answered: 20, correct: 12, accuracy: 62 },
  { key: 'docker_k8s', title: 'Docker & K8s', emoji: '🐳', answered: 5, correct: 3, accuracy: 40 },
  { key: 'cicd', title: 'CI/CD', emoji: '🔄', answered: 0, correct: 0, accuracy: 0 },
  { key: 'integrations', title: 'Интеграции', emoji: '🔌', answered: 0, correct: 0, accuracy: 0 },
];

const MOCK_ROADMAP: Roadmap = {
  title: 'Java Learning Roadmap',
  subtitle: 'Путь от основ до production-ready разработчика',
  nodes: [
    {
      key: 'java_core',
      title: 'Java Core',
      emoji: '☕',
      percent: 85,
      status: 'completed',
      subtopicCount: 5,
      completedSubtopics: 5,
    },
    {
      key: 'spring',
      title: 'Spring',
      emoji: '🌱',
      percent: 45,
      status: 'in_progress',
      subtopicCount: 4,
      completedSubtopics: 1,
      currentSubtopicKey: 'spring_core',
    },
    {
      key: 'docker_k8s',
      title: 'Docker & K8s',
      emoji: '🐳',
      percent: 10,
      status: 'available',
      subtopicCount: 3,
      completedSubtopics: 0,
    },
    {
      key: 'cicd',
      title: 'CI/CD',
      emoji: '🔄',
      percent: 0,
      status: 'available',
      subtopicCount: 3,
      completedSubtopics: 0,
    },
    {
      key: 'integrations',
      title: 'Интеграции',
      emoji: '🔌',
      percent: 0,
      status: 'available',
      subtopicCount: 2,
      completedSubtopics: 0,
    },
  ],
};

const MOCK_TOPIC_ROADMAPS: Record<string, TopicRoadmap> = {
  spring: {
    topicKey: 'spring',
    title: 'Spring',
    emoji: '🌱',
    overallPercent: 45,
    currentSubtopicKey: 'spring_core',
    subtopics: [
      {
        key: 'spring_intro',
        title: 'Введение в Spring',
        emoji: '🌱',
        description: 'IoC, DI, контекст приложения',
        status: 'completed',
        percent: 100,
        totals: { answered: 20, total: 20, correct: 18 },
      },
      {
        key: 'spring_core',
        title: 'Spring Core',
        emoji: '⚙️',
        description: '@Configuration, @Bean, жизненный цикл',
        status: 'in_progress',
        percent: 55,
        totals: { answered: 11, total: 20, correct: 8 },
      },
      {
        key: 'spring_boot',
        title: 'Spring Boot',
        emoji: '🚀',
        description: 'Auto-configuration, starters, Actuator',
        status: 'locked',
        percent: 0,
        totals: { answered: 0, total: 15 },
      },
      {
        key: 'spring_data',
        title: 'Spring Data',
        emoji: '🗄️',
        description: 'JPA, репозитории, транзакции',
        status: 'locked',
        percent: 0,
        totals: { answered: 0, total: 15 },
      },
    ],
  },
};

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
            type: 'subtopic' as const,
            label: 'Продолжить обучение',
            topic: 'spring',
            subtopic: 'spring_core',
            title: 'Spring Core',
            subtitle: 'Подтема в процессе',
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

  getTopicDetail(topicKey: string): Observable<TopicDetail> {
    const roadmap = MOCK_TOPIC_ROADMAPS[topicKey];
    const topic = MOCK_TOPICS.find((item) => item.key === topicKey);

    return of({
      key: topicKey,
      title: roadmap?.title ?? topic?.title ?? topicKey,
      emoji: roadmap?.emoji ?? topic?.emoji ?? '📚',
      overallPercent: roadmap?.overallPercent ?? topic?.accuracy ?? 0,
      subtopicCount: roadmap?.subtopics.length,
      completedSubtopics: roadmap?.subtopics.filter((s) => s.status === 'completed').length,
      currentSubtopicKey: roadmap?.currentSubtopicKey,
    }).pipe(delay(200));
  }

  getTopicRoadmap(topicKey: string): Observable<TopicRoadmap> {
    const roadmap = MOCK_TOPIC_ROADMAPS[topicKey];

    if (roadmap) {
      return of(roadmap).pipe(delay(200));
    }

    return of({
      topicKey,
      title: topicKey,
      emoji: '📚',
      overallPercent: 0,
      subtopics: [],
    }).pipe(delay(200));
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
