import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <span class="auth-icon">🎮</span>
          <h1>Bienvenido a GameLife</h1>
          <p>Inicia sesión para compartir tus reseñas</p>
        </div>
        <form (ngSubmit)="onLogin()" class="auth-form">
          <div class="form-group">
            <label for="username">Email o usuario</label>
            <input id="username" type="text" [(ngModel)]="username" name="username"
                   placeholder="tu@email.com" required autocomplete="username" />
          </div>
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input id="password" type="password" [(ngModel)]="password" name="password"
                   placeholder="••••••••" required autocomplete="current-password" />
          </div>
          @if (error()) {
            <div class="error-msg">{{ error() }}</div>
          }
          <button type="submit" class="btn btn-primary btn-full" [disabled]="loading()">
            {{ loading() ? 'Iniciando sesión...' : 'Iniciar sesión' }}
          </button>
        </form>
        <p class="auth-footer">
          ¿No tienes cuenta? <a routerLink="/register">Regístrate aquí</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .auth-card {
      background: rgba(30, 30, 50, 0.9);
      border: 1px solid rgba(139, 92, 246, 0.2);
      border-radius: 20px;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      backdrop-filter: blur(20px);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .auth-icon { font-size: 3rem; display: block; margin-bottom: 0.75rem; }
    .auth-header h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #e2e8f0;
      margin: 0 0 0.5rem;
    }
    .auth-header p { color: #94a3b8; font-size: 0.9rem; margin: 0; }
    .form-group { margin-bottom: 1.25rem; }
    .form-group label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: #cbd5e1;
      margin-bottom: 0.4rem;
    }
    .form-group input {
      width: 100%;
      padding: 0.7rem 1rem;
      background: rgba(15, 15, 25, 0.8);
      border: 1px solid rgba(100, 116, 139, 0.3);
      border-radius: 10px;
      color: #e2e8f0;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .form-group input:focus { border-color: #8b5cf6; }
    .form-group input::placeholder { color: #475569; }
    .error-msg {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
      padding: 0.6rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      margin-bottom: 1rem;
    }
    .btn-full { width: 100%; }
    .btn-primary {
      padding: 0.75rem;
      background: linear-gradient(135deg, #8b5cf6, #6d28d9);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #7c3aed, #5b21b6);
      transform: translateY(-1px);
    }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      color: #94a3b8;
      font-size: 0.85rem;
    }
    .auth-footer a { color: #8b5cf6; text-decoration: none; font-weight: 600; }
    .auth-footer a:hover { text-decoration: underline; }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  onLogin(): void {
    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.detail || 'Error al iniciar sesión');
      }
    });
  }
}
