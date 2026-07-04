import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, throwError } from 'rxjs';
import { environmentLocal } from '../../../environments/environment.local';
import {
  AnswerResultDto,
  DashboardDto,
  MeDto,
  QuestionDto,
  QuizPickDto,
  QuizPickRequestDto,
  RoadmapDto,
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
import { LearningApi } from './learning-api.interface';

@Injectable()
export class HttpLearningApiService implements LearningApi {
  private readonly baseUrl = environmentLocal.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getDashboard(): Observable<Dashboard> {
    return this.http
      .get<DashboardDto>(`${this.baseUrl}/dashboard`)
      .pipe(map((dto) => mapDashboard(dto)));
  }

  getRoadmap(): Observable<Roadmap> {
    return this.http.get<RoadmapDto>(`${this.baseUrl}/roadmap`).pipe(map((dto) => mapRoadmap(dto)));
  }

  getProfile(): Observable<ProfileView> {
    return forkJoin({
      me: this.http.get<MeDto>(`${this.baseUrl}/me`),
      stats: this.http.get<StatsDto>(`${this.baseUrl}/stats`),
      achievements: this.http.get<string[]>(`${this.baseUrl}/achievements`),
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
}
