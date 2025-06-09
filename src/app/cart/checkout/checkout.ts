import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { CartService } from '../../core/services/cart';


@Component({
  selector: 'app-checkout',
  standalone:false,
  templateUrl: './checkout.html'
})
export class Checkout implements OnInit {
  isAuthenticated = false;
  isCartEmpty = true;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (!this.isAuthenticated) {
      console.error('Checkout: User not authenticated, redirecting to login');
      alert('Please log in to proceed with checkout');
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.cart$.subscribe(cart => {
      this.isCartEmpty = cart.cartItems.length === 0;
      if (this.isCartEmpty) {
        console.warn('Checkout: Cart is empty');
        alert('Your cart is empty. Add items to proceed.');
      }
    });
  }

  onCheckoutComplete(): void {
    console.log('Checkout: Payment successful, navigating to confirmation');
    this.router.navigate(['confirmation']);
  }
}