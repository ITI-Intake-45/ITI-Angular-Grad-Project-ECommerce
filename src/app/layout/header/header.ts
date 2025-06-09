import {Component, OnInit, OnDestroy, ElementRef, ViewChild, Output, EventEmitter} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { ProductService } from '../../core/services/product';
import { CartService } from '../../core/services/cart';
import { ProductCategory } from '../../shared/product-model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  standalone: false
})
export class Header implements OnInit, OnDestroy {
  isMenuOpen = false;
  isDropdownOpen = false;
  categories: ProductCategory[] = [];
  cartItemCount: number = 0;
  searchQuery: string = '';
  currentCategory: string = '';

  @ViewChild('searchInput') searchInput!: ElementRef;

  private cartSubscription: Subscription | undefined;
  private routeSubscription: Subscription | undefined;

  // Maximum number of categories to display inline (the rest go to dropdown)
  private readonly MAX_INLINE_CATEGORIES = 3;

  constructor(
    public authService: AuthService,
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    // Fetch categories from database
    this.loadCategories();

    // Subscribe to cart changes to update badge
    this.cartSubscription = this.cartService.cart$.subscribe(() => {
      this.cartItemCount = this.cartService.getCartItemCount();
    });

    // Subscribe to route changes to track current category
    this.routeSubscription = this.router.events.subscribe(() => {
      this.updateCurrentCategory();
    });

    // Update current category on init
    this.updateCurrentCategory();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
        this.categories = [];
      }
    });
  }

  // Get categories to display inline (first 3)
  getDisplayCategories(): ProductCategory[] {
    return this.categories.slice(0, this.MAX_INLINE_CATEGORIES);
  }

  // Get categories for dropdown (after first 3)
  getExtraCategories(): ProductCategory[] {
    return this.categories.slice(this.MAX_INLINE_CATEGORIES);
  }

  // Check if a category is currently active
  isActiveCategory(categoryName: string): boolean {
    return this.currentCategory === categoryName;
  }

  // Update current category based on route
  private updateCurrentCategory(): void {
    // Get the current route's query parameters
    const snapshot = this.router.routerState.root.firstChild?.snapshot;
    if (snapshot?.queryParams && snapshot.queryParams['category']) {
      this.currentCategory = snapshot.queryParams['category'];
    } else {
      this.currentCategory = '';
    }
  }

  // Navigate to products page with category filter
  navigateToCategory(categoryName: string): void {
    this.router.navigate(['/products'], {
      queryParams: { category: categoryName }
    });
    this.closeDropdown();
    this.closeMenu();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  onSearch(event: any): void {
    this.searchQuery = event.target.value;
  }

  // Perform search and navigate to products page
  performSearch(): void {
    const searchTerm = this.searchQuery.trim();

    if (searchTerm) {
      // Navigate to products page with search query parameter
      this.router.navigate(['/products'], {
        queryParams: { name: searchTerm }
      });
    } else {
      // If search is empty, just navigate to products page without filter
      this.router.navigate(['/products']);
    }

    // Clear the search input after search
    this.searchQuery = '';
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
    }
  }

  // Handle Enter key press in search input
  onSearchKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.performSearch();
    }
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
  }
}