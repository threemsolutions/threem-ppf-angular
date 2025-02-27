// user.component.ts
import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'; // Added MatDialogRef
import { PpfService } from '../../shared/services/ppf.service';
import { ToastrService } from 'ngx-toastr';
import { jsPDF } from 'jspdf';
import { CommonModule, NgIf } from '@angular/common';
import { HeaderComponent } from '../../Common/header/header.component';
import { FooterComponent } from '../../Common/footer/footer.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';


// User Details Dialog Component
@Component({
  selector: 'app-user-details-dialog',
  template: `
    <mat-card>
      <mat-card-title>User Details</mat-card-title>
      <mat-card-content>
        <p><strong>First Name:</strong> {{ data.firstName }}</p>
        <p><strong>Last Name:</strong> {{ data.lastName }}</p>
        <p><strong>Email:</strong> {{ data.emailId }}</p>
        <p><strong>Phone:</strong> {{ data.contactNumber }}</p>
        <p><strong>Role:</strong> {{ data.roleName }}</p>
        <p><strong>Date of Birth:</strong> {{ data.dob }}</p>
        <p><strong>Gender:</strong> {{ data.gender }}</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button (click)="dialogRef.close()">Close</button>
      </mat-card-actions>
    </mat-card>
  `,
  standalone: true,
  imports: [MatCardModule, MatButtonModule]
})
export class UserDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<UserDetailsDialogComponent>, // Changed to MatDialogRef
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  // Optional: Add explicit close method if needed
  closeDialog() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderComponent,
    FooterComponent,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  roleId: number | null = null;
  userId: number | null = null;
  users: any[] = [];
  dataSource = new MatTableDataSource<any>();
  user: any = null;
  isEditing: boolean = false;
  selectedUser: any = null;
  userForm: FormGroup;
  isEditingProfile: boolean = false;
  pageSize: number = 10;

  displayedColumns: string[] = ['index', 'firstName', 'lastName', 'emailId', 'contactNumber', 'roleName', 'gender', 'dob', 'actions'];

  roles = [
    { id: 1, name: 'Super Admin' },
    { id: 2, name: 'Admin' },
    { id: 3, name: 'User' }
  ];

  constructor(
    private fb: FormBuilder,
    private ppfService: PpfService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      emailId: ['', [Validators.required, Validators.email]],
      contactNumber: ['', Validators.required],
      roleId: ['', Validators.required],
      password: ['', Validators.required],
      dob: ['', Validators.required],
      gender: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.roleId = localStorage.getItem('roleId') ? parseInt(localStorage.getItem('roleId')!, 10) : null;
    this.userId = localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')!, 10) : null;

    if (this.roleId === 1 || this.roleId === 2) {
      this.loadUsers();
    } else if (this.roleId === 3 && this.userId) {
      this.getUserById(this.userId);
    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadUsers(): void {
    this.ppfService.getUsers().subscribe(
      (users: any[]) => {
        this.users = users.map(user => ({
          ...user,
          roleName: this.roles.find(role => role.id === user.roleId)?.name || 'Unknown'
        }));
        this.dataSource.data = this.users;
      },
      (error) => {
        this.toastr.error('Failed to load users', 'Error');
        console.error('Error fetching users:', error);
      }
    );
  }

 sortData(sort: Sort) {
  const data = this.users.slice();
  if (!sort.active || sort.direction === '') {
    this.dataSource.data = data;
    return;
  }

  this.dataSource.data = data.sort((a, b) => {
    const isAsc = sort.direction === 'asc';
    return this.compare(a[sort.active], b[sort.active], isAsc);
  });
}

compare(a: any, b: any, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

  handlePageEvent(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.paginator.pageIndex = event.pageIndex;
    this.dataSource.paginator = this.paginator;
  }

  viewUser(user: any) {
    this.dialog.open(UserDetailsDialogComponent, {
      data: user,
      width: '400px'
    });
  }

  getUserById(userId: number): void {
    this.ppfService.getUserById(userId).subscribe(
      (user) => {
        this.user = user;
        this.userForm.patchValue(user);
      },
      (error) => {
        this.toastr.error('Failed to fetch user details', 'Error');
        console.error('Error fetching user by ID:', error);
      }
    );
  }

  editUser(user: any): void {
    this.isEditing = true;
    this.selectedUser = user;
    this.userForm.patchValue(user);
  }
  
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }
  
  deleteUser(id: number): void {
    this.ppfService.deleteUser(id).subscribe(
      () => {
        this.loadUsers();
        this.toastr.success('User deleted successfully', 'Success');
      },
      (error) => {
        this.toastr.error('Failed to delete user', 'Error');
        console.error('Error deleting user:', error);
      }
    );
  }

  editUserProfile(): void {
    this.isEditingProfile = true;
    this.userForm.patchValue(this.user);
  }

  updateUserProfile(): void {
    if (this.userForm.valid && this.user) {
      const updatedUser = { ...this.userForm.value, id: this.user.id };
      this.ppfService.updateUser(updatedUser).subscribe(
        () => {
          this.getUserById(this.user.id);
          this.isEditingProfile = false;
          this.toastr.success('Profile updated successfully', 'Success');
        },
        (error) => {
          this.toastr.error('Failed to update profile', 'Error');
          console.error('Error updating user profile:', error);
        }
      );
    }
  }

  updateUser(): void {
    if (this.userForm.valid && this.selectedUser) {
      const updatedUser = { ...this.userForm.value, id: this.selectedUser.id };
      this.ppfService.updateUser(updatedUser).subscribe(
        () => {
          this.loadUsers();
          this.userForm.reset();
          this.isEditing = false;
          this.toastr.success('User updated successfully', 'Success');
        },
        (error) => {
          this.toastr.error('Failed to update user', 'Error');
          console.error('Error updating user:', error);
        }
      );
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.isEditingProfile = false;
    this.selectedUser = null;
    this.userForm.reset();
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    const tableData = this.dataSource.data.map((user, index) => [
      index + 1,
      user.firstName,
      user.lastName,
      user.emailId,
      user.contactNumber,
      user.roleName,
      user.gender,
    new Date(user.dob).toLocaleDateString()
    ]);

    doc.autoTable({
      head: [['#', 'First Name', 'Last Name', 'Email', 'Phone', 'Role', 'gender', 'dob']],
      body: tableData
    });
    doc.save('user_list.pdf');
  }

}