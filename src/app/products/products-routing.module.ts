// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';

// import { ProductList } from './product-list/product-list';
// import { ProductDetails } from './product-details/product-details';
// import { ProductCategory } from './product-category/product-category';

// const routes: Routes = [
//   { path: '', component: ProductList },
//   { path: 'category/:id', component: ProductCategory },
//   { path: ':id', component: ProductDetails }
// ];

// @NgModule({
//   imports: [RouterModule.forChild(routes)],
//   exports: [RouterModule]
// })
// export class ProductsRoutingModule { }


import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductList} from './product-list/product-list';

const routes: Routes = [
  { path: '', component: ProductList }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule {}