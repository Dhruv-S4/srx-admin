import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { NgxUiLoaderConfig, NgxUiLoaderModule } from 'ngx-ui-loader';
import { routes } from './app.routes';
import { HttpRequestInterceptor } from './shared/services/http-request-interceptor.service';

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  blur: 5,
  delay: 0,
  fastFadeOut: true,
  fgsColor:
    localStorage.getItem('theme') === 'dark' ? 'var(--color-brand-500)' : 'var(--color-brand-600)',
  fgsPosition: 'center-center',
  fgsSize: 80,
  fgsType: 'ball-spin-clockwise-fade-rotating',
  masterLoaderId: 'master',
  overlayColor: 'rgba(0, 0, 0, 0.5)',
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
