import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiCourseDetailDto,
  ApiCourseDto,
  ApiLessonDto,
  ApiQuizDto,
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
import {
  mapCourse,
  mapCourseDetail,
  mapLesson,
  mapQuiz,
  mapQuizSubmitRequest,
  mapQuizSubmitResult,
  mapUserProfile,
} from './api.mapper';
import { LearningApi } from './learning-api.interface';

@Injectable()
export class HttpLearningApiService implements LearningApi {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getProfile(): Observable<UserProfile> {
    return this.http
      .get<ApiUserProfileDto>(`${this.baseUrl}/me`)
      .pipe(map((dto) => mapUserProfile(dto)));
  }

  getCourses(): Observable<Course[]> {
    return this.http
      .get<ApiCourseDto[]>(`${this.baseUrl}/courses`)
      .pipe(map((items) => items.map((dto) => mapCourse(dto))));
  }

  getCourse(id: number): Observable<CourseDetail> {
    return this.http
      .get<ApiCourseDetailDto>(`${this.baseUrl}/courses/${id}`)
      .pipe(map((dto) => mapCourseDetail(dto)));
  }

  getLesson(id: number): Observable<Lesson> {
    return this.http
      .get<ApiLessonDto>(`${this.baseUrl}/lessons/${id}`)
      .pipe(map((dto) => mapLesson(dto)));
  }

  completeLesson(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/lessons/${id}/complete`, {});
  }

  getQuiz(id: number): Observable<Quiz> {
    return this.http
      .get<ApiQuizDto>(`${this.baseUrl}/quizzes/${id}`)
      .pipe(map((dto) => mapQuiz(dto)));
  }

  submitQuiz(id: number, request: QuizSubmitRequest): Observable<QuizSubmitResult> {
    return this.http
      .post<ApiQuizSubmitResultDto>(
        `${this.baseUrl}/quizzes/${id}/submit`,
        mapQuizSubmitRequest(request),
      )
      .pipe(map((dto) => mapQuizSubmitResult(dto)));
  }
}
