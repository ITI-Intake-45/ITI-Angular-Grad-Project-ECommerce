import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Product } from '../../shared/models';
import { CartService } from '../../core/services/cart';


@Component({
  standalone: false,
  selector: 'app-product-card',
  templateUrl: './product-card.html', // Updated file name
  styleUrls: ['./product-card.css']
})
export class ProductCard {
  @Input() product!: Product;
  quantity = 1;
  showActions = false;

  constructor(private sanitizer: DomSanitizer,
    private cartService:CartService
  ) {}

  @Output() addToCartEvent = new EventEmitter<{ product: Product; quantity: number }>();

  addToCart() {
    this.cartService.addToCart(this.product.productId, this.quantity).subscribe({
      next: (cart) => {
        
        // Emit event for parent component
        this.addToCartEvent.emit({ product: this.product, quantity: this.quantity });
        console.log('Product added to cart:', cart);
        // Optionally: this.notifyUser('Product added to cart!');
      },
      error: (err) => {
        
        console.error('Error adding to cart:', err);
        // Optionally: this.notifyUser('Failed to add product to cart. Please try again.');
      }
    });
  }

  getImageUrl(): SafeUrl {
    if (this.product?.image) {
      return this.sanitizer.bypassSecurityTrustUrl(`http://localhost:8080/images/${this.product.image}`);
    }

    return this.sanitizer.bypassSecurityTrustUrl('https://via.placeholder.com/200?text=No+Image');
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=No+Image';
  }
  handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (target.classList.contains('card-title')) {
      target.classList.add('clicked');
      
    }
    setTimeout(() => target.classList.remove('clicked'), 100);
  }
}