import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';

// Define the missing interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  creditBalance: number;
  password: string;
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
  /*
    register(userData: RegisterRequest): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/register`, userData);
    }
      */

  /*
register(newUser: RegisterRequest) {

  console.log('📝 AuthService: Starting registration process...');

  this.http.post<UserLoginDto>(this.baseUrl + "/register", newUser, { withCredentials: true })
    .pipe(
      switchMap((registerResponse) => {
        console.log('📝 AuthService: Registration successful, response:', registerResponse);

        // Store user data
        localStorage.setItem('currentUser', JSON.stringify(registerResponse));

        localStorage.setItem('registerTimestamp', Date.now().toString());
        localStorage.setItem('authToken', 'authenticated');
        this.currentUserSubject.next(registerResponse);

        console.log('📝 AuthService: Now loading full profile...');

        // Load full profile after registration
        return this.http.get<any>(`${this.baseUrl}/profile`, { withCredentials: true })
          .pipe(
            tap(profile => {
              console.log('📝 AuthService: Full profile loaded:', profile);
              localStorage.setItem('userProfile', JSON.stringify(profile));
            }),
            catchError(error => {
              console.error('📝 AuthService: Error loading profile after registration:', error);
              return new Observable(observer => {
                observer.next(registerResponse);
                observer.complete();
              });
            })
          );
      })
    )
    .subscribe({
      next: (profile) => {
        console.log('📝 AuthService: Registration and profile loading completed');
        alert("🎉 Welcome! Your account has been created.");

        setTimeout(() => {
          console.log('📝 AuthService: Navigating to home...');
        }, 100);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('📝 AuthService: Registration error:', error);
        if (error.status === 409) {
          alert('❌ Email or phone number already in use.');
        } else {
          alert('⚠️ Something went wrong. Please try again later.');

        }

      }
    });
}

*/
  register(newUser: RegisterRequest) {
    console.log('📝 AuthService: Starting registration process...');
    alert("new user: " + newUser.creditBalance);
    this.http.post<UserLoginDto>(this.baseUrl + "/register", newUser)
      .subscribe({
        next: (response) => {
          console.log('📝 AuthService: Registration successful:', response);

          alert("🎉 Welcome! Your account has been created.");
          console.log('📝 AuthService: Navigating to home...');

        },
        error: (error) => {
          console.error('📝 AuthService: Registration error:', error);
          if (error.status === 409) {
            alert('❌ Email or phone number already in use.');
          } else {
            alert('⚠️ Something went wrong. Please try again later.');
          }
        }
      });
  }

  logout(): void {
    console.log('🔐 AuthService: Logging out...');

    // First clear local data
    this.clearAuthData();

    // Then call the backend logout endpoint
    this.http.post(`${this.baseUrl}/logout`, {}, {
      withCredentials: true,
      // Force browser to clear HTTP Basic credentials by sending invalid credentials
      headers: new HttpHeaders({
        'Authorization': 'Basic '
      })
    })
      .subscribe({
        next: () => {
          console.log('🔐 AuthService: Server logout successful');
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('🔐 AuthService: Server logout error:', error);
          // Even if there's an error, navigate away
          this.router.navigate(['/home']);
        }
      });
  }

  isSessionValid(): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/check-session`, {
      withCredentials: true
    }).pipe(
      catchError(err => {
        if (err.status === 401) {
          this.clearAuthData();
          return of(false);
        }
        return throwError(err);
      })
    );
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
