import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router); // Inject Router
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 || error.status === 403 || error.status === 404 || error) {
        authService.logout();
        router.navigate(['/login']); // Redirect to login after logout
      }
      return throwError(() => error);
    })
  );
};