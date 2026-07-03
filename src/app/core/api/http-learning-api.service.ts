import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Course,
  CourseDetail,
  Lesson,
  Quiz,
  QuizSubmitRequest,
  QuizSubmitResult,
  UserProfile,
} from '../../shared/models/learning.models';
import { LearningApi } from './learning-api.interface';

@Injectable()
export class HttpLearningApiService implements LearningApi {
  private readonly baseUrl = `${environment.apiUrl}/api/v1`;

  constructor(private readonly http: HttpClient) {}

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/me`);
  }

  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.baseUrl}/courses`);
  }

  getCourse(id: number): Observable<CourseDetail> {
    return this.http.get<CourseDetail>(`${this.baseUrl}/courses/${id}`);
  }

  getLesson(id: number): Observable<Lesson> {
    return this.http.get<Lesson>(`${this.baseUrl}/lessons/${id}`);
  }

  completeLesson(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/lessons/${id}/complete`, {});
  }

  getQuiz(id: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.baseUrl}/quizzes/${id}`);
  }

  submitQuiz(id: number, request: QuizSubmitRequest): Observable<QuizSubmitResult> {
    return this.http.post<QuizSubmitResult>(`${this.baseUrl}/quizzes/${id}/submit`, request);
  }
}
