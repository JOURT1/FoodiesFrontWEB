import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoriaRequest, CategoriaResponse } from '../models/categoria.model';

@Injectable({
    providedIn: 'root'
})
export class CategoriaService {
    private apiUrl = `${environment.apiBaseUrl}/operations-api/Categoria`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<CategoriaResponse[]> {
        return this.http.get<CategoriaResponse[]>(this.apiUrl);
    }

    create(categoria: CategoriaRequest): Observable<CategoriaResponse> {
        return this.http.post<CategoriaResponse>(this.apiUrl, categoria);
    }

    update(id: number, categoria: CategoriaRequest): Observable<CategoriaResponse> {
        return this.http.put<CategoriaResponse>(`${this.apiUrl}/${id}`, categoria);
    }
}