import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-otp',
  standalone: false,
  templateUrl: './verify-otp.html',
  styleUrl: './verify-otp.css'
})
export class VerifyOtp {
  code: string[] = ['', '', '', '', '', ''];

  constructor(private authService: AuthService, private router: Router) { }

  onVerify() {
    const otp = this.code.join('');
    const email = localStorage.getItem('resetEmail') || '';



    this.authService.verifyOtp(email, otp).subscribe({

      next: (res) => {
        console.log('✅ verify otp success:', res);
        this.router.navigate(['/auth/reset-password']);
      },
      error: (err) => {
        console.error('❌ verify otp error:', err);
        alert('Invalid or expired OTP')
      }
    });

  }
}
