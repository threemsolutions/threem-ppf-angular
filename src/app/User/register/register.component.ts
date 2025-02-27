import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { FooterComponent } from "../../Common/footer/footer.component";
import { Router } from '@angular/router';
import { HeaderComponent } from "../../Common/header/header.component";
import { PpfService } from '../../shared/services/ppf.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FooterComponent, HeaderComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registrationForm: FormGroup;
  isSubmitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private service: PpfService,
    private toastr: ToastrService
  ) {
    this.registrationForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dob: ['', Validators.required], // New DOB field
      gender: ['', Validators.required], // New Gender field
      emailId: ['', [Validators.required, Validators.email]],
      contactNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]], // Ensuring valid 10-digit number
      roleId: ['', Validators.required], // Using `null` instead of empty string for select fields
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  onSubmit() {
    if (this.registrationForm.invalid) {
      this.toastr.warning('Please fill all required fields correctly', 'Validation Error');
      return; // Stop execution if form is invalid
    }

    this.isSubmitted = true; // Set after validation passes

    this.service.createUser(this.registrationForm.value).subscribe({
      next: (res: any) => {
        console.log("API Response:", res);

        if (res && res.succeeded) { // Ensure `res.succeeded` is correctly checked
          this.registrationForm.reset();
          this.isSubmitted = false; // Reset for future submissions
          this.toastr.success('User Created Successfully', 'Registration Successful');
          
          // Redirect to login after success
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          console.error('Unexpected Response:', res);
          // this.toastr.error(res.message || 'There was an issue with registration', 'Registration Failed');
        }
      },
      error: (err) => {
        console.error('API Error:', err);
        this.toastr.error(err.error?.message || 'User creation failed', 'Error');
      }
    });
  }
}
