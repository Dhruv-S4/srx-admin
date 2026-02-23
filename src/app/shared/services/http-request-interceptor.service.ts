import {
    HttpContextToken,
    HttpErrorResponse,
    HttpInterceptorFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import * as CryptoES from 'crypto-es';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Observable, catchError, finalize, retry, throwError } from 'rxjs';

// Create a context token for controlling loader
export const SKIP_LOADER = new HttpContextToken<boolean>(() => false);

export const HttpRequestInterceptor: HttpInterceptorFn = (req, next) => {
  const loader = inject(NgxUiLoaderService);

  // Check if loader should be skipped based on context
  const skipLoader = req.context.get(SKIP_LOADER);

  if (!localStorage.getItem('sys_uuid')) {
    const uuid = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };
    document.cookie = 'sys_uuid' + '=' + uuid();
    localStorage.setItem('sys_uuid', uuid());
  }
  const setCookies = () => {
    let currentDate = Date.now();

    const timeStamp = Math.floor(currentDate / 1000);
    // const cus_device = document.cookie.split('; ').find(row => row.startsWith('sys_uuid='))?.split('=')[1];
    const cus_device = localStorage.getItem('sys_uuid');
    const ufp = `${cus_device}||${timeStamp}`;
    const encryptionKey = '6fa979f20126cb08aa645a8f495f6d85';
    const encryptionIV = 'I8zyA4lVhMCaJ5Kg';
    // Convert the payload to a string
    const payloadString = JSON.stringify(ufp);

    // Encrypt the payload using AES encryption
    const encryptedPayload = CryptoES.AES.encrypt(
      payloadString,
      CryptoES.Utf8.parse(encryptionKey),
      {
        iv: CryptoES.Utf8.parse(encryptionIV),
        mode: CryptoES.CBC,
        padding: CryptoES.Pkcs7,
      }
    ).toString();

    // Encode the encrypted payload in Base64
    // const base64EncodedPayload = btoa(encryptedPayload);
    // let domain = getMainDomain();
    localStorage.setItem('cookiie', '_ufp=' + btoa(encryptedPayload) + '; ' + document.cookie);
  };

  const handleError = (error: HttpErrorResponse): Observable<any> => {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 401) {
        window.parent.postMessage({ source: 'icrmIframe', value: 'logout' }, '*');
        errorMessage = `Error: ${error.error.message}`;
        localStorage.removeItem('satellizer_token');
        localStorage.removeItem('ngStorage-USER');
        const router = inject(Router);
        router.navigate(['/logout']);
        return throwError(() => errorMessage);
      }
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => errorMessage);
  };

  // Only start loader if not skipped
  if (!skipLoader) {
    loader.start();
  }

  setCookies();
  let authReq = req.clone({
    headers: req.headers.set(
      'Cookiie',
      JSON.parse(JSON.stringify(localStorage.getItem('cookiie')))
    ),
  });

  return next(authReq).pipe(
    finalize(() => {
      retry(0);
      // Only stop loader if it was started
      if (!skipLoader) {
        loader.stop();
      }
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        if (!skipLoader) {
          loader.stop();
        }
        return handleError(error);
      } else {
        if (!skipLoader) {
          loader.stop();
        }
        let err: any = error;
        const errorObj = err?.errors || err?.error?.errors;
        if (errorObj) {
          for (const [key, value] of Object.entries(errorObj)) {
            const lcl: any = value;
            err = {
              error: {
                message: lcl[0],
              },
            };
          }
        } else if (err?.error?.message) {
          err = {
            error: {
              message: err.error.message,
            },
          };
        } else {
          err = {
            error: {
              message: err.message,
            },
          };
        }

        if (err.error.message.toLowerCase().startsWith('http')) {
          err = {
            error: {
              message:
                'Unable to complete your request at the moment. Please try again in some time.',
            },
          };
        }

        return throwError(() => err);
      }
    })
  );
};
