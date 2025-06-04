// import { NgModule } from '@angular/core';
// import { SharedModule } from '../shared/shared-module';
// import { ProductsRoutingModule } from './products-routing.module';

// import { ProductList } from './product-list/product-list';
// import { ProductCard } from './product-card/product-card';
// import { ProductDetails } from './product-details/product-details';
// import { ProductFilter } from './product-filter/product-filter';
// import { ProductCategory } from './product-category/product-category';

// @NgModule({
//   declarations: [
//     ProductList,
//     ProductCard,
//     ProductDetails,
//     ProductFilter,
//     ProductCategory
//   ],
//   imports: [
//     SharedModule,
//     ProductsRoutingModule
//   ],
//   exports: [
//     ProductCard // Export if needed in other modules
//   ]
// })
// export class ProductsModule { }


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