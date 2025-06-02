import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared-module';
import { AdminRoutingModule } from './admin-routing.module';

import { AdminLogin } from './admin-login/admin-login';
import { Dashboard } from './dashboard/dashboard';
import { UserManagement } from './user-management/user-management';
import { OrderManagement } from './order-management/order-management';
import { ProductManagement } from './product-management/product-management';
import { CategoryManagement } from './category-management/category-management';
import { ProductForm } from './product-form/product-form';
import { CategoryForm } from './category-form/category-form';

@NgModule({
  declarations: [
    AdminLogin,
    Dashboard,
    UserManagement,
    OrderManagement,
    ProductManagement,
    CategoryManagement,
    ProductForm,
    CategoryForm
  ],
  imports: [
    SharedModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }