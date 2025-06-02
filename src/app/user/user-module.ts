import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared-module';
import { UserRoutingModule } from './user-routing.module';

import { Profile } from './profile/profile';
import { EditProfile } from './edit-profile/edit-profile';
import { ChangePassword } from './change-password/change-password';
import { CreditBalance } from './credit-balance/credit-balance';

@NgModule({
  declarations: [
    Profile,
    EditProfile,
    ChangePassword,
    CreditBalance
  ],
  imports: [
    SharedModule,
    UserRoutingModule
  ]
})
export class UserModule { }