import { Component } from '@angular/core';
import { CartDTO, CartService } from '../../core/services/cart';


@Component({
  selector: 'app-order-summary',
  standalone:false,
  templateUrl: './order-summary.html'
})
export class OrderSummary {
  cart: CartDTO = { userId: 0, cartId: 0, cartItems: [], totalPrice: 0 };

  constructor(private cartService: CartService) {
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
    });
  }
}