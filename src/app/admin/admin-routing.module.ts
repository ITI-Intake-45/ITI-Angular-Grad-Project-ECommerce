import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminLogin } from './admin-login/admin-login';
import { Dashboard } from './dashboard/dashboard';
import { UserManagement } from './user-management/user-management';
import { OrderManagement } from './order-management/order-management';
import { ProductManagement } from './product-management/product-management';
import { CategoryManagement } from './category-management/category-management';
import { ProductForm } from './product-form/product-form';
import { CategoryForm } from './category-form/category-form';

const routes: Routes = [
  { path: 'login', component: AdminLogin },
  { path: 'dashboard', component: Dashboard },
  { path: 'users', component: UserManagement },
  { path: 'orders', component: OrderManagement },
  { 
    path: 'products', 
    component: ProductManagement 
  },
  { 
    path: 'products/add', 
    component: ProductForm 
  },
  { 
    path: 'products/edit/:id', 
    component: ProductForm 
  },
  { 
    path: 'categories', 
    component: CategoryManagement 
  },
  { 
    path: 'categories/add', 
    component: CategoryForm 
  },
  { 
    path: 'categories/edit/:id', 
    component: CategoryForm 
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }