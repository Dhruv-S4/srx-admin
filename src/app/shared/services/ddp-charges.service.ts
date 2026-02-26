import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root',
})
export class DdpChargesService {
  private readonly http = inject(HttpService);

  getDdpChargesUploadHistory(page: number = 1, perPage: number = 15): Observable<any> {
    const params = {
      is_web: '1',
      page: page.toString(),
      per_page: perPage.toString(),
      tab: 'ddp_charges',
    };
    return this.http.get('admin/show/file_log_history', params);
  }

  uploadDdpCharges(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.formPost('admin/shipments/upload-duty-and-tax', formData);
  }
}
