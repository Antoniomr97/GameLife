import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="admin-layout">
      <header class="admin-header">
        <div class="admin-title">
          <span class="admin-icon">🛡️</span>
          <h1>Panel de Administración</h1>
        </div>
        <nav class="admin-tabs">
          <a
            routerLink="/admin/games"
            routerLinkActive="tab-active"
            class="tab"
          >
            🎮 Juegos
          </a>
          <a
            routerLink="/admin/users"
            routerLinkActive="tab-active"
            class="tab"
          >
            👥 Usuarios
          </a>
        </nav>
      </header>
      <div class="admin-content">
        <router-outlet />
      </div>
    </div>
  `,
  styles: [`
    .admin-layout { max-width: 1200px; margin: 0 auto; padding: 2rem; }

    .admin-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;
    }
    .admin-title { display: flex; align-items: center; gap: 0.75rem; }
    .admin-icon { font-size: 1.75rem; }
    .admin-title h1 { font-size: 1.75rem; font-weight: 700; color: #fff; margin: 0; }

    .admin-tabs {
      display: flex; gap: 0.5rem;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px; padding: 0.35rem;
    }
    .tab {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.5rem 1.25rem; border-radius: 7px;
      color: #94a3b8; text-decoration: none;
      font-weight: 600; font-size: 0.9rem;
      transition: all 0.2s;
    }
    .tab:hover { color: #e2e8f0; background: rgba(255,255,255,0.05); }
    .tab-active { background: #8b5cf6 !important; color: white !important; }

    .admin-content { }
  `]
})
export class AdminLayoutComponent {}
