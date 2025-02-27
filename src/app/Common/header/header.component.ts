import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';  // Import ToastrService

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  userDetails: any = null;
  showDropdown: boolean = false;
  currentRoute: string = '';
  isDashboard: boolean = false;
  isManagementPage: boolean = false; // Covers Client, User, and Role pages

  constructor(private router: Router, private toastr: ToastrService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
        this.isDashboard = this.currentRoute.startsWith('/dashboard');
        this.isManagementPage = ['/client', '/user', '/role'].some(path => this.currentRoute.startsWith(path));
      }
    });
  }

  ngOnInit(): void {
    this.getLoggedInUser();
  }

  getLoggedInUser() {
    const user = localStorage.getItem('user');
    if (user) {
      this.userDetails = JSON.parse(user);
    }
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout() {
    console.log('User logged out');
    localStorage.clear();
    this.toastr.success('You have logged out successfully', 'Logout Successful');  // Toastr success message
    this.router.navigate(['/login']);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    if (!(event.target as HTMLElement).closest('.dropdown-container')) {
      this.showDropdown = false;
    }
  }
}
