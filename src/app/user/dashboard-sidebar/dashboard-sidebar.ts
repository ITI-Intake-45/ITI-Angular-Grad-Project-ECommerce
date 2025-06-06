import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { UserService, UserProfile } from '../../core/services/user';

interface DashboardLink {
  route: string;
  label: string;
  icon: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-dashboard-sidebar',
  templateUrl: './dashboard-sidebar.html',
  standalone: false,
  styleUrls: ['./dashboard-sidebar.css']
})
export class DashboardSidebar implements OnInit {
  userProfile: UserProfile | null = null;
  isLoading = true;

  dashboardLinks: DashboardLink[] = [
    {
      route: '/user/profile',
      label: 'Profile Info',
      icon: 'fas fa-user-circle'
    },
    {
      route: '/user/edit-profile',
      label: 'Edit Profile',
      icon: 'fas fa-user-edit'
    },
    {
      route: '/user/change-password',
      label: 'Change Password',
      icon: 'fas fa-lock'
    },
    {
      route: '/user/credit-balance',
      label: 'My Credit',
      icon: 'fas fa-credit-card'
    },
    {
      route: '/user/orders',
      label: 'My Orders',
      icon: 'fas fa-shopping-bag'
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.setActiveLink();
  }

  private loadUserProfile(): void {
    if (this.authService.isAuthenticated()) {
      this.userService.getProfile().subscribe({
        next: (profile) => {
          this.userProfile = profile;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  private setActiveLink(): void {
    const currentRoute = this.router.url;
    this.dashboardLinks.forEach(link => {
      link.isActive = currentRoute === link.route || currentRoute.startsWith(link.route + '/');
    });
  }

  onLinkClick(link: DashboardLink): void {
    // Remove active state from all links
    this.dashboardLinks.forEach(l => l.isActive = false);

    // Set active state for clicked link
    link.isActive = true;

    // Navigate to the route
    this.router.navigate([link.route]);
  }

  get userName(): string {
    return this.userProfile?.name || 'User';
  }

  get userEmail(): string {
    return this.userProfile?.email || '';
  }

  get creditBalance(): number {
    return this.userProfile?.creditBalance || 0;
  }
}
