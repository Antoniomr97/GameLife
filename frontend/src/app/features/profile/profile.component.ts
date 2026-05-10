import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';
import { UserProfile } from '../../shared/models/user.model';
import { ReviewWithDetails } from '../../shared/models/review.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, StarRatingComponent],
  template: `
    <div class="profile-container">
      @if (loading()) {
        <div class="loading"><div class="spinner"></div></div>
      } @else if (user()) {
        <div class="profile-header">
          <div class="profile-avatar">{{ user()!.username[0].toUpperCase() }}</div>
          <div class="profile-info">
            <h1>{{ user()!.username }}</h1>
            @if (user()!.bio) {
              <p class="bio">{{ user()!.bio }}</p>
            }
            <div class="stats">
              <div class="stat">
                <span class="stat-value">{{ user()!.reviews_count }}</span>
                <span class="stat-label">Reseñas</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ user()!.followers_count }}</span>
                <span class="stat-label">Seguidores</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ user()!.following_count }}</span>
                <span class="stat-label">Siguiendo</span>
              </div>
            </div>
          </div>
          @if (showFollowBtn()) {
            <button class="btn-follow" [class.following]="user()!.is_following" (click)="toggleFollow()">
              {{ user()!.is_following ? '✓ Siguiendo' : '+ Seguir' }}
            </button>
          }
        </div>

        <h2 class="section-title">Reseñas</h2>
        <div class="reviews-list">
          @for (review of reviews(); track review.id) {
            <article class="review-card">
              <div class="review-header">
                <a [routerLink]="['/games', review.game_id]" class="game-info">
                  @if (review.game_cover) {
                    <img [src]="review.game_cover" class="game-thumb" />
                  }
                  <span>{{ review.game_title }}</span>
                </a>
                <app-star-rating [rating]="review.rating" />
              </div>
              <p class="review-text">{{ review.content }}</p>
              <span class="review-date">{{ review.created_at | date:'dd MMM yyyy' }}</span>
            </article>
          } @empty {
            <p class="no-reviews">Este usuario aún no ha escrito reseñas.</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-container { max-width: 800px; margin: 0 auto; padding: 2rem; }
    .loading { text-align: center; padding: 4rem; }
    .spinner {
      width: 40px; height: 40px; border: 3px solid rgba(139,92,246,0.2);
      border-top-color: #8b5cf6; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin: 0 auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .profile-header {
      display: flex; align-items: center; gap: 1.5rem;
      background: rgba(30,30,50,0.8); border: 1px solid rgba(139,92,246,0.2);
      border-radius: 20px; padding: 2rem; margin-bottom: 2rem;
    }
    .profile-avatar {
      width: 80px; height: 80px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, #8b5cf6, #06b6d4);
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 800; font-size: 2rem;
    }
    .profile-info { flex: 1; }
    .profile-info h1 { font-size: 1.5rem; color: #e2e8f0; margin: 0 0 0.3rem; }
    .bio { color: #94a3b8; font-size: 0.9rem; margin: 0 0 0.75rem; }
    .stats { display: flex; gap: 1.5rem; }
    .stat { text-align: center; }
    .stat-value { display: block; font-size: 1.2rem; font-weight: 700; color: #e2e8f0; }
    .stat-label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .btn-follow {
      padding: 0.6rem 1.5rem; border-radius: 10px; border: 1px solid #8b5cf6;
      background: transparent; color: #8b5cf6; font-weight: 600; cursor: pointer;
      transition: all 0.2s; white-space: nowrap;
    }
    .btn-follow:hover { background: rgba(139,92,246,0.1); }
    .btn-follow.following { background: rgba(139,92,246,0.2); color: #c4b5fd; }
    .section-title { font-size: 1.2rem; color: #e2e8f0; margin: 0 0 1rem; font-weight: 700; }
    .reviews-list { display: flex; flex-direction: column; gap: 1rem; }
    .review-card {
      background: rgba(30,30,50,0.8); border: 1px solid rgba(139,92,246,0.1);
      border-radius: 14px; padding: 1.25rem;
    }
    .review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .game-info {
      display: flex; align-items: center; gap: 0.5rem;
      text-decoration: none; color: #c4b5fd; font-weight: 600;
    }
    .game-info:hover { text-decoration: underline; }
    .game-thumb { width: 28px; height: 36px; border-radius: 4px; object-fit: cover; }
    .review-text { color: #cbd5e1; line-height: 1.6; margin: 0 0 0.5rem; font-size: 0.9rem; }
    .review-date { color: #64748b; font-size: 0.8rem; }
    .no-reviews { color: #64748b; text-align: center; padding: 2rem; font-style: italic; }
  `]
})
export class ProfileComponent implements OnInit {
  user = signal<UserProfile | null>(null);
  reviews = signal<ReviewWithDetails[]>([]);
  loading = signal(true);
  showFollowBtn = signal(false);

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const userId = +params['id'];
      this.loadProfile(userId);
    });
  }

  loadProfile(userId: number): void {
    this.loading.set(true);
    const currentId = this.auth.currentUser()?.id;
    this.showFollowBtn.set(!!currentId && currentId !== userId);

    this.api.getUserProfile(userId).subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.api.getUserReviews(userId).subscribe({
      next: (reviews) => this.reviews.set(reviews as ReviewWithDetails[])
    });
  }

  toggleFollow(): void {
    const u = this.user();
    if (!u) return;

    const action = u.is_following
      ? this.api.unfollowUser(u.id)
      : this.api.followUser(u.id);

    action.subscribe({
      next: (res) => {
        this.user.set({
          ...u,
          is_following: res.is_following,
          followers_count: res.followers_count,
          following_count: res.following_count
        });
      }
    });
  }
}
