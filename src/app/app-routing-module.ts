import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './home/home';
import { NotFound } from './not-found/not-found';
import { AuthGuard } from './core/guards/auth-guard';
import { AdminGuard } from './core/guards/admin-guard';
import { Slider } from './layout/slider/slider';


const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Slider },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: 'products',
    loadChildren: () => import('./products/products-module').then(m => m.ProductsModule)
  },
  {
    path: 'user',
    loadChildren: () => import('./user/user-module').then(m => m.UserModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'cart',
    loadChildren: () => import('./cart/cart-module').then(m => m.CartModule)
  },
  {
    path: 'orders',
    loadChildren: () => import('./orders/orders-module').then(m => m.OrdersModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin-module').then(m => m.AdminModule),
    canActivate: [AdminGuard]
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-module').then(m => m.AuthModule)
  },

  { path: '404', component: NotFound },
  { path: '**', redirectTo: '/404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
