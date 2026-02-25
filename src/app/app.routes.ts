import { Routes } from '@angular/router';
import { Layout } from './shared/components/layout/layout';
import { icrmGuard } from './shared/guards/icrm.guard';

export const routes: Routes = [
    {
        path: '',
        component: Layout,
        children: [
            {
                path: '',
                loadChildren: () => import('./core/routes/all.routes').then((r) => r.allRoutes),
                canActivate: [icrmGuard],
                canActivateChild: [icrmGuard],
            },
        ],
    },
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
