import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Game } from '../../../shared/models/game.model';

@Component({
  selector: 'app-admin-games',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  // FormsModule no es necesario: usamos (input) nativo con el signal
  template: `
    <div class="admin-container">
      <div class="games-toolbar">
        <span class="section-label">Juegos registrados</span>
        <button class="btn-primary" (click)="openForm()">+ Añadir Juego</button>
      </div>

      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input
          id="admin-game-search"
          type="text"
          placeholder="Buscar juego por nombre..."
          [value]="searchQuery()"
          (input)="searchQuery.set($any($event.target).value)"
        />
        @if (searchQuery()) {
          <button class="clear-search" (click)="searchQuery.set('')" title="Limpiar búsqueda">✕</button>
        }
      </div>

      @if (loading()) {
        <div class="loading">Cargando juegos...</div>
      } @else {
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Género</th>
                <th>Plataforma</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @if (filteredGames().length === 0) {
                <tr><td colspan="5" class="no-results">No se encontró ningún juego con "{{ searchQuery() }}".</td></tr>
              }
              @for (game of filteredGames(); track game.id) {
                <tr>
                  <td>{{ game.id }}</td>
                  <td>{{ game.title }}</td>
                  <td>{{ game.genre || '-' }}</td>
                  <td>{{ game.platform || '-' }}</td>
                  <td class="actions">
                    <button class="btn-edit" (click)="openForm(game)">Editar</button>
                    <button class="btn-delete" (click)="deleteGame(game.id)">Borrar</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (showForm()) {
        <div class="modal-overlay">
          <div class="modal-content">
            <h2>{{ editingGame() ? 'Editar' : 'Añadir' }} Juego</h2>
            
            <form [formGroup]="gameForm" (ngSubmit)="onSubmit()">
              <div class="form-group">
                <label>Título *</label>
                <input type="text" formControlName="title" required>
              </div>
              
              <div class="form-group">
                <label>Descripción</label>
                <textarea formControlName="description" rows="3"></textarea>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Género</label>
                  <input type="text" formControlName="genre" placeholder="Ej: RPG, Accion-Aventura">
                </div>
                
                <div class="form-group">
                  <label>Año</label>
                  <input type="number" formControlName="release_year">
                </div>
              </div>
              
              <div class="form-group">
                <label>Plataformas</label>
                <input type="text" formControlName="platform" placeholder="Ej: PC, PS5, Switch">
              </div>
              
              <div class="form-group">
                <label>URL de Portada</label>
                <input type="url" formControlName="cover_url">
              </div>

              <div class="form-actions">
                <button type="button" class="btn-secondary" (click)="closeForm()">Cancelar</button>
                <button type="submit" class="btn-primary" [disabled]="gameForm.invalid || submitting()">
                  {{ submitting() ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 1200px; margin: 0 auto; padding: 0;
    }
    .games-toolbar {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1.5rem;
    }
    .section-label { font-size: 1rem; color: #94a3b8; font-weight: 500; }

    .table-container {
      background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; overflow: hidden;
    }
    .admin-table {
      width: 100%; border-collapse: collapse; text-align: left;
    }
    .admin-table th, .admin-table td {
      padding: 1rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .admin-table th { background: rgba(0,0,0,0.2); font-weight: 600; color: #94a3b8; }
    .admin-table tr:hover { background: rgba(255,255,255,0.02); }
    
    .actions { display: flex; gap: 0.5rem; }
    button { cursor: pointer; font-family: inherit; font-size: 0.875rem; border-radius: 6px; padding: 0.5rem 1rem; border: none; font-weight: 600; }
    
    .btn-primary { background: #8b5cf6; color: white; transition: background 0.2s; }
    .btn-primary:hover:not(:disabled) { background: #7c3aed; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .btn-secondary { background: transparent; border: 1px solid #475569; color: #cbd5e1; }
    .btn-secondary:hover { background: rgba(255,255,255,0.1); }
    
    .btn-edit { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
    .btn-edit:hover { background: rgba(59, 130, 246, 0.3); }
    
    .btn-delete { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .btn-delete:hover { background: rgba(239, 68, 68, 0.3); }

    /* Modal Form */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .modal-content {
      background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
      padding: 2rem; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto;
    }
    .modal-content h2 { margin-top: 0; margin-bottom: 1.5rem; color: #fff; }
    
    .form-group { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    
    label { font-size: 0.875rem; color: #cbd5e1; font-weight: 500; }
    input, textarea {
      background: rgba(0,0,0,0.2); border: 1px solid #334155; border-radius: 8px;
      padding: 0.75rem 1rem; color: #f8fafc; font-family: inherit; font-size: 1rem;
      transition: border-color 0.2s;
    }
    input:focus, textarea:focus { outline: none; border-color: #8b5cf6; }
    
    .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
    .loading { text-align: center; padding: 4rem; color: #94a3b8; }

    /* Search bar */
    .search-bar {
      position: relative; display: flex; align-items: center;
      margin-bottom: 1.5rem;
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 0 1rem;
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
    .no-results { text-align: center; padding: 2rem; color: #64748b; font-style: italic; }
  `]
})
export class AdminGamesComponent implements OnInit {
  games = signal<Game[]>([]);
  loading = signal(false);
  searchQuery = signal('');

  filteredGames = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.games();
    return this.games().filter(g => g.title.toLowerCase().includes(query));
  });

  showForm = signal(false);
  editingGame = signal<Game | null>(null);
  submitting = signal(false);

  gameForm: FormGroup;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.gameForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      genre: [''],
      platform: [''],
      cover_url: [''],
      release_year: [null]
    });
  }

  ngOnInit() {
    this.loadAllGames();
  }

  loadAllGames() {
    this.loading.set(true);
    // Para simplificar, cargamos una página grande para ver todos (ej: límite 500)
    this.api.getGames(1, 500).subscribe({
      next: (res) => {
        this.games.set(res.games);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openForm(game?: Game) {
    if (game) {
      this.editingGame.set(game);
      this.gameForm.patchValue({
        title: game.title,
        description: game.description,
        genre: game.genre,
        platform: game.platform,
        cover_url: game.cover_url,
        release_year: game.release_year
      });
    } else {
      this.editingGame.set(null);
      this.gameForm.reset();
    }
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingGame.set(null);
    this.gameForm.reset();
  }

  onSubmit() {
    if (this.gameForm.invalid) return;
    
    this.submitting.set(true);
    const data = this.gameForm.value;
    const current = this.editingGame();

    if (current) {
      this.api.updateGame(current.id, data).subscribe({
        next: () => {
          this.loadAllGames();
          this.closeForm();
          this.submitting.set(false);
        },
        error: () => this.submitting.set(false)
      });
    } else {
      this.api.createGame(data).subscribe({
        next: () => {
          this.loadAllGames();
          this.closeForm();
          this.submitting.set(false);
        },
        error: () => this.submitting.set(false)
      });
    }
  }

  deleteGame(id: number) {
    if (confirm('¿Estás seguro de que quieres borrar este juego? Esta acción no se puede deshacer.')) {
      this.api.deleteGame(id).subscribe({
        next: () => this.loadAllGames()
      });
    }
  }
}
