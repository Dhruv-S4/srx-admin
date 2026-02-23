import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastConfig, ToastItem } from '../../core/models/toast.interface';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toasts: ToastItem[] = [];
  private toastsSubject = new BehaviorSubject<ToastItem[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  private generateUniqueId(): string {
    const timestamp1 = Date.now().toString(32); // Convert timestamp to base32
    const randomStr = Math.random().toString(32);
    const randomStr1 = randomStr.substring(2, 6); // Get random string 1
    const randomStr2 = randomStr.substring(8, 12); // Get random string 2
    const randomStr3 = randomStr.substring(5, 9); // Get random string 3
    const randomStr4 = randomStr.substring(9, 13); // Get random string 4
    const timestamp2 = Date.now().toString(24); // Convert timestamp to base24

    const completedUuid = `${timestamp1}-${randomStr1}-${randomStr2}-${randomStr3}-${randomStr4}-${timestamp2}`;
    return completedUuid;
  }

  show(config: ToastConfig): void {
    const toast: ToastItem = {
      ...config,
      id: this.generateUniqueId(),
      createdAt: new Date(),
      duration: config.duration || 3000,
      position: config.position,
      autoClose: config.autoClose ?? true,
    };

    this.toasts.push(toast);
    this.toastsSubject.next(this.toasts);

    if (toast.autoClose) {
      setTimeout(() => {
        this.remove(toast.id);
      }, toast.duration);
    }
  }

  remove(id: string): void {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.toastsSubject.next(this.toasts);
  }

  success(message: string, config?: Omit<ToastConfig, 'message' | 'type'>): void {
    this.show({ ...config, message, type: 'success' });
  }

  error(message: string, config?: Omit<ToastConfig, 'message' | 'type'>): void {
    this.show({ ...config, message, type: 'error' });
  }

  info(message: string, config?: Omit<ToastConfig, 'message' | 'type'>): void {
    this.show({ ...config, message, type: 'info' });
  }

  warning(message: string, config?: Omit<ToastConfig, 'message' | 'type'>): void {
    this.show({ ...config, message, type: 'warning' });
  }

  clear(): void {
    this.toasts = [];
    this.toastsSubject.next(this.toasts);
  }
}
