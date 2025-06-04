import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductCategory, Page } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/v1'; // Direct URL (no proxy for now)

  constructor(private http: HttpClient) {}

  getCategories(): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(`${this.apiUrl}/categories`, { withCredentials: true });
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

}