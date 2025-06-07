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
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(value => {
        if (value) {
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
    // For now, we'll use a simple validation since we don't have the validateCurrentPassword method in UserService
    // You can extend the UserService to include this method later
    if (password.length < 6) {
      this.currentPasswordStatus = '❌ Password must be at least 6 characters';
    } else {
      this.currentPasswordStatus = '✅ Password format is valid';
    }
  }

  private validateNewPassword(password: string): void {
    if (!password) {
      this.passwordStrength = 0;
      this.newPasswordStatus = '';
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
    const colors = ['#ff4d4d', '#ffcc00', '#9bcd9b', '#46cc46'];
    return colors[this.passwordStrength - 1] || '#ddd';
  }

  getStrengthWidth(): string {
    return (this.passwordStrength * 25) + '%';
  }

  onSubmit(): void {
    if (this.passwordForm.invalid || this.isSubmitting) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.formStatus = '';
    this.formStatusType = '';

    const { currentPassword, newPassword } = this.passwordForm.value;

    const changePasswordSub = this.userService.changePassword(currentPassword, newPassword)
      .subscribe({
        next: (response) => {
          this.formStatus = '✅ Password changed successfully!';
          this.formStatusType = 'success';
          this.passwordForm.reset();
          this.resetValidationStatus();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Password change error:', error);
          this.formStatus = '❌ Failed to change password. Please try again.';
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
}
