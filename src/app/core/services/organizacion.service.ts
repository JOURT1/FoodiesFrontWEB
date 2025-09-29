import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  Organizacion,
  CrearOrganizacionDto,
  EditarOrganizacionDto,
  ConsultaOrganizacionDto,
  UsuarioAutocomplete,
  ResponsableAutocomplete,
  ActividadEconomica,
  ValidacionResponse
} from '../models/organizacion.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrganizacionService {
  private readonly apiUrl = `${environment.apiBaseUrl}/operations-api`;
  private organizacionesSubject = new BehaviorSubject<Organizacion[]>([]);
  public organizaciones$ = this.organizacionesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // CRUD Operations
  obtenerOrganizaciones(): Observable<Organizacion[]> {
    return this.http.get<Organizacion[]>(`${this.apiUrl}/organizacion`).pipe(
      tap((organizaciones) => {
        this.organizacionesSubject.next(organizaciones);
      })
    );
  }

  obtenerOrganizacionPorId(id: number): Observable<Organizacion> {
    return this.http.get<Organizacion>(`${this.apiUrl}/organizacion/${id}`);
  }

  obtenerOrganizacionPorIdentificacion(identificacion: string): Observable<Organizacion> {
    return this.http.get<Organizacion>(`${this.apiUrl}/organizacion/identificacion/${identificacion}`);
  }

  crearOrganizacion(organizacion: CrearOrganizacionDto): Observable<Organizacion> {
    return this.http.post<Organizacion>(`${this.apiUrl}/organizacion`, organizacion).pipe(
      tap(() => {
        // Refrescar la lista después de crear
        this.obtenerOrganizaciones().subscribe();
      })
    );
  }

  actualizarOrganizacion(id: number, organizacion: EditarOrganizacionDto): Observable<Organizacion> {
    return this.http.put<Organizacion>(`${this.apiUrl}/organizacion/${id}`, organizacion).pipe(
      tap(() => {
        // Refrescar la lista después de actualizar
        this.obtenerOrganizaciones().subscribe();
      })
    );
  }

  buscarOrganizaciones(filtros: ConsultaOrganizacionDto): Observable<Organizacion[]> {
    return this.http.post<Organizacion[]>(`${this.apiUrl}/organizacion/search`, filtros).pipe(
      tap((organizaciones) => {
        this.organizacionesSubject.next(organizaciones);
      })
    );
  }

  // Autocomplete Methods
  buscarUsuarios(searchTerm: string): Observable<UsuarioAutocomplete[]> {
    const params = new HttpParams().set('searchTerm', searchTerm);
    return this.http.get<UsuarioAutocomplete[]>(`${this.apiUrl}/organizacion/autocomplete/usuarios`, { params });
  }

  obtenerActividadesEconomicas(): Observable<ActividadEconomica[]> {
    return this.http.get<ActividadEconomica[]>(`${this.apiUrl}/organizacion/autocomplete/actividades-economicas`);
  }

  buscarActividadesEconomicas(searchTerm: string): Observable<ActividadEconomica[]> {
    const params = new HttpParams().set('searchTerm', searchTerm);
    return this.http.get<ActividadEconomica[]>(`${this.apiUrl}/organizacion/autocomplete/actividades-economicas/search`, { params });
  }

  buscarResponsables(searchTerm: string): Observable<ResponsableAutocomplete[]> {
    const params = new HttpParams().set('searchTerm', searchTerm);
    return this.http.get<ResponsableAutocomplete[]>(`${this.apiUrl}/organizacion/autocomplete/responsables`, { params });
  }

  // Validation Methods
  validarUsuario(codigoUsuario: string): Observable<ValidacionResponse> {
    return this.http.get<ValidacionResponse>(`${this.apiUrl}/organizacion/validate/usuario/${codigoUsuario}`);
  }

  validarResponsable(codigoResponsable: string): Observable<ValidacionResponse> {
    return this.http.get<ValidacionResponse>(`${this.apiUrl}/organizacion/validate/responsable/${codigoResponsable}`);
  }

  // Utility Methods
  obtenerOrganizacionesActivas(): Observable<Organizacion[]> {
    return this.obtenerOrganizaciones().pipe(
      tap((organizaciones) => {
        const activas = organizaciones.filter(o => o.estaActivo);
        this.organizacionesSubject.next(activas);
      })
    );
  }

  obtenerOrganizacionesInactivas(): Observable<Organizacion[]> {
    return this.obtenerOrganizaciones().pipe(
      tap((organizaciones) => {
        const inactivas = organizaciones.filter(o => !o.estaActivo);
        this.organizacionesSubject.next(inactivas);
      })
    );
  }

  // Limpiar el estado
  limpiarEstado(): void {
    this.organizacionesSubject.next([]);
  }
}