import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, UserProfile } from '../../core/services/user';
import { Subject, takeUntil } from 'rxjs';

export interface AddBalanceResponse {
  success: boolean;
  message: string;
  newBalance?: number;
}

@Component({
  selector: 'app-credit-balance',
  standalone: false,
  templateUrl: './credit-balance.html',
  styleUrl: './credit-balance.css'
})
export class CreditBalance implements OnInit, OnDestroy {
  creditForm!: FormGroup;
  userProfile: UserProfile | null = null;
  isLoading = false;
  profileLoading = true; // Add separate loading state for profile
  successMessage: string | null = null;
  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.creditForm = this.fb.group({
      credit: ['', [
        Validators.required,
        Validators.pattern(/^[+]?\d+(\.\d{1,2})?$/),
        Validators.min(0.01)
      ]]
    });

    // Real-time input validation - only allow valid numeric input
    this.creditForm.get('credit')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (value) {
          // Remove any non-numeric characters except decimal point
          let cleanValue = value.replace(/[^0-9.]/g, '');

          // Ensure only one decimal point
          const decimalPoints = (cleanValue.match(/\./g) || []).length;
          if (decimalPoints > 1) {
            cleanValue = cleanValue.substring(0, cleanValue.lastIndexOf('.'));
          }

          // Update the form control if the value was changed
          if (cleanValue !== value) {
            this.creditForm.get('credit')?.setValue(cleanValue, { emitEvent: false });
          }
        }
      });
  }

  private loadUserProfile(): void {
    console.log('Credit balance component: Loading user profile...');
    this.profileLoading = true;

    // First, subscribe to the user profile observable
    this.userService.userProfile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(profile => {
        console.log('Credit balance component: Profile from observable:', profile);
        this.userProfile = profile;
        this.profileLoading = false;
      });

    // Always try to fetch the profile from the API
    // This ensures we have the latest data even if it's already cached
    this.userService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          console.log('Credit balance component: Profile loaded from API:', profile);
          this.userProfile = profile;
          this.profileLoading = false;
        },
        error: (error) => {
          console.error('Credit balance component: Error loading profile', error);
          this.showError('Failed to load user profile. Please try again.');
          this.profileLoading = false;
        }
      });
  }

  onSubmit(): void {
    if (this.creditForm.valid && !this.isLoading) {
      const creditAmount = parseFloat(this.creditForm.value.credit);

      if (creditAmount <= 0) {
        this.showError('Please enter a valid positive number with two decimal places (e.g., 50.00)');
        return;
      }

      this.isLoading = true;
      this.clearMessages();

      // Simulate API call for adding balance
      this.addBalance(creditAmount);
    } else {
      this.showError('Please enter a valid positive number with two decimal places (e.g., 50.00)');
    }
  }

  private addBalance(amount: number): void {
    // Mock implementation - replace with actual API call
    setTimeout(() => {
      const response: AddBalanceResponse = {
        success: true,
        message: `Successfully added $${amount.toFixed(2)} to your credit balance!`,
        newBalance: (this.userProfile?.creditBalance || 0) + amount
      };

      if (response.success && response.newBalance !== undefined) {
        // Update the user profile with new balance
        if (this.userProfile) {
          const updatedProfile = { ...this.userProfile, creditBalance: response.newBalance };
          this.userService.updateProfile(updatedProfile).subscribe({
            next: () => {
              this.showSuccess(response.message);
              this.creditForm.reset();
            },
            error: (error) => {
              this.showError('Error updating balance: ' + error.message);
            }
          });
        }
      } else {
        this.showError(response.message || 'Failed to add balance');
      }

      this.isLoading = false;
    }, 1000);
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = null;

    // Clear success message after 5 seconds
    setTimeout(() => {
      this.successMessage = null;
    }, 5000);
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = null;

    // Focus on the credit input field
    const creditInput = document.getElementById('reg-credit');
    if (creditInput) {
      creditInput.focus();
    }
  }

  private clearMessages(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }

  // Getter for easy access to form controls in template
  get creditControl() {
    return this.creditForm.get('credit');
  }

  // Format currency display
  formatCurrency(amount: number | undefined | null): string {
    return (amount || 0).toFixed(2);
  }

}
