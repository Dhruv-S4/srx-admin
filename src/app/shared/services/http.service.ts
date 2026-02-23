import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SKIP_LOADER } from './http-request-interceptor.service';
@Injectable({
  providedIn: 'root',
})
export class HttpService {
  public apiBaseUrl = environment.apiPath;
  private auth_token = localStorage.getItem('satellizer_token') || '';
  constructor(public http: HttpClient) { }

  public _getURL(url: string): string {
    return `${environment.apiPath}${url}`;
  }

  getHeaders(): HttpHeaders {
    this.auth_token = localStorage.getItem('satellizer_token') || '';
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + this.auth_token,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
    return headers;
  }

  getQueryParam(obj: any): HttpParams {
    let search = new HttpParams();
    for (const key in obj) {
      search = search.set(key, obj[key]);
    }
    return search;
  }

  get(
    apiURL: string,
    params: unknown = {},
    responseType: any = 'json',
    skipLoader: boolean = false
  ): Observable<any> {
    const paramsData = this.getQueryParam(params);
    const context = new HttpContext().set(SKIP_LOADER, skipLoader);

    return this.http.get(this._getURL(apiURL), {
      params: paramsData,
      headers: this.getHeaders(),
      withCredentials: true,
      responseType: responseType,
      context: context,
    });
  }

  /**
   *
   * @param apiURL
   * @param data Body for post
   * @param params Request Params
   * @param skipLoader Whether to skip showing the loader
   */

  post(
    apiURL: string,
    body: any,
    params: unknown = {},
    skipLoader: boolean = false
  ): Observable<any> {
    const paramsData = this.getQueryParam(params);
    const context = new HttpContext().set(SKIP_LOADER, skipLoader);

    return this.http.post(this._getURL(apiURL), body, {
      params: paramsData,
      headers: this.getHeaders(),
      withCredentials: true,
      context: context,
    });
  }

  put(apiURL: string, body: any, params?: string, skipLoader: boolean = false): Observable<any> {
    const paramsData = this.getQueryParam(params);
    const context = new HttpContext().set(SKIP_LOADER, skipLoader);

    return this.http.put(this._getURL(apiURL), body, {
      params: paramsData,
      headers: this.getHeaders(),
      withCredentials: true,
      context: context,
    });
  }

  patch(apiURL: string, body: any, params?: string, skipLoader: boolean = false): Observable<any> {
    const paramsData = this.getQueryParam(params);
    const context = new HttpContext().set(SKIP_LOADER, skipLoader);

    return this.http.patch(this._getURL(apiURL), body, {
      params: paramsData,
      headers: this.getHeaders(),
      withCredentials: true,
      context: context,
    });
  }

  delete(apiURL: string, skipLoader: boolean = false): Observable<any> {
    const context = new HttpContext().set(SKIP_LOADER, skipLoader);

    return this.http.delete(this._getURL(apiURL), {
      headers: this.getHeaders(),
      withCredentials: true,
      context: context,
    });
  }

  /**
   * @description Simple post request,except headers are not passing content-type.
   * @param apiURL endpoint of the request
   * @param data Body for post
   * @param skipLoader Whether to skip showing the loader
   */
  formPost(apiURL: string, body: FormData, skipLoader: boolean = false): Observable<any> {
    const token = this.auth_token;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Cookiie: localStorage.getItem('cookiie') ?? '',
    });
    const context = new HttpContext().set(SKIP_LOADER, skipLoader);

    return this.http.post(this._getURL(apiURL), body, {
      headers,
      context: context,
    });
  }
}
