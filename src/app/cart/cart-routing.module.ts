import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Cart } from './cart/cart';
import { Checkout } from './checkout/checkout';

const routes: Routes = [
  { path: '', component: Cart },
  { path: 'checkout', component: Checkout }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CartRoutingModule { }