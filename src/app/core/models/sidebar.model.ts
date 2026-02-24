export type NavItem = {
    name: string;
    icon: any;
    path?: string;
    key?: string;
    new?: boolean;
    subItems?: { name: string; path: string; pro?: boolean; new?: boolean; key?: string }[];
};