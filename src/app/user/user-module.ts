import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';

import { Profile } from './profile/profile';
import { EditProfile } from './edit-profile/edit-profile';
import { ChangePassword } from './change-password/change-password';
import { CreditBalance } from './credit-balance/credit-balance';
// import { DashboardSidebar } from './dashboard-sidebar/dashboard-sidebar';
import {OrdersModule} from '../orders/orders-module';


@NgModule({
  declarations: [
    Profile,
    EditProfile,
    ChangePassword,
    CreditBalance,

  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    OrdersModule,
  ],
})
export class UserModule { }
