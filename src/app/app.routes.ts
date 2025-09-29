import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Ruta raíz - redirigir según el estado de autenticación
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  // Rutas públicas (sin layout) - solo para usuarios NO autenticados
  {
    path: 'login',
    canActivate: [noAuthGuard],
    loadComponent: () => import('./modules/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [noAuthGuard],
    loadComponent: () => import('./modules/register/register.component').then(m => m.RegisterComponent)
  },
  // Rutas principales que usan MainLayout - solo para usuarios autenticados
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/dashboardUsuarios/dashboard-usuarios.component').then(m => m.DashboardUsuariosComponent)
      }
    ]
  },
  {
    path: 'usuarios',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/dashboardUsuarios/dashboard-usuarios.component').then(m => m.DashboardUsuariosComponent)
      }
    ]
  },
  {
    path: 'restaurantes',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/dashboardUsuarios/dashboard-usuarios.component').then(m => m.DashboardUsuariosComponent)
      }
    ]
  },
  {
    path: 'configuracion',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/dashboardUsuarios/dashboard-usuarios.component').then(m => m.DashboardUsuariosComponent)
      }
    ]
  },
  {
    path: 'foodies',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/dashboardUsuarios/dashboard-usuarios.component').then(m => m.DashboardUsuariosComponent)
      }
    ]
  },
  {
    path: 'beneficios',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/dashboardUsuarios/dashboard-usuarios.component').then(m => m.DashboardUsuariosComponent)
      }
    ]
  },
  {
    path: 'cuenta',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/dashboardUsuarios/dashboard-usuarios.component').then(m => m.DashboardUsuariosComponent)
      }
    ]
  },
  // Ruta comodín - redirigir a login
  {
    path: '**',
    redirectTo: '/login'
  }
];
