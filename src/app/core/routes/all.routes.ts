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
    {
        path: 'courier-rate-card',
        loadComponent: () =>
            import('../../features/courier-rate-card/courier-rate-card').then((c) => c.CourierRateCard),
    },
    {
        path: 'ddp-charges',
        loadComponent: () =>
            import('../../features/ddp-charges/ddp-charges').then((c) => c.DdpCharges),
    },
];
