import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductList } from './product-list/product-list';
import { ProductCard } from './product-card/product-card';
import { ProductFilter } from './product-filter/product-filter';
import { ProductsRoutingModule } from './products-routing.module';
import { SharedModule } from '../shared/shared-module'; // Import SharedModule

@NgModule({
  declarations: [
    ProductList,
    ProductCard,
    ProductFilter
  ],
  imports: [
    CommonModule,
    FormsModule,
    ProductsRoutingModule,
    SharedModule // Include SharedModule to use Pagination
  ],
  exports: [
    ProductList
  ]
})
export class ProductsModule {}