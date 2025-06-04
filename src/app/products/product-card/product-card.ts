import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Product } from '../../shared/models';


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

  constructor(private sanitizer: DomSanitizer) {}

  @Output() addToCartEvent = new EventEmitter<{ product: Product; quantity: number }>();

  addToCart() {
    this.addToCartEvent.emit({ product: this.product, quantity: this.quantity });
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