import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrderService, OrderStatistics } from '../../core/services/order';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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

  constructor(private orderService: OrderService) {}

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

    // to load from the mock data
    this.loadMockStatistics();


    //to load from the api
    // this.loadOrderStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOrderStatistics(): void {
    this.isLoading = true;
    this.error = null;

    this.orderService.getUserOrderStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
