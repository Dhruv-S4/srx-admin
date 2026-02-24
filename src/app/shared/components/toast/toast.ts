import { Component, inject, ChangeDetectorRef, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ToastItem } from '../../../core/models/toast.interface';
import { Subscription } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { SidebarService } from '../../services/sidebar.service';
import { NgClass } from '@angular/common';

const MAX_TOASTS = 3;

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgClass],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
  encapsulation: ViewEncapsulation.None
})
export class Toast implements OnInit, OnDestroy {
  readonly isMobileView$;
  toasts: ToastItem[] = [];
  position: string = 'top-right';
  closingToastIds = new Set<string>();
  private subscription: Subscription | null = null;
  private mobileViewSubscription: Subscription | null = null;
  private cdr = inject(ChangeDetectorRef);
  toastService = inject(ToastService);
  sidebarService = inject(SidebarService);

  constructor() {
    this.isMobileView$ = this.sidebarService.isMobileView$;
  }

  ngOnInit(): void {
    // Subscribe to toastr service
    this.subscription = this.toastService.toasts$.subscribe((toasts: ToastItem[]) => {
      // Check for removed toasts to handle cleanup of closingToastIds
      const currentIds = new Set(toasts.map(t => t.id));
      this.closingToastIds.forEach(id => {
        if (!currentIds.has(id)) {
          this.closingToastIds.delete(id);
        }
      });
      
      // Keep only the last MAX_TOASTS
      this.toasts = toasts.length > MAX_TOASTS ? toasts.slice(-MAX_TOASTS) : toasts;
      
      if (toasts.length > 0) {
        this.position = toasts[0].position || this.position;
      }
      // Trigger change detection since we're using OnPush
      this.cdr.markForCheck();
    });

    // Subscribe to mobile view changes
    this.mobileViewSubscription = this.isMobileView$.subscribe((isMobileView) => {
      this.position = isMobileView ? 'top-center' : 'top-right';
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.mobileViewSubscription) {
      this.mobileViewSubscription.unsubscribe();
    }
  }

  isClosing(id: string): boolean {
    return this.closingToastIds.has(id);
  }

  removeToast(id: string): void {
    if (this.closingToastIds.has(id)) return;
    
    this.closingToastIds.add(id);
    // Wait for animation to finish before removing from service
    setTimeout(() => {
      this.toastService.remove(id);
    }, 200); // Match animation duration in CSS (0.2s)
  }
}
