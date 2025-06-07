import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, BehaviorSubject, throwError, of} from 'rxjs';
import {tap, catchError, delay, map, switchMap} from 'rxjs/operators';

export interface UserProfile {
  userId: number;  // ← Changed from 'id' to 'userId' to match backend
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
  getProfile(): Observable<UserProfile> {
    const currentProfile = this.getCurrentUserProfile();

    // If we already have the profile in memory, return it
    if (currentProfile) {
      console.log('📁 UserService: Returning cached profile');
      return of(currentProfile);
    }

    // Otherwise fetch from API
    console.log('📁 UserService: Fetching profile from API');
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`, {
      withCredentials: true, // Add this to include session cookies
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      tap(profile => {
        console.log('📁 UserService: Profile loaded from API:', profile);
        this.userProfileSubject.next(profile);
        // Store in localStorage for persistence
        localStorage.setItem('userProfile', JSON.stringify(profile));
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('📁 UserService: Get profile error:', error);

        if (error.status === 401) {
          // Session expired - clear all auth data
          this.clearProfile();
          localStorage.removeItem('currentUser');
          localStorage.removeItem('userProfile');
        }

        return this.handleError(error);
      })
    );
  }

  // Force refresh profile from API
  refreshProfile(): Observable<UserProfile> {
    console.log('📁 UserService: Force refreshing profile from API');
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`, {
      withCredentials: true, // Add this to include session cookies
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      tap(profile => {
        console.log('📁 UserService: Profile refreshed from API:', profile);
        this.userProfileSubject.next(profile);
        localStorage.setItem('userProfile', JSON.stringify(profile));
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('📁 UserService: Refresh profile error:', error);

        if (error.status === 401) {
          // Session expired - clear all auth data
          this.clearProfile();
          localStorage.removeItem('currentUser');
          localStorage.removeItem('userProfile');
        }

        return this.handleError(error);
      })
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
                  const updatedUser = {...user, ...profile};
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

  // Get current user profile (synchronous)
  getCurrentUserProfile(): UserProfile | null {
    return this.userProfileSubject.value;
  }

  // ===== CREDIT BALANCE METHODS =====
  addBalance(newTotalBalance: number): Observable<UserProfile> {
    console.log('💳 UserService: Updating balance to new total via real API:', newTotalBalance);

    return this.http.patch<UserProfile>(`${this.apiUrl}/change-balance`, {
      balance: newTotalBalance // Send the new total balance to backend
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      tap(updatedUserProfile => {
        console.log('💳 UserService: Balance updated successfully:', updatedUserProfile);

        // Update the BehaviorSubject with the new profile data from backend
        this.userProfileSubject.next(updatedUserProfile);

        // Update localStorage with the new profile
        localStorage.setItem('userProfile', JSON.stringify(updatedUserProfile));

        // Also update currentUser in localStorage if it exists
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          try {
            const user = JSON.parse(currentUser);
            const updatedUser = { ...user, creditBalance: updatedUserProfile.creditBalance };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          } catch (error) {
            console.error('Error updating currentUser in localStorage:', error);
          }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('💳 UserService: Add balance error:', error);

        let errorMessage = 'Failed to add balance';

        if (error.status === 400) {
          errorMessage = error.error || 'Invalid amount';
        } else if (error.status === 401) {
          errorMessage = 'User not authenticated';
        } else if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        }

        return throwError(() => new Error(errorMessage));
      })
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
    if (!password || password.trim() === '') {
      return of({valid: false, message: '❌ Current password is required'});
    }
    return of({valid: true, message: '✅ Valid'}).pipe(delay(200));
  }

  validateNewPassword(password: string): Observable<ValidationResult> {
    if (!password || password.trim() === '') {
      return of({valid: false, message: '❌ New password is required'});
    }

    if (password.length < 8) {
      return of({valid: false, message: '❌ Password must be at least 8 characters'});
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return of({
        valid: false,
        message: '❌ Password must contain uppercase, lowercase, number, and special character'
      });
    }

    return of({valid: true, message: '✅ Strong password'}).pipe(delay(300));
  }

  validateConfirmPassword(newPassword: string, confirmPassword: string): Observable<ValidationResult> {
    if (!confirmPassword || confirmPassword.trim() === '') {
      return of({valid: false, message: '❌ Confirm password is required'});
    }

    if (newPassword !== confirmPassword) {
      return of({valid: false, message: '❌ Passwords do not match'});
    }

    return of({valid: true, message: '✅ Passwords match'}).pipe(delay(150));
  }

  changePassword(oldPassword: string, newPassword: string): Observable<PasswordChangeResponse> {
    return this.http.patch(`${this.apiUrl}/change-password`, {
      oldPassword,
      newPassword
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      },
      observe: 'response',
      responseType: 'text'
    }).pipe(
      map(response => {
        if (response.status === 200 && response.body?.includes('successfully')) {
          return {
            success: true,
            message: 'Password changed successfully'
          };
        } else {
          throw new Error(response.body || 'Failed to change password');
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('🔐 UserService: Change password error:', error);

        let message = 'Failed to change password';

        if (error.status === 400) {
          message = error.error || 'Invalid current password';
        } else if (error.status === 401) {
          message = 'User not authenticated';
        } else if (error.error && typeof error.error === 'string') {
          message = error.error;
        }

        return throwError(() => ({
          success: false,
          message: message
        }));
      })
    );
  }

  // Error handling
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('UserService error:', error);

    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      switch (error.status) {
        case 401:
          errorMessage = 'Authentication required. Please log in again.';
          break;
        case 403:
          errorMessage = 'Access denied.';
          break;
        case 404:
          errorMessage = 'User profile not found.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = error.error?.message || `Server error: ${error.status}`;
          break;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
