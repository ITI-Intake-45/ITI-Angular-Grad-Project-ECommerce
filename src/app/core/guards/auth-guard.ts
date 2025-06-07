
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  canActivate(): Observable<boolean> | boolean {
    console.log('🔒 AuthGuard: canActivate called');

    // First check localStorage authentication
    const isLocallyAuthenticated = this.authService.isAuthenticated();
    console.log('🔒 AuthGuard: Local authentication:', isLocallyAuthenticated);

    if (!isLocallyAuthenticated) {
      console.log('❌ AuthGuard: Not locally authenticated, redirecting to login');
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Validate session with backend
    console.log('🔒 AuthGuard: Validating session with backend...');
    return this.http.get('http://localhost:8080/api/v1/users/check-session', { withCredentials: true }).pipe(
      map((response: any) => {
        console.log('✅ AuthGuard: Backend session valid:', response);
        return true;
      }),
      catchError((error) => {
        console.log('❌ AuthGuard: Backend session invalid:', error);

        // Clear local authentication data if backend session is invalid
        this.authService.clearAuthData();

        // Redirect to login
        this.router.navigate(['/auth/login']);
        return of(false);
      })
    );
  }
}
