import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';
import { ownerGuard } from './core/guards/owner-guard';

export const routes: Routes = [
  /* OWNER */
  {
    path: 'owner',

    canActivate: [ownerGuard],

    loadComponent: () => import('./layouts/owner-layout/owner-layout').then((m) => m.OwnerLayout),

    children: [
      {
        path: 'listings',
        loadComponent: () =>
          import('./features/owner/listing/my-listings').then(m => m.MyListings)
      },
      {
        path: 'new-listing',
        loadComponent: () =>
          import('./features/owner/new-listing/new-listing').then(m => m.NewListing)
      },
      {
        path: 'requests',

        loadComponent: () =>
          import('./features/owner/owner-requests/owner-requests')
            .then(m => m.OwnerRequests)
      },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/owner/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'ads',
        loadComponent: () =>
          import('./features/owner/my-ads/my-ads').then(m => m.MyAds)
      },
      {
        path: '',
        redirectTo: 'listings',
        pathMatch: 'full'
      }
    ],
  },

  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },

  /* ADMIN */
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
        path: 'properties',
        loadComponent: () =>
          import('./features/admin/properties/properties').then((m) => m.Properties),
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/users').then((m) => m.Users),
      },
      {
        path: 'listings',
        loadComponent: () =>
          import('./features/admin/listings/admin-listings').then((m) => m.AdminListings),
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

  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },

  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password').then((m) => m.ResetPassword),
  },

  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },

  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password').then((m) => m.ResetPassword),
  },

  {
    path: 'app',

    loadComponent: () => import('./layouts/main-layout/main-layout').then((m) => m.MainLayout),

    children: [
      {
        path: 'listings',
        loadComponent: () =>
          import('./features/listings/listings').then((m) => m.Listings),
      },
      {
        path: 'listings/:id',
        loadComponent: () =>
          import('./features/listings/detail/property-detail').then((m) => m.PropertyDetail),
      },
      {
        path: 'requests',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/requests/my-requests').then((m) => m.MyRequests),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/profile/profile').then((m) => m.Profile),
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
    redirectTo: 'app/listings',
    pathMatch: 'full',
  },

  {
    path: '**',
    redirectTo: 'app/listings',
  },
];
