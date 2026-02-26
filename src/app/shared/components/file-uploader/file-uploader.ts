import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCloudUpload } from '@ng-icons/lucide';

type FileType = string;

@Component({
  selector: 'app-file-uploader',
  standalone: true,
  imports: [NgClass, NgIcon],
  providers: [provideIcons({ lucideCloudUpload })],
  templateUrl: './file-uploader.html',
})
export class FileUploader implements OnChanges {
  @Input() sampleFileUrl?: string;
  @Input() acceptedFileTypes: FileType = '*';
  /** Max size in MB */
  @Input() maxFileSize = 5;
  /** Any change resets internal state */
  @Input() resetTrigger = 0;
  @Input() uploadDisabled = false;

  @Output() fileSelected = new EventEmitter<File>();
  @Output() uploadClicked = new EventEmitter<File>();
  @Output() cancelClicked = new EventEmitter<void>();

  readonly isDragging = signal(false);
  readonly selectedFile = signal<File | null>(null);
  readonly errorMessage = signal('');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetTrigger'] && !changes['resetTrigger'].firstChange) {
      this.reset();
    }
  }

  reset() {
    this.isDragging.set(false);
    this.selectedFile.set(null);
    this.errorMessage.set('');
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.handleFile(file);
  }

  browseFiles() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = this.acceptedFileTypes;
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', (e) => {
      const input = e.target as HTMLInputElement;
      const file = input.files?.[0];
      if (file) this.handleFile(file);
    });
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  }

  downloadSampleFile() {
    if (!this.sampleFileUrl) return;
    window.open(this.sampleFileUrl, '_blank');
  }

  onUpload() {
    const file = this.selectedFile();
    if (!file) return;
    this.uploadClicked.emit(file);
  }

  onCancel() {
    this.reset();
    this.cancelClicked.emit();
  }

  private handleFile(file: File) {
    this.errorMessage.set('');
    if (!this.validateSize(file)) return;
    if (!this.validateType(file)) return;

    this.selectedFile.set(file);
    this.fileSelected.emit(file);
  }

  private validateSize(file: File): boolean {
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > this.maxFileSize) {
      this.errorMessage.set(`File size exceeds ${this.maxFileSize}MB limit`);
      return false;
    }
    return true;
  }

  private validateType(file: File): boolean {
    if (this.acceptedFileTypes === '*') return true;
    const fileName = file.name.toLowerCase();
    const accepted = this.acceptedFileTypes
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    if (accepted.length === 0) return true;

    const ok = accepted.some((type) => {
      if (type.startsWith('.')) return fileName.endsWith(type);
      return fileName.includes(type);
    });

    if (!ok) {
      this.errorMessage.set(`Invalid file type. Accepted types: ${this.acceptedFileTypes}`);
      return false;
    }
    return true;
  }
}

