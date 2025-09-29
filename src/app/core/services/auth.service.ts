import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, LoginResponse, User, UserResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  
  private readonly apiUrl = environment.apiBaseUrl;
  private readonly accessTokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';
  private readonly expiresAtKey = 'access_token_expires_at';
  private readonly userKey = 'current_user';

  public isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUserFromStorage());

  // Observables públicos
  public readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Verificar token al inicializar el servicio (solo en browser)
    if (isPlatformBrowser(this.platformId)) {
      this.checkTokenExpiration();
      
      // Si hay token válido, restaurar el estado del usuario
      if (this.hasValidToken()) {
        this.isAuthenticatedSubject.next(true);
        
        // Si no hay usuario en memoria pero hay token válido, crear usuario mock
        if (!this.getCurrentUserFromStorage()) {
          const mockUser: User = {
            id: 1,
            nombre: 'Usuario',
            apellido: 'Foodie',
            correo: 'usuario@foodiesbnb.com',
            fechaCreacion: new Date(),
            estaActivo: true
          };
          localStorage.setItem(this.userKey, JSON.stringify(mockUser));
          this.currentUserSubject.next(mockUser);
        }
      }
    }
  }

  /**
   * Login del usuario
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => this.handleLoginSuccess(response)),
        catchError(error => this.handleAuthError(error))
      );
  }

  /**
   * Registro de nuevo usuario
   */
  register(userData: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/users`, userData)
      .pipe(
        catchError(error => this.handleAuthError(error))
      );
  }

  /**
   * Logout del usuario
   */
  logout(): void {
    this.clearTokens();
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    if (isPlatformBrowser(this.platformId)) {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Obtener el token de acceso
   */
  getAccessToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    
    const token = localStorage.getItem(this.accessTokenKey);
    if (!token || this.isTokenExpired()) {
      this.logout();
      return null;
    }
    return token;
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value && this.hasValidToken();
  }

  /**
   * Obtener información del usuario actual del servidor
   */
  getUserInfo(): Observable<User> {
    // Primero intentar obtener el usuario del token si es posible
    // Por ahora, usar un usuario por defecto hasta que implementemos JWT parsing
    const mockUser: User = {
      id: 1,
      nombre: 'Usuario',
      apellido: 'Foodie',
      correo: 'usuario@foodiesbnb.com',
      fechaCreacion: new Date(),
      estaActivo: true
    };

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.userKey, JSON.stringify(mockUser));
    }
    this.currentUserSubject.next(mockUser);
    
    return new Observable(observer => {
      observer.next(mockUser);
      observer.complete();
    });
  }

  /**
   * Actualizar información del usuario
   */
  updateUser(userId: number, userData: any): Observable<User> {
    return this.http.put<UserResponse>(`${this.apiUrl}/users/${userId}`, userData)
      .pipe(
        map(response => this.mapUserResponse(response)),
        tap(user => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.userKey, JSON.stringify(user));
          }
          this.currentUserSubject.next(user);
        })
      );
  }

  // Métodos privados
  private handleLoginSuccess(response: LoginResponse): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const expiresAt = Date.now() + (response.expires_in * 1000);
    
    localStorage.setItem(this.accessTokenKey, response.access_token);
    localStorage.setItem(this.expiresAtKey, expiresAt.toString());
    
    if (response.refresh_token) {
      localStorage.setItem(this.refreshTokenKey, response.refresh_token);
    }

    this.isAuthenticatedSubject.next(true);
    
    // Por ahora usar un usuario mock hasta implementar JWT parsing
    const mockUser: User = {
      id: 1,
      nombre: 'Usuario',
      apellido: 'Foodie', 
      correo: 'usuario@foodiesbnb.com',
      fechaCreacion: new Date(),
      estaActivo: true
    };
    
    localStorage.setItem(this.userKey, JSON.stringify(mockUser));
    this.currentUserSubject.next(mockUser);
    
    // Navegar al dashboard
    this.router.navigate(['/dashboard']);
  }

  private handleAuthError(error: any): Observable<never> {
    console.error('Error de autenticación:', error);
    return throwError(() => error);
  }

  private hasValidToken(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    
    const token = localStorage.getItem(this.accessTokenKey);
    return !!token && !this.isTokenExpired();
  }

  private isTokenExpired(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }
    
    const expiresAt = localStorage.getItem(this.expiresAtKey);
    if (!expiresAt) return true;
    
    return Date.now() >= parseInt(expiresAt);
  }

  private checkTokenExpiration(): void {
    if (this.isTokenExpired()) {
      this.logout();
    }
  }

  private clearTokens(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.expiresAtKey);
    localStorage.removeItem(this.userKey);
  }

  private getCurrentUserFromStorage(): User | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        localStorage.removeItem(this.userKey);
      }
    }
    return null;
  }

  private mapUserResponse(response: UserResponse): User {
    return {
      id: response.id,
      nombre: response.nombre,
      apellido: response.apellido,
      correo: response.correo,
      fechaCreacion: new Date(response.fechaCreacion),
      estaActivo: response.estaActivo
    };
  }
}