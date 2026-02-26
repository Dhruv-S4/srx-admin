import { NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDownload } from '@ng-icons/lucide';
import { Subscription } from 'rxjs';
import type { TableHeader } from '../../core/models/common.model';
import { FileUploader } from '../../shared/components/file-uploader/file-uploader';
import { Table } from '../../shared/components/table/table';
import { DdpChargesService } from '../../shared/services/ddp-charges.service';
import { ToastService } from '../../shared/services/toast.service';

const DDP_SAMPLE_FILE_URL = 'https://sr-cdn-1.shiprocket.in/shiprocket/files/DDP+Charges+-+Sheet1.csv';

@Component({
  selector: 'app-ddp-charges',
  standalone: true,
  imports: [FileUploader, Table, NgClass, NgIcon],
  providers: [provideIcons({ lucideDownload })],
  templateUrl: './ddp-charges.html',
})
export class DdpCharges implements OnInit, OnDestroy {
  private dataSubscription?: Subscription;

  private readonly toast = inject(ToastService);
  private readonly ddpChargesService = inject(DdpChargesService);

  readonly headers = signal<TableHeader[]>([]);
  readonly tableData = signal<any[]>([]);
  readonly currentPage = signal(1);
  readonly pageSize = signal(15);
  readonly totalRecords = signal(0);
  readonly selectedFile = signal<File | null>(null);
  readonly resetTrigger = signal(0);

  ngOnInit(): void {
    this.setHeaders();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.dataSubscription?.unsubscribe();
  }

  private setHeaders(): void {
    this.headers.set([
      { name: 'File ID' },
      { name: 'Uploaded File' },
      { name: 'Error File' },
      { name: 'Success Count' },
      { name: 'Failed Count' },
      { name: 'Uploaded By' },
      { name: 'Date' },
      { name: 'Status' },
    ]);
  }

  loadData(): void {
    this.dataSubscription?.unsubscribe();

    this.dataSubscription = this.ddpChargesService
      .getDdpChargesUploadHistory(this.currentPage(), this.pageSize())
      .subscribe({
        next: (response) => {
          const raw = response?.data || [];
          this.tableData.set(this.transformTableData(raw));
          this.totalRecords.set(response?.meta?.counts ?? response?.total ?? 0);
        },
        error: () => {
          this.tableData.set([]);
          this.totalRecords.set(0);
          this.toast.error('Failed to load DDP charges history');
        },
      });
  }

  onPageChange(event: { page: number; rows: number }): void {
    if (!event) return;
    this.currentPage.set(event.page);
    this.pageSize.set(event.rows);
    this.loadData();
  }

  onFileSelected(file: File): void {
    this.selectedFile.set(file);
  }

  onUploadClick(): void {
    const file = this.selectedFile();
    if (!file) {
      this.toast.error('Please select a file to upload');
      return;
    }

    this.ddpChargesService.uploadDdpCharges(file).subscribe({
      next: (response) => {
        if (response?.status === 200 || response?.message) {
          this.toast.success(response?.message || 'File uploaded successfully');
          this.selectedFile.set(null);
          this.resetTrigger.update((v) => v + 1);
          this.loadData();
        } else {
          this.toast.error(response?.message || 'Failed to upload DDP charges');
        }
      },
      error: (error) => {
        this.toast.error(error?.error?.message || 'Failed to upload DDP charges');
      },
    });
  }

  onCancelClick(): void {
    this.selectedFile.set(null);
    this.resetTrigger.update((v) => v + 1);
  }

  downloadFile(fileUrl: string): void {
    if (!fileUrl) {
      this.toast.error('File URL not available');
      return;
    }
    window.open(fileUrl, '_blank');
  }

  getSampleFileUrl(): string {
    return DDP_SAMPLE_FILE_URL;
  }

  private transformTableData(data: any[]): any[] {
    if (!Array.isArray(data)) return [];
    return data.map((item) => ({
      fileId: item.file_id || 'N/A',
      uploadedFile: this.extractFileNameFromUrl(item.file_path ?? item.file_url) || 'N/A',
      uploadedFileUrl: item.file_path ?? item.file_url ?? null,
      errorFileUrl: item.error_file_path ?? item.error_file ?? null,
      successCount: item.success_count ?? 0,
      failedCount: item.error_count ?? item.failure_count ?? 0,
      uploadedBy: item.uploaded_by || 'N/A',
      date: item.upload_date ?? item.date ?? 'N/A',
      status: item.status || 'PENDING',
    }));
  }

  private extractFileNameFromUrl(url: string): string {
    if (!url || typeof url !== 'string') return 'N/A';
    try {
      const parts = url.split('/');
      const fileName = parts[parts.length - 1];
      return fileName.replace(/^\d+_/, '').replace(/csv$/, '.csv').replace(/xlsx$/, '.xlsx');
    } catch {
      return 'N/A';
    }
  }
}
