import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Game, GameList } from '../../shared/models/game.model';
import { ReviewWithDetails, FeedResponse } from '../../shared/models/review.model';
import { UserProfile } from '../../shared/models/user.model';
import { Comment } from '../../shared/models/comment.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Games ──────────────────────────────────────
  getGames(page = 1, limit = 15, genre?: string, search?: string): Observable<GameList> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (genre) params = params.set('genre', genre);
    if (search) params = params.set('search', search);
    return this.http.get<GameList>(`${this.apiUrl}/games`, { params });
  }

  getGame(id: number): Observable<Game> {
    return this.http.get<Game>(`${this.apiUrl}/games/${id}`);
  }

  getGameReviews(gameId: number): Observable<ReviewWithDetails[]> {
    return this.http.get<ReviewWithDetails[]>(`${this.apiUrl}/games/${gameId}/reviews`);
  }

  // ── Admin Games ────────────────────────────────
  createGame(gameData: Partial<Game>): Observable<Game> {
    return this.http.post<Game>(`${this.apiUrl}/games`, gameData);
  }

  updateGame(id: number, gameData: Partial<Game>): Observable<Game> {
    return this.http.put<Game>(`${this.apiUrl}/games/${id}`, gameData);
  }

  deleteGame(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/games/${id}`);
  }

  // ── Reviews ────────────────────────────────────
  createReview(data: { game_id: number; rating: number; content: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reviews`, data);
  }

  getReview(id: number): Observable<ReviewWithDetails> {
    return this.http.get<ReviewWithDetails>(`${this.apiUrl}/reviews/${id}`);
  }

  updateReview(id: number, data: { rating?: number; content?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/reviews/${id}`, data);
  }

  deleteReview(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reviews/${id}`);
  }

  // ── Comments ───────────────────────────────────
  getComments(reviewId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/reviews/${reviewId}/comments`);
  }

  createComment(reviewId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/reviews/${reviewId}/comments`, { content });
  }

  deleteComment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/comments/${id}`);
  }

  // ── Users ──────────────────────────────────────
  getUserProfile(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/users/${id}`);
  }

  getAdminUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.apiUrl}/users`);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  getUserReviews(userId: number): Observable<ReviewWithDetails[]> {
    return this.http.get<ReviewWithDetails[]>(`${this.apiUrl}/users/${userId}/reviews`);
  }

  // ── Follows ────────────────────────────────────
  followUser(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/follow`, {});
  }

  unfollowUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}/follow`);
  }

  getFollowers(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/${userId}/followers`);
  }

  getFollowing(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/${userId}/following`);
  }

  // ── Feed ───────────────────────────────────────
  getFeed(page = 1, limit = 20): Observable<FeedResponse> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<FeedResponse>(`${this.apiUrl}/feed`, { params });
  }
}
