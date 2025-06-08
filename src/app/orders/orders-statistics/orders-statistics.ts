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

  private loadMockStatistics(): void {
    // Mock data for testing
    this.statistics = {
      pending: 3,
      accepted: 5,
      cancelled: 1
    };
    this.updateStatisticCards();
    this.isLoading = false;
  }

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
    this.isLoading = true;
    this.error = null;

    // Option 1: Get current user profile and use its ID
    this.userService.userProfile$.pipe(
      takeUntil(this.destroy$),
      filter(profile => !!profile),
      switchMap(profile => {
        return this.orderService.getUserOrderStatistics(profile!.userId);
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

  private updateStatisticCards(): void {
    if (!this.statistics) return;

    this.statisticCards = [
      {
        icon: 'fas fa-cart-arrow-down',
        value: this.statistics.pending,
        label: 'Orders Placed',
        iconStyle: 'dash__w-icon-style-1'
      },
      {
        icon: 'fas fa-check',
        value: this.statistics.accepted,
        label: 'Orders Accepted',
        iconStyle: 'dash__w-icon-style-2'
      },
      {
        icon: 'fas fa-times',
        value: this.statistics.cancelled,
        label: 'Orders Canceled',
        iconStyle: 'dash__w-icon-style-3'
      }
    ];
  }

  refreshStatistics(): void {
    this.loadOrderStatistics();
  }
}
