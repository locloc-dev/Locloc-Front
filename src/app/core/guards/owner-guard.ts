import { inject } from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

export const ownerGuard: CanActivateFn = () => {

  const router = inject(Router);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (token && role === 'OWNER') {

    return true;
  }

  router.navigate(['/login']);

  return false;
};
