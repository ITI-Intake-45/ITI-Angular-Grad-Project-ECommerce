import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditBalance } from './credit-balance';

describe('CreditBalance', () => {
  let component: CreditBalance;
  let fixture: ComponentFixture<CreditBalance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreditBalance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditBalance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
