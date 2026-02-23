export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastConfig {
    message: string;
    type: ToastType;
    duration?: number;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    autoClose?: boolean;
}

export interface ToastItem extends ToastConfig {
    id: string;
    createdAt: Date;
} 