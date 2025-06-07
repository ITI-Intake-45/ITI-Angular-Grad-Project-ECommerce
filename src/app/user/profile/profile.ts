import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserService, UserProfile } from '../../core/services/user';
import { AuthService } from '../../core/services/auth';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {DashboardCommunicationService} from '../../core/services/dashboard-communication-service';

interface ProfileCard {
  title: string;
  value: string;
  icon: string;
  isEmpty: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit, OnDestroy {
  userProfile: UserProfile | null = null;
  isLoading = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  profileCards: ProfileCard[] = [];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private dashboardCommunicationService: DashboardCommunicationService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserProfile(): void {
    this.isLoading = true;
    this.error = null;

    // Check if user is authenticated [commented out for mocking until the login functionality works well ]
    if (!this.authService.isAuthenticated()) {
      this.error = 'Please log in to view your profile';
      this.isLoading = false;
      return;
    }

    console.log('Loading user profile...');

    this.userService.getProfile()
    // this.userService.getMockProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          console.log('Profile loaded successfully:', profile);
          this.userProfile = profile;
          this.updateProfileCards();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.error = this.getErrorMessage(error);
          this.isLoading = false;
        }
      });
  }

  private getErrorMessage(error: any): string {
    if (error?.message) {
      return error.message;
    }

    if (error?.status === 401) {
      return 'Authentication required. Please log in again.';
    }

    if (error?.status === 403) {
      return 'Access denied. You don\'t have permission to view this profile.';
    }

    if (error?.status === 404) {
      return 'Profile not found. Please contact support.';
    }

    if (error?.status === 0) {
      return 'Cannot connect to server. Please check your internet connection.';
    }

    return 'Failed to load profile. Please try again.';
  }

  private updateProfileCards(): void {
    if (!this.userProfile) return;

    this.profileCards = [
      {
        title: 'NAME',
        value: this.userProfile.name || 'Not provided',
        icon: 'fas fa-user',
        isEmpty: !this.userProfile.name
      },
      {
        title: 'EMAIL',
        value: this.userProfile.email || 'Not provided',
        icon: 'fas fa-envelope',
        isEmpty: !this.userProfile.email
      },
      {
        title: 'PHONE NUMBER',
        value: this.userProfile.phone || 'Not provided',
        icon: 'fas fa-phone',
        isEmpty: !this.userProfile.phone
      },
      {
        title: 'ADDRESS',
        value: this.userProfile.address || 'Not provided',
        icon: 'fas fa-map-marker-alt',
        isEmpty: !this.userProfile.address
      },
      {
        title: 'CREDIT BALANCE',
        value: this.formatCurrency(this.userProfile.creditBalance),
        icon: 'fas fa-wallet',
        isEmpty: false
      }
    ];
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  }

  refreshProfile(): void {
    this.loadUserProfile();
  }
// Updated action methods to activate sidebar links
  editProfile(): void {
    console.log('Edit Profile clicked - activating sidebar link');
    this.dashboardCommunicationService.activateLink('/user/edit-profile');
  }

  manageCredit(): void {
    console.log('Manage Credit clicked - activating sidebar link');
    this.dashboardCommunicationService.activateLink('/user/credit-balance');
  }

  changePassword(): void {
    console.log('Change Password clicked - activating sidebar link');
    this.dashboardCommunicationService.activateLink('/user/change-password');
  }


}
