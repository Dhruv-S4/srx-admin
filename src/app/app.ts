import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { Toast } from './shared/components/toast/toast';
import { ToastService } from './shared/services/toast.service';
import { SidebarService } from './shared/services/sidebar.service';
import { ThemeService } from './shared/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, NgxUiLoaderModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('srx-admin');
  protected readonly toast = inject(ToastService);
  protected readonly sidebarService = inject(SidebarService);
  protected readonly themeService = inject(ThemeService);

  constructor() {
    this.sidebarService.setMobileView(window.innerWidth < 768);
    this.themeService.setTheme(localStorage.getItem('theme') as 'light' | 'dark');
  }
}
