import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../core/services/order';
import { UserService } from '../../core/services/user';
import {Subject, take} from 'rxjs';
import { takeUntil, filter, switchMap } from 'rxjs/operators';
import { OrderStatistics } from '../../shared/order-models';
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
    private route: ActivatedRoute,
    private orderService: OrderService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Load initial statistics
    this.loadStatistics();
    
    // Listen for query parameter changes (when coming back from order details)
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['refreshStats'] === 'true') {
          console.log('📊 OrdersStatistics: Refreshing statistics due to query param');
          this.loadStatistics();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStatistics(): void {
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
    this.loadStatistics();
  }

  // Helper method to get counted orders (orders with recognized statuses)
  getCountedOrders(): number {
    if (!this.statistics) return 0;
    return this.statistics.pending + this.statistics.accepted + this.statistics.cancelled;
  }
}