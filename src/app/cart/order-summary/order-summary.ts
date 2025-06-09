import { Component, OnInit } from '@angular/core';
import { CartDTO, CartService } from '../../core/services/cart';


@Component({
  selector: 'app-order-summary',
  standalone:false,
  templateUrl: './order-summary.html'
})
export class OrderSummary implements OnInit{
  cart: CartDTO = { userId: 0, cartId: 0, cartItems: [], totalPrice: 0 };
  isLoadingImages: boolean = true;
  shippingCost: number = 10;
  baseImageUrl = 'http://localhost:8080/images/';

  constructor(private cartService: CartService) {
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
    });
  }
  ngOnInit(): void {
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
      this.isLoadingImages = false; // Images resolved by CartService
    });
  }
  getGrandTotal(): number {
    return this.cart.totalPrice + this.shippingCost;
  }
}