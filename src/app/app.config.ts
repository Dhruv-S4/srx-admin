import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { NgxUiLoaderConfig, NgxUiLoaderModule } from 'ngx-ui-loader';
import { routes } from './app.routes';
import { HttpRequestInterceptor } from './shared/services/http-request-interceptor.service';

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  blur: 10,
  delay: 0,
  fastFadeOut: true,
  fgsColor: 'var(--color-primary)',
  fgsPosition: 'center-center',
  fgsSize: 80,
  fgsType: 'three-strings',
  masterLoaderId: 'master',
  overlayColor: 'var(--color-loader-overlay)',
  hasProgressBar: false,
  maxTime: -1,
  minTime: 300,
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([HttpRequestInterceptor])),
    importProvidersFrom(NgxUiLoaderModule.forRoot(ngxUiLoaderConfig)),
  ]
};
