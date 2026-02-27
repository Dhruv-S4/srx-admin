import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';

export interface AwbSearchResponse {
  data: {
    company_id: string;
    company_name: string;
    order_id: string;
    quote_id: string;
    applied_weight: number;
    applied_weight_amount: number;
    charged_weight: string | number;
    charge_weight_amount: number | null;
    is_charge_deducted: boolean;
    bill_processed_count?: number;
    post_delivery_additional_charges?: { type: string; value: number; gst?: number }[];
    pre_delivery_additional_charge?: { type: string; value: number; gst?: number }[];
  };
}

export interface PostDeliveryCharge {
  type: string;
  value: number;
}

export interface SaveBillingPayload {
  quote_id: string;
  company_id: string;
  order_id: string;
  post_delivery_additional_charge: PostDeliveryCharge[];
  awb: string;
  post_assignment_charges: boolean;
  charge_weight: string | number;
}

@Injectable({
  providedIn: 'root',
})
export class AdditionalB2bBillingService {
  private readonly http = inject(HttpService);

  searchByAwb(awbCode: string): Observable<AwbSearchResponse> {
    return this.http.get('admin/shipments/cargox/awb/search', {
      awb_code: awbCode,
    }) as Observable<AwbSearchResponse>;
  }

  saveBillingDetails(payload: SaveBillingPayload): Observable<any> {
    return this.http.post('admin/shipments/cargox/b2b/save/all/details', payload);
  }
}
