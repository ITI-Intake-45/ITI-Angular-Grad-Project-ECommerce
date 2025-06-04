import { Component  } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  standalone:false
})
export class Header {
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onSearch(event: any) {
    const searchTerm = event.target.value;
    console.log('Searching for:', searchTerm);
    // Implement your search logic here
  }
}
