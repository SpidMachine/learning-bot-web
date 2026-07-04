import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { QuizPickRequestDto, StartSessionRequestDto } from '../../shared/models/api.dto';
import {
  AnswerResult,
  HomeDashboard,
  ProfileView,
  Question,
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

@Injectable()
export class MockLearningApiService implements LearningApi {
  private session: Session | null = null;

  getHomeDashboard(): Observable<HomeDashboard> {
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
      achievements: ['first_answer', 'streak_3'],
    }).pipe(delay(300));
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
      achievements: ['first_answer', 'streak_3'],
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
