import { NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDownload } from '@ng-icons/lucide';
import { Subscription } from 'rxjs';
import { TableHeader } from '../../core/models/common.model';
import { FileUploader } from '../../shared/components/file-uploader/file-uploader';
import { Table } from '../../shared/components/table/table';
import { MasterAwbUploadService } from '../../shared/services/master-awb-upload.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-master-awb-upload',
  standalone: true,
  imports: [FileUploader, Table, NgClass, NgIcon],
  providers: [provideIcons({ lucideDownload })],
  templateUrl: './master-awb-upload.html',
})
export class MasterAwbUpload implements OnInit, OnDestroy {
  private dataSubscription?: Subscription;
  private sampleSubscription?: Subscription;

  private readonly toast = inject(ToastService);
  private readonly masterAwbService = inject(MasterAwbUploadService);

  readonly headers = signal<TableHeader[]>([]);
  readonly tableData = signal<any[]>([]);
  readonly currentPage = signal(1);
  readonly pageSize = signal(15);
  readonly totalRecords = signal(0);
  readonly selectedFile = signal<File | null>(null);
  readonly resetTrigger = signal(0);
  readonly sampleFileUrl = signal<string | null>(null);

  ngOnInit(): void {
    this.setHeaders();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.dataSubscription?.unsubscribe();
    this.sampleSubscription?.unsubscribe();
  }

  private setHeaders(): void {
    this.headers.set([
      { name: 'File ID' },
      { name: 'Success Count' },
      { name: 'Failed Count' },
      { name: 'Error File' },
      { name: 'Uploaded By' },
      { name: 'Date' },
      { name: 'File Upload Status' },
    ]);
  }

  /** Called when user clicks "Download sample file"; fetches URL from API then opens it. */
  onDownloadSampleRequested(): void {
    const url = this.sampleFileUrl();
    if (url) {
      window.open(url, '_blank');
      return;
    }
    this.sampleSubscription?.unsubscribe();
    this.sampleSubscription = this.masterAwbService.getSampleFileUrl().subscribe({
      next: (downloadUrl) => {
        if (downloadUrl) {
          this.sampleFileUrl.set(downloadUrl);
          window.open(downloadUrl, '_blank');
        } else {
          this.toast.error('Sample file not available');
        }
      },
      error: () => this.toast.error('Failed to load sample file'),
    });
  }

  loadData(): void {
    this.dataSubscription?.unsubscribe();

    this.dataSubscription = this.masterAwbService
      .getUploadLogHistory(this.currentPage(), this.pageSize())
      .subscribe({
        next: (response) => {
          const raw = response?.data ?? [];
          this.tableData.set(this.transformTableData(raw));
          this.totalRecords.set(response?.meta?.pagination?.total ?? response?.meta?.counts ?? raw.length);
        },
        error: () => {
          this.tableData.set([]);
          this.totalRecords.set(0);
          this.toast.error('Failed to load upload history');
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

    this.masterAwbService.uploadMasterAwb(file).subscribe({
      next: (response) => {
        if (response?.status === 200) {
          this.toast.success(response?.message ?? 'File uploaded successfully');
          this.selectedFile.set(null);
          this.resetTrigger.update((v) => v + 1);
          this.loadData();
        } else {
          this.toast.error(response?.message ?? 'Failed to upload master AWB file');
        }
      },
      error: (error) => {
        this.toast.error(error?.error?.message ?? 'Failed to upload master AWB file');
      },
    });
  }

  onCancelClick(): void {
    this.selectedFile.set(null);
    this.resetTrigger.update((v) => v + 1);
  }

  downloadFile(url: string): void {
    if (!url) {
      this.toast.error('File URL not available');
      return;
    }
    window.open(url, '_blank');
  }

  private transformTableData(data: any[]): any[] {
    if (!Array.isArray(data)) return [];
    return data.map((item) => ({
      fileId: item.file_id ?? item.id ?? 'N/A',
      successCount: item.success_count ?? item.imported ?? 0,
      failedCount: item.failure_count ?? item.error_count ?? item.errors ?? 0,
      errorFileUrl: item.error_file ?? item.error_file_path ?? null,
      uploadedBy: item.uploaded_by ?? 'N/A',
      date: item.date ?? item.upload_date ?? item.created_at ?? 'N/A',
      status: item.status ?? 'PENDING',
    }));
  }
}
