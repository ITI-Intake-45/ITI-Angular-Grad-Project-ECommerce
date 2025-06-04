import { Component, Input } from '@angular/core';
import { Product } from '../../shared/models';

@Component({
  standalone:false,
  selector: 'app-product-card',
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.css']
})
export class ProductCard {
  @Input() product!: Product;
  quantity = 1;
  showActions = false;

  addToCart() {
    // Implement cart logic here (e.g., emit event or call a cart service)
    console.log(`Added ${this.quantity} of ${this.product.name} to cart`);
  }

  // quickLook() {
  //   // Implement quick look modal logic (e.g., open a modal with product-details)
  //   console.log(`Quick look for ${this.product.name}`);
  // }

  getImageUrl(): string {
    // Construct the full URL to the image
    return `http://localhost:8080/images/${this.product.image}`;
  }
}