import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';
import { ReviewWithDetails } from '../../shared/models/review.model';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterModule, StarRatingComponent],
  template: `
    <div class="feed-container">
      <div class="feed-header">
        <h1>📰 Tu Feed</h1>
        <p>Reseñas de las personas que sigues</p>
      </div>

      @if (loading()) {
        <div class="loading"><div class="spinner"></div><p>Cargando tu feed...</p></div>
      } @else if (reviews().length === 0) {
        <div class="empty-feed">
          <span class="empty-icon">👥</span>
          <h2>Tu feed está vacío</h2>
          <p>Sigue a otros usuarios para ver sus reseñas aquí</p>
          <a routerLink="/" class="btn btn-primary">Explorar juegos</a>
        </div>
      } @else {
        <div class="feed-list">
          @for (review of reviews(); track review.id) {
            <article class="feed-card">
              <div class="feed-card-header">
                <div class="author-info">
                  <div class="avatar">{{ review.author_username[0].toUpperCase() }}</div>
                  <div>
                    <a [routerLink]="['/profile', review.user_id]" class="author-name">
                      {{ review.author_username }}
                    </a>
                    <span class="review-date">{{ review.created_at | date:'dd MMM yyyy' }}</span>
                  </div>
                </div>
                <app-star-rating [rating]="review.rating" [showValue]="true" />
              </div>
              <div class="feed-card-game">
                <a [routerLink]="['/games', review.game_id]" class="game-link">
                  @if (review.game_cover) {
                    <img [src]="review.game_cover" [alt]="review.game_title" class="game-thumb" />
                  }
                  <span class="game-name">{{ review.game_title }}</span>
                </a>
              </div>
              <p class="review-content">{{ review.content }}</p>
              <div class="feed-card-footer">
                <span class="comment-count">💬 {{ review.comments_count }} comentarios</span>
              </div>
            </article>
          }
        </div>
        @if (hasMore()) {
          <div class="load-more">
            <button class="btn btn-outline" (click)="loadMore()" [disabled]="loadingMore()">
              {{ loadingMore() ? 'Cargando...' : 'Cargar más' }}
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .feed-container { max-width: 720px; margin: 0 auto; padding: 2rem; }
    .feed-header { text-align: center; margin-bottom: 2rem; }
    .feed-header h1 { font-size: 1.8rem; font-weight: 800; color: #e2e8f0; margin: 0 0 0.3rem; }
    .feed-header p { color: #94a3b8; margin: 0; }
    .loading { text-align: center; padding: 4rem 0; }
    .spinner {
      width: 40px; height: 40px; border: 3px solid rgba(139,92,246,0.2);
      border-top-color: #8b5cf6; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin: 0 auto 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading p { color: #94a3b8; }
    .empty-feed { text-align: center; padding: 4rem 2rem; }
    .empty-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
    .empty-feed h2 { color: #e2e8f0; margin: 0 0 0.5rem; }
    .empty-feed p { color: #94a3b8; margin: 0 0 1.5rem; }
    .btn-primary {
      display: inline-block; padding: 0.7rem 1.5rem; background: linear-gradient(135deg, #8b5cf6, #6d28d9);
      color: white; border: none; border-radius: 10px; font-weight: 600;
      text-decoration: none; transition: all 0.2s;
    }
    .btn-primary:hover { transform: translateY(-2px); }
    .feed-list { display: flex; flex-direction: column; gap: 1.25rem; }
    .feed-card {
      background: rgba(30,30,50,0.8); border: 1px solid rgba(139,92,246,0.15);
      border-radius: 16px; padding: 1.5rem; transition: border-color 0.2s;
    }
    .feed-card:hover { border-color: rgba(139,92,246,0.3); }
    .feed-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .author-info { display: flex; align-items: center; gap: 0.75rem; }
    .avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, #8b5cf6, #06b6d4);
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 1rem;
    }
    .author-name { color: #c4b5fd; text-decoration: none; font-weight: 600; font-size: 0.95rem; }
    .author-name:hover { text-decoration: underline; }
    .review-date { display: block; color: #64748b; font-size: 0.8rem; margin-top: 0.1rem; }
    .feed-card-game { margin-bottom: 0.75rem; }
    .game-link {
      display: inline-flex; align-items: center; gap: 0.5rem;
      text-decoration: none; color: #94a3b8; font-size: 0.85rem;
      padding: 0.3rem 0.6rem; border-radius: 8px;
      background: rgba(15,15,25,0.5); transition: background 0.2s;
    }
    .game-link:hover { background: rgba(15,15,25,0.8); }
    .game-thumb { width: 24px; height: 32px; border-radius: 4px; object-fit: cover; }
    .game-name { font-weight: 500; }
    .review-content { color: #cbd5e1; line-height: 1.6; font-size: 0.95rem; margin: 0 0 1rem; }
    .feed-card-footer { display: flex; align-items: center; }
    .comment-count { color: #64748b; font-size: 0.85rem; }
    .load-more { text-align: center; margin-top: 2rem; }
    .btn-outline {
      padding: 0.6rem 2rem; border: 1px solid rgba(139,92,246,0.3);
      background: transparent; color: #8b5cf6; border-radius: 10px;
      font-weight: 600; cursor: pointer; transition: all 0.2s;
    }
    .btn-outline:hover:not(:disabled) { background: rgba(139,92,246,0.1); }
    .btn-outline:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class FeedComponent implements OnInit {
  reviews = signal<ReviewWithDetails[]>([]);
  loading = signal(true);
  loadingMore = signal(false);
  hasMore = signal(false);
  page = 1;

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadFeed(); }

  loadFeed(): void {
    this.loading.set(true);
    this.api.getFeed(1, 20).subscribe({
      next: (res) => {
        this.reviews.set(res.reviews);
        this.hasMore.set(res.has_more);
        this.page = 1;
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadMore(): void {
    this.loadingMore.set(true);
    this.page++;
    this.api.getFeed(this.page, 20).subscribe({
      next: (res) => {
        this.reviews.update(current => [...current, ...res.reviews]);
        this.hasMore.set(res.has_more);
        this.loadingMore.set(false);
      },
      error: () => this.loadingMore.set(false)
    });
  }
}
