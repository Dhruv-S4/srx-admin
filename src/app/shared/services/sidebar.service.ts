import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NavItem } from '../../core/models/sidebar.model';
import { HttpService } from './http.service';

@Injectable({
    providedIn: 'root',
})
export class SidebarService {
    private http = inject(HttpService);

    private isExpandedSubject = new BehaviorSubject<boolean>(true);
    private isMobileOpenSubject = new BehaviorSubject<boolean>(false);
    private isHoveredSubject = new BehaviorSubject<boolean>(false);
    private isMobileViewSubject = new BehaviorSubject<boolean>(false);
    private filteredMenuSubject = new BehaviorSubject<NavItem[]>([]);

    isExpanded$ = this.isExpandedSubject.asObservable();
    isMobileOpen$ = this.isMobileOpenSubject.asObservable();
    isHovered$ = this.isHoveredSubject.asObservable();
    isMobileView$ = this.isMobileViewSubject.asObservable();
    filteredMenu$ = this.filteredMenuSubject.asObservable();

    setExpanded(val: boolean) {
        this.isExpandedSubject.next(val);
    }

    toggleExpanded() {
        this.isExpandedSubject.next(!this.isExpandedSubject.value);
    }

    setMobileOpen(val: boolean) {
        this.isMobileOpenSubject.next(val);
    }

    toggleMobileOpen() {
        this.isMobileOpenSubject.next(!this.isMobileOpenSubject.value);
    }

    setHovered(val: boolean) {
        this.isHoveredSubject.next(val);
    }

    getSidebarMenu() {
        return this.http.get('settings/menu');
    }

    setFilteredMenu(menu: NavItem[]) {
        this.filteredMenuSubject.next(menu);
    }

    getFilteredMenu() {
        return this.filteredMenuSubject.asObservable();
    }

    setMobileView(val: boolean) {
        this.isMobileViewSubject.next(val);
    }

    toggleMobileView() {
        this.isMobileViewSubject.next(!this.isMobileViewSubject.value);
    }
}
