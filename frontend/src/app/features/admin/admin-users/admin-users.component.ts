import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { UserProfile } from '../../../shared/models/user.model';
import { ReviewWithDetails } from '../../../shared/models/review.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-container">

      <!-- Search bar -->
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input
          id="admin-user-search"
          type="text"
          placeholder="Buscar usuario por nombre o email..."
          [value]="searchQuery()"
          (input)="searchQuery.set($any($event.target).value)"
        />
        @if (searchQuery()) {
          <button class="clear-search" (click)="searchQuery.set('')" title="Limpiar">✕</button>
        }
      </div>

      @if (loading()) {
        <div class="loading">Cargando usuarios...</div>
      } @else {
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Reseñas</th>
                <th>Rol</th>
                <th>Registro</th>
                <th>Ver reseñas</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              @if (filteredUsers().length === 0) {
                <tr>
                  <td colspan="8" class="no-results">
                    No se encontró ningún usuario con "{{ searchQuery() }}".
                  </td>
                </tr>
              }
              @for (user of filteredUsers(); track user.id) {
                <!-- Fila del usuario -->
                <tr class="user-row" [class.expanded]="expandedUserId() === user.id">
                  <td>{{ user.id }}</td>
                  <td class="user-cell">
                    @if (user.avatar_url) {
                      <img class="avatar" [src]="user.avatar_url" [alt]="user.username" />
                    } @else {
                      <span class="avatar-placeholder">{{ user.username[0].toUpperCase() }}</span>
                    }
                    <a [routerLink]="['/profile', user.id]" class="username-link">
                      {{ user.username }}
                    </a>
                  </td>
                  <td class="email-cell">{{ user.email }}</td>
                  <td>
                    <span class="badge badge-reviews">{{ user.reviews_count ?? '—' }}</span>
                  </td>
                  <td>
                    @if (user.is_admin) {
                      <span class="badge badge-admin">Admin</span>
                    } @else {
                      <span class="badge badge-user">Usuario</span>
                    }
                  </td>
                  <td class="date-cell">{{ user.created_at | date:'dd/MM/yyyy' }}</td>
                  <td>
                    <button
                      class="btn-reviews"
                      (click)="toggleReviews(user.id)"
                      [class.active]="expandedUserId() === user.id"
                    >
                      {{ expandedUserId() === user.id ? '▲ Ocultar' : '▼ Ver reseñas' }}
                    </button>
                  </td>
                  <td>
                    @if (!user.is_admin) {
                      <button
                        class="btn-delete"
                        (click)="deleteUser(user.id, user.username)"
                        title="Eliminar usuario"
                      >
                        🗑️ Eliminar
                      </button>
                    } @else {
                      <span class="protected-label">—</span>
                    }
                  </td>
                </tr>

                <!-- Fila expandida con reseñas -->
                @if (expandedUserId() === user.id) {
                  <tr class="reviews-row">
                    <td colspan="8">
                      <div class="reviews-panel">
                        @if (loadingReviews()) {
                          <p class="reviews-loading">Cargando reseñas...</p>
                        } @else if (userReviews().length === 0) {
                          <p class="reviews-empty">Este usuario no ha publicado ninguna reseña todavía.</p>
                        } @else {
                          <div class="reviews-grid">
                            @for (review of userReviews(); track review.id) {
                              <div class="review-card">
                                <div class="review-card-header">
                                  @if (review.game_cover) {
                                    <img class="game-cover" [src]="review.game_cover" [alt]="review.game_title" />
                                  }
                                  <div class="review-meta">
                                    <span class="game-title">{{ review.game_title }}</span>
                                    <div class="stars">
                                      @for (s of [1,2,3,4,5]; track s) {
                                        <span [class.filled]="s <= review.rating">★</span>
                                      }
                                    </div>
                                    <span class="review-date">{{ review.created_at | date:'dd/MM/yyyy' }}</span>
                                  </div>
                                </div>
                                <p class="review-content">{{ review.content }}</p>
                              </div>
                            }
                          </div>
                        }
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-container { max-width: 1200px; margin: 0 auto; padding: 0; }

    /* Search bar */
    .search-bar {
      display: flex; align-items: center;
      margin-bottom: 1.5rem;
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px; padding: 0 1rem;
      transition: border-color 0.2s;
    }
    .search-bar:focus-within { border-color: #8b5cf6; }
    .search-icon { font-size: 1rem; color: #64748b; margin-right: 0.75rem; pointer-events: none; }
    .search-bar input {
      flex: 1; background: transparent; border: none;
      padding: 0.85rem 0; color: #f8fafc;
      font-size: 1rem; font-family: inherit;
    }
    .search-bar input:focus { outline: none; }
    .search-bar input::placeholder { color: #475569; }
    .clear-search {
      background: transparent; border: none; color: #64748b;
      font-size: 1rem; cursor: pointer; padding: 0.25rem 0.5rem;
      border-radius: 4px; transition: color 0.2s;
    }
    .clear-search:hover { color: #f87171; }

    /* Table */
    .table-container {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; overflow: hidden;
    }
    .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
    .admin-table th, .admin-table td {
      padding: 0.9rem 1.25rem;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .admin-table th { background: rgba(0,0,0,0.2); font-weight: 600; color: #94a3b8; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .admin-table tr.user-row:hover { background: rgba(255,255,255,0.02); }
    .admin-table tr.user-row.expanded { background: rgba(139, 92, 246, 0.05); }

    /* User cell */
    .user-cell { display: flex; align-items: center; gap: 0.75rem; }
    .avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
    .avatar-placeholder {
      width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.85rem; color: white;
    }
    .username-link { color: #e2e8f0; text-decoration: none; font-weight: 500; }
    .username-link:hover { color: #a78bfa; }
    .email-cell { color: #94a3b8; font-size: 0.875rem; }
    .date-cell { color: #64748b; font-size: 0.8rem; }

    /* Badges */
    .badge {
      display: inline-block; padding: 0.2rem 0.6rem;
      border-radius: 20px; font-size: 0.75rem; font-weight: 600;
    }
    .badge-admin { background: rgba(139,92,246,0.2); color: #a78bfa; border: 1px solid rgba(139,92,246,0.3); }
    .badge-user { background: rgba(100,116,139,0.2); color: #94a3b8; border: 1px solid rgba(100,116,139,0.3); }
    .badge-reviews { background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.25); }

    /* Expand button */
    .btn-reviews {
      background: rgba(139,92,246,0.15); color: #a78bfa;
      border: 1px solid rgba(139,92,246,0.3);
      border-radius: 6px; padding: 0.4rem 0.8rem;
      font-size: 0.8rem; font-weight: 600; cursor: pointer;
      transition: all 0.2s; font-family: inherit;
    }
    .btn-reviews:hover, .btn-reviews.active {
      background: rgba(139,92,246,0.3); color: #c4b5fd;
    }

    /* Expanded reviews panel */
    .reviews-row td { padding: 0; border-bottom: 2px solid rgba(139,92,246,0.2); }
    .reviews-panel {
      padding: 1.25rem 1.5rem;
      background: rgba(15, 23, 42, 0.6);
    }
    .reviews-loading, .reviews-empty { color: #64748b; font-style: italic; text-align: center; padding: 1rem 0; margin: 0; }
    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }
    .review-card {
      background: rgba(30,41,59,0.8);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 10px; padding: 1rem;
    }
    .review-card-header { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; }
    .game-cover { width: 48px; height: 64px; object-fit: cover; border-radius: 6px; flex-shrink: 0; }
    .review-meta { display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; }
    .game-title { font-weight: 600; color: #e2e8f0; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .stars { color: #475569; font-size: 0.9rem; }
    .stars .filled { color: #f59e0b; }
    .review-date { font-size: 0.75rem; color: #64748b; }
    .review-content { color: #94a3b8; font-size: 0.85rem; line-height: 1.5; margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

    .loading { text-align: center; padding: 4rem; color: #94a3b8; }
    .no-results { text-align: center; padding: 2rem; color: #64748b; font-style: italic; }

    /* Delete button */
    .btn-delete {
      background: rgba(239,68,68,0.15); color: #f87171;
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: 6px; padding: 0.4rem 0.8rem;
      font-size: 0.8rem; font-weight: 600; cursor: pointer;
      transition: all 0.2s; font-family: inherit;
    }
    .btn-delete:hover { background: rgba(239,68,68,0.3); color: #fca5a5; }
    .protected-label { color: #334155; font-size: 0.85rem; }
  `]
})
export class AdminUsersComponent implements OnInit {
  users = signal<UserProfile[]>([]);
  loading = signal(false);
  searchQuery = signal('');

  expandedUserId = signal<number | null>(null);
  userReviews = signal<ReviewWithDetails[]>([]);
  loadingReviews = signal(false);

  filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.users();
    return this.users().filter(u =>
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.api.getAdminUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  toggleReviews(userId: number) {
    if (this.expandedUserId() === userId) {
      this.expandedUserId.set(null);
      this.userReviews.set([]);
      return;
    }
    this.expandedUserId.set(userId);
    this.userReviews.set([]);
    this.loadingReviews.set(true);
    this.api.getUserReviews(userId).subscribe({
      next: (reviews) => {
        this.userReviews.set(reviews);
        this.loadingReviews.set(false);
      },
      error: () => this.loadingReviews.set(false)
    });
  }

  deleteUser(userId: number, username: string) {
    if (!confirm(`¿Eliminar al usuario "${username}"?\n\nSe borrarán todas sus reseñas y comentarios. Esta acción no se puede deshacer.`)) {
      return;
    }
    this.api.deleteUser(userId).subscribe({
      next: () => {
        // Eliminar del signal local para actualización inmediata sin recargar
        this.users.set(this.users().filter(u => u.id !== userId));
        if (this.expandedUserId() === userId) {
          this.expandedUserId.set(null);
          this.userReviews.set([]);
        }
      },
      error: (err) => alert(err?.error?.detail ?? 'Error al eliminar el usuario.')
    });
  }
}
