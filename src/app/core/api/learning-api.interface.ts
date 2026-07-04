import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AnswerResult,
  HomeDashboard,
  ProfileView,
  Question,
  Session,
  Topic,
} from '../../shared/models/learning.models';
import { QuizPickRequestDto, StartSessionRequestDto } from '../../shared/models/api.dto';

export const LEARNING_API = new InjectionToken<LearningApi>('LEARNING_API');

export interface LearningApi {
  getHomeDashboard(): Observable<HomeDashboard>;
  getProfile(): Observable<ProfileView>;
  getTopics(): Observable<Topic[]>;
  getCurrentSession(): Observable<Session | null>;
  startSession(request: StartSessionRequestDto): Observable<Session>;
  submitAnswer(itemId: string, selectedIndex: number): Observable<AnswerResult>;
  pickQuiz(request?: QuizPickRequestDto): Observable<Question>;
  getReviewQuiz(): Observable<Question>;
  getQuestion(itemId: string): Observable<Question>;
  getBookmarks(): Observable<Question[]>;
  addBookmark(itemId: string): Observable<void>;
}
