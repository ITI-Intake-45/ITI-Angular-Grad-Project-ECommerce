import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../core/services/order';
import { AuthService } from '../../core/services/auth';
import { Order, OrderStatus } from '../../shared/order-models';

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


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const orderId = parseInt(params.get('id') || '0', 10);
      if (orderId) {
        this.loadOrderDetails(orderId);
      } else {
        this.error = 'Invalid order ID';
        this.loading = false;
      }
    });
  }

  loadOrderDetails(orderId: number): void {
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.error = 'You must be logged in to view order details';
      this.loading = false;
      return;
    }

    this.orderService.getOrderDetails(user.userId, orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load order details. ' +
          (err.status === 404 ? 'Order not found.' : 'Please try again.');
        this.loading = false;
      }
    });
  }

  formatDate(dateString: string | Date): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }


  cancelOrder(): void {
    if (!this.order) return;
    const orderId = this.order.orderId || this.order.orderId;

    if (!orderId) {
      console.error('Cannot cancel order: Missing order ID');
      return;
    }

    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: () => {
          if (this.order) {
            this.order.status = OrderStatus.CANCELLED;
            this.order.status = OrderStatus.CANCELLED;
          }
        },
        error: (err) => {
          console.error('Error cancelling order:', err);
          alert('Failed to cancel order. ' +
            (err.error || 'Please try again later.'));
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }
}
