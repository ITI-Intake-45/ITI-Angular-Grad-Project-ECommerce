import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  email = '';
  submitted = false;

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    this.submitted = true;

    if (!this.email.includes('@')) return;


    localStorage.setItem('resetEmail', this.email);


    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        console.log('✅ Forgot password success:', res);
        this.router.navigate(['/auth/verify-otp']);
      },
      error: (err) => {
        console.error('❌ Forgot password error:', err);
        alert('Error in sending OTP code.');
      }
    });

  }
}
