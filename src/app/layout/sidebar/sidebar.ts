
import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  standalone: false,
})
export class Sidebar {
  isVisible = false;

  navigationItems = [
    {
      icon: 'fas fa-home',
      label: 'Home',
      route: '/',
      color: '#3498db'
    },
    {
      icon: 'fas fa-leaf',
      label: 'Tea Beans',
      route: '/tea-beans',
      color: '#27ae60'
    },
    {
      icon: 'fas fa-coffee',
      label: 'Tea Mugs',
      route: '/tea-mugs',
      color: '#e67e22'
    },
    {
      icon: 'fas fa-cog',
      label: 'Machines',
      route: '/tea-machines',
      color: '#9b59b6'
    },
    {
      icon: 'fas fa-heart',
      label: 'Favorites',
      route: '/favorites',
      color: '#e74c3c'
    },
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
    }
  ];

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
