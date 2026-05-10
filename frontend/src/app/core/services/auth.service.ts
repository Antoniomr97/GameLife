import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../shared/models/user.model';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  /** Signal reactivo con el usuario actual */
  currentUser = signal<User | null>(null);

  /** Signal derivado: ¿está autenticado? */
  isAuthenticated = computed(() => this.currentUser() !== null);

  /** Signal derivado: username para la UI */
  username = computed(() => this.currentUser()?.username ?? '');

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  /**
   * Intenta cargar el usuario almacenado al iniciar la app.
   */
  private loadUserFromStorage(): void {
    const token = this.getToken();
    if (token) {
      this.fetchCurrentUser().subscribe({
        error: () => this.logout()
      });
    }
  }

  /**
   * Inicia sesión con email/username y contraseña.
   * El backend espera un FormData con campos 'username' y 'password'.
   */
  login(username: string, password: string): Observable<LoginResponse> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, formData).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        this.fetchCurrentUser().subscribe();
      })
    );
  }

  /**
   * Registra un nuevo usuario.
   */
  register(data: RegisterData): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/register`, data);
  }

  /**
   * Obtiene los datos del usuario autenticado desde el backend.
   */
  fetchCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/me`).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  /**
   * Cierra la sesión y limpia el estado.
   */
  logout(): void {
    localStorage.removeItem('access_token');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Retorna el token JWT almacenado.
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}
