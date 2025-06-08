import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './home/home';
import { NotFound } from './not-found/not-found';
import { AuthGuard } from './core/guards/auth-guard';
import { Slider } from './layout/slider/slider';
import { VerifyOtp } from './auth/verify-otp/verify-otp';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { ResetPassword } from './auth/reset-password/reset-password';


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
    path: 'auth',
    loadChildren: () => import('./auth/auth-module').then(m => m.AuthModule)
  },


  { path: 'forgot-password', component: ForgotPassword },
  { path: 'verify-otp', component: VerifyOtp },
  { path: 'reset-password', component: ResetPassword },


  { path: '404', component: NotFound },
  { path: '**', redirectTo: '/404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
