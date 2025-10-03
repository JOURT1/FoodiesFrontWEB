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
        
        // Verificar si tenemos usuario en storage, si no, obtenerlo del servidor
        const storedUser = this.getCurrentUserFromStorage();
        if (storedUser) {
          this.currentUserSubject.next(storedUser);
        } else {
          // Obtener información actual del usuario del servidor
          this.getUserInfo().subscribe({
            next: (user) => {
              // Usuario ya se actualiza en getUserInfo
            },
            error: (error) => {
              console.error('Error al restaurar información del usuario:', error);
              this.logout();
            }
          });
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
    return this.http.get<any>(`${this.apiUrl}/mi-usuario`)
      .pipe(
        map(response => {
          const user: User = {
            id: response.id,
            // Handle both formats: separate nombre/apellido or combined name
            nombre: response.nombre || (response.name ? response.name.split(' ')[0] : 'Usuario'),
            apellido: response.apellido || (response.name ? response.name.split(' ').slice(1).join(' ') : ''),
            // Handle both email and correo
            correo: response.correo || response.email || 'sin-email@foodiesbnb.com',
            fechaCreacion: new Date(response.fechaCreacion || new Date()),
            estaActivo: response.estaActivo || true
          };
          
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.userKey, JSON.stringify(user));
          }
          this.currentUserSubject.next(user);
          
          return user;
        }),
        catchError(error => {
          console.error('Error al obtener información del usuario:', error);
          this.logout();
          return throwError(() => error);
        })
      );
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
    
    // Obtener información real del usuario del servidor
    this.getUserInfo().subscribe({
      next: (user) => {
        // Usuario ya se guarda en localStorage y se actualiza el subject en getUserInfo
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error al obtener información del usuario después del login:', error);
        // Si no se puede obtener la info del usuario, usar un usuario temporal
        const tempUser: User = {
          id: 0,
          nombre: 'Usuario',
          apellido: 'Temporal',
          correo: 'temporal@foodiesbnb.com',
          fechaCreacion: new Date(),
          estaActivo: true
        };
        localStorage.setItem(this.userKey, JSON.stringify(tempUser));
        this.currentUserSubject.next(tempUser);
        this.router.navigate(['/dashboard']);
      }
    });
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