// src/app/orders/order-status/order-status.component.ts

import { Component, Input, OnInit } from '@angular/core';

@Component({
  standalone:false,
  selector: 'app-order-status',
  templateUrl: './order-status.html',
  styleUrls: ['./order-status.css']
})
export class OrderStatus implements OnInit {
  @Input() status: string = '';
  statusSteps: { label: string, completed: boolean, active: boolean }[] = [];

  ngOnInit(): void {
    this.updateStatusSteps();
  }

  private updateStatusSteps(): void {
    // Define all possible statuses
    this.statusSteps = [
      {
        label: 'Processing',
        completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(this.status),
        active: this.status === 'PROCESSING'
      },
      {
        label: 'Shipped',
        completed: ['SHIPPED', 'DELIVERED'].includes(this.status),
        active: this.status === 'SHIPPED'
      },
      {
        label: 'Delivered',
        completed: this.status === 'DELIVERED',
        active: this.status === 'DELIVERED'
      }
    ];

    // Handle cancelled orders
    if (this.status === 'CANCELLED') {
      this.statusSteps.forEach(step => {
        step.completed = false;
        step.active = false;
      });
    }
  }
}
