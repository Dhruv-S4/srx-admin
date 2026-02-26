import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root',
})
export class MasterAwbUploadService {
  private readonly http = inject(HttpService);

  /** Get sample file download URL for master AWB (admin/download/sample/sheet?tab=master_awb) */
  getSampleFileUrl(): Observable<string> {
    return this.http
      .get('admin/download/sample/sheet', { tab: 'master_awb' })
      .pipe(map((res: any) => res?.s3_link ?? ''));
  }

  /** Upload master AWB file (admin/upload/master_awb) */
  uploadMasterAwb(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.formPost('admin/upload/master_awb', formData);
  }

  /** Get upload log history (admin/show/file_log_history?tab=master_awb&page=&per_page=) */
  getUploadLogHistory(page: number = 1, perPage: number = 15): Observable<any> {
    const params = {
      tab: 'master_awb',
      page: page.toString(),
      per_page: perPage.toString(),
    };
    return this.http.get('admin/show/file_log_history', params);
  }
}
