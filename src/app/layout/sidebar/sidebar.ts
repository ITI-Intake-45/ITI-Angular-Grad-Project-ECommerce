import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth'; // Adjust the path as needed

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  standalone: false,
})
export class Sidebar {
  isVisible = false;

  // Base navigation items that are always shown
  baseNavigationItems = [
    {
      icon: 'fas fa-home',
      label: 'Home',
      route: '/',
      color: '#3498db'
    },
    {
      icon: 'fas fa-store',
      label: 'Store',
      route: '/products',
      color: '#9b59b6'
    },
  ];

  // Items shown only for logged-in users
  authenticatedItems = [
    {
      icon: 'fas fa-shopping-cart',
      label: 'Cart',
      route: '/cart',
      color: '#f39c12'
    },
    {
      icon: 'fas fa-user',
      label: 'Profile',
      route: '/profile',
      color: '#34495e'
    },
    {
      icon: 'fas fa-sign-out-alt',
      label: 'Logout',
      route: '/logout',
      color: '#e67e22'
    },
  ];

  // Items shown only for non-logged-in users
  unauthenticatedItems = [
    {
      icon: 'fas fa-sign-in',
      label: 'Login',
      route: '/login',
      color: '#f39c12'
    },
    {
      icon: 'fas fa-user-plus',
      label: 'Register',
      route: '/register',
      color: '#f39c12'
    },
  ];

  // Calculate the final navigation items
  get navigationItems() {
    if (this.authService.isAuthenticated()) {
      return [...this.baseNavigationItems, ...this.authenticatedItems];
    } else {
      return [...this.baseNavigationItems, ...this.unauthenticatedItems];
    }
  }

  constructor(private authService: AuthService) {}

  toggleVisibility() {
    this.isVisible = !this.isVisible;
  }

  showNavigator() {
    this.isVisible = true;
  }

  hideNavigator() {
    this.isVisible = false;
  }
}
