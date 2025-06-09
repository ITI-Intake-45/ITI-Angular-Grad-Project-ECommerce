// Updated to match backend OrderDto exactly
export interface Order {
  orderId: number;
  userId: number;
  email: string;
  status: OrderStatus;
  totalPrice: number;
  items: OrderItem[];
}

export interface OrderItem {
  // Update to match your backend OrderItemDto structure
  productId: number;
  productName: string;
  itemPrice: number;
  quantity: number;
  subtotal: number;
  productImage?: string;
}

export interface CreateOrderRequest {
  items: OrderItemRequest[];
  totalPrice: number;
  shippingAddress: string;
  paymentMethod: string;
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface OrderStatistics {
  pending: number;
  accepted: number;
  cancelled: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  CANCELLED = 'CANCELLED'
}

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}
