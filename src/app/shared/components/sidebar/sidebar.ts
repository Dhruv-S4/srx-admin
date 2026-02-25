import { NgClass, NgStyle, AsyncPipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  inject,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { NavItem } from '../../../core/models/sidebar.model';
import { SidebarService } from '../../services/sidebar.service';
import { sidebarMenu } from '../../../core/utils/sidebar-menu';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ObjectViewer } from '../object-viewer/object-viewer';
import { lucideChevronDown, lucideGlobe } from '@ng-icons/lucide';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgClass, RouterModule, NgIcon, AsyncPipe, ObjectViewer],
  providers: [
    provideIcons({
      lucideChevronDown,
      lucideGlobe,
    }),
  ],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  navItems: NavItem[] = [];
  openSubmenu: string | null | number = null;
  subMenuHeights: { [key: string]: number } = {};
  @ViewChildren('subMenu') subMenuRefs!: QueryList<ElementRef>;

  readonly isExpanded$;
  readonly isMobileOpen$;
  readonly isHovered$;

  private subscription: Subscription = new Subscription();
  sidebarService = inject(SidebarService);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);

  constructor() {
    this.isExpanded$ = this.sidebarService.isExpanded$;
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
    this.isHovered$ = this.sidebarService.isHovered$;
  }

  ngOnInit() {
    this.subscription.add(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.setActiveMenuFromRoute(this.router.url);
        }
      })
    );

    this.subscription.add(
      combineLatest([this.isExpanded$, this.isMobileOpen$, this.isHovered$]).subscribe(
        ([isExpanded, isMobileOpen, isHovered]) => {
          if (!isExpanded && !isMobileOpen && !isHovered) {
            this.cdr.detectChanges();
          }
        }
      )
    );

    this.getSidebarMenu();
  }

  getSidebarMenu() {
    this.sidebarService.getSidebarMenu().subscribe({
      next: (menu: any) => {
        this.navItems = this.filterMenuByPermissions(sidebarMenu, menu.data);
        this.sidebarService.setFilteredMenu(this.navItems);
        this.setActiveMenuFromRoute(this.router.url);
        this.cdr.detectChanges();
      },
      error: () => {
        this.navItems = sidebarMenu;
        this.sidebarService.setFilteredMenu(this.navItems);
        this.cdr.detectChanges();
      },
    });
  }

  private filterMenuByPermissions(menuItems: NavItem[], permissions: any): NavItem[] {
    if (!permissions) return menuItems;

    return menuItems.filter((item) => {
      if (item.key && (!item.subItems || item.subItems.length === 0) && permissions[item.key]) {
        return true;
      }
      if (item.subItems && item.subItems.length > 0) {
        const hasPermissionSubItem = item.subItems.some((subItem) => {
          return (
            subItem.key && permissions[item?.key || ''] && permissions[item?.key || ''][subItem.key]
          );
        });

        if (hasPermissionSubItem) {
          item.subItems = item.subItems.filter(
            (subItem) =>
              !subItem.key ||
              (permissions[item?.key || ''] && permissions[item?.key || ''][subItem.key])
          );
          return true;
        }
        return false;
      }
      return false;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  isActive(path: string | undefined): boolean {
    return !!path && this.router.url.includes(path);
  }

  toggleSubmenu(section: string, index: number) {
    const key = `${section}-${index}`;

    if (this.openSubmenu === key) {
      this.openSubmenu = null;
      this.subMenuHeights[key] = 0;
    } else {
      this.openSubmenu = key;
      setTimeout(() => {
        const el = document.getElementById(key);
        if (el) {
          this.subMenuHeights[key] = el.scrollHeight;
          this.cdr.detectChanges();
        }
      });
    }
  }

  onSidebarMouseEnter() {
    this.isExpanded$
      .subscribe((expanded) => {
        if (!expanded) {
          this.sidebarService.setHovered(true);
        }
      })
      .unsubscribe();
  }

  private setActiveMenuFromRoute(currentUrl: string) {
    const menuGroups = [{ items: this.navItems, prefix: 'main' }];
    menuGroups.forEach((group) => {
      group.items.forEach((nav, i) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (currentUrl.includes(subItem.path)) {
              const key = `${group.prefix}-${i}`;
              this.openSubmenu = key;
              setTimeout(() => {
                const el = document.getElementById(key);
                if (el) {
                  this.subMenuHeights[key] = el.scrollHeight;
                  this.cdr.detectChanges();
                }
              });
            }
          });
        }
      });
    });
  }

  onSubmenuClick() {
    this.isMobileOpen$
      .subscribe((isMobile) => {
        if (isMobile) {
          this.sidebarService.setMobileOpen(false);
        }
      })
      .unsubscribe();
  }
}
