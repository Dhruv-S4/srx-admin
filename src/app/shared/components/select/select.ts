import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  Output,
  TemplateRef,
  ViewChild,
  computed,
  signal,
  effect,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideChevronDown,
  lucideSearch,
  lucideCheck,
  lucideX,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [FormsModule, NgTemplateOutlet, NgIcon],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Select),
      multi: true,
    },
    provideIcons({
      lucideChevronDown,
      lucideSearch,
      lucideCheck,
      lucideX,
    }),
  ],
  templateUrl: './select.html',
  styleUrl: './select.scss',
})
export class Select implements ControlValueAccessor {
  private readonly elementRef = inject(ElementRef);

  private _options = signal<any[]>([]);
  @Input() set options(val: any[]) {
    this._options.set(val ?? []);
  }
  get options(): any[] {
    return this._options();
  }

  @Input() multiple = false;
  @Input() searchable = false;
  @Input() placeholder = 'Select...';
  @Input() labelKey = 'label';
  @Input() valueKey = 'value';
  @Input() searchPlaceholder = 'Search...';
  @Input() optionTemplate?: TemplateRef<any>;
  @Input() selectedTemplate?: TemplateRef<any>;
  @Input() disabled = false;

  @Input() set value(val: any) {
    this.writeValue(val);
  }

  @ViewChild('triggerButton') triggerButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  @Output() selectionChange = new EventEmitter<any>();

  readonly isOpen = signal(false);
  readonly isClosing = signal(false);
  readonly searchTerm = signal('');
  readonly maxDisplayOptions = signal(0);
  readonly isLayoutReady = signal(false);
  readonly _value = signal<any>(null);
  readonly dropdownPosition = signal<'top' | 'bottom'>('bottom');

  private resizeObserver: ResizeObserver | null = null;
  private canvas: HTMLCanvasElement | null = null;

  constructor() {
    effect(
      () => {
        this._options();
        this._value();
        this.isLayoutReady.set(false);
        setTimeout(() => {
          this.calculateRequiredWidth();
          this.calculateVisibleChips();
          this.isLayoutReady.set(true);
        });
      },
      { allowSignalWrites: true }
    );
  }

  filteredOptions = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const opts = this._options();
    if (!term) return opts;
    return opts.filter((opt) =>
      this.getLabel(opt).toLowerCase().includes(term)
    );
  });

  selectedOptions = computed(() => {
    const val = this._value();
    const opts = this._options();
    if (val == null) return [];
    if (this.multiple) {
      if (!Array.isArray(val)) return [];
      return opts.filter((opt) => val.includes(this.getValue(opt)));
    }
    const option = opts.find((opt) => this.getValue(opt) === val);
    return option ? [option] : [];
  });

  requiredWidth = signal<number | null>(null);

  isSelected(option: any): boolean {
    const optValue = this.getValue(option);
    const val = this._value();
    if (this.multiple) {
      return Array.isArray(val) && val.includes(optValue);
    }
    return val === optValue;
  }

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  ngAfterViewInit(): void {
    if (typeof ResizeObserver !== 'undefined' && this.triggerButton?.nativeElement) {
      this.resizeObserver = new ResizeObserver(() => this.calculateVisibleChips());
      this.resizeObserver.observe(this.triggerButton.nativeElement);
    }
    this.calculateRequiredWidth();
    this.calculateVisibleChips();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  toggleDropdown(): void {
    if (this.disabled || this.isClosing()) return;
    if (!this.isOpen()) {
      this.calculatePosition();
    }
    this.isOpen.update((v) => !v);
    if (this.isOpen() && this.searchable) {
      setTimeout(() => this.searchInput?.nativeElement?.focus(), 80);
    } else {
      this.onTouched();
    }
  }

  private calculatePosition(): void {
    if (!this.triggerButton?.nativeElement) return;
    const rect = this.triggerButton.nativeElement.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const neededSpace = 260;
    this.dropdownPosition.set(
      spaceBelow < neededSpace && spaceAbove > spaceBelow ? 'top' : 'bottom'
    );
  }

  selectOption(option: any): void {
    const val = this.getValue(option);
    if (this.multiple) {
      const currentVal = Array.isArray(this._value()) ? [...this._value()] : [];
      const idx = currentVal.indexOf(val);
      if (idx > -1) currentVal.splice(idx, 1);
      else currentVal.push(val);
      this.writeValue(currentVal);
      this.onChange(currentVal);
      this.selectionChange.emit(currentVal);
    } else {
      this.writeValue(val);
      this.onChange(val);
      this.selectionChange.emit(val);
      this.closeWithAnimation();
    }
  }

  removeItem(event: Event, option: any): void {
    event.stopPropagation();
    if (!this.multiple) return;
    const val = this.getValue(option);
    const currentVal = Array.isArray(this._value()) ? [...this._value()] : [];
    const idx = currentVal.indexOf(val);
    if (idx > -1) {
      currentVal.splice(idx, 1);
      this.writeValue(currentVal);
      this.onChange(currentVal);
      this.selectionChange.emit(currentVal);
    }
  }

  clearSelection(event: Event): void {
    event.stopPropagation();
    const newVal = this.multiple ? [] : null;
    this.writeValue(newVal);
    this.onChange(newVal);
    this.selectionChange.emit(newVal);
  }

  private calculateRequiredWidth(): void {
    if (!this.canvas) this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    ctx.font = '14px sans-serif';
    const opts = this._options();
    let maxW = 0;
    for (const opt of opts) {
      const w = ctx.measureText(this.getLabel(opt)).width;
      if (w > maxW) maxW = w;
    }
    if (maxW > 0) this.requiredWidth.set(maxW + 80);
  }

  private calculateVisibleChips(): void {
    if (!this.multiple || !this.triggerButton?.nativeElement) return;
    const selected = this.selectedOptions();
    if (selected.length === 0) {
      this.maxDisplayOptions.set(0);
      return;
    }
    const containerWidth = this.triggerButton.nativeElement.offsetWidth;
    const availableWidth = Math.max(0, containerWidth - 60);
    if (availableWidth <= 0) {
      this.maxDisplayOptions.set(0);
      return;
    }
    if (!this.canvas) this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    ctx.font = '500 12px sans-serif';
    const chipOverhead = 32;
    const gap = 4;
    const badgeOverhead = 16;
    let usedWidth = 0;
    let count = 0;
    for (let i = 0; i < selected.length; i++) {
      const label = this.getLabel(selected[i]);
      const chipWidth = ctx.measureText(label).width + chipOverhead;
      if (usedWidth + chipWidth <= availableWidth) {
        usedWidth += chipWidth + gap;
        count++;
      } else break;
    }
    if (count === selected.length) {
      this.maxDisplayOptions.set(count);
      return;
    }
    let badgeText = `+${selected.length - count} more`;
    let badgeWidth = ctx.measureText(badgeText).width + badgeOverhead;
    while (count > 0 && usedWidth + badgeWidth > availableWidth) {
      count--;
      const label = this.getLabel(selected[count]);
      usedWidth -= ctx.measureText(label).width + chipOverhead + gap;
      badgeText = `+${selected.length - count} more`;
      badgeWidth = ctx.measureText(badgeText).width + badgeOverhead;
    }
    this.maxDisplayOptions.set(count);
  }

  updateSearch(term: string): void {
    this.searchTerm.set(term);
  }

  getValue(option: any): any {
    return typeof option === 'object' && option !== null
      ? option[this.valueKey]
      : option;
  }

  getLabel(option: any): string {
    return typeof option === 'object' && option !== null
      ? String(option[this.labelKey] ?? '')
      : String(option);
  }

  writeValue(value: any): void {
    this._value.set(value);
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onPanelAnimationEnd(): void {
    if (this.isClosing()) {
      this.isOpen.set(false);
      this.isClosing.set(false);
    }
  }

  closeWithAnimation(): void {
    if (!this.isOpen()) return;
    this.isClosing.set(true);
    this.onTouched();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      if (this.isOpen()) this.closeWithAnimation();
    }
  }
}
