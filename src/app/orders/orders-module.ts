import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared-module';
import { OrdersRoutingModule } from './orders-routing.module';

import { OrderList } from './order-list/order-list';
import { OrderDetails } from './order-details/order-details';
import { OrderStatus } from './order-status/order-status';
import { OrdersStatistics } from './orders-statistics/orders-statistics';

@NgModule({
  declarations: [
    OrderList,
    OrderDetails,
    OrderStatus,
    OrdersStatistics
  ],
  imports: [
    SharedModule,
    RouterModule,
    OrdersRoutingModule
  ],
  exports: [
    OrderList,
    OrderDetails,
    OrdersStatistics
  ]
})
export class OrdersModule { }
