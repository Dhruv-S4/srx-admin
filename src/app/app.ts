import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { Toast } from './shared/components/toast/toast';
import { ToastService } from './shared/services/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, NgxUiLoaderModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('srx-admin');
  protected readonly toast = inject(ToastService);

  constructor() {
    this.toast.success('Hello, world!');
    setTimeout(() => {
    this.toast.success('Hello, world2!');
  }, 500);
  setTimeout(() => {
    this.toast.success('Hello, world3!');
  }, 1000);
  setTimeout(() => {
    this.toast.success('Hello, world4!');
  }, 1500);
  }
}
