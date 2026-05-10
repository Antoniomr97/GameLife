import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';
import { Game } from '../../shared/models/game.model';
import { ReviewWithDetails } from '../../shared/models/review.model';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StarRatingComponent],
  template: `
    <div class="game-detail">
      @if (loading()) {
        <div class="loading"><div class="spinner"></div></div>
      } @else if (game()) {
        <div class="game-hero">
          <div class="hero-bg">
            @if (game()!.cover_url) {
              <img [src]="game()!.cover_url" [alt]="game()!.title" class="hero-cover" />
            }
          </div>
          <div class="hero-info">
            <h1>{{ game()!.title }}</h1>
            <div class="hero-meta">
              @if (game()!.genre) { <span class="badge">{{ game()!.genre }}</span> }
              @if (game()!.release_year) { <span class="year">{{ game()!.release_year }}</span> }
              @if (game()!.platform) { <span class="platform">{{ game()!.platform }}</span> }
            </div>
            <div class="hero-rating">
              @if (game()!.avg_rating) {
                <app-star-rating [rating]="game()!.avg_rating!" [showValue]="true" />
                <span class="review-count">({{ game()!.reviews_count }} reseñas)</span>
              } @else {
                <span class="no-rating">Aún sin reseñas — ¡sé el primero!</span>
              }
            </div>
            @if (game()!.description) {
              <p class="description">{{ game()!.description }}</p>
            }
          </div>
        </div>

        @if (auth.isAuthenticated()) {
          <div class="write-review">
            <h2>✍️ Escribe tu reseña</h2>
            <div class="review-form">
              <div class="rating-select">
                <span>Tu puntuación:</span>
                <app-star-rating [rating]="0" [interactive]="true" #ratingComp />
              </div>
              <textarea [(ngModel)]="reviewContent" placeholder="Comparte tu opinión sobre este juego (mínimo 10 caracteres)..."
                        rows="4"></textarea>
              @if (reviewError()) { <div class="error-msg">{{ reviewError() }}</div> }
              @if (reviewSuccess()) { <div class="success-msg">{{ reviewSuccess() }}</div> }
              <button class="btn btn-primary" (click)="submitReview(ratingComp)" [disabled]="submitting()">
                {{ submitting() ? 'Publicando...' : 'Publicar reseña' }}
              </button>
            </div>
          </div>
        }

        <div class="reviews-section">
          <h2>💬 Reseñas ({{ reviews().length }})</h2>
          @for (review of reviews(); track review.id) {
            <article class="review-card">
              <div class="review-header">
                <div class="author">
                  <div class="avatar">{{ review.author_username[0].toUpperCase() }}</div>
                  <a [routerLink]="['/profile', review.user_id]">{{ review.author_username }}</a>
                </div>
                <app-star-rating [rating]="review.rating" />
              </div>
              <p>{{ review.content }}</p>
              <span class="date">{{ review.created_at | date:'dd MMM yyyy' }}</span>
            </article>
          } @empty {
            <p class="empty">No hay reseñas para este juego todavía.</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .game-detail { max-width: 900px; margin: 0 auto; padding: 2rem; }
    .loading { text-align: center; padding: 4rem; }
    .spinner {
      width: 40px; height: 40px; border: 3px solid rgba(139,92,246,0.2);
      border-top-color: #8b5cf6; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin: 0 auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .game-hero {
      display: flex; gap: 2rem;
      background: rgba(30,30,50,0.8); border: 1px solid rgba(139,92,246,0.2);
      border-radius: 20px; padding: 2rem; margin-bottom: 2rem;
    }
    .hero-bg { flex-shrink: 0; }
    .hero-cover { width: 200px; border-radius: 12px; object-fit: cover; }
    .hero-info { flex: 1; }
    .hero-info h1 { font-size: 1.8rem; color: #e2e8f0; margin: 0 0 0.75rem; }
    .hero-meta { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; }
    .badge {
      background: rgba(139,92,246,0.2); color: #c4b5fd;
      padding: 0.25rem 0.7rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600;
    }
    .year, .platform { color: #94a3b8; font-size: 0.85rem; }
    .hero-rating { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
    .review-count { color: #64748b; font-size: 0.85rem; }
    .no-rating { color: #64748b; font-size: 0.9rem; font-style: italic; }
    .description { color: #cbd5e1; line-height: 1.6; font-size: 0.95rem; margin: 0; }
    .write-review {
      background: rgba(30,30,50,0.8); border: 1px solid rgba(139,92,246,0.15);
      border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem;
    }
    .write-review h2 { font-size: 1.1rem; color: #e2e8f0; margin: 0 0 1rem; }
    .rating-select { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; color: #94a3b8; font-size: 0.9rem; }
    textarea {
      width: 100%; padding: 0.8rem; background: rgba(15,15,25,0.8);
      border: 1px solid rgba(100,116,139,0.3); border-radius: 10px;
      color: #e2e8f0; font-size: 0.9rem; resize: vertical; outline: none;
      font-family: inherit; margin-bottom: 0.75rem; box-sizing: border-box;
    }
    textarea:focus { border-color: #8b5cf6; }
    .error-msg {
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
      color: #fca5a5; padding: 0.5rem 0.8rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 0.75rem;
    }
    .success-msg {
      background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3);
      color: #86efac; padding: 0.5rem 0.8rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 0.75rem;
    }
    .btn-primary {
      padding: 0.6rem 1.5rem; background: linear-gradient(135deg, #8b5cf6, #6d28d9);
      color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s;
    }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .reviews-section h2 { font-size: 1.2rem; color: #e2e8f0; margin: 0 0 1rem; }
    .review-card {
      background: rgba(30,30,50,0.6); border: 1px solid rgba(139,92,246,0.1);
      border-radius: 14px; padding: 1.25rem; margin-bottom: 1rem;
    }
    .review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .author { display: flex; align-items: center; gap: 0.6rem; }
    .avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: linear-gradient(135deg, #8b5cf6, #06b6d4);
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 0.8rem;
    }
    .author a { color: #c4b5fd; text-decoration: none; font-weight: 600; }
    .author a:hover { text-decoration: underline; }
    .review-card p { color: #cbd5e1; line-height: 1.6; margin: 0 0 0.5rem; font-size: 0.9rem; }
    .date { color: #64748b; font-size: 0.8rem; }
    .empty { color: #64748b; text-align: center; padding: 2rem; font-style: italic; }
  `]
})
export class GameDetailComponent implements OnInit {
  game = signal<Game | null>(null);
  reviews = signal<ReviewWithDetails[]>([]);
  loading = signal(true);
  submitting = signal(false);
  reviewContent = '';
  reviewError = signal('');
  reviewSuccess = signal('');

  constructor(
    private route: ActivatedRoute,
    public api: ApiService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const gameId = +params['id'];
      this.loadGame(gameId);
    });
  }

  loadGame(id: number): void {
    this.loading.set(true);
    this.api.getGame(id).subscribe({
      next: (game) => { this.game.set(game); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.api.getGameReviews(id).subscribe({
      next: (reviews) => this.reviews.set(reviews)
    });
  }

  submitReview(ratingComp: StarRatingComponent): void {
    const rating = ratingComp.getSelectedRating();
    if (!rating || rating < 1) { this.reviewError.set('Selecciona una puntuación'); return; }
    if (this.reviewContent.length < 10) { this.reviewError.set('La reseña debe tener al menos 10 caracteres'); return; }

    this.submitting.set(true);
    this.reviewError.set('');
    this.api.createReview({ game_id: this.game()!.id, rating, content: this.reviewContent }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.reviewSuccess.set('¡Reseña publicada!');
        this.reviewContent = '';
        this.loadGame(this.game()!.id);
        setTimeout(() => this.reviewSuccess.set(''), 3000);
      },
      error: (err) => {
        this.submitting.set(false);
        this.reviewError.set(err.error?.detail || 'Error al publicar');
      }
    });
  }
}
