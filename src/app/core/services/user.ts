import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  creditBalance: number;
  avatar?: string;
  joinDate?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  public userProfile$ = this.userProfileSubject.asObservable();

  constructor(private http: HttpClient) { }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`).pipe(
      tap(profile => this.userProfileSubject.next(profile))
    );
  }

  updateProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/profile`, profile).pipe(
      tap(updatedProfile => this.userProfileSubject.next(updatedProfile))
    );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, {
      oldPassword,
      newPassword
    });
  }

  getAllUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.apiUrl}/admin`);
  }

  updateCreditBalance(amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/credit`, { amount }).pipe(
      tap(() => {
        // Refresh profile to get updated credit balance
        this.getProfile().subscribe();
      })
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
}
