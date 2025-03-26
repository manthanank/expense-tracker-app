import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/stats`);
  }

  getAllUsers(page = 1, limit = 10, search = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get(`${this.apiUrl}/admin/users`, { params });
  }

  getUserDetails(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/users/${userId}`);
  }

  getUserExpenses(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/users/${userId}/expenses`);
  }
}
