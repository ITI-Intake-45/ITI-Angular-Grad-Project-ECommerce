import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { UserRoutingModule } from './user-routing.module';
import { OrdersModule } from '../orders/orders-module';

// Components
import { Profile } from './profile/profile';
import { EditProfile } from './edit-profile/edit-profile';
import { ChangePassword } from './change-password/change-password';
import { CreditBalance } from './credit-balance/credit-balance';
import { DashboardSidebar } from './dashboard-sidebar/dashboard-sidebar';
import { UserLayoutComponent } from './user-layout/user-layout'; // Add this

@NgModule({
  declarations: [
    Profile,
    EditProfile,
    ChangePassword,
    CreditBalance,
    DashboardSidebar,
    UserLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    UserRoutingModule,
    OrdersModule
  ],
  exports: [
    DashboardSidebar,
    UserLayoutComponent
  ]
})
export class UserModule { }
