import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { Game } from '../../models/game.model';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule, RouterModule, StarRatingComponent],
  template: `
    <a [routerLink]="['/games', game.id]" class="game-card">
      <div class="card-image">
        @if (game.cover_url) {
          <img [src]="game.cover_url" [alt]="game.title" loading="lazy" />
        } @else {
          <div class="placeholder-cover">🎮</div>
        }
        @if (game.genre) {
          <span class="genre-badge">{{ game.genre }}</span>
        }
      </div>
      <div class="card-body">
        <h3 class="card-title">{{ game.title }}</h3>
        <div class="card-meta">
          @if (game.release_year) {
            <span class="year">{{ game.release_year }}</span>
          }
          @if (game.platform) {
            <span class="platform">{{ game.platform }}</span>
          }
        </div>
        <div class="card-footer">
          @if (game.avg_rating) {
            <app-star-rating [rating]="game.avg_rating" [showValue]="true" />
          } @else {
            <span class="no-reviews">Sin reseñas</span>
          }
          <span class="review-count">{{ game.reviews_count }} reseña{{ game.reviews_count !== 1 ? 's' : '' }}</span>
        </div>
      </div>
    </a>
  `,
  styles: [`
    .game-card {
      display: flex;
      flex-direction: column;
      background: rgba(30, 30, 50, 0.8);
      border: 1px solid rgba(139, 92, 246, 0.15);
      border-radius: 16px;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      transition: all 0.3s ease;
    }
    .game-card:hover {
      transform: translateY(-4px);
      border-color: rgba(139, 92, 246, 0.4);
      box-shadow: 0 12px 40px rgba(139, 92, 246, 0.15);
    }
    .card-image {
      position: relative;
      aspect-ratio: 3/4;
      overflow: hidden;
      background: #1a1a2e;
    }
    .card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .game-card:hover .card-image img { transform: scale(1.05); }
    .placeholder-cover {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-size: 3rem;
      background: linear-gradient(135deg, #1e1b4b, #312e81);
    }
    .genre-badge {
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
      background: rgba(139, 92, 246, 0.9);
      color: white;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .card-body { padding: 1rem; }
    .card-title {
      font-size: 1rem;
      font-weight: 700;
      color: #e2e8f0;
      margin: 0 0 0.5rem;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card-meta {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 0.75rem;
    }
    .card-meta span {
      font-size: 0.75rem;
      color: #64748b;
    }
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .no-reviews {
      font-size: 0.8rem;
      color: #475569;
      font-style: italic;
    }
    .review-count {
      font-size: 0.75rem;
      color: #64748b;
    }
  `]
})
export class GameCardComponent {
  @Input({ required: true }) game!: Game;
}
