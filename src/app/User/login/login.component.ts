import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FooterComponent } from "../../Common/footer/footer.component";
import { Router } from '@angular/router';
import { HeaderComponent } from "../../Common/header/header.component";
import { PpfService } from '../../shared/services/ppf.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FooterComponent, HeaderComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitted: boolean = false;

  constructor(private fb: FormBuilder,
    private router: Router,
    private service: PpfService,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      emailId: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  onSubmit() {
    this.isSubmitted = true;

    // Toastr message for failed validation
    if (this.loginForm.invalid) {
      this.toastr.error('Please fill in all required fields correctly', 'Validation Failed');
      return;
    }

    this.service.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        console.log('api response', res);
        localStorage.setItem('token', res.token);

        // Decode token and extract RoleId
        const roleId = this.service.getRoleIdFromToken();
        console.log('Extracted RoleId:', roleId); // ✅ Debugging
        const userId = this.service.getUserIdFromToken();
        console.log('extracted UserId',userId);
        

        if (roleId !== null && userId!== null) {
          // Store the roleId in localStorage
          localStorage.setItem('roleId', roleId.toString());
          localStorage.setItem('userId', userId.toString());
          // Toastr success message on successful login
          this.toastr.success('Login successful', 'Welcome Back!');

          // After storing the roleId, you can directly navigate to the dashboard page
          this.router.navigateByUrl('/dashboard');
        } else {
          console.error('RoleId not found in token');
        }
      },
      error: (err) => {
        if (err.status === 400) {
          this.toastr.error('Incorrect Email or Password', 'Login Failed');
        } else {
          console.error('Error during login:', err);
        }
      }
    });
  }
}
