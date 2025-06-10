// login.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { LoginRequest } from '../../core/services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  submitted = false;

  // Validation errors
  emailError: string = '';
  passwordError: string = '';
  globalErrorMessage: string = '';

  // Validation flags
  isValidEmail: boolean = false;
  isValidPassword: boolean = false;

  // Password strength indicators
  hasUppercase: boolean = false;
  hasLowercase: boolean = false;
  hasDigit: boolean = false;
  hasSpecialChar: boolean = false;
  hasMinLength: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  get isFormValid(): boolean {
    return this.isValidEmail && this.isValidPassword && !this.emailError && !this.passwordError;
  }

  validateEmail(): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!this.email || this.email.trim() === '') {
      this.emailError = 'Email is required';
      this.isValidEmail = false;
      return false;
    } else if (!emailRegex.test(this.email.trim())) {
      this.emailError = 'Please enter a valid email address';
      this.isValidEmail = false;
      return false;
    } else {
      this.emailError = '';
      this.isValidEmail = true;
      return true;
    }
  }

  validatePassword(): boolean {
    const password = this.password;
    
    // Reset password strength indicators
    this.hasUppercase = /[A-Z]/.test(password);
    this.hasLowercase = /[a-z]/.test(password);
    this.hasDigit = /\d/.test(password);
    this.hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    this.hasMinLength = password.length >= 8;

    if (!password || password.trim() === '') {
      this.passwordError = 'Password is required';
      this.isValidPassword = false;
      return false;
    } else if (!this.hasMinLength) {
      this.passwordError = 'Password must be at least 8 characters long';
      this.isValidPassword = false;
      return false;
    } else if (!this.hasUppercase) {
      this.passwordError = 'Password must contain at least one uppercase letter';
      this.isValidPassword = false;
      return false;
    } else if (!this.hasLowercase) {
      this.passwordError = 'Password must contain at least one lowercase letter';
      this.isValidPassword = false;
      return false;
    } else if (!this.hasDigit) {
      this.passwordError = 'Password must contain at least one digit';
      this.isValidPassword = false;
      return false;
    } else if (!this.hasSpecialChar) {
      this.passwordError = 'Password must contain at least one special character';
      this.isValidPassword = false;
      return false;
    } else {
      this.passwordError = '';
      this.isValidPassword = true;
      return true;
    }
  }

  onEmailChange(): void {
    this.validateEmail();
    // Clear global error when user starts typing
    if (this.globalErrorMessage) {
      this.globalErrorMessage = '';
    }
  }

  onPasswordChange(): void {
    this.validatePassword();
    // Clear global error when user starts typing
    if (this.globalErrorMessage) {
      this.globalErrorMessage = '';
    }
  }

  onSubmit() {
    this.submitted = true;
    this.globalErrorMessage = '';
    
    const isEmailValid = this.validateEmail();
    const isPasswordValid = this.validatePassword();

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    const credentials: LoginRequest = {
      email: this.email.trim(),
      password: this.password
    };

    // Call the login service
    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        // Navigation will be handled by the auth service
      },
      error: (error) => {
        console.error('Login failed:', error);
        
        // Show user-friendly error message
        if (error.status === 401 || error.status === 400) {
          this.globalErrorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.status === 429) {
          this.globalErrorMessage = 'Too many login attempts. Please try again later.';
        } else if (error.status === 0) {
          this.globalErrorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else {
          this.globalErrorMessage = 'Something went wrong. Please try again later.';
        }
      }
    });
  }
}