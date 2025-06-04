import { Component, Input } from '@angular/core';
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

  addToCart() {
    console.log(`Added ${this.quantity} of ${this.product.name} to cart`);
  }

  getImageUrl(): SafeUrl {
    if (this.product && this.product.image) { // Fixed to use imagePath
      return this.sanitizer.bypassSecurityTrustUrl(`http://localhost:8080/images/${this.product.image}`);
    }
    return this.sanitizer.bypassSecurityTrustUrl('https://via.placeholder.com/200?text=No+Image');
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=No+Image';
  }
}