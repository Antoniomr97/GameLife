import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <a routerLink="/" class="navbar-brand">
          <img src="assets/gamelife-logo.png" alt="GameLife Logo" class="brand-logo" />
          <span class="brand-text">GameLife</span>
        </a>

        <div class="navbar-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            <span class="nav-icon">🎮</span> Games
          </a>
          @if (auth.isAuthenticated()) {
            <a routerLink="/feed" routerLinkActive="active">
              <span class="nav-icon">📰</span> Feed
            </a>
            <a [routerLink]="['/profile', currentUserId()]" routerLinkActive="active">
              <span class="nav-icon">👤</span> Perfil
            </a>
            @if (auth.currentUser()?.is_admin) {
              <a routerLink="/admin" routerLinkActive="active">
                <span class="nav-icon">🛡️</span> Admin
              </a>
            }
          }
        </div>

        <div class="navbar-actions">
          @if (auth.isAuthenticated()) {
            <span class="user-greeting">Hola, <strong>{{ auth.username() }}</strong></span>
            <button class="btn btn-outline" (click)="auth.logout()">Cerrar sesión</button>
          } @else {
            <a routerLink="/login" class="btn btn-outline">Iniciar sesión</a>
            <a routerLink="/register" class="btn btn-primary">Registrarse</a>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: rgba(15, 15, 25, 0.95);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(139, 92, 246, 0.2);
      padding: 0 2rem;
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .navbar-container {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
      gap: 2rem;
    }
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      font-size: 1.4rem;
      font-weight: 700;
    }
    .brand-logo {
      height: 36px;
      width: 36px;
      object-fit: contain;
      border-radius: 8px;
      filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.6));
      transition: transform 0.2s ease, filter 0.2s ease;
    }
    .navbar-brand:hover .brand-logo {
      transform: scale(1.1) rotate(-5deg);
      filter: drop-shadow(0 0 14px rgba(139, 92, 246, 0.9));
    }
    .brand-text {
      background: linear-gradient(135deg, #8b5cf6, #06b6d4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .navbar-links {
      display: flex;
      gap: 0.5rem;
    }
    .navbar-links a {
      color: #94a3b8;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .navbar-links a:hover { color: #e2e8f0; background: rgba(139, 92, 246, 0.1); }
    .navbar-links a.active { color: #8b5cf6; background: rgba(139, 92, 246, 0.15); }
    .nav-icon { font-size: 1rem; }
    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .user-greeting {
      color: #cbd5e1;
      font-size: 0.85rem;
    }
    .btn {
      padding: 0.45rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }
    .btn-outline {
      background: transparent;
      border: 1px solid rgba(139, 92, 246, 0.4);
      color: #8b5cf6;
    }
    .btn-outline:hover {
      background: rgba(139, 92, 246, 0.1);
      border-color: #8b5cf6;
    }
    .btn-primary {
      background: linear-gradient(135deg, #8b5cf6, #6d28d9);
      color: white;
    }
    .btn-primary:hover {
      background: linear-gradient(135deg, #7c3aed, #5b21b6);
      transform: translateY(-1px);
    }
  `]
})
export class NavbarComponent {
  constructor(public auth: AuthService) { }

  currentUserId() {
    return this.auth.currentUser()?.id ?? 0;
  }
}
