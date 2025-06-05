
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Order {
  id: number;
  userId: number;
  items: any[];
  total: number;
  status: string;
  createdAt: Date;
  shippingAddress: any;
}

export interface CreateOrderRequest {
  items: any[];
  total: number;
  shippingAddress: any;
  paymentMethod: string;
}

export interface OrderStatistics {
  pending: number;
  accepted: number;
  cancelled: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/v1/orders';

  constructor(private http: HttpClient) { }

  createOrder(orderData: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, orderData);
  }

  getUserOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/user/1`);
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/admin`);
  }

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, { status });
  }

  // New method to get user order statistics
  getUserOrderStatistics(): Observable<OrderStatistics> {
    return this.getUserOrders().pipe(
      map(orders => this.calculateOrderStatistics(orders))
    );
  }

  // Method to get order statistics for admin
  getOrderStatistics(): Observable<OrderStatistics> {
    return this.getAllOrders().pipe(
      map(orders => this.calculateOrderStatistics(orders))
    );
  }

  // Helper method to calculate statistics from orders array
  private calculateOrderStatistics(orders: Order[]): OrderStatistics {
    const stats: OrderStatistics = {
      pending: 0,
      accepted: 0,
      cancelled: 0,
    };

    orders.forEach(order => {
      const status = order.status.toLowerCase();
      switch (status) {
        case 'pending':
          stats.pending++;
          break;
        case 'accepted':
          stats.accepted++;
          break;
        case 'cancelled':
          stats.cancelled++;
          break;
      }
    });

    return stats;
  }
}
