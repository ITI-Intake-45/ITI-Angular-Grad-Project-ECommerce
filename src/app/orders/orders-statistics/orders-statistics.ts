import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrderService } from '../../core/services/order';
import { UserService } from '../../core/services/user';
import {Subject, take} from 'rxjs';
import { takeUntil, filter, switchMap } from 'rxjs/operators';
import { OrderStatistics } from '../../shared/order-models'; // Import from shared models
import { AuthService } from '../../core/services/auth';


interface StatisticCard {
  icon: string;
  value: number;
  label: string;
  iconStyle: string;
}

@Component({
  selector: 'app-orders-statistics',
  templateUrl: './orders-statistics.html',
  standalone: false,
  styleUrls: ['./orders-statistics.css']
})
export class OrdersStatistics implements OnInit, OnDestroy {
  statistics: OrderStatistics | null = null;
  isLoading = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  statisticCards: StatisticCard[] = [];

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  // private loadMockStatistics(): void {
  //   // Mock data for testing
  //   this.statistics = {
  //     pending: 3,
  //     accepted: 5,
  //     cancelled: 1
  //   };
  //   this.updateStatisticCards();
  //   this.isLoading = false;
  // }

  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      filter(user => !!user),
      take(1),
      switchMap(user => {
        if (!user?.userId) {
          throw new Error('User ID not available');
        }
        return this.orderService.getUserOrderStatistics(user.userId);
      })
    ).subscribe({
      next: (stats) => {
        this.statistics = stats;
        this.updateStatisticCards();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading order statistics:', error);
        this.error = 'Failed to load order statistics';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOrderStatistics(): void {
    console.log('📊 OrdersStatistics: Loading order statistics...');
    this.isLoading = true;
    this.error = null;

    // // Option 1: Get current user profile and use its ID
    // this.userService.userProfile$.pipe(
    //   takeUntil(this.destroy$),
    //   filter(profile => !!profile),
    //   switchMap(profile => {
    //     return this.orderService.getUserOrderStatistics(profile!.userId);
    //   })
    // ).subscribe({
    //   next: (stats) => {
    //     this.statistics = stats;
    //     this.updateStatisticCards();
    //     this.isLoading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error loading order statistics:', error);
    //     this.error = 'Failed to load order statistics';
    //     this.isLoading = false;
    //   }
    // });
    // Get user ID from multiple sources
    const userId = this.getUserId();

    if (userId) {
      console.log('📊 OrdersStatistics: Using user ID:', userId);
      this.fetchOrderStatistics(userId);
    } else {
      console.log('📊 OrdersStatistics: No user ID found, fetching profile from API...');
      this.userService.getProfile()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (userProfile) => {
            console.log('📊 OrdersStatistics: API response userProfile:', userProfile);

            // Now checking for 'userId' field which matches backend response
            if (userProfile?.userId) {
              console.log('📊 OrdersStatistics: Got user ID from API:', userProfile.userId);
              this.fetchOrderStatistics(userProfile.userId);
            } else {
              console.error('📊 OrdersStatistics: No userId in profile from API:', userProfile);
              this.error = 'Unable to determine user ID. Please log in again.';
              this.isLoading = false;
              this.setDefaultStatistics();
            }
          },
          error: (error) => {
            console.error('📊 OrdersStatistics: Error getting user profile from API:', error);
            this.error = 'Failed to load user profile. Please log in again.';
            this.isLoading = false;
            this.setDefaultStatistics();
          }
        });
    }
  }

  private getUserId(): number | null {
    // Try to get user ID from multiple sources
    let userId: number | null = null;

    // Method 1: From current user profile
    const currentProfile = this.userService.getCurrentUserProfile();
    if (currentProfile?.userId) {  // Now checking for 'userId'
      userId = currentProfile.userId;
      console.log('📊 OrdersStatistics: Got user ID from current profile (userId):', userId);
      return userId;
    }

    // Method 2: From localStorage userProfile
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      try {
        const parsedProfile = JSON.parse(storedProfile);
        userId = parsedProfile.userId || parsedProfile.id;  // Check both for compatibility
        console.log('📊 OrdersStatistics: Got user ID from stored profile:', userId);
        return userId;
      } catch (error) {
        console.error('📊 OrdersStatistics: Error parsing stored profile:', error);
      }
    }

    // Method 3: From localStorage currentUser
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        userId = parsedUser.userId || parsedUser.id;
        console.log('📊 OrdersStatistics: Got user ID from stored user:', userId);
        return userId;
      } catch (error) {
        console.error('📊 OrdersStatistics: Error parsing stored user:', error);
      }
    }

    return null;
  }

  private fetchOrderStatistics(userId: number): void {
    console.log('📊 OrdersStatistics: Fetching statistics for user ID:', userId);

    this.orderService.getUserOrderStatistics(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          console.log('📊 OrdersStatistics: Statistics loaded successfully:', stats);
          this.statistics = stats;
          this.updateStatisticCards();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('📊 OrdersStatistics: Error loading order statistics:', error);
          this.error = this.getErrorMessage(error);
          this.isLoading = false;
          this.setDefaultStatistics();
        }
      });
  }

  private setDefaultStatistics(): void {
    this.statistics = {
      pending: 0,
      accepted: 0,
      cancelled: 0,
    };
    this.updateStatisticCards();
  }

  private getErrorMessage(error: any): string {
    if (error?.message) {
      if (error.message.includes('Authentication required')) {
        return 'Please log in again to view your order statistics.';
      }
      if (error.message.includes('Server error')) {
        return 'Server error. Please try again later.';
      }
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'Failed to load order statistics. Please try again.';
  }

  private updateStatisticCards(): void {
    if (!this.statistics) return;

    this.statisticCards = [
      {
        icon: 'fas fa-cart-arrow-down',
        value: this.statistics.pending,
        label: 'Pending Orders',
        iconStyle: 'dash__w-icon-style-1'
      },
      {
        icon: 'fas fa-check',
        value: this.statistics.accepted,
        label: 'Accepted Orders',
        iconStyle: 'dash__w-icon-style-2'
      },
      {
        icon: 'fas fa-times',
        value: this.statistics.cancelled,
        label: 'Cancelled Orders',
        iconStyle: 'dash__w-icon-style-3'
      }
    ];
  }

  refreshStatistics(): void {
    console.log('📊 OrdersStatistics: Refreshing statistics...');
    this.loadOrderStatistics();
  }

  
  // Helper method to get counted orders (orders with recognized statuses)
  getCountedOrders(): number {
    if (!this.statistics) return 0;
    return this.statistics.pending + this.statistics.accepted + this.statistics.cancelled;
  }

  
}
