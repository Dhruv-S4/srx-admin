import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideReceipt, lucideSearch, lucideTrash2, lucideUpload } from '@ng-icons/lucide';
import type {
  AwbSearchResponse,
  PostDeliveryCharge,
  SaveBillingPayload,
} from '../../shared/services/additional-b2b-billing.service';
import { AdditionalB2bBillingService } from '../../shared/services/additional-b2b-billing.service';
import { ToastService } from '../../shared/services/toast.service';
import { Select } from '../../shared/components/select/select';

export interface AdditionalChargeOption {
  name: string;
  type: string;
  enabled: boolean;
  gstrue: boolean;
}

export interface AdditionalChargeRow {
  name: string;
  value: number;
  gst?: number;
}

const ADDITIONAL_CHARGE_LIST: AdditionalChargeOption[] = [
  { name: 'Cargo Handling Charges', type: 'Cargo_Handling_Charges', enabled: true, gstrue: false },
  { name: 'Weight Discrepancy', type: 'Weight_Discrepancy', enabled: true, gstrue: true },
  { name: 'Domestic Palletization Charges', type: 'Domestic_Palletization_Charges', enabled: true, gstrue: true },
  { name: 'Dangerous Goods Handling (DG) Charges', type: 'Dangerous_Goods_Handling_DG_Charges', enabled: true, gstrue: false },
  { name: 'Other Charges', type: 'Other_Charges', enabled: true, gstrue: true },
  { name: 'NOC Charges', type: 'NOC_Charges', enabled: true, gstrue: false },
  { name: 'Custom Duty and Taxes', type: 'Custom_Duty_and_Taxes', enabled: true, gstrue: false },
  { name: 'Transportation', type: 'Transportation', enabled: true, gstrue: false },
  { name: 'DDP Charges', type: 'DDP_Charges', enabled: true, gstrue: false },
  { name: 'Commercial/CSB Charges', type: 'Commercial_CSB_Charges', enabled: true, gstrue: false },
  { name: 'AWB Charges', type: 'AWB_Charges', enabled: true, gstrue: false },
  { name: 'Cab Delivery', type: 'Cab_Delivery', enabled: true, gstrue: false },
  { name: 'Peak Surcharge', type: 'Peak_Surcharge', enabled: true, gstrue: false },
  { name: 'Commodity Charges 70-100/KG', type: 'Commodity_Charges_70-100_KG', enabled: true, gstrue: false },
  { name: 'Terminal Charges', type: 'Terminal_Charges', enabled: true, gstrue: false },
  { name: 'VAT Charges', type: 'VAT_Charges', enabled: true, gstrue: false },
  { name: 'Deferment Charges', type: 'Deferment_Charges', enabled: true, gstrue: false },
  { name: 'IOSS Charges/EORI Charges', type: 'IOSS_Charges_EORI_Charges', enabled: true, gstrue: false },
  { name: 'Misc Charges', type: 'Misc_Charges', enabled: true, gstrue: false },
];

@Component({
  selector: 'app-additional-b2b-billing',
  standalone: true,
  imports: [FormsModule, NgIcon, Select],
  providers: [provideIcons({ lucideReceipt, lucideSearch, lucideTrash2, lucideUpload })],
  templateUrl: './additional-b2b-billing.html',
})
export class AdditionalB2bBilling {
  private readonly router = inject(Router);
  private readonly billingService = inject(AdditionalB2bBillingService);
  private readonly toast = inject(ToastService);

  readonly searchByAwbNo = signal('');
  readonly companyId = signal('');
  readonly companyName = signal('');
  readonly orderId = signal('');
  readonly appliedWeight = signal<number | null>(null);
  readonly appliedWeightAmount = signal<number | null>(null);
  readonly chargedWeight = signal<string | number>('');
  readonly chargeWeightAmount = signal<number | null>(null);
  readonly isChargeDeducted = signal(false);
  readonly disableSubmit = signal(false);
  readonly checked = signal(false);
  readonly loading = signal(false);
  readonly quoteId = signal('');

  readonly postAdditionalChargeArray = signal<AdditionalChargeRow[]>([]);
  readonly additionalChargeList = ADDITIONAL_CHARGE_LIST;

  readonly chargeSelectOptions = ADDITIONAL_CHARGE_LIST.map((c) => ({
    label: c.name,
    value: c.type,
  }));

  searchBy(event?: KeyboardEvent): void {
    if (event && event.key !== 'Enter') return;
    this.getAwbDetails();
  }

  getAwbDetails(): void {
    const awb = this.searchByAwbNo().trim();
    if (!awb) {
      this.toast.error('Please enter an AWB number');
      return;
    }
    this.loading.set(true);
    this.billingService.searchByAwb(awb).subscribe({
      next: (res: AwbSearchResponse) => {
        this.loading.set(false);
        const d = res?.data;
        if (!d) {
          this.resetForm();
          return;
        }
        this.companyId.set(d.company_id ?? '');
        this.companyName.set(d.company_name ?? '');
        this.orderId.set(d.order_id ?? '');
        this.quoteId.set(d.quote_id ?? '');
        this.appliedWeight.set(d.applied_weight ?? null);
        this.appliedWeightAmount.set(d.applied_weight_amount ?? null);
        this.chargedWeight.set(d.charged_weight ?? '');
        this.isChargeDeducted.set(!!d.is_charge_deducted);
        if (d.charge_weight_amount != null) {
          this.chargeWeightAmount.set(Number(d.charge_weight_amount));
        } else {
          this.chargeWeightAmount.set(Number(d.applied_weight_amount) ?? null);
        }
        if (d.post_delivery_additional_charges?.length) {
          this.postAdditionalChargeArray.set(
            d.post_delivery_additional_charges.map((c) => ({
              name: c.type,
              value: c.value,
              gst: c.gst,
            }))
          );
          this.disableSubmit.set(true);
        } else {
          this.postAdditionalChargeArray.set([]);
          this.disableSubmit.set(false);
        }
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Unable to get AWB details');
        this.resetForm();
      },
    });
  }

  addAdditionalChargesRow(): void {
    if (this.disableSubmit() || !this.isChargeDeducted()) return;
    this.postAdditionalChargeArray.update((arr) => [...arr, { name: '', value: 0 }]);
  }

  removeAdditionalChargesRow(index: number): void {
    if (this.disableSubmit()) return;
    this.postAdditionalChargeArray.update((arr) => arr.filter((_, i) => i !== index));
  }

  alreadyAddedCharge(selectedType: string, index: number): void {
    const arr = this.postAdditionalChargeArray();
    const others = arr.filter((row, i) => i !== index && row.name === selectedType);
    if (others.length > 0) {
      this.postAdditionalChargeArray.update((a) => {
        const next = [...a];
        next[index] = { ...next[index], name: '' };
        return next;
      });
      this.toast.error('This charge is already added');
    }
  }

  onChargeTypeChange(value: string, index: number): void {
    this.postAdditionalChargeArray.update((arr) => {
      const next = [...arr];
      next[index] = { ...next[index], name: value };
      return next;
    });
    this.alreadyAddedCharge(value, index);
  }

  updateChargeValue(index: number, value: number | string): void {
    const num = typeof value === 'string' ? parseFloat(value) || 0 : value;
    this.postAdditionalChargeArray.update((arr) => {
      const next = [...arr];
      next[index] = { ...next[index], value: num };
      return next;
    });
  }

  calculateTotalAdditionChargeForVCN(): number | null {
    let total = 0;
    for (const charge of this.postAdditionalChargeArray()) {
      total += Number(charge.value) || 0;
    }
    const base = this.chargeWeightAmount() ?? 0;
    total += base;
    return Number.isNaN(total) ? null : Number(total.toFixed(2));
  }

  submitHeavyBulkyBillingForm(): void {
    if (!this.isChargeDeducted()) {
      this.toast.error(
        'Freight invoice (First invoice) not yet generated. Please try after generating the freight invoice.'
      );
      return;
    }
    const cw = this.chargedWeight();
    if (cw === '' || cw === null || Number(cw) <= 0) {
      this.toast.error('Please enter valid charge weight');
      return;
    }
    const postCharges: PostDeliveryCharge[] = this.postAdditionalChargeArray().map((c) => ({
      type: c.name,
      value: Number(c.value),
    }));
    const invalid = postCharges.some((c) => !c.type || Number.isNaN(c.value));
    if (invalid) {
      this.toast.error('Either the charge type is not selected or the charge value is not entered correctly');
      return;
    }
    if (!this.checked()) {
      this.toast.error('Please select the checkbox to proceed');
      return;
    }

    const payload: SaveBillingPayload = {
      quote_id: this.quoteId(),
      company_id: this.companyId(),
      order_id: this.orderId(),
      post_delivery_additional_charge: postCharges,
      awb: this.searchByAwbNo().trim(),
      post_assignment_charges: true,
      charge_weight: this.chargedWeight(),
    };

    this.loading.set(true);
    this.billingService.saveBillingDetails(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Saved successfully');
        this.resetForm();
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Failed to save billing details');
      },
    });
  }

  goToAwbUploader(): void {
    this.router.navigate(['/sr-awb-uploader']);
  }

  resetForm(): void {
    this.searchByAwbNo.set('');
    this.companyId.set('');
    this.companyName.set('');
    this.orderId.set('');
    this.quoteId.set('');
    this.appliedWeight.set(null);
    this.appliedWeightAmount.set(null);
    this.chargedWeight.set('');
    this.chargeWeightAmount.set(null);
    this.checked.set(false);
    this.postAdditionalChargeArray.set([]);
  }
}
