import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  
  // Check if it's a logout request
  const isLogoutRequest = req.url.includes('/auth/logout');
  
  // Add token logic
  let authRequest = req;
  if (token || isLogoutRequest) {
    // For logout requests, use the token from the service if available
    const tokenToUse = token || (isLogoutRequest ? authService.getLastKnownToken() : null);
    
    if (tokenToUse) {
      authRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${tokenToUse}`,
        },
      });
    }
  }

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors, but don't redirect for logout requests
      if (error.status === 401 && !isLogoutRequest) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
