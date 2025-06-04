import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductList } from './product-list/product-list';
import { ProductCard } from './product-card/product-card';
import { ProductFilter } from './product-filter/product-filter';
import { ProductDetails } from './product-details/product-details';  // <-- import
import { ProductsRoutingModule } from './products-routing.module';
import { SharedModule } from '../shared/shared-module';

@NgModule({
  declarations: [
    ProductList,
    ProductCard,
    ProductFilter,
    ProductDetails        // <-- add here
  ],
  imports: [
    CommonModule,
    FormsModule,
    ProductsRoutingModule,
    SharedModule
  ],
  exports: [
    ProductList
  ]
})
export class ProductsModule {}
