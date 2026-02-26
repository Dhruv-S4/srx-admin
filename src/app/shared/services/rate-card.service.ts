import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root',
})
export class RateCardService {
  private readonly http = inject(HttpService);

  getRateCardUploadHistory(
    page: number = 1,
    perPage: number = 15,
    rateCardType: string
  ): Observable<any> {
    const params = {
      is_web: '1',
      page: page.toString(),
      per_page: perPage.toString(),
      tab: rateCardType,
    };
    return this.http.get('admin/show/file_log_history', params);
  }

  uploadLMVolumeFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tab', 'lastmile_volume_uploader');
    return this.http.formPost('courier/upload/srx', formData);
  }

  uploadSellerRateCard(file: File, rateCardType: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('rate_card_type', rateCardType);
    return this.http.formPost('courier/upload/seller-rate-card', formData);
  }
}

