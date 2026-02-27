import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root',
})
export class SrAwbUploaderService {
  private readonly http = inject(HttpService);

  getUploadHistory(page: number = 1, perPage: number = 15): Observable<any> {
    return this.http.get('admin/log/history', {
      type: '149',
      page: page.toString(),
      per_page: perPage.toString(),
    });
  }

  uploadBulkBilling(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.formPost('admin/upload/bulk/billing', formData);
  }
}
