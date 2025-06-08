import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import {CreateOrderRequest, Order, OrderStatistics, OrderStatus, Page} from "../../shared/order-models";
import {map} from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/v1/orders';

  constructor(private http: HttpClient) {}

  createOrder(orderData: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, orderData);
  }

  getUserOrders(userId: number, page?: number, size?: number): Observable<Page<Order>> {
    let params = new HttpParams();

    if (page !== undefined) {
      params = params.set('page', page.toString());
    }
    if (size !== undefined) {
      params = params.set('size', size.toString());
    }

    console.log('OrderService: Making request to:', `${this.apiUrl}/user/${userId}`, 'with params:', params.toString());

    return this.http.get<Page<Order>>(`${this.apiUrl}/user/${userId}`, {
      params,
      withCredentials: true // Add this for session-based auth
    });
  }

  getOrder(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`, { withCredentials: true });
  }

  getOrderDetails(userId: number, orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/user/${userId}/${orderId}`, { withCredentials: true });
  }

  getAllOrders(page?: number, size?: number): Observable<Page<Order>> {
    let params = new HttpParams();

    if (page !== undefined) {
      params = params.set('page', page.toString());
    }
    if (size !== undefined) {
      params = params.set('size', size.toString());
    }

    return this.http.get<Page<Order>>(this.apiUrl, {
      params,
      withCredentials: true
    });
  }

  updateOrderStatus(orderId: number, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${orderId}/status`, { status }, { withCredentials: true });
  }

  cancelOrder(orderId: number): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/${orderId}/cancel`, null, {
      withCredentials: true,
      responseType: 'text' as 'json' // Backend returns string response
    });
  }

  getUserOrderStatistics(userId: number): Observable<OrderStatistics> {
    return this.getUserOrders(userId).pipe(
      map(page => this.calculateOrderStatistics(page.content))
    );
  }

  private calculateOrderStatistics(orders: Order[]): OrderStatistics {
    const stats: OrderStatistics = {
      pending: 0,
      accepted: 0,
      cancelled: 0
    };

    orders.forEach(order => {
      const status = order.status;
      switch (status) {
        case OrderStatus.PENDING:
          stats.pending++;
          break;
        case OrderStatus.ACCEPTED:
          stats.accepted++;
          break;
        case OrderStatus.CANCELLED:
          stats.cancelled++;
          break;
      }
    });

    return stats;
  }
}
