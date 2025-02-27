import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../Common/header/header.component";
import { FooterComponent } from "../Common/footer/footer.component";
import { CommonModule } from '@angular/common';
import { PpfService } from '../shared/services/ppf.service';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('buttonHover', [
      transition('* => hover', [
        animate('200ms', style({ transform: 'scale(1.1)' }))
      ]),
      transition('hover => *', [
        animate('200ms', style({ transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit {
  roleId: number | null = null;

  constructor(private service: PpfService, private router: Router) {}

  viewCompanies() {
    this.router.navigateByUrl('/client');
  }
  viewRoles() {
    this.router.navigateByUrl('/role');
  }
  viewUsers() {
    this.router.navigateByUrl('/user');
  }

  ngOnInit(): void {
    const storedRoleId = localStorage.getItem('roleId');
    this.roleId = storedRoleId ? parseInt(storedRoleId, 10) : null;
    console.log('Role ID:', this.roleId);
  }
}
