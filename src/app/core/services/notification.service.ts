import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationRequest, NotificationResponse } from '../models/notification.model';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    private apiUrl = `${environment.apiBaseUrl}/notifications-api`;

    constructor(private http: HttpClient) { }

    sendNotification(notification: NotificationRequest): Observable<NotificationResponse> {
        return this.http.post<NotificationResponse>(`${this.apiUrl}/send`, notification);
    }
}