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

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    const credentials: LoginRequest = {
      email: this.email,
      password: this.password
    };

    this.authService.login(credentials);



  }
  /*
    onSubmit() {
      console.log('Login attempt:', this.email, this.password);
      alert("hi");
  
      // Simulate validation
      if (this.email === 'adelhadeer435@gmail.com') {
        this.isValidUser = true;
        alert("goode email");
      } else {
        alert("bad email");
        this.isValidUser = false;
      }
    }
      */
}
