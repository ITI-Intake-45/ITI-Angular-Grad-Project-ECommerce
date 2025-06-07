import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log('🔧 AuthInterceptor: Intercepting request to:', request.url);

    // Check if user is authenticated
    const isAuthenticated = this.authService.isAuthenticated();
    console.log('🔧 AuthInterceptor: User authenticated:', isAuthenticated);

    // our backend uses cookies, we need to include credentials
    // instead of sending a Bearer token
    if (isAuthenticated && request.url.includes('localhost:8080')) {
      console.log('🔧 AuthInterceptor: Adding withCredentials to request');
      request = request.clone({
        setHeaders: {
          'Content-Type': 'application/json'
        },
        withCredentials: true // This ensures cookies are sent
      });
    }

    return next.handle(request);
  }
}
