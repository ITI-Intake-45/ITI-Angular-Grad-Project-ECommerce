import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderList } from './order-list/order-list';
import { OrderDetails } from './order-details/order-details';

const routes: Routes = [
  { path: '', component: OrderList },
  { path: 'details/:id', component: OrderDetails } // Add route for order details
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule {}
