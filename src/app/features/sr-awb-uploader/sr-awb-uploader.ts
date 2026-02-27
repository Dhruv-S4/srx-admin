import { NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDownload } from '@ng-icons/lucide';
import { Subscription } from 'rxjs';
import { SR_FILES_BASE_URL, type TableHeader } from '../../core/models/common.model';
import { FileUploader } from '../../shared/components/file-uploader/file-uploader';
import { Table } from '../../shared/components/table/table';
import { SrAwbUploaderService } from '../../shared/services/sr-awb-uploader.service';
import { ToastService } from '../../shared/services/toast.service';

const SAMPLE_FILE_URL = SR_FILES_BASE_URL + 'csv/Bulk_Upload_Format_Updated.csv';

@Component({
  selector: 'app-sr-awb-uploader',
  standalone: true,
  imports: [FileUploader, Table, NgClass, NgIcon],
  providers: [provideIcons({ lucideDownload })],
  templateUrl: './sr-awb-uploader.html',
})
export class SrAwbUploader implements OnInit, OnDestroy {
  private dataSubscription?: Subscription;

  private readonly toast = inject(ToastService);
  private readonly srAwbUploaderService = inject(SrAwbUploaderService);

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

    this.dataSubscription = this.srAwbUploaderService
      .getUploadHistory(this.currentPage(), this.pageSize())
      .subscribe({
        next: (response) => {
          const raw = response?.data ?? [];
          const data = Array.isArray(raw) ? raw : [];
          this.tableData.set(this.transformTableData(data));
          this.totalRecords.set(response?.meta?.total ?? response?.meta?.counts ?? data.length);
        },
        error: () => {
          this.tableData.set([]);
          this.totalRecords.set(0);
          this.toast.error('Unable to get upload history');
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
      this.toast.error('Please select a file first');
      return;
    }

    this.srAwbUploaderService.uploadBulkBilling(file).subscribe({
      next: (response) => {
        const msg = response?.data?.message ?? response?.message;
        if (msg) {
          this.toast.success(msg);
        } else {
          this.toast.success('File uploaded successfully');
        }
        this.selectedFile.set(null);
        this.resetTrigger.update((v) => v + 1);
        this.loadData();
      },
      error: (error) => {
        this.toast.error(error?.error?.message ?? error?.error?.data?.message ?? 'Upload failed');
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
    return SAMPLE_FILE_URL;
  }

  private transformTableData(data: any[]): any[] {
    if (!Array.isArray(data)) return [];
    return data.map((item) => ({
      fileId: item.file_id ?? item.id ?? 'N/A',
      errorFileUrl: item.error_file ?? item.error_file_path ?? null,
      successCount: item.success_count ?? 0,
      failedCount: item.failed_count ?? item.error_count ?? 0,
      uploadedBy: item.uploaded_by ?? 'N/A',
      date: item.upload_date ?? item.date ?? 'N/A',
      status: item.status ?? 'PENDING',
    }));
  }
}
