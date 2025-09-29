import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Usuario,
  CambiarPasswordDto,
  CrearUsuarioDto,
  EditarUsuarioDto,
  OperacionUsuarioDto} from '../models/usuarios.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private readonly apiUrl = `${environment.apiBaseUrl}/users-api`;
  private usuariosSubject = new BehaviorSubject<Usuario[]>([]);
  public usuarios$ = this.usuariosSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.post<Usuario[]>(`${this.apiUrl}/consultar`, {}).pipe(
      tap((usuarios) => {
        this.usuariosSubject.next(usuarios);
      })
    );
  }

  obtenerUsuariosActivos(): Observable<Usuario[]> {
    return this.obtenerUsuarios().pipe(
      map((usuarios) => usuarios.filter((u) => u.estaActivo))
    );
  }

  obtenerUsuariosBloqueados(): Observable<Usuario[]> {
    return this.obtenerUsuarios().pipe(
      map((usuarios) => usuarios.filter((u) => !u.estaActivo))
    );
  }

  obtenerUsuarioPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/consultar/${id}`);
  }

  crearUsuario(usuario: CrearUsuarioDto): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/gestionar`, usuario).pipe(
      tap((response) => {
        this.obtenerUsuarios().subscribe();
      })
    );
  }

  editarUsuario(datos: EditarUsuarioDto): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/gestionar`, datos).pipe(
      tap(() => this.obtenerUsuarios().subscribe())
    );
  }

  eliminarUsuario(id: number): Observable<void> {
    const request: OperacionUsuarioDto = {
      operacion: 'desactivar',
      idUsuario: id,
    };
    return this.http.post<void>(`${this.apiUrl}/gestionar`, request).pipe(
      tap(() => this.obtenerUsuarios().subscribe())
    );
  }

  bloquearUsuario(id: number): Observable<void> {
    const request: OperacionUsuarioDto = {
      operacion: 'bloquear',
      idUsuario: id,
    };
    return this.http.post<void>(`${this.apiUrl}/gestionar`, request).pipe(
      tap(() => this.obtenerUsuarios().subscribe())
    );
  }

  desbloquearUsuario(id: number): Observable<void> {
    const request: OperacionUsuarioDto = {
      operacion: 'desbloquear',
      idUsuario: id,
    };
    return this.http.post<void>(`${this.apiUrl}/gestionar`, request).pipe(
      tap(() => this.obtenerUsuarios().subscribe())
    );
  }

  activarCuenta(id: number): Observable<void> {
    const request: OperacionUsuarioDto = {
      operacion: 'activar',
      idUsuario: id,
    };

    return this.http.post<void>(`${this.apiUrl}/gestionar`, request);
  }

  desactivarCuenta(id: number): Observable<void> {
    const request: OperacionUsuarioDto = {
      operacion: 'desactivar',
      idUsuario: id,
    };

    return this.http.post<void>(`${this.apiUrl}/gestionar`, request);
  }

  cambiarPassword(datos: CambiarPasswordDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/gestionar`, datos);
  }

  resetearPassword(id: number, nuevaContrasenia: string): Observable<void> {
    const request = {
      operacion: 'cambiar_contrasenia',
      idUsuario: id,
      contrasenia: nuevaContrasenia,
      contraseniaActual: ''
    };
    return this.http.post<void>(`${this.apiUrl}/gestionar`, request);
  }
}
