import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // En el servidor, siempre redirigir al login
  if (!isPlatformBrowser(platformId)) {
    return false;
  }

  // Verificar si hay token válido
  const hasValidToken = authService.getAccessToken() !== null;
  
  if (hasValidToken) {
    // Asegurar que el estado de autenticación esté correcto
    if (!authService.isAuthenticated()) {
      // Forzar la actualización del estado si hay token válido
      authService.isAuthenticatedSubject.next(true);
    }
    return true;
  }

  // Si no está autenticado, redirigir al login
  router.navigate(['/login']);
  return false;
};

export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // En el servidor, permitir acceso a login/register
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Si ya está autenticado, redirigir al dashboard
  router.navigate(['/dashboard']);
  return false;
};