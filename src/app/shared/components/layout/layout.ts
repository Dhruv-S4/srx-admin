import { Component, inject } from '@angular/core';
import { NgClass, AsyncPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { SidebarService } from '../../services/sidebar.service';
import { ThemeService } from '../../services/theme.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePanelLeft, lucideSun, lucideMoon } from '@ng-icons/lucide';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [NgClass, RouterOutlet, Sidebar, AsyncPipe, NgIcon],
  providers: [
    provideIcons({
      lucidePanelLeft,
      lucideSun,
      lucideMoon,
    }),
  ],
  templateUrl: './layout.html',
  styles: ``,
})
export class Layout {
  sidebarService = inject(SidebarService);
  themeService = inject(ThemeService);
  
  isExpanded$ = this.sidebarService.isExpanded$;
  isHovered$ = this.sidebarService.isHovered$;
  isMobileOpen$ = this.sidebarService.isMobileOpen$;
  theme$ = this.themeService.theme$;

  toggleSidebar() {
    this.sidebarService.toggleExpanded();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
