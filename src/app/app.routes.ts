import { Routes } from '@angular/router';

export const routes: Routes = [
  // Rutas públicas (sin layout)
  {
    path: 'login',
    loadComponent: () => import('./modules/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./modules/register/register.component').then(m => m.RegisterComponent)
  },
  // Rutas principales que usan MainLayout
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./modules/dashboardUsuarios/dashboard-usuarios.component').then(m => m.DashboardUsuariosComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./modules/dashboardUsuarios/dashboard-usuarios.component').then(m => m.DashboardUsuariosComponent)
      },
      {
        path: 'restaurantes',
        loadComponent: () => import('./modules/dashboardUsuarios/dashboard-usuarios.component').then(m => m.DashboardUsuariosComponent)
      },
      {
        path: 'reservas',
        loadComponent: () => import('./modules/dashboardUsuarios/dashboard-usuarios.component').then(m => m.DashboardUsuariosComponent)
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./modules/dashboardUsuarios/dashboard-usuarios.component').then(m => m.DashboardUsuariosComponent)
      },
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
