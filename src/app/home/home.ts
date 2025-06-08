import { Component, OnInit } from '@angular/core';
import { ProductService } from '../core/services/product';
import { Product } from '../shared/product-model';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  standalone: false
})
export class Home implements OnInit {
  // Static fallback products
  private staticProducts = [
    {
      productId: 1,
      name: 'POHAPOLO SSAL NDE',
      price: 24.99,
      image: 'assets/home/mug.jpeg',
      description: '',
      stock: 10,
      status: 'active',
      category: { id: 1, name: 'Mugs' }
    },
    {
      productId: 2,
      name: 'MALHELD CIR HELD',
      price: 28.99,
      image: 'assets/home/images%20(2).jpeg',
      description: '',
      stock: 10,
      status: 'active',
      category: { id: 1, name: 'Beans' }
    },
    {
      productId: 3,
      name: 'ALPHA BARD',
      price: 32.99,
      image: 'assets/home/accessories.jpeg',
      description: '',
      stock: 10,
      status: 'active',
      category: { id: 1, name: 'Machine' }
    },
  ];

  recentProducts: Product[] = [];
  recentMugs: Product[] = [];
  recentMachines: Product[] = [];
  loading = false;

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadRecentProducts();
    this.loadRecentMugs();
    this.loadRecentMachines();
  }

  loadRecentProducts() {
    this.loading = true;
    this.productService.getFilteredProducts(
      null,          // name filter
      "Beans",      // category filter
      null,          // min price
      null,          // max price
      "desc",        // sort by newest
      0,             // first page
      3              // limit to 3 products
    ).pipe(
      catchError(error => {
        console.error('Error loading recent products:', error);
        return of({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 0 });
      })
    ).subscribe(page => {
      // If no products returned from API, use static products
      this.recentProducts = page.content.length > 0
        ? page.content
        : this.staticProducts;
      this.loading = false;
    });
  }

  loadRecentMugs() {
    this.productService.getFilteredProducts(
      null,          // name filter
      "Mugs",        // category filter
      null,          // min price
      null,          // max price
      "desc",        // sort by newest
      0,             // first page
      3              // limit to 3 products
    ).pipe(
      catchError(error => {
        console.error('Error loading recent mugs:', error);
        return of({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 0 });
      })
    ).subscribe(page => {
      // If no products returned from API, use static products
      this.recentMugs = page.content.length > 0
        ? page.content
        : this.staticProducts;
      this.loading = false;
    });
  }

  loadRecentMachines() {
    this.productService.getFilteredProducts(
      null,          // name filter
      "Machines",    // category filter
      null,          // min price
      null,          // max price
      "desc",        // sort by newest
      0,             // first page
      3              // limit to 3 products
    ).pipe(
      catchError(error => {
        console.error('Error loading recent machines:', error);
        return of({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 0 });
      })
    ).subscribe(page => {
      // If no products returned from API, use static products
      this.recentMachines = page.content.length > 0
        ? page.content
        : this.staticProducts;
      this.loading = false;
    });
  }

  getImageUrl(product: Product): string {
    // For API products, use the API image path
    if (product.image && product.image.startsWith('http')) {
      return product.image;
    } else if (product.image && !product.image.includes('assets')) {
      return `http://localhost:8080/images/${product.image}`;
    }

    // For static products or if no image
    return product.image || 'https://via.placeholder.com/200?text=No+Image';
  }
}
