// register.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  isLoading: boolean = false;
  globalErrorMessage: string = ''
  name = '';
  email = '';
  phone = '';
  address = '';
  creditBalence: number = 0;
  password = '';
  confirmPassword = '';

  submitted = false;

  // Validation errors
  nameError: string = '';
  emailError: string = '';
  phoneError: string = '';
  addressError: string = '';
  creditError: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';

  nameTouched: boolean = false;
  emailTouched = false;
  phoneTouched = false;
  addressTouched = false;
  creditTouched = false;
  passwordTouched = false;
  confirmPasswordTouched = false;

  constructor(private authService: AuthService, private router: Router) { }

  validateName(): boolean {
    if (!this.name || this.name.trim() === '') {
      this.nameError = 'Name is required';
      return false;
    } else {
      this.nameError = '';
      return true;
    }
  }

  validateEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!this.email || this.email.trim() === '') {
      this.emailError = 'Email is required';
      return false;
    } else if (!emailRegex.test(this.email)) {
      this.emailError = 'Please enter a valid email address';
      return false;
    } else {
      this.emailError = '';
      return true;
    }
  }

validatePhone(): boolean {
  // Accepts only phone numbers starting with 010, 011, 012, or 015 and followed by 8 digits
  const phoneRegex = /^(010|011|012|015)[0-9]{8}$/;

  if (!this.phone || this.phone.trim() === '') {
    this.phoneError = 'Phone number is required';
    return false;
  } else if (!phoneRegex.test(this.phone.replace(/\s/g, ''))) {
    this.phoneError = 'Phone number must start with 010, 011, 012, or 015 and be 11 digits';
    return false;
  } else {
    this.phoneError = '';
    return true;
  }
}


  validateAddress(): boolean {
    if (!this.address || this.address.trim() === '') {
      this.addressError = 'Address is required';
      return false;
    } else {
      this.addressError = '';
      return true;
    }
  }

  validateCredit(): boolean {
    if (this.creditBalence === null || this.creditBalence === undefined) {
      this.creditError = 'Credit balance is required';
      return false;
    } else if (this.creditBalence < 0) {
      this.creditError = 'Credit balance must be positive';
      return false;
    } else {
      this.creditError = '';
      return true;
    }
  }

  validatePassword(): boolean {
    const hasLowerCase = /[a-z]/.test(this.password);
    const hasUpperCase = /[A-Z]/.test(this.password);
    const hasNumbers = /\d/.test(this.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(this.password);
    const hasMinLength = this.password.length >= 8;

    if (!this.password || this.password.trim() === '') {
      this.passwordError = 'Password is required';
      return false;
    } else if (!hasMinLength) {
      this.passwordError = 'Password must be at least 8 characters long';
      return false;
    } else if (!hasLowerCase) {
      this.passwordError = 'Password must contain at least one lowercase letter';
      return false;
    } else if (!hasUpperCase) {
      this.passwordError = 'Password must contain at least one uppercase letter';
      return false;
    } else if (!hasNumbers) {
      this.passwordError = 'Password must contain at least one number';
      return false;
    } else if (!hasSpecialChar) {
      this.passwordError = 'Password must contain at least one special character';
      return false;
    } else {
      this.passwordError = '';
      return true;
    }
  }

  validateConfirmPassword(): boolean {
    if (!this.confirmPassword || this.confirmPassword.trim() === '') {
      this.confirmPasswordError = 'Please confirm your password';
      return false;
    } else if (this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Passwords do not match';
      return false;
    } else {
      this.confirmPasswordError = '';
      return true;
    }
  }

  // Individual field validation methods for real-time validation
  onNameChange(): void {
      this.nameTouched = true;

      this.validateName();

  }

  onEmailChange(): void {
          this.emailTouched = true;

      this.validateEmail();

  }

  onPhoneChange(): void {
    // Only allow numeric input
          this.phoneTouched = true;

    this.phone = this.phone.replace(/[^0-9]/g, '');
      this.validatePhone();

  }

  onAddressChange(): void {
          this.addressTouched = true;

      this.validateAddress();

  }

  onCreditChange(): void {
          this.creditTouched = true;

      this.validateCredit();

  }

onPasswordChange(): void {
        this.passwordTouched = true;

  this.validatePassword();
  // Also validate confirm password if it has a value
  if (this.confirmPassword) {
    this.confirmPasswordTouched = true;
    this.validateConfirmPassword();
  }
}

onConfirmPasswordChange(): void {
    this.confirmPasswordTouched = true;
  this.validateConfirmPassword();
}


  onRegister() {
    this.submitted = true;
    this.globalErrorMessage = '';
    this.isLoading = true;

    // Validate all fields
    const isNameValid = this.validateName();
    const isEmailValid = this.validateEmail();
    const isPhoneValid = this.validatePhone();
    const isAddressValid = this.validateAddress();
    const isCreditValid = this.validateCredit();
    const isPasswordValid = this.validatePassword();
    const isConfirmPasswordValid = this.validateConfirmPassword();

    // Check if all validations passed
    if (!isNameValid || !isEmailValid || !isPhoneValid || !isAddressValid ||
      !isCreditValid || !isPasswordValid || !isConfirmPasswordValid) {
      this.isLoading = false;
      return;
    }

    const user = {
      name: this.name.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      address: this.address.trim(),
      creditBalance: this.creditBalence,
      password: this.password
    };

    // Subscribe to the register method
    this.authService.register(user).subscribe({
      next: (response) => {
        console.log('✅ Registration and login successful:', response);
        this.isLoading = false;
        // Navigation will be handled by the AuthService login method
      },
      error: (error) => {
        console.error('❌ Registration failed:', error);
        this.isLoading = false;

        // Display user-friendly error message
        this.globalErrorMessage = error.message || 'Registration failed. Please try again.';
      }
    });
  }

  // Helper method to get password strength
  getPasswordStrength(): string {
    if (!this.password) return '';

    const hasLowerCase = /[a-z]/.test(this.password);
    const hasUpperCase = /[A-Z]/.test(this.password);
    const hasNumbers = /\d/.test(this.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(this.password);
    const hasMinLength = this.password.length >= 8;

    const criteria = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChar, hasMinLength];
    const met = criteria.filter(Boolean).length;

    if (met <= 2) return 'weak';
    if (met <= 4) return 'medium';
    return 'strong';
  }
}
