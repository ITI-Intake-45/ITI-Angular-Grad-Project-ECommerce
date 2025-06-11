import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../core/services/order';
import { UserService } from '../../core/services/user';
import { Order, OrderStatus, OrderItem } from '../../shared/order-models';

@Component({
  standalone: false,
  selector: 'app-order-details',
  templateUrl: './order-details.html',
  styleUrls: ['./order-details.css']
})
export class OrderDetails implements OnInit {
  order: Order | null = null;
  loading = true;
  error = '';
  OrderStatus = OrderStatus;
  updatingStatus = false; // Track status update operations

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadOrderDetails();
  }

  private loadOrderDetails(): void {
    this.loading = true;

    this.userService.userProfile$.subscribe({
      next: (profile) => {
        if (!profile?.userId) {
          this.error = 'You must be logged in to view order details.';
          this.loading = false;
          return;
        }

        const orderId = this.getOrderIdFromRoute();
        if (!orderId) {
          this.error = 'Invalid order ID';
          this.loading = false;
          return;
        }

        this.orderService.getOrderDetails(profile.userId, orderId).subscribe({
          next: (order) => {
            console.log(order);
            order.items.forEach(element => {
              console.log(element);
            });
            this.order = order;
            this.loading = false;
          },
          error: (err) => {
            console.error('Error fetching order details:', err);
            this.error = 'Failed to load order details. ' +
              (err.status === 404 ? 'Order not found.' : 'Please try again.');
            this.loading = false;
          }
        });
      },
      error: () => {
        this.error = 'Failed to retrieve user profile. Please try again.';
        this.loading = false;
      }
    });
  }

  private getOrderIdFromRoute(): number | null {
    const orderId = this.route.snapshot.paramMap.get('id');
    return orderId ? parseInt(orderId, 10) : null;
  }

  

  cancelOrder(): void {
    if (!this.order || this.order.status !== OrderStatus.PENDING) {
      return;
    }

    // const confirmCancel = confirm('Are you sure you want to cancel this order?');
    // if (!confirmCancel) {
    //   return;
    // }

    this.updatingStatus = true;

    this.orderService.cancelOrder(this.order.orderId).subscribe({
      next: () => {
        if (this.order) {
          this.order.status = OrderStatus.CANCELLED;
        }
        this.updatingStatus = false;
        // alert('Order cancelled successfully.');
        
        // Navigate back to orders list with a flag to refresh statistics
        this.router.navigate(['user/orders'], { 
          queryParams: { refreshStats: 'true' }
        });
      },
      error: (err) => {
        console.error('Error cancelling order:', err);
        this.updatingStatus = false;
        alert('Failed to cancel order. Please try again.');
      }
    });
  }

  acceptOrder(): void {
    if (!this.order || this.order.status !== OrderStatus.PENDING) {
      return;
    }

    const confirmAccept = confirm('Are you sure you want to accept this order?');
    if (!confirmAccept) {
      return;
    }

    this.updatingStatus = true;

    this.orderService.acceptOrder(this.order.orderId).subscribe({
      next: () => {
        if (this.order) {
          this.order.status = OrderStatus.ACCEPTED;
        }
        this.updatingStatus = false;
        alert('Order accepted successfully.');
        
        // Navigate back to orders list with a flag to refresh statistics
        this.router.navigate(['user/orders'], { 
          queryParams: { refreshStats: 'true' }
        });
      },
      error: (err) => {
        console.error('Error accepting order:', err);
        this.updatingStatus = false;
        alert('Failed to accept order. Please try again.');
      }
    });
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

  goBack(): void {
    this.router.navigate(['user/orders']);
  }
}