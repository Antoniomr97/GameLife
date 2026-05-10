import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stars" [class.interactive]="interactive">
      @for (star of stars; track star) {
        <span
          class="star"
          [class.filled]="star <= displayRating"
          [class.hover]="interactive && star <= hoverRating"
          (mouseenter)="interactive ? hoverRating = star : null"
          (mouseleave)="interactive ? hoverRating = 0 : null"
          (click)="interactive ? selectRating(star) : null"
        >★</span>
      }
      @if (showValue && displayRating > 0) {
        <span class="rating-value">{{ displayRating }}/5</span>
      }
    </div>
  `,
  styles: [`
    .stars {
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }
    .star {
      font-size: 1.2rem;
      color: #334155;
      transition: all 0.15s ease;
      cursor: default;
    }
    .star.filled { color: #f59e0b; }
    .star.hover { color: #fbbf24; transform: scale(1.2); }
    .interactive .star { cursor: pointer; }
    .interactive .star:hover { transform: scale(1.3); }
    .rating-value {
      margin-left: 0.5rem;
      font-size: 0.85rem;
      color: #94a3b8;
      font-weight: 600;
    }
  `]
})
export class StarRatingComponent {
  @Input() rating = 0;
  @Input() interactive = false;
  @Input() showValue = false;

  stars = [1, 2, 3, 4, 5];
  hoverRating = 0;
  selectedRating = 0;

  get displayRating(): number {
    if (this.hoverRating > 0) return this.hoverRating;
    if (this.selectedRating > 0) return this.selectedRating;
    return Math.round(this.rating);
  }

  selectRating(star: number): void {
    this.selectedRating = star;
  }

  getSelectedRating(): number {
    return this.selectedRating || this.rating;
  }
}
