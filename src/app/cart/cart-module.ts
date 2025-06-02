import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared-module';
import { CartRoutingModule } from './cart-routing.module';

import { Cart } from './cart/cart';
import { CartItem } from './cart-item/cart-item';
import { Checkout } from './checkout/checkout';
import { OrderSummary } from './order-summary/order-summary';
import { Payment } from './payment/payment';

@NgModule({
  declarations: [
    Cart,
    CartItem,
    Checkout,
    OrderSummary,
    Payment
  ],
  imports: [
    SharedModule,
    CartRoutingModule
  ]
})
export class CartModule { }