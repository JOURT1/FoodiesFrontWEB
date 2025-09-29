import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: unknown) => {
      let summary;
      let detail = 'Ha ocurrido un error inesperado.';
      let severity: 'error' | 'warn' | 'info' = 'error';

      if (error instanceof HttpErrorResponse) {
        messageService.clear();
        switch (error.status) {
          case 0:
            summary = 'Sin conexión';
            detail = 'No se puede conectar con el servidor.';
            break;
          case 400:
            summary = 'Solicitud inválida';
            detail = formatearDetalle(error) || 'Revisa los datos enviados.';
            severity = 'warn';
            break;
          case 401:
            if (authService.getAccessToken() === null) {
              authService.logout();
            }
            break;
          case 403:
            summary = 'Acceso denegado';
            detail = 'No tienes permisos para esta acción.';
            break;
          case 404:
            summary = 'No encontrado';
            detail = 'El recurso solicitado no existe.';
            severity = 'warn';
            break;
          case 409:
            summary = 'Conflicto';
            detail =
              formatearDetalle(error) ||
              'Conflicto con el estado actual del recurso.';
            severity = 'warn';
            break;
          case 422:
            summary = 'Datos inválidos';
            detail =
              formatearDetalle(error) || 'Algunos campos no son válidos.';
            severity = 'warn';
            break;
          case 500:
            summary = 'Error del servidor';
            detail =
              formatearDetalle(error) ||
              'Ocurrió un problema interno. Intenta más tarde.';
            break;
          default:
            summary = `Error ${error.status}`;
            detail = formatearDetalle(error) || error.message || detail;
            break;
        }
      }

      if (summary) {
        messageService.add({ severity, summary, detail, life: 6000 });
      }
      return throwError(() => error);
    })
  );
};

function formatearDetalle(error: HttpErrorResponse): string | null {
  if (!error.error) return null;
  if (typeof error.error === 'string') return error.error;
  if (error.error.message) return error.error.message;
  if (error.error.errors) {
    if (Array.isArray(error.error.errors)) {
      return error.error.errors.join('\n');
    }
    return Object.values(error.error.errors).flat().join('\n');
  }
  return null;
}
