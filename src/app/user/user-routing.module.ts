import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Import from the layout directory
import { Profile } from './profile/profile';
import { EditProfile } from './edit-profile/edit-profile';
import { ChangePassword } from './change-password/change-password';
import { CreditBalance } from './credit-balance/credit-balance';
import {UserLayoutComponent} from './user-layout/user-layout';

const routes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    children: [
      { path: 'profile', component: Profile },
      { path: 'edit-profile', component: EditProfile },
      { path: 'change-password', component: ChangePassword },
      { path: 'credit-balance', component: CreditBalance },
      { path: '', redirectTo: 'profile', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
