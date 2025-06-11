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
    // event.stopPropagation(); // Prevent triggering other events
    // if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: () => {
          // alert('Order cancelled successfully.');
          this.loadOrders(); // Refresh orders after cancellation
        },
        error: (err) => {
          console.error('Error cancelling order:', err);
          alert('Failed to cancel the order. Please try again.');
        }
      });
    // }s
  }

    // accept an order
  acceptOrder(orderId: number, event: Event): void {
    event.stopPropagation(); // Prevent triggering other events
    if (confirm('Are you sure you want to accept this order?')) {
      this.orderService.acceptOrder(orderId).subscribe({
        next: () => {
          alert('Order accepted successfully.');
          this.loadOrders(); // Refresh orders after cancellation
        },
        error: (err) => {
          console.error('Error accepting order:', err);
          alert('Failed to accept the order. Please try again.');
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
