import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';
  private tokenExpirationTimer: any;

  http = inject(HttpClient);
  router = inject(Router);

  constructor() {
    this.autoLogin();
  }

  signup(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, user).pipe(
      tap((response: any) => {
        this.handleAuthentication(response.token, response.expiresIn, response.user);
      })
    )
  }

  login(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, user).pipe(
      tap((response: any) => {
        this.handleAuthentication(response.token, response.expiresIn, response.user);
      })
    );
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  redirectToExpenses() {
    this.router.navigate(['/expenses']);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpirationDate');
    localStorage.removeItem('userData');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    // this.router.navigate(['']);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password/${token}`, { password });
  }

  private handleAuthentication(token: string, expiresIn: number, userData?: any) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    localStorage.setItem('token', token);
    localStorage.setItem('tokenExpirationDate', expirationDate.toISOString());
    
    // Store user data if available (from login/signup response)
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    }
    
    this.autoLogout(expiresIn * 1000);
  }

  autoLogin() {
    const token = this.getToken();
    const expirationDate = new Date(localStorage.getItem('tokenExpirationDate') || '');
    if (!token || expirationDate <= new Date()) {
      this.logout();
      return;
    }
    const expiresIn = expirationDate.getTime() - new Date().getTime();
    this.autoLogout(expiresIn);
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  isAdmin(): boolean {
    const userData = this.getUserData();
    return userData && userData.role === 'admin';
  }

  getUserData(): any {
    const userData = localStorage.getItem('userData');
    if (userData) {
      return JSON.parse(userData);
    }
    
    // Fallback to decoding the token if userData is not available
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }
}
