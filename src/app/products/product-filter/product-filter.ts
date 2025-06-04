import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductCategory } from '../../shared/models';

@Component({
  standalone:false,
  selector: 'app-product-filters',
  templateUrl: './product-filter.html',
  styleUrls: ['./product-filter.css']
})
export class ProductFilter {
  @Input() categories: ProductCategory[] = [];
  @Output() filterChange = new EventEmitter<{
    name: string | null;
    category: string | null;
    maxPrice: number | null;
  }>();

  filterName: string | null = null;
  filterCategory: string | null = null;
  filterMaxPrice: number | null = null;

  applyFilters() {
    this.filterChange.emit({
      name: this.filterName,
      category: this.filterCategory,
      maxPrice: this.filterMaxPrice
    });
  }

  resetFilters() {
    this.filterName = null;
    this.filterCategory = null;
    this.filterMaxPrice = null;
    this.applyFilters();
  }
}