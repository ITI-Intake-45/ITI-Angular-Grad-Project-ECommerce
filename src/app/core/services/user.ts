import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { tap, catchError, delay } from 'rxjs/operators';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  creditBalance: number;
  // avatar?: string;
  // joinDate?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  public userProfile$ = this.userProfileSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Mock method for testing (ACTIVE)
  getMockProfile(): Observable<UserProfile> {
    const mockProfile: UserProfile = {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      address: '123 Main Street, New York, NY 10001',
      phone: '+1 (555) 123-4567',
      creditBalance: 250.75,
      // avatar: null,
      // joinDate: new Date('2024-01-15')
    };

    return of(mockProfile).pipe(
      delay(800), // Simulate network delay
      tap(profile => {
        console.log('Mock profile loaded:', profile);
        this.userProfileSubject.next(profile);
      }),
      catchError(this.handleError)
    );
  }

  // Get user profile from API (COMMENTED OUT)
  getProfile(): Observable<UserProfile> {
    // Using mock data instead of API
    return this.getMockProfile();

    /*
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`).pipe(
      tap(profile => {
        console.log('Profile loaded from API:', profile);
        this.userProfileSubject.next(profile);
      }),
      catchError(this.handleError)
    );
    */
  }

  // Mock update profile method
  getMockUpdateProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
    const currentProfile = this.userProfileSubject.value;
    const updatedProfile: UserProfile = {
      ...currentProfile!,
      ...profile
    };

    return of(updatedProfile).pipe(
      delay(600), // Simulate network delay
      tap(updated => {
        console.log('Mock profile updated:', updated);
        this.userProfileSubject.next(updated);
      }),
      catchError(this.handleError)
    );
  }

  // Update profile (COMMENTED OUT)
  updateProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
    // Using mock data instead of API
    return this.getMockUpdateProfile(profile);

    /*
    return this.http.put<UserProfile>(`${this.apiUrl}/profile`, profile).pipe(
      tap(updatedProfile => this.userProfileSubject.next(updatedProfile)),
      catchError(this.handleError)
    );
    */
  }

  // Mock change password method
  getMockChangePassword(oldPassword: string, newPassword: string): Observable<any> {
    return of({ success: true, message: 'Password changed successfully' }).pipe(
      delay(500), // Simulate network delay
      tap(result => console.log('Mock password change:', result)),
      catchError(this.handleError)
    );
  }

  // Change password (COMMENTED OUT)
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    // Using mock data instead of API
    return this.getMockChangePassword(oldPassword, newPassword);

    /*
    return this.http.post(`${this.apiUrl}/change-password`, {
      oldPassword,
      newPassword
    }).pipe(catchError(this.handleError));
    */
  }

  // Mock get all users method
  getMockAllUsers(): Observable<UserProfile[]> {
    const mockUsers: UserProfile[] = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        address: '123 Main Street, New York, NY 10001',
        phone: '+1 (555) 123-4567',
        creditBalance: 250.75,
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        address: '456 Oak Avenue, Los Angeles, CA 90210',
        phone: '+1 (555) 987-6543',
        creditBalance: 180.50,
      },
      {
        id: 3,
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        address: '789 Pine Street, Chicago, IL 60601',
        phone: '+1 (555) 555-1234',
        creditBalance: 420.00,
      }
    ];

    return of(mockUsers).pipe(
      delay(700), // Simulate network delay
      tap(users => console.log('Mock users loaded:', users)),
      catchError(this.handleError)
    );
  }

  // Get all users (COMMENTED OUT)
  getAllUsers(): Observable<UserProfile[]> {
    // Using mock data instead of API
    return this.getMockAllUsers();

    /*
    return this.http.get<UserProfile[]>(`${this.apiUrl}/admin`).pipe(
      catchError(this.handleError)
    );
    */
  }

  // Mock update credit balance method
  getMockUpdateCreditBalance(amount: number): Observable<any> {
    const currentProfile = this.userProfileSubject.value;
    if (currentProfile) {
      const updatedProfile = {
        ...currentProfile,
        creditBalance: currentProfile.creditBalance + amount
      };

      return of({ success: true, newBalance: updatedProfile.creditBalance }).pipe(
        delay(500), // Simulate network delay
        tap(result => {
          console.log('Mock credit balance updated:', result);
          this.userProfileSubject.next(updatedProfile);
        }),
        catchError(this.handleError)
      );
    }

    return of({ success: false, message: 'No profile found' });
  }

  // Update credit balance (COMMENTED OUT)
  updateCreditBalance(amount: number): Observable<any> {
    // Using mock data instead of API
    return this.getMockUpdateCreditBalance(amount);

    /*
    return this.http.post(`${this.apiUrl}/credit`, { amount }).pipe(
      tap(() => {
        // Refresh profile to get updated credit balance
        this.getProfile().subscribe();
      }),
      catchError(this.handleError)
    );
    */
  }

  // Get current user profile from subject
  getCurrentUserProfile(): UserProfile | null {
    return this.userProfileSubject.value;
  }

  // Clear user profile (useful for logout)
  clearProfile(): void {
    this.userProfileSubject.next(null);
  }

  // Load initial mock profile (useful for testing)
  loadMockProfile(): void {
    this.getMockProfile().subscribe();
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('User Service Error:', error);

    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} ${error.message}`;
      if (error.error && error.error.message) {
        errorMessage += ` - ${error.error.message}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
