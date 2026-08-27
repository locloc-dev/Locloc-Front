import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);


  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  const token = auth.getToken();


  if (token && auth.isTokenExpired()) {
    auth.clearSession();
    return next(req);
  }

  const authorized =
    token && !auth.isTokenExpired()
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authorized).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.clearSession();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
