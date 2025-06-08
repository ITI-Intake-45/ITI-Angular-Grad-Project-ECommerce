// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { OrderService } from '../../core/services/order';
// import { AuthService } from '../../core/services/auth';
// import { Router } from '@angular/router';
// import { Order, OrderStatus } from '../../shared/order-models';
// import { Subject } from 'rxjs';
// import { takeUntil } from 'rxjs/operators';
// import { UserProfile, UserService } from '../../core/services/user';
//
// @Component({
//   standalone: false,
//   selector: 'app-order-list',
//   templateUrl: './order-list.html',
//   styleUrls: ['./order-list.css']
// })
// export class OrderList implements OnInit, OnDestroy {
//   orders: Order[] = [];
//   loading = true;
//   error = '';
//   currentPage = 0;
//   pageSize = 10;
//   totalPages = 0;
//   totalElements = 0;
//   OrderStatus = OrderStatus;
//   userProfile: UserProfile | null = null;
//   profileLoading = true;
//   private destroy$ = new Subject<void>();
//
//   constructor(
//     private orderService: OrderService,
//     private authService: AuthService,
//     private userService: UserService,
//     private router: Router
//   ) {}
//
//   ngOnInit(): void {
//     console.log('OrderList: Component initialized');
//     this.loadUserProfile();
//   }
//
//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }
//
//   private loadUserProfile(): void {
//     console.log('Order list component: Loading user profile...');
//     this.profileLoading = true;
//
//     this.userService.userProfile$
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(profile => {
//         console.log('Order list component: Profile from observable:', profile);
//         const userId = profile?.id || profile?.userId;
//         if (userId) {
//           console.log('User ID to load orders:', userId); // Debug logging
//           this.loadOrders(0, userId);
//         }
//         this.profileLoading = false;
//       });
//   }
//
//   loadOrders(page: number, userId?: number): void {
//     console.log('Attempting to load orders with userId:', userId);
//
//     if (!userId) {
//       this.error = 'User not authenticated';
//       this.loading = false;
//       return;
//     }
//
//     this.loading = true;
//     this.error = '';
//
//     this.orderService.getUserOrders(userId, page, this.pageSize)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (response) => {
//           console.log('Orders loaded successfully:', response);
//           this.orders = response.content;
//           this.currentPage = response.number;
//           this.totalPages = response.totalPages;
//           this.totalElements = response.totalElements;
//           this.loading = false;
//         },
//         error: (err) => {
//           console.error('Error loading orders:', err);
//           this.error = 'Failed to load orders. Please try again.';
//           this.loading = false;
//         }
//       });
//   }
//
//   viewOrderDetails(orderId: number): void {
//     console.log('OrderList: Navigating to order details:', orderId);
//     this.router.navigate(['/orders/details', orderId]);
//   }
//
//   cancelOrder(orderId: number, event: Event): void {
//     event.stopPropagation();
//
//     if (confirm('Are you sure you want to cancel this order?')) {
//       console.log('OrderList: Cancelling order:', orderId);
//
//       this.orderService.cancelOrder(orderId)
//         .pipe(takeUntil(this.destroy$))
//         .subscribe({
//           next: (response) => {
//             console.log('OrderList: Order cancelled successfully:', response);
//
//             // Update the order status locally
//             const order = this.orders.find(o => o.orderId === orderId);
//             if (order) {
//               order.status = OrderStatus.CANCELLED;
//             }
//
//             // Show success message
//             if (typeof response === 'string' && response.includes('successfully')) {
//               alert('Order cancelled successfully!');
//             }
//           },
//           error: (err) => {
//             console.error('OrderList: Error cancelling order:', err);
//             alert('Failed to cancel order. Please try again.');
//           }
//         });
//     }
//   }
//
//   goToPage(page: number): void {
//     if (page >= 0 && page < this.totalPages && this.userProfile?.id) {
//       console.log('OrderList: Going to page:', page);
//       this.loadOrders(page, this.userProfile.id);
//     }
//   }
//
//   // Helper method to get number of items in an order
//   getItemCount(order: Order): number {
//     return order.items ? order.items.length : 0;
//   }
//
//   // Helper method to format total price
//   formatPrice(price: number): string {
//     return price ? price.toFixed(2) : '0.00';
//   }
//
//   getStatusClass(status: OrderStatus): string {
//     switch (status) {
//       case OrderStatus.PENDING:
//         return 'status-pending';
//       case OrderStatus.ACCEPTED:
//         return 'status-accepted';
//       case OrderStatus.CANCELLED:
//         return 'status-cancelled';
//       default:
//         return '';
//     }
//   }
//
//   // Method to refresh orders
//   refreshOrders(): void {
//     if (this.userProfile?.id) {
//       this.loadOrders(this.currentPage, this.userProfile.id);
//     }
//   }
//
//   // TrackBy function for better performance
//   trackByOrderId(index: number, order: Order): number {
//     return order.orderId;
//   }
// }


import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../core/services/order';
import { Order, Page, OrderStatus } from '../../shared/order-models';
import { UserService } from '../../core/services/user';

@Component({
  standalone: false,
  selector: 'app-order-list',
  templateUrl: './order-list.html',
  styleUrls: ['./order-list.css']
})
export class OrderList implements OnInit {
  orders: Order[] = [];
  totalPages = 0;
  totalElements = 0;
  currentPage = 0;
  profileLoading = true;
  loading = true;
  error = '';
  OrderStatus = OrderStatus; // Enum to use in template

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  // Load orders based on the user's profile
  private loadOrders(): void {
    this.profileLoading = true;

    // Wait for user profile to load
    this.userService.userProfile$.subscribe({
      next: (profile) => {
        if (!profile?.userId) {
          this.error = 'You must be logged in to view your orders.';
          this.profileLoading = false;
          return;
        }

        this.profileLoading = false;
        this.loading = true;

        // Fetch user orders
        this.orderService.getUserOrders(profile.userId, this.currentPage).subscribe({
          next: (page: Page<Order>) => {
            this.orders = page.content;
            this.totalPages = page.totalPages;
            this.totalElements = page.totalElements;
            this.loading = false;
          },
          error: (err) => {
            console.error('Error loading orders:', err);
            this.error = 'Failed to load orders. Please try again.';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error loading user profile:', err);
        this.error = 'Failed to load user profile.';
        this.profileLoading = false;
      }
    });
  }

  // Navigate to order details page
  viewOrderDetails(orderId: number): void {
    this.router.navigate([`/orders/details/${orderId}`]);
  }

  // Cancel an order
  cancelOrder(orderId: number, event: Event): void {
    event.stopPropagation(); // Prevent triggering other events
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: () => {
          alert('Order cancelled successfully.');
          this.loadOrders(); // Refresh orders after cancellation
        },
        error: (err) => {
          console.error('Error cancelling order:', err);
          alert('Failed to cancel the order. Please try again.');
        }
      });
    }
  }

  // Display order item count
  getItemCount(order: Order): number {
    return order.items.reduce((count, item) => count + item.quantity, 0);
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'status-pending';
      case OrderStatus.ACCEPTED:
        return 'status-accepted';
      case OrderStatus.CANCELLED:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  // Go to specific page in pagination
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadOrders();
    }
  }

  // Format price
  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  // Track orders by id for better performance
  trackByOrderId(index: number, order: Order): number {
    return order.orderId;
  }

  // Reload orders on error while preserving pagination state
  refreshOrders(): void {
    this.loadOrders();
  }
}
