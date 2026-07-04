import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, switchMap, throwError } from 'rxjs';
import { environmentLocal } from '../../../environments/environment.local';
import {
  AnswerResultDto,
  MeDto,
  QuestionDto,
  QuizPickDto,
  QuizPickRequestDto,
  SessionDto,
  StartSessionRequestDto,
  StatsDto,
  TopicDto,
} from '../../shared/models/api.dto';
import {
  AnswerResult,
  Dashboard,
  ProfileView,
  Question,
  Roadmap,
  Session,
  Topic,
} from '../../shared/models/learning.models';
import { normalizeDashboardDto, normalizeRoadmapDto, STAGE_COLORS } from './api-normalize';
import {
  mapAnswerResult,
  mapDashboard,
  mapMe,
  mapQuestion,
  mapQuizPick,
  mapRoadmap,
  mapSession,
  mapStats,
  mapTopic,
} from './api.mapper';
import { inferNextAction } from './next-action.util';
import { LearningApi } from './learning-api.interface';

@Injectable()
export class HttpLearningApiService implements LearningApi {
  private readonly baseUrl = environmentLocal.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getDashboard(): Observable<Dashboard> {
    return this.http.get<unknown>(`${this.baseUrl}/dashboard`).pipe(
      map((raw) => this.toDashboard(raw)),
      catchError(() => this.buildDashboardFallback()),
    );
  }

  getRoadmap(): Observable<Roadmap> {
    return this.http.get<unknown>(`${this.baseUrl}/roadmap`).pipe(
      map((raw) => this.toRoadmap(raw)),
      switchMap((roadmap) =>
        roadmap.stages.length > 0 ? of(roadmap) : this.buildRoadmapFallback(),
      ),
      catchError(() => this.buildRoadmapFallback()),
    );
  }

  getProfile(): Observable<ProfileView> {
    return forkJoin({
      me: this.http.get<MeDto>(`${this.baseUrl}/me`),
      stats: this.http.get<StatsDto>(`${this.baseUrl}/stats`),
      achievements: this.http
        .get<string[]>(`${this.baseUrl}/achievements`)
        .pipe(catchError(() => of([]))),
    }).pipe(
      map(({ me, stats, achievements }) => ({
        me: mapMe(me),
        stats: mapStats(stats),
        achievements,
      })),
    );
  }

  getTopics(): Observable<Topic[]> {
    return forkJoin({
      topics: this.http.get<TopicDto[]>(`${this.baseUrl}/topics`),
      stats: this.http.get<StatsDto>(`${this.baseUrl}/stats`),
    }).pipe(
      map(({ topics, stats }) =>
        topics.map((topic) => {
          const topicStats = stats.topicStats.find((item) => item.title === topic.title);
          return mapTopic(topic, topicStats);
        }),
      ),
    );
  }

  getCurrentSession(): Observable<Session | null> {
    return this.http.get<SessionDto>(`${this.baseUrl}/sessions/current`).pipe(
      map((dto) => mapSession(dto)),
      catchError((error) => (error.status === 404 ? of(null) : throwError(() => error))),
    );
  }

  startSession(request: StartSessionRequestDto): Observable<Session> {
    return this.http
      .post<SessionDto>(`${this.baseUrl}/sessions`, request)
      .pipe(map((dto) => mapSession(dto)));
  }

  submitAnswer(itemId: string, selectedIndex: number): Observable<AnswerResult> {
    return this.http
      .post<AnswerResultDto>(`${this.baseUrl}/quiz/answers`, { itemId, selectedIndex })
      .pipe(map((dto) => mapAnswerResult(dto)));
  }

  pickQuiz(request: QuizPickRequestDto = {}): Observable<Question> {
    return this.http
      .post<QuizPickDto>(`${this.baseUrl}/quiz/pick`, request)
      .pipe(map((dto) => mapQuizPick(dto)));
  }

  getReviewQuiz(): Observable<Question> {
    return this.http
      .post<QuizPickDto>(`${this.baseUrl}/quiz/review`, {})
      .pipe(map((dto) => mapQuizPick(dto)));
  }

  getQuestion(itemId: string): Observable<Question> {
    return this.http
      .get<QuestionDto>(`${this.baseUrl}/quiz/items/${itemId}`)
      .pipe(map((dto) => mapQuestion(dto)));
  }

  getBookmarks(): Observable<Question[]> {
    return this.http
      .get<QuestionDto[]>(`${this.baseUrl}/bookmarks`)
      .pipe(map((items) => items.map((dto) => mapQuestion(dto))));
  }

  addBookmark(itemId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/bookmarks/${itemId}`, {});
  }

  private toDashboard(raw: unknown): Dashboard {
    const dashboard = mapDashboard(normalizeDashboardDto(raw));

    if (!dashboard.nextAction?.type || !dashboard.nextAction.label) {
      dashboard.nextAction = inferNextAction(dashboard.session, dashboard.stats);
    }

    return dashboard;
  }

  private toRoadmap(raw: unknown): Roadmap {
    return mapRoadmap(normalizeRoadmapDto(raw));
  }

  private buildDashboardFallback(): Observable<Dashboard> {
    return forkJoin({
      me: this.http.get<MeDto>(`${this.baseUrl}/me`),
      stats: this.http.get<StatsDto>(`${this.baseUrl}/stats`),
      session: this.getCurrentSession(),
      achievements: this.http
        .get<string[]>(`${this.baseUrl}/achievements`)
        .pipe(catchError(() => of([]))),
    }).pipe(
      map(({ me, stats, session, achievements }) => {
        const mappedStats = mapStats(stats);
        const mappedSession = session;

        return {
          me: mapMe(me),
          stats: mappedStats,
          session: mappedSession,
          achievements,
          nextAction: inferNextAction(mappedSession, mappedStats),
        };
      }),
    );
  }

  private buildRoadmapFallback(): Observable<Roadmap> {
    return this.getTopics().pipe(
      map((topics) => ({
        title: 'Learning Roadmap',
        subtitle: 'Путь обучения по темам',
        stages: topics.map((topic, index) => ({
          order: index + 1,
          key: topic.key,
          title: topic.title,
          emoji: topic.emoji,
          color: STAGE_COLORS[index % STAGE_COLORS.length],
          status: topic.answered
            ? ('completed' as const)
            : index === 0 || topics[index - 1]?.answered
              ? ('active' as const)
              : ('locked' as const),
          topics: topic.answered
            ? [`${topic.correct ?? 0} / ${topic.answered} верных ответов`]
            : ['Ещё не начинали'],
          progress: topic.accuracy,
          topicKey: topic.key,
        })),
      })),
      catchError(() =>
        of({
          title: 'Learning Roadmap',
          subtitle: 'Путь обучения',
          stages: [],
        }),
      ),
    );
  }
}
