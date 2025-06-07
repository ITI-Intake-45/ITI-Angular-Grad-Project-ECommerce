import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface UserLoginDto {
  userId: number;
  name: string;
  email: string;
  address: string;
  phone: string;
  creditBalance: number;

}



export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private baseUrl = 'http://localhost:8080/api/v1/users';

  constructor(private http: HttpClient, private router: Router) {
    // Check if user is already logged in
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUserSubject.next(JSON.parse(userData));
    }
  }
  login(credentials: LoginRequest) {

    this.http.post<UserLoginDto>(this.baseUrl + "/login", credentials, { withCredentials: true })
      .subscribe({
        next: (response) => {
          //redirect to home page
          localStorage.setItem('currentUser', JSON.stringify(response));
          alert("hello: " + response.name);

          this.router.navigate(['/home']);

        }
        ,
        error: (error) => {
          if (error.status === 401) {
            alert('Invalid email or password.');
          } else {
            alert('Something went wrong. Please try again later.');
          }
        }
      });



  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  /*

  logout(): void {
    // localStorage.removeItem('token');
    
    localStorage.removeItem('currentUser');
    alert("logout");
    this.currentUserSubject.next(null);

  }
    */
  logout(): void {

    localStorage.removeItem('currentUser');

    this.router.navigate(['/home']);
  }


  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, { token, password });
  }

  verifyOtp(otp: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-otp`, { otp });
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'admin';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}