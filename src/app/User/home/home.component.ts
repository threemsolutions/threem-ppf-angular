import { Component } from '@angular/core';
import { FooterComponent } from '../../Common/footer/footer.component';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { HeaderComponent } from "../../Common/header/header.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FooterComponent, RouterLink, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  submitContactForm(name: string, email: string, message: string) {
    console.log('Contact Form Submitted:', { name, email, message });
    alert('Thank you for reaching out!');
  }
}
