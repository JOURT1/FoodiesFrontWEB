import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CatalogoMaster, CatalogoMasterRequest } from '../models/catalogo.model';

@Injectable({ providedIn: 'root' })
export class CatalogosService {
  private apiUrl = environment.apiBaseUrl + '/catalogos-api';

  constructor(private http: HttpClient) { }

  getCatalogos(): Observable<CatalogoMaster[]> {
    return this.http.get<CatalogoMaster[]>(this.apiUrl);
  }

  getCatalogoById(id: number): Observable<CatalogoMaster> {
    return this.http.get<CatalogoMaster>(`${this.apiUrl}/${id}`);
  }

  getByCodigo(codigo: string): Observable<CatalogoMaster> {
    return this.http.get<CatalogoMaster>(`${this.apiUrl}/codigo/${codigo}`);
  }

  createCatalogo(catalogo: CatalogoMasterRequest): Observable<CatalogoMaster> {
    return this.http.post<CatalogoMaster>(this.apiUrl, catalogo);
  }

  updateCatalogo(id: number, catalogo: CatalogoMasterRequest): Observable<CatalogoMaster> {
    return this.http.put<CatalogoMaster>(`${this.apiUrl}/${id}`, catalogo);
  }

}
