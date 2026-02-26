import { NgTemplateOutlet, NgClass } from '@angular/common';
import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight } from '@ng-icons/lucide';
import { TableHeader } from '../../../core/models/common.model';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [NgTemplateOutlet, NgClass, NgIcon],
  providers: [provideIcons({ lucideChevronLeft, lucideChevronRight })],
  templateUrl: './table.html',
})
export class Table {
  @Input() headers: TableHeader[] = [];
  @Input() data: any[] = [];
  @Input() paginationRequired = true;
  @Input() totalRecords = 0;
  @Input() pageSizeOptions: number[] = [15, 30, 60, 100];
  @Input() defaultPageSize = 15;

  @Output() pageChange = new EventEmitter<{ page: number; rows: number }>();

  @ContentChild('rowTemplate') rowTemplate!: TemplateRef<any>;

  readonly currentPage = signal(1);
  readonly rowsPerPage = signal(15);

  ngOnInit() {
    this.rowsPerPage.set(this.defaultPageSize);
  }

  get totalPages(): number {
    const rows = this.rowsPerPage();
    return Math.max(1, Math.ceil((this.totalRecords || 0) / (rows || 1)));
  }

  goToPage(page: number) {
    const next = Math.min(this.totalPages, Math.max(1, page));
    if (next === this.currentPage()) return;
    this.currentPage.set(next);
    this.emit();
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  previousPage() {
    this.goToPage(this.currentPage() - 1);
  }

  changeRowsPerPage(value: number) {
    this.rowsPerPage.set(value);
    this.currentPage.set(1);
    this.emit();
  }

  private emit() {
    this.pageChange.emit({ page: this.currentPage(), rows: this.rowsPerPage() });
  }

  displayedPages(): Array<number | '...'> {
    const total = this.totalPages;
    const current = this.currentPage();

    if (total <= 6) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, 5, '...', total];
    if (current >= total - 2) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
  }
}

