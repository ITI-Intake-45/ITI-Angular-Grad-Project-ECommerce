import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserService } from '../../core/services/user';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-change-password',
  standalone: false,
  templateUrl: './change-password.html',
  styleUrl: './change-password.css'
})
export class ChangePassword implements OnInit, OnDestroy {
  passwordForm!: FormGroup;
  isSubmitting = false;
  formStatus = '';
  formStatusType: 'success' | 'error' | '' = '';

  // Validation status for each field
  currentPasswordStatus = '';
  newPasswordStatus = '';
  confirmPasswordStatus = '';

  // Password strength indicator
  passwordStrength = 0;
  passwordRequirements = {
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumbers: false
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupValidation();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeForm(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private setupValidation(): void {
    // Current password validation
    const currentPasswordSub = this.passwordForm.get('currentPassword')?.valueChanges
      .pipe(debounceTime(800), distinctUntilChanged())
      .subscribe(value => {
        if (value && value.trim() !== '') {
          this.validateCurrentPassword(value);
        } else {
          this.currentPasswordStatus = '';
        }
      });

    // New password validation
    const newPasswordSub = this.passwordForm.get('newPassword')?.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(value => {
        this.validateNewPassword(value);
        this.checkPasswordMatch();
      });

    // Confirm password validation
    const confirmPasswordSub = this.passwordForm.get('confirmPassword')?.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.checkPasswordMatch();
      });

    if (currentPasswordSub) this.subscriptions.push(currentPasswordSub);
    if (newPasswordSub) this.subscriptions.push(newPasswordSub);
    if (confirmPasswordSub) this.subscriptions.push(confirmPasswordSub);
  }

  private validateCurrentPassword(password: string): void {
    if (!password || password.trim() === '') {
      this.currentPasswordStatus = '';
      return;
    }

    // Set loading state
    this.currentPasswordStatus = '⏳ Validating current password...';

    // Use the real API validation
    const validationSub = this.userService.validateCurrentPassword(password)
      .subscribe({
        next: (result) => {
          this.currentPasswordStatus = result.message;
          console.log('🔐 Current password validation result:', result);

          // If password is valid, also check if new password is different
          if (result.valid) {
            const newPassword = this.passwordForm.get('newPassword')?.value;
            if (newPassword && newPassword === password) {
              this.validateNewPassword(newPassword); // Re-validate new password
            }
          }
        },
        error: (error) => {
          console.error('🔐 Current password validation error:', error);
          this.currentPasswordStatus = '❌ Failed to validate password';
        }
      });

    this.subscriptions.push(validationSub);
  }

  private validateNewPassword(password: string): void {
    if (!password) {
      this.passwordStrength = 0;
      this.newPasswordStatus = '';
      this.resetPasswordRequirements();
      return;
    }

    // Check password requirements
    this.passwordRequirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password)
    };

    // Calculate strength
    this.passwordStrength = Object.values(this.passwordRequirements).filter(Boolean).length;

    // Check if new password is same as current password
    const currentPassword = this.passwordForm.get('currentPassword')?.value;
    if (currentPassword && password === currentPassword) {
      this.newPasswordStatus = '❌ New password must be different from current password';
      return;
    }

    // Set status based on strength
    if (this.passwordStrength === 4) {
      this.newPasswordStatus = '✅ Strong password';
    } else if (this.passwordStrength >= 2) {
      this.newPasswordStatus = '⚠️ Medium strength - consider adding more requirements';
    } else {
      this.newPasswordStatus = '❌ Weak password - please meet more requirements';
    }
  }

  private checkPasswordMatch(): void {
    const newPassword = this.passwordForm.get('newPassword')?.value;
    const confirmPassword = this.passwordForm.get('confirmPassword')?.value;

    if (!confirmPassword) {
      this.confirmPasswordStatus = '';
      return;
    }

    if (newPassword === confirmPassword) {
      this.confirmPasswordStatus = '✅ Passwords match';
    } else {
      this.confirmPasswordStatus = '❌ Passwords do not match';
    }
  }

  // Custom validator for password strength
  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasMinLength = password.length >= 8;

    const valid = hasUppercase && hasLowercase && hasNumbers && hasMinLength;
    return valid ? null : { passwordStrength: true };
  }

  // Custom validator for password match
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (!newPassword || !confirmPassword) return null;

    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  getStrengthColor(): string {
    const colors = ['#ff4d4d', '#ff8c00', '#ffd700', '#32cd32'];
    return colors[this.passwordStrength - 1] || '#ddd';
  }

  getStrengthWidth(): string {
    return (this.passwordStrength * 25) + '%';
  }

  onSubmit(): void {
    // Clear any previous form status
    this.formStatus = '';
    this.formStatusType = '';

    // Check if current password validation is complete and valid
    if (this.currentPasswordStatus.includes('❌')) {
      this.formStatus = '❌ Current password is incorrect';
      this.formStatusType = 'error';
      return;
    }

    if (this.currentPasswordStatus.includes('⏳')) {
      this.formStatus = '❌ Please wait for current password validation to complete';
      this.formStatusType = 'error';
      return;
    }

    if (!this.currentPasswordStatus.includes('✅')) {
      this.formStatus = '❌ Please enter your current password';
      this.formStatusType = 'error';
      return;
    }

    // Check if new password is strong enough
    if (this.passwordStrength < 4) {
      this.formStatus = '❌ New password must meet all requirements';
      this.formStatusType = 'error';
      return;
    }

    // Check if passwords match
    if (!this.confirmPasswordStatus.includes('✅')) {
      this.formStatus = '❌ Passwords do not match';
      this.formStatusType = 'error';
      return;
    }

    if (this.passwordForm.invalid || this.isSubmitting) {
      this.markFormGroupTouched();
      this.formStatus = '❌ Please fix all errors before submitting';
      this.formStatusType = 'error';
      return;
    }

    this.isSubmitting = true;
    this.formStatus = '⏳ Changing password...';
    this.formStatusType = '';

    const { currentPassword, newPassword } = this.passwordForm.value;

    const changePasswordSub = this.userService.changePassword(currentPassword, newPassword)
      .subscribe({
        next: (response) => {
          console.log('✅ Password changed successfully:', response);
          this.formStatus = '✅ Password changed successfully!';
          this.formStatusType = 'success';
          this.passwordForm.reset();
          this.resetValidationStatus();
          this.isSubmitting = false;

          // Auto-hide success message after 5 seconds
          setTimeout(() => {
            this.formStatus = '';
            this.formStatusType = '';
          }, 5000);
        },
        error: (error) => {
          console.error('❌ Password change error:', error);

          let errorMessage = '❌ Failed to change password. Please try again.';

          if (error.message) {
            errorMessage = `❌ ${error.message}`;
          } else if (typeof error === 'string') {
            errorMessage = `❌ ${error}`;
          }

          this.formStatus = errorMessage;
          this.formStatusType = 'error';
          this.isSubmitting = false;
        }
      });

    this.subscriptions.push(changePasswordSub);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.passwordForm.controls).forEach(key => {
      const control = this.passwordForm.get(key);
      control?.markAsTouched();
    });
  }

  private resetValidationStatus(): void {
    this.currentPasswordStatus = '';
    this.newPasswordStatus = '';
    this.confirmPasswordStatus = '';
    this.passwordStrength = 0;
    this.resetPasswordRequirements();
  }

  private resetPasswordRequirements(): void {
    this.passwordRequirements = {
      minLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumbers: false
    };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.passwordForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  // Helper method to check if form can be submitted
  canSubmit(): boolean {
    return !this.isSubmitting &&
      this.currentPasswordStatus.includes('✅') &&
      this.passwordStrength === 4 &&
      this.confirmPasswordStatus.includes('✅') &&
      this.passwordForm.valid;
  }

  // Helper methods for template
  isCurrentPasswordValid(): boolean {
    return this.currentPasswordStatus.includes('✅');
  }

  isCurrentPasswordValidating(): boolean {
    return this.currentPasswordStatus.includes('⏳');
  }

  isCurrentPasswordInvalid(): boolean {
    return this.currentPasswordStatus.includes('❌');
  }

  isNewPasswordValid(): boolean {
    return this.newPasswordStatus.includes('✅');
  }

  isNewPasswordInvalid(): boolean {
    return this.newPasswordStatus.includes('❌');
  }

  isConfirmPasswordValid(): boolean {
    return this.confirmPasswordStatus.includes('✅');
  }

  isConfirmPasswordInvalid(): boolean {
    return this.confirmPasswordStatus.includes('❌');
  }
}
