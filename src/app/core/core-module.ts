import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

// Services
import { AuthService } from './services/auth';
import { ProductService } from './services/product';
import { CartService } from './services/cart';
import { OrderService } from './services/order';
import { UserService } from './services/user';

// Guards
import { AuthGuard } from './guards/auth-guard';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    // Services
    AuthService,
    ProductService,
    CartService,
    OrderService,
    UserService,

    // Guards
    AuthGuard,

  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in AppModule only');
    }
  }
}
