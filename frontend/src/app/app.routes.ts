import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'GameLife — Explorar Videojuegos'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'GameLife — Iniciar Sesión'
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    title: 'GameLife — Registro'
  },
  {
    path: 'feed',
    loadComponent: () => import('./features/feed/feed.component').then(m => m.FeedComponent),
    canActivate: [authGuard],
    title: 'GameLife — Tu Feed'
  },
  {
    path: 'profile/:id',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    title: 'GameLife — Perfil'
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    title: 'GameLife — Administración',
    children: [
      { path: '', redirectTo: 'games', pathMatch: 'full' },
      {
        path: 'games',
        loadComponent: () => import('./features/admin/admin-games/admin-games.component').then(m => m.AdminGamesComponent),
        title: 'GameLife — Admin: Juegos'
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/admin-users/admin-users.component').then(m => m.AdminUsersComponent),
        title: 'GameLife — Admin: Usuarios'
      }
    ]
  },
  {
    path: 'games/:id',
    loadComponent: () => import('./features/game-detail/game-detail.component').then(m => m.GameDetailComponent),
    title: 'GameLife — Detalle del Juego'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
