import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { CartService } from '../../core/services/cart';
import { of, switchMap, tap } from 'rxjs';


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
      this.router.navigate(['/auth/login']);
      return;
    }

    // Force cart sync and check cart state
    /*this.cartService.syncCartWithServer().pipe(
      tap(cart => console.log('Checkout: Cart synced', cart)),
      switchMap(cart => {
        this.isCartEmpty = cart.cartItems.length === 0;
        console.log('Checkout: Cart state after sync, isCartEmpty:', this.isCartEmpty);
        if (this.isCartEmpty) {
          console.warn('Checkout: Cart is empty, redirecting to cart page');
          this.router.navigate(['/cart']);
          return of(null); // Stop further processing
        }
        return of(cart);
      })
    ).subscribe({
      error: err => {
        console.error('Checkout: Error syncing cart:', err);
        this.isCartEmpty = true; // Assume empty on error to avoid checkout with invalid cart
        this.router.navigate(['/cart']);
      }
    });*/

    // Monitor cart$ for real-time updates
    this.cartService.cart$.subscribe(cart => {
      console.log('Checkout: cart$ emitted', cart);
      this.isCartEmpty = cart.cartItems.length === 0;
      if (this.isCartEmpty) {
        console.warn('Checkout: Cart became empty during session');
      }
    });
  }

  onCheckoutComplete(): void {
    console.log('Checkout: Shipping confirmed, navigating to confirmation');
    this.router.navigate(['confirmation']);
  }
}