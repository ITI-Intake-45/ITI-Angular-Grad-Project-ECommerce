
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { tap, catchError, delay, debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  creditBalance: number;
}

export interface ValidationResult {
  valid: boolean;
  message: string;
  loading?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/v1/users';
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  public userProfile$ = this.userProfileSubject.asObservable();

  constructor(private http: HttpClient) {
  }

  // ===== VALIDATION METHODS =====


  getMockValidateName(name: string): Observable<ValidationResult> {
    if (!name || name.trim() === '') {
      return of({ valid: false, message: '❌ Name is required' });
    }

    const namePattern = /^[A-Za-z ]{2,50}$/;
    if (!namePattern.test(name)) {
      return of({ valid: false, message: '❌ Only letters and spaces (2-50 characters)' });
    }

    // Simulate checking against restricted names
    const restrictedNames = ['admin', 'administrator', 'root', 'test'];
    if (restrictedNames.includes(name.toLowerCase())) {
      return of({ valid: false, message: '❌ This name is not allowed' }).pipe(delay(200));
    }

    return of({ valid: true, message: '✅ Name is valid' }).pipe(delay(200));
  }

  // Validate name (ACTIVE - using mock)
  validateName(name: string): Observable<ValidationResult> {
    return this.getMockValidateName(name);

    /*
    // Real API implementation (commented out)
    return this.http.post<ValidationResult>(`${this.apiUrl}/validate/name`, { name }).pipe(
      catchError(this.handleValidationError)
    );
    */
  }

  // Mock email validation (ACTIVE)
  getMockValidateEmail(email: string): Observable<ValidationResult> {
    if (!email || email.trim() === '') {
      return of({ valid: false, message: '❌ Email is required' });
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      return of({ valid: false, message: '❌ Invalid email format' });
    }

    // Check against existing emails
    const existingEmails = ['test@example.com', 'admin@example.com', 'user@test.com'];
    const currentUser = this.getCurrentUserProfile();

    // If it's the current user's email, it's available
    if (currentUser && currentUser.email === email) {
      return of({ valid: true, message: '✅ Current email' }).pipe(delay(300));
    }

    // Check if email exists
    const emailExists = existingEmails.includes(email.toLowerCase());

    return of({
      valid: !emailExists,
      message: emailExists ? '❌ Email already in use!' : '✅ Email available!'
    }).pipe(delay(300));
  }

  // Validate email (ACTIVE - using mock)
  validateEmail(email: string): Observable<ValidationResult> {
    return this.getMockValidateEmail(email);

    /*
    // Real API implementation (commented out)
    return this.http.post<ValidationResult>(`${this.apiUrl}/validate/email`, { email }).pipe(
      catchError(this.handleValidationError)
    );
    */
  }

  // Mock phone validation (ACTIVE)
  getMockValidatePhone(phone: string): Observable<ValidationResult> {
    if (!phone || phone.trim() === '') {
      return of({ valid: false, message: '❌ Phone is required' });
    }

    const phonePattern = /^01[0125]\d{8}$/;
    if (!phonePattern.test(phone)) {
      return of({ valid: false, message: '❌ Must start with 010, 011, 012, or 015 followed by 8 digits' });
    }

    // Simulate checking against existing phone numbers
    const existingPhones = ['01012345678', '01098765432', '01055512345'];
    const currentUser = this.getCurrentUserProfile();

    // If it's the current user's phone, it's available
    if (currentUser && currentUser.phone === phone) {
      return of({ valid: true, message: '✅ Current phone number' }).pipe(delay(250));
    }

    // Check if phone exists
    const phoneExists = existingPhones.includes(phone);

    return of({
      valid: !phoneExists,
      message: phoneExists ? '❌ Phone number already in use!' : '✅ Phone number available!'
    }).pipe(delay(250));
  }

  // Validate phone (ACTIVE - using mock)
  validatePhone(phone: string): Observable<ValidationResult> {
    return this.getMockValidatePhone(phone);

    /*
    // Real API implementation (commented out)
    return this.http.post<ValidationResult>(`${this.apiUrl}/validate/phone`, { phone }).pipe(
      catchError(this.handleValidationError)
    );
    */
  }

  // Mock address validation (ACTIVE)
  getMockValidateAddress(address: string): Observable<ValidationResult> {
    if (!address || address.trim() === '') {
      return of({ valid: false, message: '❌ Address is required' });
    }

    if (address.length < 5) {
      return of({ valid: false, message: '❌ Address must be at least 5 characters' });
    }

    if (address.length > 100) {
      return of({ valid: false, message: '❌ Address must be less than 100 characters' });
    }

    return of({ valid: true, message: '✅ Address is valid' }).pipe(delay(150));
  }

  // Validate address (ACTIVE - using mock)
  validateAddress(address: string): Observable<ValidationResult> {
    return this.getMockValidateAddress(address);

    /*
    // Real API implementation (commented out)
    return this.http.post<ValidationResult>(`${this.apiUrl}/validate/address`, { address }).pipe(
      catchError(this.handleValidationError)
    );
    */
  }

  // ===== EXISTING METHODS =====

  // Mock method for testing (ACTIVE)
  // getMockProfile(): Observable<UserProfile> {
  //   const mockProfile: UserProfile = {
  //     id: 1,
  //     name: 'John Doe',
  //     email: 'john.doe@example.com',
  //     address: '123 Main Street, New York, NY 10001',
  //     phone: '01012345678',
  //     creditBalance: 250.75,
  //   };
  //
  //   return of(mockProfile).pipe(
  //     delay(800), // Simulate network delay
  //     tap(profile => {
  //       console.log('Mock profile loaded:', profile);
  //       this.userProfileSubject.next(profile);
  //     }),
  //     catchError(this.handleError)
  //   );
  // }

  // Get user profile (ACTIVE - using mock)
  getProfile(): Observable<UserProfile> {
    // return this.getMockProfile();


    // Real API implementation (commented out)
    return this.http.get<UserProfile>(`${this.apiUrl}/1`).pipe(
      tap(profile => {
        console.log('Profile loaded from API:', profile);
        this.userProfileSubject.next(profile);
      }),
      catchError(this.handleError)
    );

  }

  // // Mock update profile method (ACTIVE)
  // getMockUpdateProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
  //   const currentProfile = this.userProfileSubject.value;
  //   const updatedProfile: UserProfile = {
  //     ...currentProfile!,
  //     ...profile
  //   };
  //
  //   return of(updatedProfile).pipe(
  //     delay(600), // Simulate network delay
  //     tap(updated => {
  //       console.log('Mock profile updated:', updated);
  //       // THIS IS KEY: Update the BehaviorSubject to persist the data
  //       this.userProfileSubject.next(updated);
  //     }),
  //     catchError(this.handleError)
  //   );
  // }

  // Update profile (ACTIVE - using mock)
  updateProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
    // return this.getMockUpdateProfile(profile);


    // Real API implementation (commented out)
    return this.http.put<UserProfile>(`${this.apiUrl}/1`, profile).pipe(
      tap(updatedProfile => this.userProfileSubject.next(updatedProfile)),
      catchError(this.handleError)
    );

  }



  // Change password (ACTIVE - using mock)
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    // return this.getMockChangePassword(oldPassword, newPassword);


    // Real API implementation (commented out)
    return this.http.post(`${this.apiUrl}/change-password`, {
      oldPassword,
      newPassword
    }).pipe(catchError(this.handleError));

  }
  //
  // // Mock get all users method (ACTIVE)
  // getMockAllUsers(): Observable<UserProfile[]> {
  //   const mockUsers: UserProfile[] = [
  //     {
  //       id: 1,
  //       name: 'John Doe',
  //       email: 'john.doe@example.com',
  //       address: '123 Main Street, New York, NY 10001',
  //       phone: '01012345678',
  //       creditBalance: 250.75,
  //     },
  //     {
  //       id: 2,
  //       name: 'Jane Smith',
  //       email: 'jane.smith@example.com',
  //       address: '456 Oak Avenue, Los Angeles, CA 90210',
  //       phone: '01098765432',
  //       creditBalance: 180.50,
  //     },
  //     {
  //       id: 3,
  //       name: 'Mike Johnson',
  //       email: 'mike.johnson@example.com',
  //       address: '789 Pine Street, Chicago, IL 60601',
  //       phone: '01055512345',
  //       creditBalance: 420.00,
  //     }
  //   ];
  //
  //   return of(mockUsers).pipe(
  //     delay(700), // Simulate network delay
  //     tap(users => console.log('Mock users loaded:', users)),
  //     catchError(this.handleError)
  //   );
  // }

  // Get all users (ACTIVE - using mock)
  getAllUsers(): Observable<UserProfile[]> {
    // return this.getMockAllUsers();


    // Real API implementation (commented out)
    return this.http.get<UserProfile[]>(`${this.apiUrl}/admin`).pipe(
      catchError(this.handleError)
    );

  }
  //
  // // Mock update credit balance method (ACTIVE)
  // getMockUpdateCreditBalance(amount: number): Observable<any> {
  //   const currentProfile = this.userProfileSubject.value;
  //   if (currentProfile) {
  //     const updatedProfile = {
  //       ...currentProfile,
  //       creditBalance: currentProfile.creditBalance + amount
  //     };
  //
  //     return of({ success: true, newBalance: updatedProfile.creditBalance }).pipe(
  //       delay(500), // Simulate network delay
  //       tap(result => {
  //         console.log('Mock credit balance updated:', result);
  //         this.userProfileSubject.next(updatedProfile);
  //       }),
  //       catchError(this.handleError)
  //     );
  //   }
  //
  //   return of({ success: false, message: 'No profile found' });
  // }

  // Update credit balance (ACTIVE - using mock)
  updateCreditBalance(amount: number): Observable<any> {
    // return this.getMockUpdateCreditBalance(amount);


    // Real API implementation (commented out)
    return this.http.post(`${this.apiUrl}/credit`, { amount }).pipe(
      tap(() => {
        // Refresh profile to get updated credit balance
        this.getProfile().subscribe();
      }),
      catchError(this.handleError)
    );

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
  // loadMockProfile(): void {
  //   this.getMockProfile().subscribe();
  // }

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

  private handleValidationError = (error: HttpErrorResponse): Observable<ValidationResult> => {
    console.error('Validation Error:', error);
    return of({ valid: false, message: '❌ Validation failed. Please try again.' });
  }
}
