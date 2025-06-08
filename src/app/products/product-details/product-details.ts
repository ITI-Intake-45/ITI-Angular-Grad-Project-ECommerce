import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product';
import { Product } from '../../shared/product-model';

@Component({
  standalone: false,
  selector: 'app-product-details',
  templateUrl: './product-details.html',
  styleUrls: ['./product-details.css']
})
export class ProductDetails implements OnInit {
  product!: Product;
  relatedProducts: Product[] = [];
  loading = true;
  selectedQuantity = 1;
  errorMessage: string | null = null;

  // Slider properties
  currentSlideIndex = 0;
  slideWidth = 25; // Show 4 items at once (100% / 4 = 25%)
  itemsPerSlide = 4;
  maxSlideIndex = 0;
  indicators: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.errorMessage = 'No product ID provided.';
      this.loading = false;
      return;
    }

    this.productService.getProductById(idParam).subscribe({
      next: (prod) => {
        this.product = prod;
        this.loading = false;

        if (this.product?.category?.id != null) {
          this.productService
            .getProductsByCategoryId(this.product.category.id)
            .subscribe({
              next: (related) => {
                this.relatedProducts = related.filter(
                  p => p.productId !== this.product.productId
                );
                this.initializeSlider();
              },
              error: (err) => {
                console.error('Error loading related products', err);
              }
            });
        }
      },
      error: (err) => {
        console.error('Error loading product', err);
        this.errorMessage = 'Could not load product. Please try again later.';
        this.loading = false;
      }
    });

    this.updateSliderSettings();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.updateSliderSettings();
    this.initializeSlider();
  }

  private updateSliderSettings(): void {
    const windowWidth = window.innerWidth;

    if (windowWidth < 576) {
      // Mobile: 1 item per slide
      this.itemsPerSlide = 1;
      this.slideWidth = 100;
    } else if (windowWidth < 768) {
      // Small tablets: 2 items per slide
      this.itemsPerSlide = 2;
      this.slideWidth = 50;
    } else if (windowWidth < 992) {
      // Medium tablets: 3 items per slide
      this.itemsPerSlide = 3;
      this.slideWidth = 33.333;
    } else {
      // Desktop: 4 items per slide
      this.itemsPerSlide = 4;
      this.slideWidth = 25;
    }
  }

  private initializeSlider(): void {
    if (this.relatedProducts.length <= this.itemsPerSlide) {
      this.maxSlideIndex = 0;
      this.indicators = [];
    } else {
      this.maxSlideIndex = Math.ceil(this.relatedProducts.length / this.itemsPerSlide) - 1;
      this.indicators = Array(this.maxSlideIndex + 1).fill(0).map((_, i) => i);
    }

    // Reset to first slide if current index is out of bounds
    if (this.currentSlideIndex > this.maxSlideIndex) {
      this.currentSlideIndex = 0;
    }
  }

  slideProducts(direction: 'prev' | 'next'): void {
    if (direction === 'prev' && this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
    } else if (direction === 'next' && this.currentSlideIndex < this.maxSlideIndex) {
      this.currentSlideIndex++;
    }
  }

  goToSlide(index: number): void {
    if (index >= 0 && index <= this.maxSlideIndex) {
      this.currentSlideIndex = index;
    }
  }

  onImageError(event: Event): void {
    const imgEl = event.target as HTMLImageElement;
    imgEl.src = 'https://via.placeholder.com/400?text=No+Image';
  }

  addToCart(): void {
    console.log(`Adding to cart: ${this.product.name} x ${this.selectedQuantity}`);
    // …your cart logic here…
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  onQuantityChange(delta: number): void {
    const newQty = this.selectedQuantity + delta;
    if (newQty >= 1 && newQty <= this.product.stock) {
      this.selectedQuantity = newQty;
    }
  }
}
