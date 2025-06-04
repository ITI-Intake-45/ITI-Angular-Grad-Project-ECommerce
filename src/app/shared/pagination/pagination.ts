import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-pagination',
  template: `
    <div class="pagination">
      <button (click)="onPageChange(currentPage - 1)" [disabled]="currentPage === 0">
        Previous
      </button>
      <span>Page {{ currentPage + 1 }} of {{ totalPages }}</span>
      <button
        (click)="onPageChange(currentPage + 1)"
        [disabled]="currentPage >= totalPages - 1"
      >
        Next
      </button>
    </div>
  `,
  styles: [
    `
      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        margin-top: 20px;
      }
      button {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
      }
      button[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `
  ]
})
export class Pagination {
  @Input() currentPage = 0;
  @Input() totalItems = 0;
  @Input() pageSize = 9;
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  onPageChange(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.pageChange.emit(page);
    }
  }
}