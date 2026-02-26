import {
  Component,
  inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { NgClass, AsyncPipe } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { SidebarService } from '../../services/sidebar.service';
import { ThemeService } from '../../services/theme.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePanelLeft, lucideSun, lucideMoon, lucideSearch } from '@ng-icons/lucide';
import { NavItem } from '../../../core/models/sidebar.model';

type SearchMenuItem = { name: string; path: string | undefined };

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [NgClass, RouterOutlet, Sidebar, AsyncPipe, NgIcon],
  providers: [
    provideIcons({
      lucidePanelLeft,
      lucideSun,
      lucideMoon,
      lucideSearch,
    }),
  ],
  templateUrl: './layout.html',
  styles: ``,
})
export class Layout implements AfterViewInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('searchContainer') searchContainer!: ElementRef<HTMLElement>;

  private readonly router = inject(Router);

  sidebarService = inject(SidebarService);
  themeService = inject(ThemeService);

  isExpanded$ = this.sidebarService.isExpanded$;
  isHovered$ = this.sidebarService.isHovered$;
  isMobileOpen$ = this.sidebarService.isMobileOpen$;
  theme$ = this.themeService.theme$;

  filteredMenuItems: SearchMenuItem[] = [];
  isSearchMenuOpen = false;
  private allMenuItems: SearchMenuItem[] = [];
  private keydownHandler = (e: KeyboardEvent) => this.handleSearchKeyDown(e);

  toggleSidebar() {
    if (window.innerWidth >= 1280) {
      this.sidebarService.toggleExpanded();
    } else {
      this.sidebarService.toggleMobileOpen();
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  ngAfterViewInit() {
    document.addEventListener('keydown', this.keydownHandler);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.keydownHandler);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (
      this.isSearchMenuOpen &&
      this.searchContainer?.nativeElement &&
      !this.searchContainer.nativeElement.contains(event.target as Node)
    ) {
      this.closeSearchMenu();
    }
  }

  private handleSearchKeyDown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.searchInput?.nativeElement?.focus();
    }
  }

  loadSidebarData() {
    this.filteredMenuItems = [];
    this.allMenuItems = [];
    this.sidebarService.getFilteredMenu().subscribe((menuData: NavItem[]) => {
      const items: SearchMenuItem[] = [];
      menuData.forEach((menu) => {
        if (menu?.subItems?.length) {
          menu.subItems!.forEach((sub) => {
            items.push({ name: sub.name, path: sub.path });
          });
        } else {
          items.push({ name: menu.name, path: menu.path });
        }
      });
      this.allMenuItems = items;
      this.filteredMenuItems = [...items];
    });
    this.isSearchMenuOpen = true;
  }

  closeSearchMenu() {
    this.isSearchMenuOpen = false;
  }

  filterMenu(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (value) {
      this.filteredMenuItems = this.allMenuItems.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
    } else {
      this.filteredMenuItems = [...this.allMenuItems];
    }
  }

  navigateToItem(item: SearchMenuItem) {
    if (item.path) {
      this.router.navigate([item.path]);
    } else {
      this.router.navigate(['/']);
    }
    if (this.searchInput?.nativeElement) {
      this.searchInput.nativeElement.value = item.name;
    }
    this.closeSearchMenu();
  }
}
