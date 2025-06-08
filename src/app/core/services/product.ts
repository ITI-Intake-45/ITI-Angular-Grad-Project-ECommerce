import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductCategory, Page } from '../../shared/product-model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/v1'; // Direct URL (no proxy for now)

  constructor(private http: HttpClient) {}

  getCategories(): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(`${this.apiUrl}/categories`, { withCredentials: true });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`, { withCredentials: true });
  }

  getProductsByCategoryId(categoryId: number): Observable<Product[]> {
  return this.http.get<Product[]>(`${this.apiUrl}/products/category/${categoryId}`, { withCredentials: true });
  }




  getFilteredProducts(
  name: string | null,
  category: string | null,
  minPrice: number | null, // ← added
  maxPrice: number | null,
  sortDir: string,
  page: number,
  size: number
): Observable<Page<Product>> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString())
    .set('sortDir', sortDir);

  if (name) params = params.set('name', name);
  if (category) params = params.set('category', category);
  if (minPrice !== null) params = params.set('minPrice', minPrice.toString()); // ← added
  if (maxPrice !== null) params = params.set('maxPrice', maxPrice.toString());

  return this.http.get<Page<Product>>(`${this.apiUrl}/products/filter`, {
    params,
    withCredentials: true
  });
}

createProduct(formData: FormData): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, formData, { withCredentials: true });
  }

// addToCart(product: any) {
//     const existingItem = this.cartItems.find(item => item.id === product.id);
//     if (existingItem) {
//       existingItem.quantity++;
//     } else {
//       this.cartItems.push({ ...product, quantity: 1 });
//     }
//     this.saveCartToStorage();
//     this.cartSubject.next([...this.cartItems]);
//   }

//   removeFromCart(id: number) {
//     this.cartItems = this.cartItems.filter(item => item.id !== id);
//     this.saveCartToStorage();
//     this.cartSubject.next([...this.cartItems]);
//   }

//   updateQuantity(id: number, quantity: number) {
//     const item = this.cartItems.find(item => item.id === id);
//     if (item && quantity > 0) { // Ensure quantity is positive
//       item.quantity = quantity;
//       this.saveCartToStorage();
//       this.cartSubject.next([...this.cartItems]);
//     }
//   }

//   clearCart() {
//     this.cartItems = [];
//     this.saveCartToStorage();
//     this.cartSubject.next([]);
//   }

//   private saveCartToStorage() {
//     try {
//       localStorage.setItem('cart', JSON.stringify(this.cartItems));
//     } catch (error) {
//       console.error('Error saving cart to localStorage:', error);
//     }
//   }

//   private loadCartFromStorage() {
//     try {
//       const cart = localStorage.getItem('cart');
//       if (cart) {
//         this.cartItems = JSON.parse(cart);
//         this.cartSubject.next([...this.cartItems]); // Emit the loaded cart
//       }
//     } catch (error) {
//       console.error('Error loading cart from localStorage:', error);
//       this.cartItems = [];
//       this.cartSubject.next([]);
//     }
//   }

//   getCartItemCount() {
//     return this.cartItems.reduce((total, item) => total + item.quantity, 0);
//   }

//   getCartTotal() {
//     return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
//   }




}
