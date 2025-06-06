import { Component, Input } from '@angular/core';
import { CartService,  CartItemDTO } from '../../core/services/cart';

@Component({
  selector: 'app-cart-item',
  templateUrl: './cart-item.html',
  styleUrl: './cart-item.css',
  standalone: false,
})
export class CartItem {
  @Input() cartItems: CartItemDTO[] = [];
  baseImageUrl = 'http://localhost:8080/images/';
  subtotalChanged: Set<number> = new Set();

  constructor(private cartService: CartService) {}
updateQuantity(productId: number, quantity: number): void {
    if (!isNaN(quantity) && quantity >= 1) {
      const item = this.cartItems.find(i => i.productId === productId);
      if (item) {
        item.quantity = quantity;
        item.subtotal = item.price * quantity;

        // Trigger animation by marking changed item
        this.subtotalChanged.add(productId);
        setTimeout(() => this.subtotalChanged.delete(productId), 300); // Remove after animation
      }

      this.cartService.updateCartItem(productId, quantity).subscribe({
        next: (cart) => console.log('Cart updated:', cart),
        error: (err) => console.error('Error updating quantity:', err)
      });
    }
  }

  isSubtotalChanged(productId: number): boolean {
    return this.subtotalChanged.has(productId);
  }


  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId).subscribe({
      next: (cart) => {
        console.log('Item removed:', cart);
      },
      error: (err) => {
        console.error('Error removing item:', err);
      }
    });
  }
}