import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Course,
  CourseDetail,
  Lesson,
  Quiz,
  QuizSubmitRequest,
  QuizSubmitResult,
  UserProfile,
} from '../../shared/models/learning.models';

export const LEARNING_API = new InjectionToken<LearningApi>('LEARNING_API');

export interface LearningApi {
  getProfile(): Observable<UserProfile>;
  getCourses(): Observable<Course[]>;
  getCourse(id: number): Observable<CourseDetail>;
  getLesson(id: number): Observable<Lesson>;
  completeLesson(id: number): Observable<void>;
  getQuiz(id: number): Observable<Quiz>;
  submitQuiz(id: number, request: QuizSubmitRequest): Observable<QuizSubmitResult>;
}
