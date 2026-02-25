import { NavItem } from '../models/sidebar.model';

export const sidebarMenu: NavItem[] = [
    {
        name: 'SRX',
        key: 'srx',
        icon: 'lucideGlobe',
        subItems: [
            { name: 'Courier Rate Card', path: '/srx-courier-rate-card', key: 'cost_center' },
            { name: 'International KYC', path: '/international-kyc', key: 'international_kyc' },
            // { name: 'Courier Management', path: '/srx-courier-management', key: 'courier_management' },
            {
                name: 'Rates & Ranking Management',
                path: '/srx-rates-ranking-management',
                key: 'upload_rates_ranking',
            },
        ],
    },
];
