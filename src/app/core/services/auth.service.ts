import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, tap, map, catchError, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';
  private tokenExpirationTimer: any;
  private lastKnownToken: string | null = null;

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
    return !!sessionStorage.getItem('token');
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  getLastKnownToken(): string | null {
    return this.lastKnownToken;
  }

  redirectToExpenses() {
    this.router.navigate(['/expenses']);
  }

  logout() {
    // Save token before clearing
    const token = this.getToken();
    this.lastKnownToken = token;
    
    // Clear client side first
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('tokenExpirationDate');
    sessionStorage.removeItem('userData');
    
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    
    // Then call server (with proper error handling)
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {})
        .pipe(
          finalize(() => {
            // Always navigate to login regardless of outcome
            this.router.navigate(['/login']);
            this.lastKnownToken = null;
          })
        )
        .subscribe({
          next: () => console.log('Logged out successfully'),
          error: (err) => console.error('Error logging out', err)
        });
    } else {
      // If no token, just navigate
      this.router.navigate(['/login']);
    }
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password/${token}`, { password });
  }

  private handleAuthentication(token: string, expiresIn: number, userData?: any) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    
    // Use a combination of sessionStorage and more secure cookie options
    // Store minimal information in sessionStorage
    sessionStorage.setItem('tokenExpirationDate', expirationDate.toISOString());
    
    // For a more secure solution, consider using HttpOnly cookies via your backend
    // But for the current implementation:
    sessionStorage.setItem('token', token);
    
    // Store user data if available
    if (userData) {
      sessionStorage.setItem('userData', JSON.stringify(userData));
    }
    
    this.autoLogout(expiresIn * 1000);
  }

  autoLogin() {
    const token = this.getToken();
    const expirationDateStr = sessionStorage.getItem('tokenExpirationDate');
    
    if (!token || !expirationDateStr) {
      return;
    }
    
    const expirationDate = new Date(expirationDateStr);
    
    // Check if token is expired
    if (expirationDate <= new Date()) {
      this.logout();
      return;
    }
    
    // Validate token on the server
    this.validateToken().subscribe({
      next: (isValid) => {
        if (isValid) {
          const expiresIn = expirationDate.getTime() - new Date().getTime();
          this.autoLogout(expiresIn);
        } else {
          this.logout();
        }
      },
      error: () => this.logout()
    });
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
    const userData = sessionStorage.getItem('userData');
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

  validateToken(): Observable<boolean> {
    return this.http.get<{valid: boolean}>(`${this.apiUrl}/validate-token`).pipe(
      map(response => response.valid),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }
}
