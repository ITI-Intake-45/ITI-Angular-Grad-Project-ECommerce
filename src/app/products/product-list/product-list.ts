import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../core/services/product';
import { Product, ProductCategory, Page } from '../../shared/models';

@Component({
  standalone:false,
  selector: 'app-product-list',
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
})
export class ProductList implements OnInit {
  products: Product[] = [];
  categories: ProductCategory[] = [];
  totalProducts = 0;
  currentPage = 0;
  pageSize = 9;
  sortDir = 'desc';
  filterName: string | null = null;
  filterCategory: string | null = null;
  filterMaxPrice: number | null = null;
  loading = false;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.productService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  loadProducts() {
    this.loading = true;
    this.productService
      .getFilteredProducts(
        this.filterName,
        this.filterCategory,
        this.filterMaxPrice,
        this.sortDir,
        this.currentPage,
        this.pageSize
      )
      .subscribe((page: Page<Product>) => {
        this.products = page.content;
        this.totalProducts = page.totalElements;
        this.loading = false;
      });
  }

  onFilterChange(filters: { name: string | null; category: string | null; maxPrice: number | null }) {
    this.filterName = filters.name;
    this.filterCategory = filters.category;
    this.filterMaxPrice = filters.maxPrice;
    this.currentPage = 0; // Reset to first page on filter change
    this.loadProducts();
  }

  onSortChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement && selectElement.value) {
      this.sortDir = selectElement.value;
      this.loadProducts();
    }
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadProducts();
  }
}