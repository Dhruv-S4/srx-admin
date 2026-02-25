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
];
