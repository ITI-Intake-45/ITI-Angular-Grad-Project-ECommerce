import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, UserProfile } from '../../core/services/user';
import { Subject, takeUntil } from 'rxjs';

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
  profileLoading = true;
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
        Validators.min(0.01),
        Validators.max(10000) // Add max validation as per backend logic
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

          // Limit to 2 decimal places
          if (cleanValue.includes('.')) {
            const parts = cleanValue.split('.');
            if (parts[1] && parts[1].length > 2) {
              cleanValue = parts[0] + '.' + parts[1].substring(0, 2);
            }
          }

          // Update the form control if the value was changed
          if (cleanValue !== value) {
            this.creditForm.get('credit')?.setValue(cleanValue, { emitEvent: false });
          }
        }
      });
  }

  private loadUserProfile(): void {
    console.log('💳 Credit balance component: Loading user profile...');
    this.profileLoading = true;

    // Subscribe to the user profile observable for real-time updates
    this.userService.userProfile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(profile => {
        console.log('💳 Credit balance component: Profile from observable:', profile);
        this.userProfile = profile;
        this.profileLoading = false;
      });

    // Fetch the profile from the API to ensure we have the latest data
    this.userService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          console.log('💳 Credit balance component: Profile loaded from API:', profile);
          // Profile will be updated via the observable above
        },
        error: (error) => {
          console.error('💳 Credit balance component: Error loading profile', error);
          this.showError('Failed to load user profile. Please try again.');
          this.profileLoading = false;
        }
      });
  }

  onSubmit(): void {
    if (this.creditForm.valid && !this.isLoading) {
      const creditAmount = parseFloat(this.creditForm.value.credit);

      // Client-side validation
      if (creditAmount <= 0) {
        this.showError('Please enter a valid positive amount');
        return;
      }

      if (creditAmount > 10000) {
        this.showError('Maximum amount per transaction is $10,000');
        return;
      }

      // Check decimal places
      const decimalPlaces = (creditAmount.toString().split('.')[1] || '').length;
      if (decimalPlaces > 2) {
        this.showError('Amount can have maximum 2 decimal places');
        return;
      }

      this.isLoading = true;
      this.clearMessages();

      // Call the real API
      this.addBalance(creditAmount);
    } else {
      this.showError('Please enter a valid amount (0.01 - 10,000.00)');
      this.markFormControlsTouched();
    }
  }

  private addBalance(amount: number): void {
    console.log('💳 Adding balance amount:', amount);
    console.log('💳 Current balance:', this.userProfile?.creditBalance || 0);

    // Calculate the new total balance (current + added amount)
    const currentBalance = this.userProfile?.creditBalance || 0;
    const newTotalBalance = currentBalance + amount;

    console.log('💳 New total balance to send to backend:', newTotalBalance);

    const addBalanceSub = this.userService.addBalance(newTotalBalance)
      .subscribe({
        next: (updatedProfile) => {
          console.log('💳 Balance updated successfully:', updatedProfile);

          // Show success message with the amount that was added
          this.showSuccess(`Successfully added $${amount.toFixed(2)} to your credit balance! New balance: $${updatedProfile.creditBalance.toFixed(2)}`);

          // Reset the form
          this.creditForm.reset();

          // Update local profile reference (though it should already be updated via the observable)
          this.userProfile = updatedProfile;

          this.isLoading = false;
        },
        error: (error) => {
          console.error('💳 Error adding balance:', error);

          let errorMessage = 'Failed to add balance. Please try again.';

          if (error.message) {
            if (error.message.includes('zero or less')) {
              errorMessage = 'Amount must be greater than zero';
            } else if (error.message.includes('authenticated')) {
              errorMessage = 'Please log in again';
            } else {
              errorMessage = error.message;
            }
          }

          this.showError(errorMessage);
          this.isLoading = false;
        }
      });

    // Clean up subscription
    this.destroy$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      addBalanceSub.unsubscribe();
    });
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

    // Clear error message after 8 seconds
    setTimeout(() => {
      this.errorMessage = null;
    }, 8000);
  }

  private clearMessages(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }

  private markFormControlsTouched(): void {
    Object.keys(this.creditForm.controls).forEach(key => {
      const control = this.creditForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getter for easy access to form controls in template
  get creditControl() {
    return this.creditForm.get('credit');
  }

  // Format currency display
  formatCurrency(amount: number | undefined | null): string {
    return (amount || 0).toFixed(2);
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.creditForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.creditForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return 'Amount is required';
      if (field.errors['min']) return 'Amount must be at least $0.01';
      if (field.errors['max']) return 'Amount cannot exceed $10,000';
      if (field.errors['pattern']) return 'Please enter a valid number with up to 2 decimal places';
    }
    return '';
  }
}
