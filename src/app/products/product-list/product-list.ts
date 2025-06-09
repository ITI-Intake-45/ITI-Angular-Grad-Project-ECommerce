import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product';
import { Product, ProductCategory, Page } from '../../shared/product-model';

@Component({
  standalone: false,
  selector: 'app-product-list',
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
})
export class ProductList implements OnInit {
  products: Product[] = [];
  categories: ProductCategory[] = [];
  totalProducts = 0;
  currentPage = 0;
  pageSize = 9; // Default to 9
  sortDir = ''; // Default to blank (no sorting)
  filterName: string | null = null;
  filterCategory: string | null = null;
  filterMaxPrice: number | null = null;
  filterMinPrice: number | null = null;
  loading = false;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCategories();

    // Subscribe to query parameters to handle search and category filters
    this.route.queryParams.subscribe(params => {
      // Handle search parameter from header search
      if (params['name']) {
        this.filterName = params['name'];
      }

      // Handle category parameter from navigation
      if (params['category']) {
        this.filterCategory = params['category'];
      }

      // Reset page when new search/filter is applied
      this.currentPage = 0;
      this.loadProducts();
    });
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
        this.filterMinPrice,
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

  onFilterChange(filters: {
    name: string | null;
    category: string | null;
    minPrice: number | null;
    maxPrice: number | null
  }) {
    this.filterName = filters.name;
    this.filterCategory = filters.category;
    this.filterMinPrice = filters.minPrice;
    this.filterMaxPrice = filters.maxPrice;
    this.currentPage = 0;

    // Update URL parameters to reflect current filters
    const queryParams: any = {};
    if (filters.name) queryParams.name = filters.name;
    if (filters.category) queryParams.category = filters.category;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });

    this.loadProducts();
  }

  onSortChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement && selectElement.value) {
      this.sortDir = selectElement.value;
    } else {
      this.sortDir = ''; // Reset to blank (no sorting)
    }
    this.currentPage = 0;
    this.loadProducts();
  }

  onPageSizeChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.pageSize = +selectElement.value;
    this.currentPage = 0;
    this.loadProducts();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadProducts();
  }
}
