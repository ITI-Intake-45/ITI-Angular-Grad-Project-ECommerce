import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductCategory } from '../../shared/product-model';

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
  minPrice: number | null;
  maxPrice: number | null;
}>();

filterName: string | null = null;
filterCategory: string | null = null;
filterMinPrice: number | null = null;
filterMaxPrice: number | null = null;

applyFilters() {
  this.filterChange.emit({
    name: this.filterName,
    category: this.filterCategory,
    minPrice: this.filterMinPrice,
    maxPrice: this.filterMaxPrice
  });
}

resetFilters() {
  this.filterName = null;
  this.filterCategory = null;
  this.filterMinPrice = null;
  this.filterMaxPrice = null;
  this.applyFilters();
}

}
