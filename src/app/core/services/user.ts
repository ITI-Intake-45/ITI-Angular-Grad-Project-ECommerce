import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, BehaviorSubject, throwError, of} from 'rxjs';
import {tap, catchError, delay, map, switchMap} from 'rxjs/operators';
import {User} from './auth';

export interface UserProfile {
  userId: number; // Rename or add userId here
  id?: number;    // Optional, for flexibility
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

export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
}

export interface PasswordChangeResponse {
  success: boolean;
  message: string;
}

export interface AddBalanceRequest {
  credit: number;
}

export interface AddBalanceResponse {
  success: boolean;
  message: string;
  newBalance: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/v1/users';
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  public userProfile$ = this.userProfileSubject.asObservable();
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();


  constructor(private http: HttpClient) {
    // Check if there's a stored profile from login
    this.loadStoredProfile();
  }

  // Load profile from localStorage if available
  private loadStoredProfile(): void {
    const profileData = localStorage.getItem('userProfile');
    if (profileData) {
      try {
        const profile = JSON.parse(profileData);
        console.log('📁 UserService: Loaded stored profile:', profile);
        this.userProfileSubject.next(profile);
      } catch (error) {
        console.error('📁 UserService: Error parsing stored profile:', error);
        localStorage.removeItem('userProfile');
      }
    }
  }

  // Get user profile - first check if we have it in memory, otherwise fetch from API
  // getProfile(): Observable<UserProfile> {
  //   const currentProfile = this.getCurrentUserProfile();
  //
  //   // If we already have the profile in memory, return it
  //   if (currentProfile) {
  //     console.log('📁 UserService: Returning cached profile');
  //     return of(currentProfile);
  //   }
  //
  //   // Otherwise fetch from API
  //   console.log('📁 UserService: Fetching profile from API');
  //   return this.http.get<UserProfile>(`${this.apiUrl}/profile`).pipe(
  //     tap(profile => {
  //       console.log('📁 UserService: Profile loaded from API:', profile);
  //       this.userProfileSubject.next(profile);
  //       // Store in localStorage for persistence
  //       localStorage.setItem('userProfile', JSON.stringify(profile));
  //     }),
  //     catchError(this.handleError)
  //   );
  // }

  // UserService: Map userId to id to resolve mismatched expectations
  getProfile(): Observable<UserProfile> {
    const currentProfile = this.getCurrentUserProfile();

    if (currentProfile) {
      console.log('📁 UserService: Returning cached profile');
      return of(currentProfile);
    }

    return this.http.get<UserProfile>(`${this.apiUrl}/profile`).pipe(
      map(profile => {
        console.log('📁 UserService: Profile loaded from API:', profile);
        // Map userId to id for consistency
        const mappedProfile = { ...profile, id: profile.userId };
        this.userProfileSubject.next(mappedProfile);
        localStorage.setItem('userProfile', JSON.stringify(mappedProfile));
        return mappedProfile;
      }),
      catchError(this.handleError)
    );
  }


  // Force refresh profile from API
  refreshProfile(): Observable<UserProfile> {
    console.log('📁 UserService: Force refreshing profile from API');
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`).pipe(
      tap(profile => {
        console.log('📁 UserService: Profile refreshed from API:', profile);
        this.userProfileSubject.next(profile);
        localStorage.setItem('userProfile', JSON.stringify(profile));
      }),
      catchError(this.handleError)
    );
  }

// Update profile method with better error handling
  updateProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
    console.log('🔄 UserService: Updating profile with data:', profile);

    return this.http.patch(`${this.apiUrl}/update-profile`, profile, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      },
      observe: 'response', // Get full response
      responseType: 'text' // Expect text response
    }).pipe(
      map((response) => {
        console.log('✅ UserService: Update profile response:', response);

        if (response.status === 200) {
          const responseBody = response.body;

          // Check if response indicates success
          if (responseBody && responseBody.includes('successfully')) {
            console.log('✅ Profile update successful');

            // Create updated profile object from the form data and current profile
            const currentProfile = this.getCurrentUserProfile();
            if (currentProfile) {
              const updatedProfile: UserProfile = {
                ...currentProfile,
                ...profile // Merge the updated fields
              };

              // Update the BehaviorSubject and localStorage immediately
              this.userProfileSubject.next(updatedProfile);
              localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

              // Also update currentUser in localStorage if it exists
              const currentUser = localStorage.getItem('currentUser');
              if (currentUser) {
                try {
                  const user = JSON.parse(currentUser);
                  const updatedUser = { ...user, ...profile };
                  localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                } catch (error) {
                  console.error('Error updating currentUser in localStorage:', error);
                }
              }

              return updatedProfile;
            } else {
              throw new Error('No current profile found');
            }
          } else if (responseBody && (responseBody.includes('exists') || responseBody.includes('error'))) {
            // Error response
            throw new Error(responseBody);
          } else {
            throw new Error('Unknown response from server');
          }
        } else {
          throw new Error('Update failed');
        }
      }),
      catchError((error: any) => {
        console.error('❌ UserService: Update profile error:', error);

        let errorMessage = 'Failed to update profile';

        if (error.message) {
          errorMessage = error.message;
        } else if (error.error) {
          errorMessage = error.error;
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // Clear profile data (called on logout)
  clearProfile(): void {
    this.userProfileSubject.next(null);
    localStorage.removeItem('userProfile');
  }

  // ===== CREDIT BALANCE METHODS =====
  addBalance(amount: number): Observable<AddBalanceResponse> {
    return this.http.post<AddBalanceResponse>(`${this.apiUrl}/changeBalance`, {credit: amount}).pipe(
      tap(response => {
        if (response.success) {
          // Update the local user profile with new balance
          const currentProfile = this.getCurrentUserProfile();
          if (currentProfile) {
            const updatedProfile = {...currentProfile, creditBalance: response.newBalance};
            this.userProfileSubject.next(updatedProfile);
            localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
          }
        }
      }),
      catchError(this.handleError)
    );
  }

  validateCreditAmount(amount: number): Observable<ValidationResult> {
    if (!amount || amount <= 0) {
      return of({valid: false, message: '❌ Amount must be greater than 0'});
    }

    if (amount > 10000) {
      return of({valid: false, message: '❌ Maximum amount per transaction is $10,000'});
    }

    const decimalPlaces = (amount.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      return of({valid: false, message: '❌ Amount can have maximum 2 decimal places'});
    }

    return of({valid: true, message: '✅ Valid amount'}).pipe(delay(200));
  }

  // ===== VALIDATION METHODS =====
  validateName(name: string): Observable<ValidationResult> {
    return this.getMockValidateName(name);
  }

  private getMockValidateName(name: string): Observable<ValidationResult> {
    if (!name || name.trim() === '') {
      return of({valid: false, message: '❌ Name is required'});
    }

    const namePattern = /^[A-Za-z ]{2,50}$/;
    if (!namePattern.test(name)) {
      return of({valid: false, message: '❌ Only letters and spaces (2-50 characters)'});
    }

    const restrictedNames = ['admin', 'administrator', 'root', 'test'];
    if (restrictedNames.includes(name.toLowerCase())) {
      return of({valid: false, message: '❌ This name is not allowed'}).pipe(delay(200));
    }

    return of({valid: true, message: '✅ Name is valid'}).pipe(delay(200));
  }

  validateEmail(email: string): Observable<ValidationResult> {
    return this.getMockValidateEmail(email);
  }

  private getMockValidateEmail(email: string): Observable<ValidationResult> {
    if (!email || email.trim() === '') {
      return of({valid: false, message: '❌ Email is required'});
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      return of({valid: false, message: '❌ Invalid email format'});
    }

    const existingEmails = ['test@example.com', 'admin@example.com', 'user@test.com'];
    const currentUser = this.getCurrentUserProfile();

    if (currentUser && currentUser.email === email) {
      return of({valid: true, message: '✅ Current email'}).pipe(delay(300));
    }

    const emailExists = existingEmails.includes(email.toLowerCase());

    return of({
      valid: !emailExists,
      message: emailExists ? '❌ Email already in use!' : '✅ Email available!'
    }).pipe(delay(300));
  }

  validatePhone(phone: string): Observable<ValidationResult> {
    return this.getMockValidatePhone(phone);
  }

  private getMockValidatePhone(phone: string): Observable<ValidationResult> {
    if (!phone || phone.trim() === '') {
      return of({valid: false, message: '❌ Phone is required'});
    }

    const phonePattern = /^01[0125]\d{8}$/;
    if (!phonePattern.test(phone)) {
      return of({valid: false, message: '❌ Must start with 010, 011, 012, or 015 followed by 8 digits'});
    }

    const existingPhones = ['01012345678', '01098765432', '01055512345'];
    const currentUser = this.getCurrentUserProfile();

    if (currentUser && currentUser.phone === phone) {
      return of({valid: true, message: '✅ Current phone number'}).pipe(delay(250));
    }

    const phoneExists = existingPhones.includes(phone);

    return of({
      valid: !phoneExists,
      message: phoneExists ? '❌ Phone number already in use!' : '✅ Phone number available!'
    }).pipe(delay(250));
  }

  validateAddress(address: string): Observable<ValidationResult> {
    return this.getMockValidateAddress(address);
  }

  private getMockValidateAddress(address: string): Observable<ValidationResult> {
    if (!address || address.trim() === '') {
      return of({valid: false, message: '❌ Address is required'});
    }

    if (address.length < 5) {
      return of({valid: false, message: '❌ Address must be at least 5 characters'});
    }

    if (address.length > 100) {
      return of({valid: false, message: '❌ Address must be less than 100 characters'});
    }

    return of({valid: true, message: '✅ Address is valid'}).pipe(delay(150));
  }

  // ===== PASSWORD METHODS =====
  validateCurrentPassword(password: string): Observable<ValidationResult> {
    return this.getMockValidateCurrentPassword(password);
  }

  private getMockValidateCurrentPassword(password: string): Observable<ValidationResult> {
    if (!password || password.trim() === '') {
      return of({valid: false, message: '❌ Current password is required'});
    }

    return of({valid: true, message: '✅ Password is valid'}).pipe(delay(400));
  }

  changePassword(oldPassword: string, newPassword: string): Observable<PasswordChangeResponse> {
    return this.http.post<PasswordChangeResponse>(`${this.apiUrl}/change-password`, {
      oldPassword,
      newPassword
    }).pipe(catchError(this.handleError));
  }

  // ===== UTILITY METHODS =====
  getCurrentUserProfile(): UserProfile | null {
    return this.userProfileSubject.value;
  }

  // Error handling
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('UserService error:', error);

    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.message || `Server error: ${error.status}`;
    }

    return throwError(() => new Error(errorMessage));
  }

  private handleValidationError(error: HttpErrorResponse): Observable<ValidationResult> {
    console.error('Validation error:', error);

    let message = 'Validation failed';

    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else {
      message = error.error?.message || 'Server validation error';
    }

    return of({valid: false, message: `❌ ${message}`});
  }
}
