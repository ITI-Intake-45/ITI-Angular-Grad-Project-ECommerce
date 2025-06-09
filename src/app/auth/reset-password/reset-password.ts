import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword {
  password = '';
  confirmPassword = '';

  constructor(private authService: AuthService, private router: Router) { }

  onReset() {

    if (this.password !== this.confirmPassword || this.password.length < 8) return;

    const email = localStorage.getItem('resetEmail') || '';




    this.authService.resetPassword(email, this.password).subscribe({
      next: (res) => {
        console.log('Password reset successful: ', res);
        alert('Password reset successful');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('❌ reset password error:', err);
        alert('Error resetting password');
      }
    });

  }
}
