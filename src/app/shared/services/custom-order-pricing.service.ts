import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';

export interface QuoteListingParams {
  page?: number;
  per_page?: number;
  quote_id?: string;
  channel_order_id?: string;
  company_id?: string;
  awb_code?: string;
  source?: string;
  quote_status?: string;
  email_id?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CustomOrderPricingService {
  private readonly http = inject(HttpService);

  getQuoteListing(params: QuoteListingParams): Observable<any> {
    const query: Record<string, string> = {};
    if (params.page != null) query['page'] = String(params.page);
    if (params.per_page != null) query['per_page'] = String(params.per_page);
    if (params.quote_id) query['quote_id'] = params.quote_id;
    if (params.channel_order_id) query['channel_order_id'] = params.channel_order_id;
    if (params.company_id) query['company_id'] = params.company_id;
    if (params.awb_code) query['awb_code'] = params.awb_code;
    if (params.source) query['source'] = params.source;
    if (params.quote_status) query['quote_status'] = params.quote_status;
    if (params.email_id) query['email_id'] = params.email_id;
    return this.http.get('admin/shipments/cargox/b2b/cargo/quote/listing', query);
  }

  getKamList(): Observable<{ data: { kam_email: string; kam_name: string }[] }> {
    return this.http.get('admin/shipments/cargox/kam/lists') as Observable<{
      data: { kam_email: string; kam_name: string }[];
    }>;
  }

  downloadReport(): Observable<any> {
    return this.http.get('admin/shipments/cargox/b2b/report');
  }
}
