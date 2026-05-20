import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  /* AUTH */
  {
    path: 'owner',

    loadComponent: () =>
      import('./layouts/owner-layout/owner-layout')
        .then(m => m.OwnerLayout),

    children: [

      {
        path: 'dashboard',

        loadComponent: () =>
          import('./features/owner/dashboard/dashboard')
            .then(m => m.Dashboard)
      },

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }

    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },

  {
    path: 'admin',

    canActivate: [adminGuard],

    loadComponent: () => import('./layouts/admin-layout/admin-layout').then((m) => m.AdminLayout),

    children: [
      {
        path: 'dashboard',

        loadComponent: () =>
          import('./features/admin/dashboard/dashboard').then((m) => m.Dashboard),
      },

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },

  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },

  /* MAIN APP LAYOUT */

  {
    path: 'app',

    canActivate: [authGuard],

    loadComponent: () => import('./layouts/main-layout/main-layout').then((m) => m.MainLayout),

    children: [
      {
        path: 'listings',

        loadComponent: () => import('./features/listings/listings').then((m) => m.Listings),
      },

      {
        path: '',
        redirectTo: 'listings',
        pathMatch: 'full',
      },
    ],
  },

  /* DEFAULT */

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];
