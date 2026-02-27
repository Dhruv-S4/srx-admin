import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  Renderer2,
  Inject,
  OnDestroy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [],
  template: `
    <span
      #trigger
      class="tooltip-trigger inline-flex"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
      (focusin)="onFocus()"
      (focusout)="onBlur()"
    >
      <ng-content />
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
      .tooltip-trigger:focus {
        outline: none;
      }
    `,
  ],
})
export class TooltipComponent implements OnDestroy {
  @Input() content = '';
  @Input() side: TooltipSide = 'right';
  @Input() position?: 'left' | 'right' | 'up' | 'down';
  @Input() delayMs = 200;
  @Input() disabled = false;

  @ViewChild('trigger') triggerRef!: ElementRef<HTMLElement>;

  private visible = false;
  private showTimeout: ReturnType<typeof setTimeout> | null = null;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private tooltipEl: HTMLElement | null = null;
  private readonly renderer = inject(Renderer2);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor(@Inject(DOCUMENT) private readonly doc: Document) {}

  ngOnDestroy(): void {
    this.clearTimeouts();
    this.removeTooltip();
  }

  onMouseEnter(): void {
    if (this.disabled) return;
    this.clearTimeouts();
    this.showTimeout = setTimeout(() => this.show(), this.delayMs);
  }

  onMouseLeave(): void {
    this.clearTimeouts();
    this.hideTimeout = setTimeout(() => this.hide(), 100);
  }

  onFocus(): void {
    if (this.disabled) return;
    this.clearTimeouts();
    this.showTimeout = setTimeout(() => this.show(), this.delayMs);
  }

  onBlur(): void {
    this.clearTimeouts();
    this.hideTimeout = setTimeout(() => this.hide(), 100);
  }

  private clearTimeouts(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  private show(): void {
    if (this.visible || !this.content || !this.triggerRef?.nativeElement) return;
    this.visible = true;
    this.createTooltip();
    this.cdr.detectChanges();
  }

  private hide(): void {
    if (!this.visible) return;
    this.visible = false;
    this.removeTooltip();
    this.cdr.detectChanges();
  }

  private getTriggerRect(): DOMRect {
    const trigger = this.triggerRef?.nativeElement;
    if (!trigger) return new DOMRect(0, 0, 0, 0);
    // Use first child for rect when trigger has display:contents (no box)
    const child = trigger.firstElementChild as HTMLElement;
    const el = child ?? trigger;
    return el.getBoundingClientRect();
  }

  private getEffectiveSide(): TooltipSide {
    if (!this.position) return this.side;
    switch (this.position) {
      case 'up':
        return 'top';
      case 'down':
        return 'bottom';
      case 'left':
        return 'left';
      case 'right':
      default:
        return 'right';
    }
  }

  private isDarkMode(): boolean {
    const docEl = this.doc.documentElement;
    return docEl.classList.contains('dark') || this.doc.body.classList.contains('dark');
  }

  private createTooltip(): void {
    if (this.tooltipEl) return;
    const rect = this.getTriggerRect();
    const el = this.renderer.createElement('div');
    el.setAttribute('role', 'tooltip');
    el.setAttribute('aria-hidden', 'false');
    el.className =
      'fixed max-w-[min(calc(100vw-16px),280px)] rounded-md border px-3 py-1.5 text-sm shadow-md';
    el.textContent = this.content;
    const offset = 8;
    const side = this.getEffectiveSide();
    const isDark = this.isDarkMode();

    // Invert colors relative to theme
    if (isDark) {
      el.style.backgroundColor = '#ffffff';
      el.style.color = '#020617';
      el.style.borderColor = 'rgba(15,23,42,0.16)';
      el.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.25), 0 4px 6px -4px rgba(0,0,0,0.25)';
    } else {
      el.style.backgroundColor = '#020617';
      el.style.color = '#f9fafb';
      el.style.borderColor = 'rgba(15,23,42,0.16)';
      el.style.boxShadow = '0 10px 15px -3px rgba(15,23,42,0.35), 0 4px 6px -4px rgba(15,23,42,0.3)';
    }

    let left = 0;
    let top = 0;
    switch (side) {
      case 'right':
        left = rect.right + offset;
        top = rect.top + rect.height / 2;
        el.style.transform = 'translateY(-50%)';
        break;
      case 'left':
        left = rect.left - offset;
        top = rect.top + rect.height / 2;
        el.style.transform = 'translate(-100%, -50%)';
        break;
      case 'top':
        left = rect.left + rect.width / 2;
        top = rect.top - offset;
        el.style.transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        left = rect.left + rect.width / 2;
        top = rect.bottom + offset;
        el.style.transform = 'translateX(-50%)';
        break;
    }
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    el.style.zIndex = '1000';
    this.renderer.appendChild(this.doc.body, el);
    this.tooltipEl = el;
  }

  private removeTooltip(): void {
    if (this.tooltipEl?.parentNode) {
      this.renderer.removeChild(this.doc.body, this.tooltipEl);
    }
    this.tooltipEl = null;
  }
}
