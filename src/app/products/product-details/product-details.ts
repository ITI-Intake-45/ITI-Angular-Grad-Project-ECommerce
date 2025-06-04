import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product';
import { Product } from '../../shared/models';

@Component({
  standalone:false,
  selector: 'app-product-details',
  templateUrl: './product-details.html',
  styleUrls: ['./product-details.css']
})
export class ProductDetails implements OnInit {
  product!: Product;
  relatedProducts: Product[] = [];
  loading = true;
  selectedQuantity = 1;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.errorMessage = 'No product ID provided.';
      this.loading = false;
      return;
    }

    this.productService.getProductById(idParam).subscribe({
      next: (prod) => {
        this.product = prod;
        this.loading = false;

        if (this.product?.category?.id != null) {
          this.productService
            .getProductsByCategoryId(this.product.category.id)
            .subscribe({
              next: (related) => {
                this.relatedProducts = related.filter(
                  p => p.productId !== this.product.productId
                );
              },
              error: (err) => {
                console.error('Error loading related products', err);
              }
            });
        }
      },
      error: (err) => {
        console.error('Error loading product', err);
        this.errorMessage = 'Could not load product. Please try again later.';
        this.loading = false;
      }
    });
  }

  onImageError(event: Event): void {
    const imgEl = event.target as HTMLImageElement;
    imgEl.src = 'https://via.placeholder.com/400?text=No+Image';
  }

  addToCart(): void {
    console.log(`Adding to cart: ${this.product.name} x ${this.selectedQuantity}`);
    // …your cart logic here…
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  onQuantityChange(delta: number): void {
    const newQty = this.selectedQuantity + delta;
    if (newQty >= 1 && newQty <= this.product.stock) {
      this.selectedQuantity = newQty;
    }
  }
}
