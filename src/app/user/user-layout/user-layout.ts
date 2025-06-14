import { Component } from '@angular/core';
import {UserModule} from '../user-module';
import {OrdersModule} from '../../orders/orders-module';
import {RouterOutlet} from '@angular/router';
import {DashboardSidebar} from '../dashboard-sidebar/dashboard-sidebar'

@Component({
  selector: 'app-user-layout',
  standalone: false,
  templateUrl: './user-layout.html',
  styleUrls: ['./user-layout.css'],
  // imports: [
  //   OrdersModule,
  //   RouterOutlet,
  //   UserModule,
  // ]
})
export class UserLayoutComponent { }
