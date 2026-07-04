import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
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
import { QuizPickRequestDto, StartSessionRequestDto } from '../../shared/models/api.dto';

export const LEARNING_API = new InjectionToken<LearningApi>('LEARNING_API');

export interface LearningApi {
  getDashboard(): Observable<Dashboard>;
  getRoadmap(): Observable<Roadmap>;
  getTopicDetail(topicKey: string): Observable<TopicDetail>;
  getTopicRoadmap(topicKey: string): Observable<TopicRoadmap>;
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
