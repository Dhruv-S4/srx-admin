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
        path: 'additional-b2b-billing',
        loadComponent: () =>
            import('../../features/additional-b2b-billing/additional-b2b-billing').then((c) => c.AdditionalB2bBilling),
    },
    {
        path: 'custom-order-pricing',
        loadComponent: () =>
            import('../../features/custom-order-pricing/custom-order-pricing').then((c) => c.CustomOrderPricing),
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
    {
        path: 'master-awb-upload',
        loadComponent: () =>
            import('../../features/master-awb-upload/master-awb-upload').then((c) => c.MasterAwbUpload),
    },
    {
        path: 'sr-awb-uploader',
        loadComponent: () =>
            import('../../features/sr-awb-uploader/sr-awb-uploader').then((c) => c.SrAwbUploader),
    },
];
