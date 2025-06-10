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
  errorMessage = '';
  isValidUser: boolean = false;
  submitted = false;

  // Validation errors
  emailError: string = '';
  passwordError: string = '';

  constructor(private authService: AuthService, private router: Router) { }

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

  validatePassword(): boolean {
    if (!this.password || this.password.trim() === '') {
      this.passwordError = 'Password is required';
      return false;
    } else {
      this.passwordError = '';
      return true;
    }
  }

  onEmailChange(): void {
    if (this.submitted) {
      this.validateEmail();
    }
  }

  onPasswordChange(): void {
    if (this.submitted) {
      this.validatePassword();
    }
  }

  onSubmit() {
    this.submitted = true;
    
    const isEmailValid = this.validateEmail();
    const isPasswordValid = this.validatePassword();

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    const credentials: LoginRequest = {
      email: this.email.trim(),
      password: this.password
    };

    this.authService.login(credentials);
  }
}