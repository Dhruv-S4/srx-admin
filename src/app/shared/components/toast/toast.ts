import { Component, inject, ChangeDetectorRef, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ToastItem } from '../../../core/models/toast.interface';
import { Subscription } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { SidebarService } from '../../services/sidebar.service';
import { NgClass } from '@angular/common';

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

  // SVG Icons paths
  icons = {
    success: `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>`,
    error: `<polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>`,
    info: `<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>`,
    warning: `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>`,
    close: `<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>`
  };

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

      this.toasts = toasts;
      if (toasts.length > 0) {
        console.log("toasts", toasts)
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
    }, 300); // Match animation duration in CSS
  }
}
