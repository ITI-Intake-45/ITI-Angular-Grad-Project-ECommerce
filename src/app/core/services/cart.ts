import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of, Subject } from 'rxjs';
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
  subtotal?: number; // Calculated on frontend
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
  
  // BehaviorSubject to track cart state
  private cartSubject = new BehaviorSubject<CartDTO>({ userId: 0, cartId: 0, cartItems: [], totalPrice: 0 });
  public cart$ = this.cartSubject.asObservable();

  // Subject for debounced cart updates
  private cartUpdateSubject = new Subject<CartDTO>();

  // In-memory fallback for local storage failures
  private inMemoryCart: CartDTO = { userId: 0, cartId: 0, cartItems: [], totalPrice: 0 };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private productService: ProductService
  ) {
    // Debounce cart updates to reduce localStorage writes
    this.cartUpdateSubject.pipe(debounceTime(300)).subscribe(cart => {
      this.saveCartToLocalStorage(cart);
      this.cartSubject.next(cart);
    });
    this.initializeCart();
  }

  /**
   * Initializes the cart by fetching from server (authenticated users) or local storage (guests).
   */
  private initializeCart(): void {
    if (this.authService.isAuthenticated()) {
      this.getCart().subscribe({
        next: (cart) => {
          this.cartUpdateSubject.next(cart);
        },
        error: () => {
          this.cartUpdateSubject.next(this.getCartFromLocalStorage());
        }
      });
    } else {
      this.cartUpdateSubject.next(this.getCartFromLocalStorage());
    }
  }

  /**
   * Returns HTTP headers for API requests, including credentials for session management.
   */
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      withCredentials: true
    };
  }

  /**
   * Fetches the cart from the server for authenticated users.
   * @returns Observable emitting the server cart.
   */
  getCart(): Observable<CartDTO> {
    return this.http.get<CartDTO>(`${this.API_BASE_URL}`, this.getHttpOptions()).pipe(
      tap(cart => {
        this.validateCart(cart);
        this.recalculateCart(cart);
        this.cartUpdateSubject.next(cart);
      }),
      catchError(error => {
        if (error.status === 401) {
          const localCart = this.getCartFromLocalStorage();
          this.cartUpdateSubject.next(localCart);
          return of(localCart);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Adds an item to the cart, either via API (authenticated) or local storage (guest).
   * @param productId The ID of the product to add.
   * @param quantity The quantity to add (default: 1).
   * @returns Observable emitting the updated cart.
   */
  addToCart(productId: number, quantity: number = 1): Observable<CartDTO> {
    if (this.authService.isAuthenticated()) {
      const request: AddToCartRequest = { productId, quantity };
      return this.http.post<CartItemDTO>(`${this.API_BASE_URL}/add`, request, this.getHttpOptions()).pipe(
        map(newItem => {
          const currentCart = this.getCurrentCart();
          const existingItemIndex = currentCart.cartItems.findIndex(item => item.productId === productId);
          if (existingItemIndex > -1) {
            currentCart.cartItems[existingItemIndex].quantity += quantity;
          } else {
            currentCart.cartItems.push(newItem);
          }
          this.recalculateCart(currentCart);
          this.cartUpdateSubject.next(currentCart);
          return currentCart;
        }),
        catchError(error => {
          if (error.status === 401) {
            return this.addToLocalCart(productId, quantity);
          }
          return throwError(() => error);
        })
      );
    }
    return this.addToLocalCart(productId, quantity);
  }

  /**
   * Removes an item from the cart.
   * @param productId The ID of the product to remove.
   * @returns Observable emitting the updated cart.
   */
  removeFromCart(productId: number): Observable<CartDTO> {
    if (this.authService.isAuthenticated()) {
      return this.http.delete<CartDTO>(`${this.API_BASE_URL}/remove/${productId}`, this.getHttpOptions()).pipe(
        tap(cart => {
          this.recalculateCart(cart);
          this.cartUpdateSubject.next(cart);
        }),
        catchError(error => {
          if (error.status === 401) {
            return this.removeFromLocalCart(productId);
          }
          return throwError(() => error);
        })
      );
    }
    return this.removeFromLocalCart(productId);
  }

  /**
   * Updates the quantity of a cart item.
   * @param productId The ID of the product to update.
   * @param quantity The new quantity.
   * @returns Observable emitting the updated cart.
   */
  updateCartItem(productId: number, quantity: number): Observable<CartDTO> {
    if (this.authService.isAuthenticated()) {
      return this.http.put<CartDTO>(`${this.API_BASE_URL}/update/${productId}?quantity=${quantity}`, {}, this.getHttpOptions()).pipe(
        tap(cart => {
          this.recalculateCart(cart);
          this.cartUpdateSubject.next(cart);
        }),
        catchError(error => {
          if (error.status === 401) {
            return this.updateLocalCartItem(productId, quantity);
          }
          return throwError(() => error);
        })
      );
    }
    return this.updateLocalCartItem(productId, quantity);
  }

  /**
   * Checks if the user can proceed to checkout (must be authenticated).
   * @returns Observable emitting true if checkout is allowed, or an error if not.
   */
  canProceedToCheckout(): Observable<boolean> {
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('User must be logged in to proceed to checkout'));
    }
    return of(true);
  }

  /**
   * Fetches the cart for a specific user (admin function).
   * @param cartId The ID of the cart to fetch.
   * @returns Observable emitting the cart.
   */
  getCartForUser(cartId: number): Observable<CartDTO> {
    return this.http.get<CartDTO>(`${this.API_BASE_URL}/${cartId}`, this.getHttpOptions());
  }

  /**
   * Syncs the local cart with the server upon login.
   * @returns Observable emitting the synced cart.
   */
  syncCartWithServer(): Observable<CartDTO> {
    const localCart = this.getCartFromLocalStorage();
    if (localCart.cartItems.length === 0) {
      return this.getCart();
    }

    return this.getCart().pipe(
      switchMap(serverCart => {
        // Merge local and server carts
        const mergedItems = [...serverCart.cartItems];
        localCart.cartItems.forEach(localItem => {
          const existingItemIndex = mergedItems.findIndex(item => item.productId === localItem.productId);
          if (existingItemIndex > -1) {
            mergedItems[existingItemIndex].quantity += localItem.quantity;
          } else {
            mergedItems.push(localItem);
          }
        });

        return this.http.post<CartDTO>(
          `${this.API_BASE_URL}/sync`,
          { items: mergedItems.map(item => ({ productId: item.productId, quantity: item.quantity })) },
          this.getHttpOptions()
        ).pipe(
          tap(cart => {
            this.recalculateCart(cart);
            this.cartUpdateSubject.next(cart);
            localStorage.removeItem(this.CART_STORAGE_KEY);
          })
        );
      }),
      catchError(error => {
        console.error('Error syncing cart with server:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Checks if the user is authenticated.
   * @returns True if the user is authenticated.
   */
  isUserAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  /**
   * Gets the current cart state.
   * @returns The current cart.
   */
  getCurrentCart(): CartDTO {
    return this.cartSubject.value;
  }

  /**
   * Gets the total number of items in the cart.
   * @returns The total item count.
   */
  getCartItemCount(): number {
    return this.getCurrentCart().cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Gets the total price of the cart.
   * @returns The total price.
   */
  getCartTotal(): number {
    return this.getCurrentCart().totalPrice;
  }

  /**
   * Checks if the cart is empty.
   * @returns True if the cart is empty.
   */
  isCartEmpty(): boolean {
    return this.getCurrentCart().cartItems.length === 0;
  }

  /**
   * Clears the cart.
   */
  clearCart(): void {
    const emptyCart: CartDTO = { userId: 0, cartId: 0, cartItems: [], totalPrice: 0 };
    this.cartUpdateSubject.next(emptyCart);
    localStorage.removeItem(this.CART_STORAGE_KEY);
  }

  /**
   * Loads the cart from local storage or in-memory fallback.
   * @returns The local cart.
   */
  private getCartFromLocalStorage(): CartDTO {
    try {
      const cartData = localStorage.getItem(this.CART_STORAGE_KEY);
      if (cartData) {
        const cart = JSON.parse(cartData);
        this.validateCart(cart);
        return cart;
      }
    } catch (error) {
      console.error('Error reading cart from localStorage:', error);
      this.notifyUser('Unable to access local storage. Using temporary cart.');
      return this.inMemoryCart;
    }
    return { userId: 0, cartId: 0, cartItems: [], totalPrice: 0 };
  }

  /**
   * Saves the cart to local storage or in-memory fallback.
   * @param cart The cart to save.
   */
  private saveCartToLocalStorage(cart: CartDTO): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
      this.inMemoryCart = cart;
      this.notifyUser('Unable to save cart to local storage. Your cart is saved temporarily.');
    }
  }

  /**
   * Adds an item to the local cart for guest users.
   * @param productId The product ID.
   * @param quantity The quantity to add.
   * @returns Observable emitting the updated cart.
   */
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
            productName: product.name,
            price: product.price,
            image: product.image
          });
        }

        this.recalculateCart(currentCart);
        this.cartUpdateSubject.next(currentCart);
        return of(currentCart);
      }),
      catchError(error => {
        console.error('Error fetching product details:', error);
        this.notifyUser('Unable to fetch product details. Please try again.');
        return throwError(() => error);
      })
    );
  }

  /**
   * Removes an item from the local cart.
   * @param productId The product ID to remove.
   * @returns Observable emitting the updated cart.
   */
  private removeFromLocalCart(productId: number): Observable<CartDTO> {
    const currentCart = this.getCartFromLocalStorage();
    currentCart.cartItems = currentCart.cartItems.filter(item => item.productId !== productId);

    this.recalculateCart(currentCart);
    this.cartUpdateSubject.next(currentCart);
    return of(currentCart);
  }

  /**
   * Updates the quantity of an item in the local cart.
   * @param productId The product ID.
   * @param quantity The new quantity.
   * @returns Observable emitting the updated cart.
   */
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

  /**
   * Recalculates the cart's total price and item subtotals.
   * @param cart The cart to recalculate.
   */
  private recalculateCart(cart: CartDTO): void {
    cart.totalPrice = cart.cartItems.reduce((total, item) => {
      if (item.price == null || item.productName == null) {
        throw new Error(`Invalid cart item: productId ${item.productId} missing price or name`);
      }
      item.subtotal = item.price * item.quantity;
      return total + item.subtotal;
    }, 0);
  }

  /**
   * Validates the cart and its items.
   * @param cart The cart to validate.
   */
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

  /**
   * Notifies the user of an issue (e.g., via a toast service).
   * @param message The message to display.
   */
  private notifyUser(message: string): void {
    console.warn(message); // Replace with toast service in production
    // Example: this.toastr.error(message);
  }
}