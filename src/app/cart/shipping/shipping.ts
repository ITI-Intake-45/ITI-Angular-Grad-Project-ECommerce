import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UserProfile, UserService, ValidationResult } from '../../core/services/user';
import { CartService } from '../../core/services/cart';
import { catchError, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../../core/services/auth';
import { OrderService } from '../../core/services/order';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shipping',
  standalone: false,
  templateUrl: './shipping.html',
  styleUrl: './shipping.css'
})
export class Shipping implements OnInit {
@Output() checkoutComplete = new EventEmitter<void>();
  address: string = '';
  isProcessing = false;
  addressValidation: ValidationResult = { valid: true, message: '' };
  isAddressValid = true;
  creditBalance: number = 0;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private userService: UserService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (profile: UserProfile) => {
        this.address = profile.address || 'No address set';
        this.creditBalance = profile.creditBalance;
        this.validateAddress();
      },
      error: (error) => {
        console.error('Shipping: Error fetching user profile:', error);
        alert('Failed to load user profile. Please try again.');
      }
    });
  }

  validateAddress(): void {
    this.userService.validateAddress(this.address).subscribe({
      next: (result: ValidationResult) => {
        this.addressValidation = result;
        this.isAddressValid = result.valid;
      },
      error: (error) => {
        console.error('Shipping: Address validation error:', error);
        this.addressValidation = { valid: false, message: 'Address validation failed' };
        this.isAddressValid = false;
      }
    });
  }

  onSubmit(): void {
  if (!this.isAddressValid) {
    alert('Please ensure a valid shipping address is set in your profile.');
    return;
  }

  const user = this.authService.getCurrentUser();
  if (!user || !user.userId) {
    console.error('Shipping: No user ID found');
    alert('User not authenticated. Please log in again.');
    this.router.navigate(['/auth/login']);
    return;
  }

  this.isProcessing = true;
  console.log('Shipping: Starting order process for user:', user.userId, 'Cart:', this.cartService.getCurrentCart());
  

  this.orderService.createOrder(user.userId).pipe(
    tap(response => console.log('Shipping: Order created successfully:', response)),
    switchMap(() => this.userService.refreshProfile().pipe(
      tap(profile => console.log('Shipping: Profile refreshed, balance:', profile.creditBalance))
    ))
  ).subscribe({
    next: (profile: UserProfile) => {
      console.log('Shipping: Order and profile refresh completed');
      this.creditBalance = profile.creditBalance;
      this.cartService.clearCartAfterCheckout().subscribe({
        next: () => {
          console.log('Shipping: Cart cleared successfully, cart:', this.cartService.getCurrentCart());
          this.isProcessing = false;
          
          alert("Order placed! ☕ Thank you for shopping with us.");
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Shipping: Error clearing cart:', error);
          this.isProcessing = false;
          console.log('Shipping: Cart after clear error:', this.cartService.getCurrentCart());
          alert('Order placed, but failed to clear cart. Please check your cart.');
          this.router.navigate(['/']);
        }
      });
    },
    error: (error) => {
      console.error('Shipping: Error in order process:', error);
      this.isProcessing = false;
      console.log('Shipping: Cart preserved after error:', this.cartService.getCurrentCart());
      let message = 'Failed to place order. Please try again.';
      const backendError = error.message || error.error; // Handle text-based errors from OrderService
      console.log('Shipping: Backend error:', backendError);
      if (typeof backendError === 'string') {
        if (backendError.includes('Cart not found')) {
          message = 'Cart not found. Please add items to your cart.';
        } else if (backendError.includes('empty cart')) {
          message = 'Your cart is empty. Please add items.';
        } else if (backendError.includes('Insufficient credit balance')) {
          message = 'Insufficient credit balance. Please add funds.';
        } else if (backendError.includes('Insufficient stock')) {
          message = backendError;
        } else if (backendError.includes('Id cannot be null')) {
          message = 'Invalid user ID. Please log in again.';
        }
      }
      alert(message);
    }
  });
}

}
