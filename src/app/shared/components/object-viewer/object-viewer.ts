import { Component, Input } from '@angular/core';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { CommonModule } from '@angular/common';
import { SR_FILES_BASE_URL } from '../../../core/models/common.model';

@Component({
  selector: 'app-object-viewer',
  imports: [CommonModule, SafeUrlPipe],
  templateUrl: './object-viewer.html',
})
export class ObjectViewer {
  private _src: string = '';
  displaySrc: string = '';

  @Input()
  set src(value: string) {
    this._src = value;
    this.updateSrc();
  }
  get src(): string {
    return this._src;
  }

  @Input() width: string | number | undefined;
  @Input() height: string | number | undefined;
  @Input() alt: string = '';

  private updateSrc(): void {
    if (!this._src) {
      this.displaySrc = '';
      return;
    }

    // Check if the source is already absolute, absolute-root, or data URI
    if (
      this._src.startsWith('/') ||
      this._src.startsWith('http') ||
      this._src.startsWith('https') ||
      this._src.startsWith('data:')
    ) {
      // Leave purely as is
      this.displaySrc = this._src;
    } else {
      // Prepend base URL
      this.displaySrc = SR_FILES_BASE_URL + 'img/' + this._src;
    }
  }

  get widthStyle(): string | null {
    if (this.width === undefined || this.width === null) return null;
    return typeof this.width === 'number' ? `${this.width}px` : this.width;
  }

  get heightStyle(): string | null {
    if (this.height === undefined || this.height === null) return null;
    return typeof this.height === 'number' ? `${this.height}px` : this.height;
  }
}
