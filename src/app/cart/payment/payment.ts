import { Component, EventEmitter, Output } from '@angular/core';

import { Observable } from 'rxjs';
import { CartService } from '../../core/services/cart';

@Component({
  selector: 'app-payment',
  standalone:false,
  templateUrl: './payment.html'
})
export class Payment {
  @Output() checkoutComplete = new EventEmitter<void>();
  paymentDetails = {
    cardNumber: '',
    expiry: '',
    cvv: ''
  };
  isProcessing = false;

  constructor(private cartService: CartService) {}

  onSubmit(): void {
    this.isProcessing = true;
    console.log('Payment: Processing payment...');

    this.mockPayment().subscribe({
      next: () => {
        this.cartService.saveCartToDatabase().subscribe({
          next: () => {
            this.cartService.clearCartAfterCheckout().subscribe({
              next: () => {
                console.log('Payment: Checkout completed');
                this.isProcessing = false;
                this.checkoutComplete.emit();
              },
              error: (error) => {
                console.error('Payment: Error clearing cart:', error);
                alert('Checkout failed. Please try again.');
                this.isProcessing = false;
              }
            });
          },
          error: (error) => {
            console.error('Payment: Error saving cart:', error);
            alert('Failed to save cart. Please try again.');
            this.isProcessing = false;
          }
        });
      },
      error: (error) => {
        console.error('Payment: Payment processing failed:', error);
        alert('Payment failed. Please try again.');
        this.isProcessing = false;
      }
    });
  }

  private mockPayment(): Observable<void> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next();
        observer.complete();
      }, 1000);
    });
  }
}