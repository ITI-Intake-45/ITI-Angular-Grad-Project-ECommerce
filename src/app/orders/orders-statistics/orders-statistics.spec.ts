import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersStatistics } from './orders-statistics';

describe('OrdersStatistics', () => {
  let component: OrdersStatistics;
  let fixture: ComponentFixture<OrdersStatistics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrdersStatistics]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdersStatistics);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
