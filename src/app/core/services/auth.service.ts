import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, filter, finalize, map, of, switchMap, tap, throwError } from 'rxjs';
import { OAUTH_CONFIG } from '../config/oauth.config';
import { Router } from '@angular/router';

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private accessTokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';
  private expiresAtKey = 'access_token_expires_at';
  private refreshing = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);
  private tokenUrl = OAUTH_CONFIG.tokenUrl;
  private _refreshTokenTimeout: any;

  startRefreshTokenTimer() {
    const token = this.getAccessToken();
    if (!token) return;
    try {
      const jwtToken = JSON.parse(atob(token.split('.')[1]));
      const expires = new Date(jwtToken.exp * 1000);
      const timeout = expires.getTime() - Date.now() - (60 * 1000); // 1 min antes de expirar
      if (timeout > 0) {
        this._refreshTokenTimeout = setTimeout(() => {
          this.refreshToken().subscribe((response: any) => {
            if (typeof response === 'string') {
              this.storeTokens({ access_token: response });
            } else if (response && response.access_token) {
              this.storeTokens(response);
            }
            this.startRefreshTokenTimer();
          });
        }, timeout);
      }
    } catch (e) {
      // Si el token no es JWT válido, no iniciar timer
    }
  }

  stopRefreshTokenTimer() {
    if (this._refreshTokenTimeout) {
      clearTimeout(this._refreshTokenTimeout);
      this._refreshTokenTimeout = null;
    }
  }

  login(username: string, password: string): Observable<void> {
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('username', username);
    body.set('password', password);
    if (OAUTH_CONFIG.scope) body.set('scope', OAUTH_CONFIG.scope);
    if (OAUTH_CONFIG.clientId) body.set('client_id', OAUTH_CONFIG.clientId);
    if (OAUTH_CONFIG.clientSecret)
      body.set('client_secret', OAUTH_CONFIG.clientSecret);

    const headers = this.buildAuthHeaders();

    return this.http
      .post<TokenResponse>(this.tokenUrl, body.toString(), {
        headers,
        withCredentials: false,
      })
      .pipe(
        tap((res) => {
          this.storeTokens(res);
        }),
        map(() => void 0),
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.accessTokenKey);
      localStorage.removeItem(this.refreshTokenKey);
      localStorage.removeItem(this.expiresAtKey);
    }
    this.stopRefreshTokenTimer();
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.accessTokenKey);
    }
    return null;
  }

  private storeTokens(res: TokenResponse) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.accessTokenKey, res.access_token);
      if (res.refresh_token) {
        localStorage.setItem(this.refreshTokenKey, res.refresh_token);
      }
      if (res.expires_in) {
        const expiresAt = Date.now() + res.expires_in * 1000;
        localStorage.setItem(this.expiresAtKey, String(expiresAt));
      }
    }
  }

  refreshToken(): Observable<string> {
    if (this.refreshing) {
      return this.refreshSubject.pipe(filter((t): t is string => t !== null));
    }
    let refresh: string | null = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      refresh = localStorage.getItem(this.refreshTokenKey);
    }

    if (!refresh) {
      return of(null as any);
    }

    this.refreshing = true;
    this.refreshSubject.next(null);

    const body = new URLSearchParams();
    body.set('grant_type', 'refresh_token');
    body.set('refresh_token', refresh);
    if (OAUTH_CONFIG.clientId) body.set('client_id', OAUTH_CONFIG.clientId);
    if (OAUTH_CONFIG.clientSecret)
      body.set('client_secret', OAUTH_CONFIG.clientSecret);

    const headers = this.buildAuthHeaders();

    return this.http
      .post<TokenResponse>(this.tokenUrl, body.toString(), {
        headers,
        withCredentials: false,
      })
      .pipe(
        tap((res) => this.storeTokens(res)),
        tap((res) => this.refreshSubject.next(res.access_token)),
        map((res) => res.access_token),
        finalize(() => (this.refreshing = false)),
        catchError((err: HttpErrorResponse) => {
          this.logout();
          return throwError(() => err);
        })
      );
  }

  private buildAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
  }
}
