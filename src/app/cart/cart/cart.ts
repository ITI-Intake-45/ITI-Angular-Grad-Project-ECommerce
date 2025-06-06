import {
  Component,
  OnInit,
  OnDestroy,
  
} from '@angular/core';



import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartDTO, CartService } from '../../core/services/cart';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.html',
  styleUrl: './cart.css',
  
})
export class Cart implements OnInit, OnDestroy {
  cart: CartDTO = { userId: 0, cartId: 0, cartItems: [], totalPrice: 0 };
  loading = false;
  private cartSubscription: Subscription | undefined;
  

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    this.loading = true;
    this.cartSubscription = this.cartService.cart$.subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
         
      },
      error: (err) => {
        console.error('Error fetching cart:', err);
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  }

  proceedToCheckout(): void {
    this.loading = true;
    if (!this.cartService.isUserAuthenticated()) {
      this.loading = false;
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart/checkout' } });
    } else {
      this.cartService.canProceedToCheckout().subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/cart/checkout']);
        },
        error: (err) => {
          console.error('Checkout error:', err);
          this.loading = false;
          this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart/checkout' } });
        }
      });
    }
  }

  isCartEmpty(): boolean {
    return this.cartService.isCartEmpty();
  }
}
