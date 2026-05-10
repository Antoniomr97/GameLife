import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { GameCardComponent } from '../../shared/components/game-card/game-card.component';
import { Game } from '../../shared/models/game.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, GameCardComponent],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h1>🎮 Explorar Videojuegos</h1>
        <p>Descubre juegos y comparte tus opiniones con la comunidad</p>
      </div>
      <div class="filters">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Buscar juegos..." [(ngModel)]="searchQuery"
                 (input)="onSearch()" />
        </div>
        <div class="genre-filters">
          @for (genre of genres; track genre) {
            <button class="genre-chip" [class.active]="selectedGenre() === genre"
                    (click)="filterByGenre(genre)">
              {{ genre }}
            </button>
          }
        </div>
      </div>
      @if (loading()) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Cargando juegos...</p>
        </div>
      } @else {
        <div class="games-grid">
          @for (game of games(); track game.id) {
            <app-game-card [game]="game" />
          } @empty {
            <div class="empty-state">
              <span class="empty-icon">🕹️</span>
              <p>No se encontraron juegos</p>
            </div>
          }
        </div>
        @if (totalPages() > 1) {
          <div class="pagination">
            <button (click)="changePage(currentPage() - 1)" [disabled]="currentPage() <= 1">← Anterior</button>
            <span class="page-info">Página {{ currentPage() }} de {{ totalPages() }}</span>
            <button (click)="changePage(currentPage() + 1)" [disabled]="currentPage() >= totalPages()">Siguiente →</button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1280px; margin: 0 auto; padding: 2rem; }
    .dashboard-header { text-align: center; margin-bottom: 2rem; }
    .dashboard-header h1 { font-size: 2rem; font-weight: 800; color: #e2e8f0; margin: 0 0 0.5rem; }
    .dashboard-header p { color: #94a3b8; font-size: 1rem; margin: 0; }
    .filters { margin-bottom: 2rem; }
    .search-box {
      position: relative; margin-bottom: 1rem;
    }
    .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); font-size: 1.1rem; }
    .search-box input {
      width: 100%; padding: 0.8rem 1rem 0.8rem 2.8rem;
      background: rgba(30, 30, 50, 0.8); border: 1px solid rgba(100, 116, 139, 0.3);
      border-radius: 12px; color: #e2e8f0; font-size: 0.95rem;
      outline: none; transition: border-color 0.2s; box-sizing: border-box;
    }
    .search-box input:focus { border-color: #8b5cf6; }
    .search-box input::placeholder { color: #475569; }
    .genre-filters { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .genre-chip {
      padding: 0.4rem 0.9rem; border-radius: 20px; border: 1px solid rgba(100, 116, 139, 0.3);
      background: transparent; color: #94a3b8; font-size: 0.8rem; cursor: pointer;
      transition: all 0.2s; font-weight: 500;
    }
    .genre-chip:hover { border-color: #8b5cf6; color: #c4b5fd; }
    .genre-chip.active { background: rgba(139, 92, 246, 0.2); border-color: #8b5cf6; color: #c4b5fd; }
    .games-grid {
      display: grid; 
      grid-template-columns: repeat(5, 1fr);
      gap: 1.5rem;
    }
    @media (max-width: 1200px) { .games-grid { grid-template-columns: repeat(4, 1fr); } }
    @media (max-width: 900px) { .games-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 600px) { .games-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 400px) { .games-grid { grid-template-columns: 1fr; } }
    .loading { text-align: center; padding: 4rem 0; }
    .spinner {
      width: 40px; height: 40px; border: 3px solid rgba(139, 92, 246, 0.2);
      border-top-color: #8b5cf6; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin: 0 auto 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading p { color: #94a3b8; }
    .empty-state { grid-column: 1 / -1; text-align: center; padding: 4rem; }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
    .empty-state p { color: #94a3b8; font-size: 1.1rem; }
    .pagination {
      display: flex; align-items: center; justify-content: center;
      gap: 1rem; margin-top: 2rem; padding: 1rem 0;
    }
    .pagination button {
      padding: 0.5rem 1.2rem; border-radius: 8px;
      border: 1px solid rgba(139, 92, 246, 0.3); background: transparent;
      color: #8b5cf6; font-weight: 600; cursor: pointer; transition: all 0.2s;
    }
    .pagination button:hover:not(:disabled) { background: rgba(139, 92, 246, 0.1); }
    .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
    .page-info { color: #94a3b8; font-size: 0.9rem; }
  `]
})
export class DashboardComponent implements OnInit {
  games = signal<Game[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  selectedGenre = signal('');
  searchQuery = '';
  private searchTimeout: any;

  genres = ['Todos', 'RPG', 'Acción-Aventura', 'Roguelike', 'Metroidvania', 'Estrategia', 'Survival', 'Simulación', 'Plataformas'];

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadGames(); }

  loadGames(): void {
    this.loading.set(true);
    const genre = this.selectedGenre() === 'Todos' ? undefined : this.selectedGenre() || undefined;
    const search = this.searchQuery || undefined;

    this.api.getGames(this.currentPage(), 15, genre, search).subscribe({
      next: (res) => {
        this.games.set(res.games);
        this.totalPages.set(res.pages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filterByGenre(genre: string): void {
    this.selectedGenre.set(genre === 'Todos' ? '' : genre);
    this.currentPage.set(1);
    this.loadGames();
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadGames();
    }, 400);
  }

  changePage(page: number): void {
    this.currentPage.set(page);
    this.loadGames();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
