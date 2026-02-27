import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDownload, lucideFilePlus, lucidePencil, lucideSearch } from '@ng-icons/lucide';
import { Subscription } from 'rxjs';
import type { TableHeader } from '../../core/models/common.model';
import { Select } from '../../shared/components/select/select';
import { Table } from '../../shared/components/table/table';
import type { QuoteListingParams } from '../../shared/services/custom-order-pricing.service';
import { CustomOrderPricingService } from '../../shared/services/custom-order-pricing.service';
import { ToastService } from '../../shared/services/toast.service';

const QUOTE_STATUS_LIST: Record<number, string> = {
  1: 'New',
  2: 'Actioned',
  3: 'Submitted',
  4: 'Complete',
  5: 'Expired',
  6: 'Charges Added',
  7: 'Ready for Invoice',
  8: 'Closed',
  9: 'Order Created',
};

const SHIPMENT_PURPOSE_LIST: Record<number, string> = {
  0: 'Gift(CSB4)',
  1: 'Sample(CSB4)',
  2: 'Commercial(CSB5)',
  3: 'Cargo',
};

const DOC_STATUS_MAPPING: Record<number, string> = {
  1: 'PENDING',
  2: 'IN PROGRESS',
  3: 'APPROVED',
  4: 'REJECTED',
};

const SOURCE_LIST: Record<number, string> = {
  1: 'Order',
  2: 'KAM',
  3: 'WEBSITE',
  4: 'SELLER',
  5: 'Whatsapp',
  6: 'Voice',
  7: 'Whatsapp External',
};

@Component({
  selector: 'app-custom-order-pricing',
  standalone: true,
  imports: [FormsModule, Table, Select, NgIcon],
  providers: [provideIcons({ lucideDownload, lucideFilePlus, lucidePencil, lucideSearch })],
  templateUrl: './custom-order-pricing.html',
})
export class CustomOrderPricing implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly customOrderPricingService = inject(CustomOrderPricingService);
  private readonly toast = inject(ToastService);
  private dataSubscription?: Subscription;
  private kamSubscription?: Subscription;

  readonly searchByQuoteId = signal('');
  readonly searchByOrderId = signal('');
  readonly searchByCompanyId = signal('');
  readonly searchByAwb = signal('');
  readonly source = signal<string>('');
  readonly quoteStatus = signal<string>('');
  readonly selectedKam = signal<string>('');

  readonly headers = signal<TableHeader[]>([
    { name: 'Quote ID' },
    { name: 'Company Id' },
    { name: 'Mode' },
    { name: 'Order ID' },
    { name: 'Created On' },
    { name: 'Status' },
    { name: 'Shipment purpose' },
    { name: 'Source' },
    { name: 'Action' },
  ]);

  readonly tableData = signal<any[]>([]);
  readonly currentPage = signal(1);
  readonly pageSize = signal(15);
  readonly totalRecords = signal(0);
  readonly loading = signal(false);

  readonly kamList = signal<{ kam_email: string; kam_name: string }[]>([]);

  readonly sourceOptions = computed(() => [
    { label: 'Source', value: '' },
    ...Object.entries(SOURCE_LIST).map(([key, value]) => ({ label: value, value: key })),
  ]);

  readonly quoteStatusOptions = computed(() => [
    { label: 'Quote Status', value: '' },
    ...Object.entries(QUOTE_STATUS_LIST).map(([key, value]) => ({ label: value, value: key })),
  ]);

  readonly kamOptions = computed(() => {
    const kams = this.kamList();
    return [{ label: 'KAM', value: '' }, ...kams.map((k) => ({ label: k.kam_name, value: k.kam_email }))];
  });

  readonly quoteStatusList = QUOTE_STATUS_LIST;
  readonly shipmentPurposeList = SHIPMENT_PURPOSE_LIST;
  readonly docStatusMapping = DOC_STATUS_MAPPING;
  readonly sourceList = SOURCE_LIST;

  ngOnInit(): void {
    this.syncFromQueryParams();
    this.fetchKamList();
    this.loadData();
    this.route.queryParams.subscribe(() => this.syncFromQueryParams());
  }

  ngOnDestroy(): void {
    this.dataSubscription?.unsubscribe();
    this.kamSubscription?.unsubscribe();
  }

  private syncFromQueryParams(): void {
    const q = this.route.snapshot.queryParams;
    if (q['quote_id'] != null) this.searchByQuoteId.set(q['quote_id'] ?? '');
    if (q['channel_order_id'] != null) this.searchByOrderId.set(q['channel_order_id'] ?? '');
    if (q['company_id'] != null) this.searchByCompanyId.set(q['company_id'] ?? '');
    if (q['awb_code'] != null) this.searchByAwb.set(q['awb_code'] ?? '');
    if (q['source'] != null) this.source.set(q['source'] ?? '');
    if (q['quote_status'] != null) this.quoteStatus.set(q['quote_status'] ?? '');
    if (q['email_id'] != null) this.selectedKam.set(q['email_id'] ?? '');
    if (q['page'] != null) this.currentPage.set(Number(q['page']) || 1);
    if (q['per_page'] != null) this.pageSize.set(Number(q['per_page']) || 15);
  }

  private updateUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.currentPage(),
        per_page: this.pageSize(),
        quote_id: this.searchByQuoteId() || null,
        channel_order_id: this.searchByOrderId() || null,
        company_id: this.searchByCompanyId() || null,
        awb_code: this.searchByAwb() || null,
        source: this.source() || null,
        quote_status: this.quoteStatus() || null,
        email_id: this.selectedKam() || null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  fetchKamList(): void {
    this.kamSubscription?.unsubscribe();
    this.kamSubscription = this.customOrderPricingService.getKamList().subscribe({
      next: (res) => this.kamList.set(res?.data ?? []),
      error: () => this.kamList.set([]),
    });
  }

  loadData(): void {
    this.dataSubscription?.unsubscribe();
    this.loading.set(true);

    const params: QuoteListingParams = {
      page: this.currentPage(),
      per_page: this.pageSize(),
      quote_id: this.searchByQuoteId().trim() || undefined,
      channel_order_id: this.searchByOrderId().trim() || undefined,
      company_id: this.searchByCompanyId().trim() || undefined,
      awb_code: this.searchByAwb().trim() || undefined,
      source: this.source() || undefined,
      quote_status: this.quoteStatus() || undefined,
      email_id: this.selectedKam() || undefined,
    };

    this.dataSubscription = this.customOrderPricingService.getQuoteListing(params).subscribe({
      next: (res) => {
        this.loading.set(false);
        const raw = res?.data ?? [];
        this.tableData.set(this.transformTableData(Array.isArray(raw) ? raw : []));
        const meta = res?.meta?.pagination ?? res?.meta;
        this.totalRecords.set(meta?.total ?? (Array.isArray(raw) ? raw.length : 0));
      },
      error: () => {
        this.loading.set(false);
        this.tableData.set([]);
        this.totalRecords.set(0);
        this.toast.error('Failed to load quote listing');
      },
    });
  }

  searchBy(event?: KeyboardEvent): void {
    if (event && event.key !== 'Enter') return;
    this.currentPage.set(1);
    this.updateUrl();
    this.loadData();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.updateUrl();
    this.loadData();
  }

  onPageChange(event: { page: number; rows: number }): void {
    if (!event) return;
    this.currentPage.set(event.page);
    this.pageSize.set(event.rows);
    this.updateUrl();
    this.loadData();
  }

  goToEditQuote(order: any): void {
    this.searchByQuoteId.set(order.quoteId ?? '');
    this.searchByOrderId.set(order.channelOrderId ?? '');
    this.searchByCompanyId.set(order.companyId ?? '');
    this.source.set(String(order.source ?? ''));
    this.router.navigate(['/custom-order-pricing'], {
      queryParams: {
        channel_order_id: order.channelOrderId ?? undefined,
        company_id: order.companyId ?? undefined,
        source: order.source != null ? String(order.source) : undefined,
        quote_id: order.quoteId ?? undefined,
        page: 1,
        per_page: this.pageSize(),
      },
      queryParamsHandling: '',
    });
    this.currentPage.set(1);
    this.loadData();
  }

  goToCreateQuote(): void {
    this.router.navigate(['/create-quote']);
  }

  downloadReport(): void {
    this.loading.set(true);
    this.customOrderPricingService.downloadReport().subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('The report will be sent to your email shortly');
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Failed to request report');
      },
    });
  }

  getQuoteStatusLabel(status: number): string {
    return QUOTE_STATUS_LIST[status] ?? 'N/A';
  }

  getDocStatusLabel(status: number): string {
    return DOC_STATUS_MAPPING[status] ?? 'N/A';
  }

  getShipmentPurposeLabel(purpose: number): string {
    return SHIPMENT_PURPOSE_LIST[purpose] ?? '';
  }

  getSourceLabel(source: number): string {
    return SOURCE_LIST[source] ?? 'Order';
  }

  private transformTableData(data: any[]): any[] {
    return data.map((item) => ({
      quoteId: item.quote_id,
      companyId: item.company_id,
      transportMode: item.transport_mode ?? 'N/A',
      channelOrderId: item.channel_order_id,
      quoteCreatedAt: item.quote_created_at ?? 'N/A',
      quoteStatus: item.quote_status,
      documentStatus: item.document_status,
      purposeOfShipment: item.purpose_of_shipment,
      adminRemark: item.admin_remark,
      source: item.source,
    }));
  }
}
