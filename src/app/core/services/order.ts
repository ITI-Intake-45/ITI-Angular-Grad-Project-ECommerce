import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import {CreateOrderRequest, Order, OrderStatistics, OrderStatus, Page} from "../../shared/order-models";
import {catchError, map} from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/v1/orders';

  constructor(private http: HttpClient) {}

  // Create/Place order
  createOrder(userId: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/${userId}`, {}, {
    withCredentials: true,
    responseType: 'text' as 'json'
  }).pipe(
    catchError(this.handleBackendError)
  );
  }
  private handleBackendError(error: HttpErrorResponse): Observable<never> {
  console.error('Backend error:', error.error); // Will print the string message
  return throwError(() => new Error(error.error || 'Something went wrong'));
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

        default:
          // Don't count unknown statuses in any category
          break;
      }
    });

    console.log('📊 OrderService: Final statistics:', stats);
    return stats;
  }

  // Error handling
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('📦 OrderService error:', error);

    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          errorMessage = 'Authentication required. Please log in again.';
          break;
        case 403:
          errorMessage = 'Access denied. You don\'t have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'Orders not found.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = error.error?.message || `Server error: ${error.status}`;
          break;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
