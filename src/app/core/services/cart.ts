import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of, Subject, forkJoin } from 'rxjs';
import { catchError, tap, map, switchMap, debounceTime } from 'rxjs/operators';
import { AuthService } from './auth';
import { ProductService } from './product';

// Interfaces aligned with backend DTOs
export interface CartItemDTO {
  cartItemId: number;
  productId: number;
  quantity: number;
  productName: string;
  price: number;
  image: string;
  subtotal?: number;
}

export interface CartDTO {
  userId: number;
  cartId: number;
  cartItems: CartItemDTO[];
  totalPrice: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly API_BASE_URL = 'http://localhost:8080/api/v1/carts';
  private readonly CART_STORAGE_KEY = 'cart';
  private cartSubject = new BehaviorSubject<CartDTO>({ userId: 0, cartId: 0, cartItems: [], totalPrice: 0 });
  public cart$ = this.cartSubject.asObservable();
  private cartUpdateSubject = new Subject<CartDTO>();
  private inMemoryCart: CartDTO = { userId: 0, cartId: 0, cartItems: [], totalPrice: 0 };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private productService: ProductService
  ) {
    this.cartUpdateSubject.pipe(debounceTime(300)).subscribe(cart => {
      this.saveCartToLocalStorage(cart);
      this.cartSubject.next(cart);
    });
    this.initializeCart();
  }

  private getHttpOptions() {
    const authToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
    });
    return {
      headers,
      withCredentials: true
    };
  }

  private initializeCart(): void {
    if (this.authService.isAuthenticated()) {
      this.getCart().subscribe({
        next: cart => {
          this.cartUpdateSubject.next(cart);
        },
        error: err => {
          console.error('CartService: Failed to initialize server cart:', err.status, err.message, err.error);
          this.cartUpdateSubject.next(this.getCartFromLocalStorage());
        }
      });
    } else {
      this.cartUpdateSubject.next(this.getCartFromLocalStorage());
    }
  }

  getCart(): Observable<CartDTO> {
    return this.http.get<CartDTO>(`${this.API_BASE_URL}`, this.getHttpOptions()).pipe(
      tap(cart => {
        this.validateCart(cart);
        this.recalculateCart(cart);
        this.cartUpdateSubject.next(cart);
      }),
      catchError(error => {
        console.error('CartService: Error fetching server cart:', error.status, error.message, error.error);
        if (error.status === 401) {
          const localCart = this.getCartFromLocalStorage();
          this.cartUpdateSubject.next(localCart);
          return of(localCart);
        }
        return throwError(() => error);
      })
    );
  }

  addToCart(productId: number, quantity: number = 1): Observable<CartDTO> {
    if (this.authService.isAuthenticated()) {
      const request: AddToCartRequest = { productId, quantity };
      return this.http.post<CartDTO>(`${this.API_BASE_URL}/add`, request, this.getHttpOptions()).pipe(
        switchMap(cart => this.handleNullImages(cart)),
        catchError(error => this.handleCartError(error, () => this.addToLocalCart(productId, quantity)))
      );
    }
    return this.addToLocalCart(productId, quantity);
  }

  removeFromCart(productId: number): Observable<CartDTO> {
    if (this.authService.isAuthenticated()) {
      return this.http.delete<CartDTO>(`${this.API_BASE_URL}/remove/${productId}`, this.getHttpOptions()).pipe(
        switchMap(cart => this.handleNullImages(cart)),
        catchError(error => this.handleCartError(error, () => this.removeFromLocalCart(productId)))
      );
    }
    return this.removeFromLocalCart(productId);
  }

  updateCartItem(productId: number, quantity: number): Observable<CartDTO> {
    if (this.authService.isAuthenticated()) {
      return this.http.put<CartDTO>(`${this.API_BASE_URL}/update/${productId}?quantity=${quantity}`, {}, this.getHttpOptions()).pipe(
        switchMap(cart => {
          if (!cart || !cart.cartItems) {
            console.warn('CartService: Invalid server cart response, preserving local cart');
            const currentCart = this.getCurrentCart();
            return of(currentCart);
          }
          return this.handleNullImages(cart);
        }),
        catchError(error => this.handleCartError(error, () => this.updateLocalCartItem(productId, quantity)))
      );
    }
    return this.updateLocalCartItem(productId, quantity);
  }

  canProceedToCheckout(): Observable<boolean> {
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('User must be logged in to proceed to checkout'));
    }
    if (this.getCurrentCart().cartItems.length === 0) {
      return throwError(() => new Error('Cart is empty'));
    }
    return of(true);
  }

  getCartForUser(cartId: number): Observable<CartDTO> {
    return this.http.get<CartDTO>(`${this.API_BASE_URL}/${cartId}`, this.getHttpOptions()).pipe(
      catchError(error => {
        console.error('CartService: Error fetching cart for cartId:', error.status, error.message, error.error);
        return throwError(() => error);
      })
    );
  }

  syncCartWithServer(): Observable<CartDTO> {
    if (!this.isUserAuthenticated()) {
      const localCart = this.getCartFromLocalStorage();
      return of(localCart);
    }
    const localCart = this.getCartFromLocalStorage();
    if (localCart.cartItems.length === 0) {
      return this.getCart();
    }

    return this.getCart().pipe(
      switchMap(serverCart => {
        const syncOperations: Observable<CartDTO>[] = [];
        localCart.cartItems.forEach(localItem => {
          const serverItem = serverCart.cartItems.find(item => item.productId === localItem.productId);
          const totalQuantity = serverItem ? serverItem.quantity + localItem.quantity : localItem.quantity;

          if (serverItem) {
            syncOperations.push(
              this.http.put<CartDTO>(
                `${this.API_BASE_URL}/update/${localItem.productId}?quantity=${totalQuantity}`,
                {},
                this.getHttpOptions()
              )
            );
          } else {
            const request: AddToCartRequest = { productId: localItem.productId, quantity: localItem.quantity };
            syncOperations.push(
              this.http.post<CartDTO>(`${this.API_BASE_URL}/add`, request, this.getHttpOptions())
            );
          }
        });

        return syncOperations.length > 0
          ? forkJoin(syncOperations).pipe(
              switchMap(() => this.saveCartToDatabase()),
              tap(cart => {
                this.recalculateCart(cart);
                this.cartUpdateSubject.next(cart);
                localStorage.removeItem(this.CART_STORAGE_KEY);
              })
            )
          : this.saveCartToDatabase().pipe(
              tap(cart => {
                this.recalculateCart(cart);
                this.cartUpdateSubject.next(cart);
                localStorage.removeItem(this.CART_STORAGE_KEY);
              })
            );
      }),
      catchError(error => {
        console.error('CartService: Sync error:', error.status, error.message, error.error);
        const localCart = this.getCartFromLocalStorage();
        return of(localCart);
      })
    );
  }

  saveCartToDatabase(): Observable<CartDTO> {
    if (!this.authService.isAuthenticated()) {
      const localCart = this.getCartFromLocalStorage();
      return of(localCart);
    }
    return this.http.post<CartDTO>(`${this.API_BASE_URL}/save`, {}, this.getHttpOptions()).pipe(
      tap(cart => {
        this.recalculateCart(cart);
        this.cartUpdateSubject.next(cart);
      }),
      switchMap(cart => this.handleNullImages(cart)),
      catchError(error => {
        console.error('CartService: Save to database error:', error.status, error.message, error.error);
        const localCart = this.getCartFromLocalStorage();
        return of(localCart);
      })
    );
  }

  handleCartOnLogout(): Observable<void> {
    if (this.authService.isAuthenticated()) {
      return this.saveCartToDatabase().pipe(
        tap(() => {
          this.clearCart();
        }),
        map(() => void 0),
        catchError(error => {
          console.error('CartService: Logout save error:', error.status, error.message, error.error);
          this.clearCart();
          return of(void 0);
        })
      );
    }
    this.clearCart();
    return of(void 0);
  }

  clearCartAfterCheckout(): Observable<void> {
    if (!this.authService.isAuthenticated()) {
      this.clearCart();
      console.log("clear cart..")
      return of(void 0);
    }
    return this.http.post<void>(`${this.API_BASE_URL}/clear`, {}, this.getHttpOptions()).pipe(
      tap(() => {
        this.clearCart();
      }),
      catchError(error => {
        console.error('CartService: Error clearing server cart:', error.status, error.message, error.error);
        this.clearCart();
        return of(void 0);
      })
    );
  }

  isUserAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  getCurrentCart(): CartDTO {
    return this.cartSubject.value;
  }

  getCartItemCount(): number {
    return this.getCurrentCart().cartItems.length;
  }

  getCartTotal(): number {
    return this.getCurrentCart().totalPrice;
  }

  isCartEmpty(): boolean {
    return this.getCurrentCart().cartItems.length === 0;
  }

  clearCart(): void {
    const emptyCart: CartDTO = { userId: 0, cartId: 0, cartItems: [], totalPrice: 0 };
    this.cartUpdateSubject.next(emptyCart);
    localStorage.removeItem(this.CART_STORAGE_KEY);
  }

  private handleNullImages(cart: CartDTO): Observable<CartDTO> {
    const itemsWithNullImage = cart.cartItems.filter(item => !item.image);
    if (itemsWithNullImage.length === 0) {
      this.validateCart(cart);
      this.recalculateCart(cart);
      this.cartUpdateSubject.next(cart);
      return of(cart);
    }
    const productObservables = itemsWithNullImage.map(item =>
      this.productService.getProductById(item.productId.toString()).pipe(
        map(product => ({ ...item, image: product.image || 'default.jpg' })),
        catchError(err => {
          console.error(`CartService: Error fetching image for product ${item.productId}:`, err);
          return of({ ...item, image: 'default.jpg' });
        })
      )
    );
    return forkJoin(productObservables).pipe(
      map(updatedItems => {
        const updatedCart = { ...cart };
        updatedItems.forEach(updatedItem => {
          const index = updatedCart.cartItems.findIndex(item => item.productId === updatedItem.productId);
          if (index > -1) {
            updatedCart.cartItems[index] = updatedItem;
          }
        });
        this.validateCart(updatedCart);
        this.recalculateCart(updatedCart);
        this.cartUpdateSubject.next(updatedCart);
        return updatedCart;
      })
    );
  }

  private handleCartError(error: any, fallback: () => Observable<CartDTO>): Observable<CartDTO> {
    console.error('CartService: Operation error:', {
      status: error.status,
      message: error.message,
      error: error.error || 'No error details'
    });
    return fallback();
  }

  private addToLocalCart(productId: number, quantity: number): Observable<CartDTO> {
    return this.productService.getProductById(productId.toString()).pipe(
      switchMap(product => {
        const currentCart = this.getCartFromLocalStorage();
        const existingItemIndex = currentCart.cartItems.findIndex(item => item.productId === productId);
        if (existingItemIndex > -1) {
          currentCart.cartItems[existingItemIndex].quantity += quantity;
        } else {
          currentCart.cartItems.push({
            cartItemId: 0,
            productId,
            quantity,
            productName: product.name || 'Unknown Product',
            price: product.price || 0,
            image: product.image || 'default.jpg'
          });
        }
        this.recalculateCart(currentCart);
        this.cartUpdateSubject.next(currentCart);
        return of(currentCart);
      }),
      catchError(error => {
        console.error('CartService: Error fetching product details:', error);
        return throwError(() => error);
      })
    );
  }

  private removeFromLocalCart(productId: number): Observable<CartDTO> {
    const currentCart = this.getCartFromLocalStorage();
    currentCart.cartItems = currentCart.cartItems.filter(item => item.productId !== productId);
    this.recalculateCart(currentCart);
    this.cartUpdateSubject.next(currentCart);
    return of(currentCart);
  }

  private updateLocalCartItem(productId: number, quantity: number): Observable<CartDTO> {
    const currentCart = this.getCartFromLocalStorage();
    const existingItemIndex = currentCart.cartItems.findIndex(item => item.productId === productId);
    if (existingItemIndex > -1) {
      if (quantity <= 0) {
        currentCart.cartItems.splice(existingItemIndex, 1);
      } else {
        currentCart.cartItems[existingItemIndex].quantity = quantity;
      }
    }
    this.recalculateCart(currentCart);
    this.cartUpdateSubject.next(currentCart);
    return of(currentCart);
  }

  private getCartFromLocalStorage(): CartDTO {
    try {
      const cartData = localStorage.getItem(this.CART_STORAGE_KEY);
      if (cartData) {
        const cart = JSON.parse(cartData);
        this.validateCart(cart);
        return cart;
      }
    } catch (error) {
      console.error('CartService: Error reading localStorage:', error);
      return this.inMemoryCart;
    }
    return { userId: 0, cartId: 0, cartItems: [], totalPrice: 0 };
  }

  private saveCartToLocalStorage(cart: CartDTO): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('CartService: Error saving to localStorage:', error);
      this.inMemoryCart = cart;
    }
  }

  private recalculateCart(cart: CartDTO): void {
    cart.totalPrice = cart.cartItems.reduce((total, item) => {
      if (item.price == null || item.productName == null) {
        throw new Error(`Invalid cart item: productId ${item.productId} missing price or name`);
      }
      item.subtotal = item.price * item.quantity;
      return total + item.subtotal;
    }, 0);
  }

  private validateCart(cart: CartDTO): void {
    if (!cart.cartItems) {
      cart.cartItems = [];
    }
    cart.cartItems.forEach(item => {
      if (item.price == null || item.productName == null) {
        throw new Error(`Invalid cart item: productId ${item.productId} missing price or name`);
      }
    });
  }
}