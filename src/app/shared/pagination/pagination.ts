import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-pagination',
  templateUrl: './pagination.html',
  styleUrls: ['./pagination.css']
})
export class Pagination {
  @Input() currentPage = 0;
  @Input() totalItems = 0;
  @Input() pageSize = 9;
  @Output() pageChange = new EventEmitter<number>();

get pages(): number[] {
  const total = this.totalPages;
  const current = this.currentPage;
  const maxVisible = 5;
  const pages: number[] = [];

  if (total <= maxVisible + 2) {
    // Show all pages if few
    return Array.from({ length: total }, (_, i) => i);
  }

  const start = Math.max(1, current - 2);
  const end = Math.min(total - 2, current + 2);

  pages.push(0); // Always show first page

  if (start > 1) {
    pages.push(-1); // -1 will represent '...'
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < total - 2) {
    pages.push(-1); // '...'
  }

  pages.push(total - 1); // Always show last page

  return pages;
}


  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  onPageChange(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.pageChange.emit(page);
    }
  }
}