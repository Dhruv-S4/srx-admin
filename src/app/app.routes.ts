import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/login/login').then((c) => c.Login),
    },
    {
        path: 'logout',
        loadComponent: () => import('./features/logout/logout').then((c) => c.Logout),
    },
    {
        path: '**',
        loadComponent: () => import('./features/not-found/not-found').then((c) => c.NotFound),
    },
];
