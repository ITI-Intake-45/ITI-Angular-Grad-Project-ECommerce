import {Component, OnInit, OnDestroy, ElementRef, ViewChild, Output, EventEmitter} from '@angular/core';
import { Router } from '@angular/router';
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
  mainCategories: ProductCategory[] = [];
  additionalCategories: ProductCategory[] = [];
  cartItemCount: number = 0;
  searchQuery: string = ''; // Add this property to store search input

  @ViewChild('searchInput') searchInput!: ElementRef;

  private cartSubscription: Subscription | undefined;

  // Names of main categories to display directly in the navbar
  private mainCategoryNames: string[] = ['Beans', 'Mugs', 'Machines'];

  constructor(
    public authService: AuthService,
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    // Fetch categories from database
    this.loadCategories();

    // Subscribe to cart changes to update badge
    this.cartSubscription = this.cartService.cart$.subscribe(() => {
      this.cartItemCount = this.cartService.getCartItemCount();
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;

        // Split categories into main and additional
        this.mainCategories = this.categories.filter(category =>
          this.mainCategoryNames.includes(category.name)
        );

        // Get additional categories (not in main)
        this.additionalCategories = this.categories.filter(category =>
          !this.mainCategoryNames.includes(category.name)
        );
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
        // Fallback to empty arrays if there's an error
        this.categories = [];
        this.mainCategories = [];
        this.additionalCategories = [];
      }
    });
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

  // Update search query as user types
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
  }
}
