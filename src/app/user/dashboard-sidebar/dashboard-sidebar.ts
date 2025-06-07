import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { UserService, UserProfile } from '../../core/services/user';
import { DashboardCommunicationService } from '../../core/services/dashboard-communication-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
export class DashboardSidebar implements OnInit, OnDestroy {
  userProfile: UserProfile | null = null;
  isLoading = true;
  private destroy$ = new Subject<void>();

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
    private userService: UserService,
    private dashboardCommunicationService: DashboardCommunicationService
  ) {}

  ngOnInit(): void {
    this.subscribeToProfileUpdates();
    this.loadUserProfile();
    this.setActiveLink();
    this.listenForLinkActivations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Subscribe to real-time profile updates
  private subscribeToProfileUpdates(): void {
    this.userService.userProfile$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          console.log('🔄 Sidebar - Profile updated via subscription:', profile);
          this.userProfile = profile;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Sidebar - Error in profile subscription:', error);
          this.isLoading = false;
        }
      });
  }

  private loadUserProfile(): void {
    // DEBUG: Check authentication status
    const isAuthenticated = this.authService.isAuthenticated();
    console.log('📋 Sidebar - Is user authenticated?', isAuthenticated);

    // Only load if we don't already have a profile from the subscription
    if (!this.userProfile) {
      this.userService.getProfile().subscribe({
        next: (profile) => {
          console.log('📋 Sidebar - Profile loaded via getProfile:', profile);
          // Profile will be updated via the subscription above
        },
        error: (error) => {
          console.error('❌ Sidebar - Error loading user profile:', error);
          this.isLoading = false;
        }
      });
    }
  }

  private setActiveLink(): void {
    const currentRoute = this.router.url;
    this.dashboardLinks.forEach(link => {
      link.isActive = currentRoute === link.route || currentRoute.startsWith(link.route + '/');
    });
  }

  // Listen for external link activation requests
  private listenForLinkActivations(): void {
    this.dashboardCommunicationService.activateLink$
      .pipe(takeUntil(this.destroy$))
      .subscribe(route => {
        console.log('📋 Sidebar - Received activation request for route:', route);
        this.activateLinkByRoute(route);
      });
  }

  // Activate link by route (called from external components)
  private activateLinkByRoute(route: string): void {
    // Remove active state from all links
    this.dashboardLinks.forEach(l => l.isActive = false);

    // Find and activate the matching link
    const targetLink = this.dashboardLinks.find(link => link.route === route);
    if (targetLink) {
      targetLink.isActive = true;
      console.log('📋 Sidebar - Activated link:', targetLink.label);
    }

    // Navigate to the route
    this.router.navigate([route]);
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
