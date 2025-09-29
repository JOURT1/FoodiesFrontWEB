import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  // URLs que no requieren autenticación
  const publicEndpoints = ['/auth/login', '/users'];
  const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));
  
  // Si no es un endpoint público y hay token, agregarlo
  if (token && !isPublicEndpoint) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  // Para operaciones específicas que requieren token (GET y PUT a /users/:id)
  if (token && req.url.match(/\/users\/\d+/) && (req.method === 'GET' || req.method === 'PUT')) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};