
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardCommunicationService {
  private activateLinkSubject = new Subject<string>();

  // Observable that components can subscribe to
  activateLink$ = this.activateLinkSubject.asObservable();

  constructor() { }

  // Method to trigger link activation
  activateLink(route: string): void {
    this.activateLinkSubject.next(route);
  }
}
