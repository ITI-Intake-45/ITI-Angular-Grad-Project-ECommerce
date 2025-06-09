import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared-module';
import { AuthRoutingModule } from './auth-routing.module';

import { Login } from './login/login';
import { Register } from './register/register';
import { ForgotPassword } from './forgot-password/forgot-password';
import { ResetPassword } from './reset-password/reset-password';
import { VerifyOtp } from './verify-otp/verify-otp';
import {LayoutModule} from '../layout/layout-module';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    Login,
    Register,
    ForgotPassword,
    ResetPassword,
    VerifyOtp
  ],
  imports: [
    SharedModule,
    AuthRoutingModule,
    LayoutModule,
    FormsModule
  ]
  ,
  exports: [

  ]
})
export class AuthModule { }
