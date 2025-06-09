import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';
import { CreditBalance } from '../../user/credit-balance/credit-balance';
@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  name = '';
  email = '';
  phone = '';
  address = '';
  creditBalence: number = 0;
  password = '';
  confirmPassword = '';

  submitted = false;

  constructor(private authService: AuthService, private router: Router) { }

  onRegister(form: any) {
    this.submitted = true;

    if (form.invalid || this.password !== this.confirmPassword) {
      return;
    }

    const user = {
      name: this.name,
      email: this.email,
      phone: this.phone,
      address: this.address,
      creditBalance: this.creditBalence,
      password: this.password
    };


    this.authService.register(user);


    // TODO: Send to backend
  }
}
