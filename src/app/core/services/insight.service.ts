import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InsightService {
  private apiUrl = environment.apiUrl + '/insights';

  http = inject(HttpClient);
  authService = inject(AuthService);

  constructor() {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
  }

  getAIInsights(filters: { startDate?: string; endDate?: string; category?: string } = {}): Observable<any> {
    let params = new HttpParams();
    
    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }
    
    if (filters.category) {
      params = params.set('category', filters.category);
    }

    return this.http.get(`${this.apiUrl}/ai`, {
      headers: this.getHeaders(),
      params,
    });
  }
}