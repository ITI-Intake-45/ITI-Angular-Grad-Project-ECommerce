import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected title = 'ITI-Angular-Grad-Project-ECommerce';
  showLayout = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;

        const fullScreenRoutes = [
          '/auth/login',
          '/auth/register',
          '/auth/forgot-password',
          '/auth/verify-otp',
          '/auth/reset-password'
        ];

        this.showLayout = !fullScreenRoutes.includes(url);
      });
  }
}
