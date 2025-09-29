import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService) as AuthService;
  const token = auth.getAccessToken();

  const publicEndpoints: (string | RegExp)[] = [/\/login$/, /\/auth\/token$/];
  const isPublic = publicEndpoints.some((ep) =>
    ep instanceof RegExp ? ep.test(req.url) : req.url.endsWith(ep)
  );

  let authReq = req;
  if (token && !isPublic) {
    authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !isPublic) {
        // Intentamos refresh y reejecutamos la request una sola vez
        return auth.refreshToken().pipe(
          switchMap((newToken) => {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            });
            return next(retryReq);
          }),
          catchError((refreshErr) => {
            auth.logout();
            return throwError(() => refreshErr);
          })
        );
      }
      return throwError(() => error);
    })
  );
};

