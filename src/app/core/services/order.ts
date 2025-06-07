import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface OrderDto {
  orderId: number;
  userId: number;
  status: string;  // ← Changed from 'orderStatus' to 'status' to match backend
  email?: string;
  totalPrice: number;  // ← Changed from 'totalAmount' to 'totalPrice' to match backend
  items?: any[];
  shippingAddress?: any;
}

export interface OrderPage {
  content: OrderDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
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
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/v1/orders';

  constructor(private http: HttpClient) { }

  // Create/Place order
  createOrder(userId: number): Observable<string> {
    return this.http.post(`${this.apiUrl}/${userId}`, {}, {
      withCredentials: true,
      responseType: 'text'
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Get ALL user orders without pagination
  getUserOrders(userId: number): Observable<OrderDto[]> {
    console.log('📦 OrderService: Fetching ALL user orders for userId:', userId);

    return this.http.get<OrderPage>(`${this.apiUrl}/user/${userId}?page=0&size=10000`, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      map(response => {
        console.log('📦 OrderService: User orders response:', response);
        console.log('📦 OrderService: Orders content:', response.content);
        return response.content || [];
      }),
      catchError(this.handleError)
    );
  }

  // Get all orders (admin only)
  getAllOrders(page: number = 0, size: number = 100): Observable<OrderPage> {
    return this.http.get<OrderPage>(`${this.apiUrl}?page=${page}&size=${size}`, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Get specific order by ID
  getOrder(orderId: number): Observable<OrderDto> {
    return this.http.get<OrderDto>(`${this.apiUrl}/${orderId}`, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Get specific order for a user
  getOrderForUser(userId: number, orderId: number): Observable<OrderDto> {
    return this.http.get<OrderDto>(`${this.apiUrl}/user/${userId}/${orderId}`, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Cancel order (admin only)
  cancelOrder(orderId: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/${orderId}/cancel`, {}, {
      withCredentials: true,
      responseType: 'text'
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Get user order statistics
  getUserOrderStatistics(userId: number): Observable<OrderStatistics> {
    console.log('📊 OrderService: Fetching user order statistics for userId:', userId);

    return this.getUserOrders(userId).pipe(
      map(orders => {
        console.log('📊 OrderService: Calculating statistics from orders:', orders);
        return this.calculateOrderStatistics(orders);
      }),
      catchError(error => {
        console.error('📊 OrderService: Error fetching user order statistics:', error);
        return throwError(() => error);
      })
    );
  }

  // Get all order statistics (admin only)
  getOrderStatistics(): Observable<OrderStatistics> {
    return this.getAllOrders(0, 10000).pipe(
      map(orderPage => this.calculateOrderStatistics(orderPage.content)),
      catchError(this.handleError)
    );
  }

  // Calculate statistics from orders array - match exact backend status values
  private calculateOrderStatistics(orders: OrderDto[]): OrderStatistics {
    console.log('📊 OrderService: Calculating statistics for orders:', orders);

    const stats: OrderStatistics = {
      pending: 0,
      accepted: 0,
      cancelled: 0,
      total: 0
    };

    if (!orders || orders.length === 0) {
      console.log('📊 OrderService: No orders found, returning zero statistics');
      return stats;
    }

    // Count total orders
    stats.total = orders.length;

    // Count each status - backend sends uppercase values
    orders.forEach((order, index) => {
      const status = (order.status || '').toUpperCase().trim();  // Convert to uppercase to match backend

      console.log(`📊 OrderService: Order ${index + 1} - Original: "${order.status}", Normalized: "${status}"`);

      // Match the exact status values from your backend
      switch (status) {
        case 'PENDING':
          stats.pending++;
          console.log(`📊 OrderService: Order ${index + 1} -> PENDING`);
          break;

        case 'ACCEPTED':
          stats.accepted++;
          console.log(`📊 OrderService: Order ${index + 1} -> ACCEPTED`);
          break;

        case 'CANCELLED':
          stats.cancelled++;
          console.log(`📊 OrderService: Order ${index + 1} -> CANCELLED`);
          break;

        default:
          // Don't count unknown statuses in any category
          console.log(`📊 OrderService: Order ${index + 1} -> UNKNOWN STATUS "${order.status}" - not counted`);
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
