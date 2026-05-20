import {
  HttpInterceptorFn
} from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  /*
   * Do not attach token
   * for auth endpoints
   */

  if (
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register')
  ) {

    return next(req);
  }

  const token = localStorage.getItem('token');

  if (token) {

    const cloned = req.clone({

      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(cloned);
  }

  return next(req);
};
