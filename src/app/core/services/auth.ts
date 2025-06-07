import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';

// Define the missing interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface UserLoginDto {
  userId: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  creditBalance?: number;
}

export interface User {
  userId: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  creditBalance?: number;
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
      try {
        this.currentUserSubject.next(JSON.parse(userData));
        console.log('🔐 AuthService: Restored user from localStorage:', JSON.parse(userData));
      } catch (error) {
        console.error('🔐 AuthService: Error parsing stored user data:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  login(credentials: LoginRequest) {
    console.log('🔐 AuthService: Starting login process...');

    this.http.post<UserLoginDto>(this.baseUrl + "/login", credentials, { withCredentials: true })
      .pipe(
        switchMap((loginResponse) => {
          console.log('🔐 AuthService: Login successful, response:', loginResponse);

          // Store basic user data first
          localStorage.setItem('currentUser', JSON.stringify(loginResponse));
          localStorage.setItem('loginTimestamp', Date.now().toString());
          localStorage.setItem('authToken', 'authenticated');
          this.currentUserSubject.next(loginResponse);

          console.log('🔐 AuthService: Now loading full profile...');

          // Load full profile from API
          return this.http.get<any>(`${this.baseUrl}/profile`, { withCredentials: true })
            .pipe(
              tap(profile => {
                console.log('🔐 AuthService: Full profile loaded:', profile);
                // Store the full profile data
                localStorage.setItem('userProfile', JSON.stringify(profile));
              }),
              catchError(error => {
                console.error('🔐 AuthService: Error loading profile after login:', error);
                // Continue with login even if profile fails to load - profile is same as login response
                return new Observable(observer => {
                  observer.next(loginResponse);
                  observer.complete();
                });
              })
            );
        })
      )
      .subscribe({
        next: (profile) => {
          console.log('🔐 AuthService: Login and profile loading completed');
          alert("Hello and welcome!");

          // Navigate to home after everything is loaded
          setTimeout(() => {
            console.log('🔐 AuthService: Navigating to home');
            this.router.navigate(['/home']);
          }, 100);
        },
        error: (error) => {
          console.error('🔐 AuthService: Login error:', error);
          if (error.status === 401) {
            alert('Invalid email or password.');
          } else {
            alert('Something went wrong. Please try again later.');
          }
        }
      });
  }

  // Add session validation method
  validateSession(): Observable<any> {
    return this.http.get(`${this.baseUrl}/check-session`, { withCredentials: true });
  }

  // Add method to get stored profile
  getStoredProfile(): any {
    const profileData = localStorage.getItem('userProfile');
    if (profileData) {
      try {
        return JSON.parse(profileData);
      } catch (error) {
        console.error('🔐 AuthService: Error parsing stored profile:', error);
        return null;
      }
    }
    return null;
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    console.log('🔐 AuthService: Logging out...');

    // Call backend logout endpoint
    this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          console.log('🔐 AuthService: Server logout successful');
        },
        error: (error) => {
          console.error('🔐 AuthService: Server logout error:', error);
        },
        complete: () => {
          this.clearAuthData();
          this.router.navigate(['/home']);
        }
      });
  }

  // Make this method public so AuthGuard can use it
  public clearAuthData(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('authToken');
    localStorage.removeItem('loginTimestamp');
    this.currentUserSubject.next(null);
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
    const user = localStorage.getItem('currentUser');
    const authToken = localStorage.getItem('authToken');
    const loginTimestamp = localStorage.getItem('loginTimestamp');

    // Check if session has expired (optional - adjust time as needed)
    if (loginTimestamp) {
      const sessionAge = Date.now() - parseInt(loginTimestamp);
      const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      if (sessionAge > maxSessionAge) {
        console.log('🔐 AuthService: Session expired due to age');
        this.clearAuthData();
        return false;
      }
    }

    const result = !!(user && authToken);

    console.log('🔐 AuthService: isAuthenticated check:');
    console.log('  - currentUser exists:', !!user);
    console.log('  - authToken exists:', !!authToken);
    console.log('  - final result:', result);

    return result;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('🔐 AuthService: Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }
}
