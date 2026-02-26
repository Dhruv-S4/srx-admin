import { Routes } from '@angular/router';

export const allRoutes: Routes = [
    {
        path: '',
        redirectTo: '/welcome',
        pathMatch: 'full',
    },
    {
        path: 'welcome',
        loadComponent: () => import('../../features/welcome/welcome').then((c) => c.Welcome),
    },
    {
        path: 'profile',
        loadComponent: () => import('../../features/profile/profile').then((c) => c.Profile),
    },
];
