import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { PpfService } from '../../shared/services/ppf.service';
import { ToastrService } from 'ngx-toastr';
import { ToastrModule } from 'ngx-toastr';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FooterComponent } from '../../Common/footer/footer.component';
import { HeaderComponent } from '../../Common/header/header.component';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';


// Extend jsPDF interface for TypeScript
declare module 'jspdf' {
  interface jsPDF {
    autoTable(options: any): void;
  }
}

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatDividerModule,
    ToastrModule,
    FooterComponent,
    HeaderComponent,
    MatTooltipModule
  ],
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css'],
})
export class RoleComponent implements OnInit, AfterViewInit {
  roles: any[] = [];
  pagedRoles = new MatTableDataSource<any>([]); // Changed from dataSource to match template
  displayedColumns: string[] = ['roleName', 'status', 'actions'];
  selectedRole: any = { id: '', roleName: '', status: 1 };
  isAddingRole: boolean = false;
  isViewingRole: boolean = false;
  pageSize: number = 5;
  totalItems: number = 0;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private ppfService: PpfService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.getRoles();
  }

  ngAfterViewInit(): void {
    this.pagedRoles.sort = this.sort;
    this.pagedRoles.paginator = this.paginator;
  }

  getRoles(): void {
    this.ppfService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.pagedRoles.data = this.roles; // Assign data to pagedRoles
        this.totalItems = this.roles.length;
      },
      error: (error) => {
        console.error('Error fetching roles:', error);
        this.toastr.error('Failed to fetch roles', 'Error');
      },
    });
  }

  handlePageEvent(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pagedRoles.paginator!.pageIndex = event.pageIndex; // Update paginator
  }

  sortTable(sort: Sort): void {
    const data = this.roles.slice();
    if (!sort.active || sort.direction === '') {
      this.pagedRoles.data = data;
      return;
    }

    this.pagedRoles.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'roleName':
          return this.compare(a.roleName, b.roleName, isAsc);
        case 'status':
          return this.compare(a.status, b.status, isAsc);
        default:
          return 0;
      }
    });
  }

  compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  addRole(): void {
    this.isAddingRole = true;
    this.selectedRole = { id: '', roleName: '', status: 1 };
    this.isViewingRole = false;
  }

  editRole(role: any): void {
    this.selectedRole = { ...role };
    this.isAddingRole = false;
    this.isViewingRole = false;
  }

  viewRole(role: any): void {
    this.selectedRole = { ...role };
    this.isViewingRole = true;
    this.isAddingRole = false;
  }

  cancelEdit(): void {
    this.selectedRole = { id: '', roleName: '', status: 1 };
    this.isAddingRole = false;
    this.isViewingRole = false;
  }

  cancelViewRole(): void {
    this.isViewingRole = false;
    this.selectedRole = { id: '', roleName: '', status: 1 };
  }

  cancelAddRole(): void {
    this.isAddingRole = false;
    this.selectedRole = { id: '', roleName: '', status: 1 };
  }

  createRole(): void {
    if (!this.selectedRole.roleName.trim()) {
      this.toastr.warning('Role name is required', 'Warning');
      return;
    }

    const roleData = {
      roleName: this.selectedRole.roleName,
      status: this.selectedRole.status,
      CreatedBy: 1,
    };

    this.ppfService.createRole(roleData).subscribe({
      next: (response) => {
        this.roles.push(response);
        this.pagedRoles.data = this.roles;
        this.cancelAddRole();
        this.toastr.success('Role created successfully', 'Success');
      },
      error: (error) => {
        console.error('Error creating role:', error);
        this.toastr.error('Failed to create role', 'Error');
      },
    });
  }

  updatedRole(): void {
    if (!this.selectedRole.id || !this.selectedRole.roleName.trim()) {
      this.toastr.warning('Role name is required', 'Warning');
      return;
    }

    this.ppfService.updateRole(this.selectedRole.id, this.selectedRole).subscribe({
      next: (response) => {
        this.roles = this.roles.map((role) =>
          role.id === response.id ? response : role
        );
        this.pagedRoles.data = this.roles;
        this.cancelEdit();
        this.toastr.success('Role updated successfully', 'Success');
      },
      error: (error) => {
        console.error('Error updating role:', error);
        this.toastr.error('Failed to update role', 'Error');
      },
    });
  }

  deleteRole(id: number): void {
    this.ppfService.deleteRole(id).subscribe({
      next: () => {
        this.roles = this.roles.filter((role) => role.id !== id);
        this.pagedRoles.data = this.roles;
        this.toastr.success('Role deleted successfully', 'Success');
      },
      error: (error) => {
        console.error('Error deleting role:', error);
        this.toastr.error('Failed to delete role', 'Error');
      },
    });
  }

  onSubmit(roleForm: any): void {
    if (roleForm.valid) {
      this.isAddingRole ? this.createRole() : this.updatedRole();
    }
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    const tableData = this.roles.map((role) => [
      role.roleName,
      role.status === 1 ? 'Active' : role.status === 2 ? 'Inactive' : 'Deleted',
    ]);
    doc.autoTable({
      head: [['Role Name', 'Status']],
      body: tableData,
    });
    doc.save('roles.pdf');
  }

  exportToExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
      this.roles.map((role) => ({
        'Role Name': role.roleName,
        Status: role.status === 1 ? 'Active' : role.status === 2 ? 'Inactive' : 'Deleted',
      }))
    );
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Roles');
    XLSX.writeFile(wb, 'roles.xlsx');
  }
}