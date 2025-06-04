import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../core/services/product';
import { Product, ProductCategory } from '../../shared/models';

@Component({
  standalone:false,
  selector: 'app-admin-product-form',
  templateUrl: './product-form.html',
  styleUrls: ['./product-form.css']
})
export class ProductForm implements OnInit {
  product: Product = {
    productId: 0,
    name: '',
    description: '',
    price: 0,
    image: '',
    stock: 0,
    status: '',
    category: { id: 0, name: '' }
  };
  categories: ProductCategory[] = [];
  imageFile: File | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0];
    }
  }

  onSubmit() {
    if (this.imageFile) {
      const formData = new FormData();
      formData.append('product', new Blob([JSON.stringify(this.product)], { type: 'application/json' }));
      formData.append('image', this.imageFile);

      this.productService.createProduct(formData).subscribe(
        response => {
          console.log('Product created:', response);
        },
        error => {
          console.error('Error creating product:', error);
        }
      );
    }
  }
}