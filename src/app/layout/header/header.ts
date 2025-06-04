import { Component  } from '@angular/core';
import { AuthService } from '../../core/services/auth';


@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  standalone:false
})
export class Header {
  constructor(public authService: AuthService) {}
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onSearch(event: any) {
    const searchTerm = event.target.value;
    console.log('Searching for:', searchTerm);
    // Implement your search logic here
  }
  closeMenu() {
    this.isMenuOpen = false;
  }

}

