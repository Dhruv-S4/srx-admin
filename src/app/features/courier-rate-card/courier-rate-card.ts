import { NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDownload } from '@ng-icons/lucide';
import { Subscription } from 'rxjs';
import { SR_FILES_BASE_URL, TabOption, TableHeader } from '../../core/models/common.model';
import { FileUploader } from '../../shared/components/file-uploader/file-uploader';
import { Table } from '../../shared/components/table/table';
import { Tabs } from '../../shared/components/tabs/tabs';
import { RateCardService } from '../../shared/services/rate-card.service';
import { ToastService } from '../../shared/services/toast.service';

type MileType = 'First Mile' | 'Middle Mile' | 'Last Mile' | 'LM Volume';

@Component({
  selector: 'app-courier-rate-card',
  standalone: true,
  imports: [Tabs, FileUploader, Table, NgClass, NgIcon],
  providers: [provideIcons({ lucideDownload })],
  templateUrl: './courier-rate-card.html',
})
export class CourierRateCard implements OnInit, OnDestroy {
  private dataSubscription?: Subscription;

  private readonly toast = inject(ToastService);
  private readonly rateCardService = inject(RateCardService);

  readonly tabs = signal<TabOption[]>([
    { id: 1, name: 'First Mile', active: true },
    { id: 2, name: 'Middle Mile', active: false },
    { id: 3, name: 'Last Mile', active: false },
    { id: 4, name: 'LM Volume', active: false },
  ]);

  readonly activeTabId = signal<1 | 2 | 3 | 4>(1);
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

    const mileType = this.getCurrentMileType();
    const rateCardType =
      mileType === 'LM Volume' ? 'lastmile_volume_uploader' : mileType.toLowerCase().replace(' ', '_');

    this.dataSubscription = this.rateCardService
      .getRateCardUploadHistory(this.currentPage(), this.pageSize(), rateCardType)
      .subscribe({
        next: (response) => {
          const raw = response?.data || [];
          this.tableData.set(this.transformTableData(raw));
          this.totalRecords.set(response?.meta?.counts || 0);
        },
        error: () => {
          this.tableData.set([]);
          this.totalRecords.set(0);
          this.toast.error('Failed to load rate card history');
        },
      });
  }

  onPageChange(event: { page: number; rows: number }): void {
    if (!event) return;
    this.currentPage.set(event.page);
    this.pageSize.set(event.rows);
    this.loadData();
  }

  onTabSelected(tab: TabOption): void {
    if (!tab || this.activeTabId() === (tab.id as any)) return;

    this.activeTabId.set(tab.id as 1 | 2 | 3 | 4);
    this.tabs.update((currentTabs) => currentTabs.map((t) => ({ ...t, active: t.id === tab.id })));
    this.onCancelClick();
    this.currentPage.set(1);
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

    const mileType = this.getCurrentMileType();

    if (mileType === 'LM Volume') {
      this.rateCardService.uploadLMVolumeFile(file).subscribe({
        next: (response) => {
          if (response?.status === 200) {
            this.toast.success(response?.message || 'File uploaded successfully');
            this.selectedFile.set(null);
            this.resetTrigger.update((v) => v + 1);
            this.loadData();
          } else {
            this.toast.error(response?.message || 'Failed to upload LM Volume rate card');
          }
        },
        error: (error) => {
          this.toast.error(error?.error?.message || 'Failed to upload LM Volume rate card');
        },
      });
    } else {
      const rateCardType = mileType.toLowerCase().replace(' ', '_');
      this.rateCardService.uploadSellerRateCard(file, rateCardType).subscribe({
        next: (response) => {
          if (response?.status === 200) {
            this.toast.success(response?.message || 'File uploaded successfully');
            this.selectedFile.set(null);
            this.resetTrigger.update((v) => v + 1);
            this.loadData();
          } else {
            this.toast.error(response?.message || `Failed to upload ${mileType} rate card`);
          }
        },
        error: (error) => {
          this.toast.error(error?.error?.message || `Failed to upload ${mileType} rate card`);
        },
      });
    }
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

  getDownloadUrl(mileType: MileType): string {
    const sampleFiles: Record<MileType, string> = {
      'First Mile': SR_FILES_BASE_URL + 'csv/FirstMileRates.csv',
      'Middle Mile': SR_FILES_BASE_URL + 'csv/MidMileRates.csv',
      'Last Mile': SR_FILES_BASE_URL + 'csv/LastMileRates.csv',
      'LM Volume': SR_FILES_BASE_URL + 'csv/lastmile_volume_sample.csv',
    };
    return sampleFiles[mileType] || sampleFiles['First Mile'];
  }

  getCurrentMileType(): MileType {
    const tab = this.tabs().find((t) => t.id === this.activeTabId());
    return (tab?.name as MileType) || 'First Mile';
  }

  private transformTableData(data: any[]): any[] {
    if (!Array.isArray(data)) return [];
    return data.map((item) => ({
      fileId: item.file_id || 'N/A',
      uploadedFile: this.extractFileNameFromUrl(item.file_path) || 'N/A',
      uploadedFileUrl: item.file_path || null,
      errorFileUrl: item.error_file_path || null,
      successCount: item.success_count || 0,
      failedCount: item.error_count || 0,
      uploadedBy: item.uploaded_by || 'N/A',
      date: item.upload_date || 'N/A',
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
