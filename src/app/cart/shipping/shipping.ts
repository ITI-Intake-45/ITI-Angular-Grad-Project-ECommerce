import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UserProfile, UserService, ValidationResult } from '../../core/services/user';
import { CartService } from '../../core/services/cart';
import { catchError, of, tap } from 'rxjs';
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
    console.log('Shipping: Placing order...');

    this.orderService.createOrder(user.userId).subscribe({
      next: (response) => {
        console.log('Shipping: Order placed successfully:', response);
        this.cartService.clearCart();
        this.userService.refreshProfile().subscribe({
          next: (profile) => this.creditBalance = profile.creditBalance,
          error: (error) => console.error('Shipping: Error refreshing profile:', error)
        });
        this.isProcessing = false;
        this.router.navigate(['/user/orders']);
      },
      error: (error) => {
        console.error('Shipping: Error placing order:', error);
        this.isProcessing = false;
        let message = 'Failed to place order. Please try again.';
        if (error.message.includes('Cart not found')) {
          message = 'Cart not found. Please add items to your cart.';
        } else if (error.message.includes('empty cart')) {
          message = 'Your cart is empty. Please add items.';
        } else if (error.message.includes('Insufficient credit balance')) {
          message = 'Insufficient credit balance. Please add funds.';
        } else if (error.message.includes('Insufficient stock')) {
          message = error.message;
        } else if (error.message.includes('Id cannot be null')) {
          message = 'Invalid user ID. Please log in again.';
        }
        alert(message);
      }
    });
  }

}
