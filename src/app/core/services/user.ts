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
  }

  // ===== CREDIT BALANCE METHODS =====

  // Add credit balance (mock implementation)
  getMockAddBalance(amount: number): Observable<AddBalanceResponse> {
    if (!amount || amount <= 0) {
      return throwError(() => new Error('Invalid amount'));
    }

    const currentUser = this.getCurrentUserProfile();
    if (!currentUser) {
      return throwError(() => new Error('User not found'));
    }

    const newBalance = currentUser.creditBalance + amount;

    return of({
      success: true,
      message: `Successfully added $${amount.toFixed(2)} to your credit balance!`,
      newBalance: newBalance
    }).pipe(delay(800));
  }

  // Add credit balance (ACTIVE - using mock)
  addBalance(amount: number): Observable<AddBalanceResponse> {
    // return this.getMockAddBalance(amount);


    // Real API implementation (commented out)
    return this.http.post<AddBalanceResponse>(`${this.apiUrl}/changeBalance`, { credit: amount }).pipe(
      tap(response => {
        if (response.success) {
          // Update the local user profile with new balance
          const currentProfile = this.getCurrentUserProfile();
          if (currentProfile) {
            const updatedProfile = { ...currentProfile, creditBalance: response.newBalance };
            this.userProfileSubject.next(updatedProfile);
          }
        }
      }),
      catchError(this.handleError)
    );

  }

  // Validate credit amount
  validateCreditAmount(amount: number): Observable<ValidationResult> {
    if (!amount || amount <= 0) {
      return of({ valid: false, message: '❌ Amount must be greater than 0' });
    }

    if (amount > 10000) {
      return of({ valid: false, message: '❌ Maximum amount per transaction is $10,000' });
    }

    // Check if amount has more than 2 decimal places
    const decimalPlaces = (amount.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      return of({ valid: false, message: '❌ Amount can have maximum 2 decimal places' });
    }

    return of({ valid: true, message: '✅ Valid amount' }).pipe(delay(200));
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

  // ===== PASSWORD METHODS =====

  // Mock current password validation
  getMockValidateCurrentPassword(password: string): Observable<ValidationResult> {
    if (!password || password.trim() === '') {
      return of({ valid: false, message: '❌ Current password is required' });
    }

    // Simulate server validation delay
    return of({ valid: true, message: '✅ Password is valid' }).pipe(delay(400));

    /*
    // For real implementation, you might want to simulate some failed cases:
    const mockCurrentPassword = 'currentPass123'; // This would come from server
    if (password === mockCurrentPassword) {
      return of({ valid: true, message: '✅ Password is valid' }).pipe(delay(400));
    } else {
      return of({ valid: false, message: '❌ Invalid current password' }).pipe(delay(400));
    }
    */
  }

  // Validate current password (ACTIVE - using mock)
  validateCurrentPassword(password: string): Observable<ValidationResult> {
    return this.getMockValidateCurrentPassword(password);

    /*
    // Real API implementation (commented out)
    return this.http.post<ValidationResult>(`${this.apiUrl}/validate/current-password`, { password }).pipe(
      catchError(this.handleValidationError)
    );
    */
  }

  // Mock change password
  getMockChangePassword(oldPassword: string, newPassword: string): Observable<PasswordChangeResponse> {
    // Simulate validation
    if (!oldPassword || !newPassword) {
      return throwError(() => new Error('Both passwords are required'));
    }

    if (newPassword.length < 8) {
      return throwError(() => new Error('New password must be at least 8 characters'));
    }

    if (oldPassword === newPassword) {
      return throwError(() => new Error('New password must be different from current password'));
    }

    // Simulate successful password change
    return of({
      success: true,
      message: 'Password changed successfully'
    }).pipe(delay(600));
  }

  // Change password (ACTIVE - using mock)
  changePassword(oldPassword: string, newPassword: string): Observable<PasswordChangeResponse> {
    // return this.getMockChangePassword(oldPassword, newPassword);


    // Real API implementation (commented out)
    return this.http.post<PasswordChangeResponse>(`${this.apiUrl}/change-password`, {
      oldPassword,
      newPassword
    }).pipe(catchError(this.handleError));

  }

  // ===== EXISTING METHODS =====

  // Get user profile (ACTIVE - using real API)
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/1`).pipe(
      tap(profile => {
        console.log('Profile loaded from API:', profile);
        this.userProfileSubject.next(profile);
      }),
      catchError(this.handleError)
    );
  }

  // Update profile (ACTIVE - using real API)
  updateProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/1`, profile).pipe(
      tap(updatedProfile => this.userProfileSubject.next(updatedProfile)),
      catchError(this.handleError)
    );
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
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Server error: ${error.status}`;
    }

    return throwError(() => new Error(errorMessage));
  }

  // Validation error handling
  private handleValidationError(error: HttpErrorResponse): Observable<ValidationResult> {
    console.error('Validation error:', error);

    let message = 'Validation failed';

    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else {
      message = error.error?.message || 'Server validation error';
    }

    return of({ valid: false, message: `❌ ${message}` });
  }
}
