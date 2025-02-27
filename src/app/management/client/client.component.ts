import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PpfService } from '../../shared/services/ppf.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { MatTooltip } from '@angular/material/tooltip';
import { FooterComponent } from '../../Common/footer/footer.component';
import { HeaderComponent } from '../../Common/header/header.component';
import { ToastrService } from 'ngx-toastr'; // Import ToastrService

interface Client {
  id: number;
  clientName: string;
  address: string;
  numberOfEmployees: number;
  emailId: string;
  contactNumber: string;
  status: number;
  startDate: string;
  endDate: string | null;
}

@Component({
  selector: 'app-client',
  standalone: true,
  templateUrl: './client.component.html',
  styleUrl: './client.component.css',
  imports: [
    HeaderComponent,
    FooterComponent,
    CommonModule,
    MatTableModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSortModule,
    MatTooltip,
    MatProgressSpinnerModule,
  ],
})
export class ClientComponent implements OnInit {
  displayedColumns: string[] = [
    'clientName',
    'address',
    'emailId',
    'numberOfEmployees',
    'contactNumber',
    'startDate',
    'endDate',
    'status',
    'actions',
  ];
  clients: Client[] = [];
  dataSource = new MatTableDataSource<Client>(this.clients);
  clientForm: FormGroup;
  isEditing = false;
  isFormVisible = false;
  selectedClientId: number | null = null;
  isViewing = false;
  isLoading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private ppfService: PpfService,
    private fb: FormBuilder,
    private toastr: ToastrService // Inject ToastrService
  ) {
    this.clientForm = this.fb.group({
      clientName: [{ value: '', disabled: false }, Validators.required],
      address: [{ value: '', disabled: false }, Validators.required],
      emailId: [
        { value: '', disabled: false },
        [Validators.required, Validators.email],
      ],
      contactNumber: [{ value: '', disabled: false }, Validators.required],
      numberOfEmployees: [{ value: '', disabled: false }, Validators.required],
      status: [{ value: 1, disabled: false }, Validators.required],
      startDate: [{ value: '', disabled: false }, Validators.required],
      endDate: [{ value: '', disabled: false }],
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.fetchClients();

    this.dataSource.filterPredicate = (data: Client, filter: string) => {
      return (
        data.clientName.toLowerCase().includes(filter) ||
        data.emailId.toLowerCase().includes(filter) ||
        data.contactNumber.toLowerCase().includes(filter)
      );
    };
  }

  fetchClients(): void {
    this.isLoading=true;
    this.ppfService.getClients().subscribe((data) => {
      this.clients = data;
      this.dataSource.data = this.clients;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.isLoading = false; 
    });
  }

  openAddClientForm(): void {
    this.isFormVisible = true;
    this.isEditing = false;
    this.isViewing = false;
    this.clientForm.reset();
    this.clientForm.enable();
  }

  openEditClientForm(client: Client): void {
    this.isFormVisible = true;
    this.isEditing = true;
    this.isViewing = false;
    this.clientForm.patchValue(client);
    this.clientForm.enable();
  }

  openViewClientForm(client: Client): void {
    this.isFormVisible = true;
    this.isEditing = false;
    this.isViewing = true;
    this.clientForm.patchValue(client);
    setTimeout(() => {
      this.clientForm.disable();
    });
  }

  initForm(): void {
    this.clientForm = this.fb.group({
      clientName: ['', Validators.required],
      address: ['', Validators.required],
      emailId: ['', [Validators.required, Validators.email]],
      contactNumber: ['', Validators.required],
      numberOfEmployees: ['', Validators.required],
      status: [1, Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filterValue;
  }

  onPageChange(event: any): void {
    console.log(`Page changed to: ${event.pageIndex + 1}, page size: ${event.pageSize}`);
  }

  prepareNewClient(): void {
    this.clientForm.reset();
    this.isEditing = false;
    this.isFormVisible = true;
  }

  editClient(client: Client): void {
    const formatDate = (date: string | null) => (date ? date.split('T')[0] : '');

    this.clientForm.patchValue({
      ...client,
      startDate: formatDate(client.startDate),
      endDate: formatDate(client.endDate),
      status: client.status,
    });
    this.selectedClientId = client.id;
    this.isEditing = true;
    this.isFormVisible = true;
  }

  viewClient(client: Client): void {
    const formatDate = (date: string | null) => (date ? date.split('T')[0] : '');

    this.clientForm.patchValue({
      ...client,
      startDate: formatDate(client.startDate),
      endDate: formatDate(client.endDate),
      status: client.status,
    });

    this.selectedClientId = client.id;
    this.isEditing = false;
    this.isViewing = true;
    this.isFormVisible = true;

    setTimeout(() => {
      this.clientForm.disable();
    });
  }

  addClient(): void {
    if (this.clientForm.valid) {
      this.ppfService.addClient(this.clientForm.value).subscribe({
        next: () => {
          this.fetchClients();
          this.isFormVisible = false;
          this.toastr.success('Client added successfully!', 'Success'); // Toastr success
        },
        error: () => {
          this.toastr.error('Failed to add client!', 'Error'); // Toastr error
        },
      });
    }
  }

  updateClient(): void {
    if (this.clientForm.valid && this.selectedClientId !== null) {
      const updatedClient = {
        ...this.clientForm.value,
        id: this.selectedClientId,
        endDate: this.clientForm.value.endDate || null,
      };

      console.log('Updated Client Data: ', updatedClient);

      this.ppfService.updateClient(updatedClient).subscribe({
        next: () => {
          this.fetchClients();
          this.isFormVisible = false;
          this.toastr.success('Client updated successfully!', 'Success'); // Toastr success
        },
        error: (err) => {
          console.error('Update failed with error:', err.error);
          this.toastr.error('Failed to update client!', 'Error'); // Toastr error
        },
      });
    } else {
      this.toastr.warning('Form is invalid or client ID is missing', 'Warning'); // Toastr warning
    }
  }

  deleteClient(clientId: number): void {
    if (confirm('Are you sure you want to delete this client?')) {
      this.ppfService.deleteClient(clientId).subscribe({
        next: () => {
          this.fetchClients();
          this.toastr.success('Client deleted successfully!', 'Success');
        },
        error: () => {
          this.toastr.error('Failed to delete client!', 'Error');
        },
      });
    } else {
      this.toastr.info('Delete action canceled', 'Canceled');
    }
  }
  
  closeForm(): void {
    this.isFormVisible = false;
    this.isViewing = false;
    this.clientForm.enable();
  }

  getStatusText(status: number): string {
    switch (status) {
      case 1:
        return 'Active';
      case 0:
        return 'Inactive';
      case 2:
        return 'Deleted';
      default:
        return 'Unknown';
    }
  }

  exportToExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
      this.clients.map((client) => ({
        'Client Name': client.clientName,
        Address: client.address,
        Email: client.emailId,
        'Number of Employees': client.numberOfEmployees,
        Status: this.getStatusText(client.status),
        contactNumber: client.contactNumber,
        startDate: client.startDate,
        endDate: client.endDate,
      }))
    );

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clients');
    XLSX.writeFile(wb, 'clients.xlsx');
    this.toastr.success('Exported to Excel successfully!', 'Success'); // Toastr success
  }

  exportToPDF(): void {
    const doc = new jsPDF();

    const columns = [
      'Client Name',
      'Address',
      'Email',
      'Number of Employees',
      'contactNumber',
      'startDate',
      'endDate',
      'Status',
    ];
    const rows = this.clients.map((client) => [
      client.clientName,
      client.address,
      client.emailId,
      client.numberOfEmployees,
      client.contactNumber,
      client.startDate ? new Date(client.startDate).toLocaleDateString() : '',
      client.endDate ? new Date(client.endDate).toLocaleDateString() : '',
      this.getStatusText(client.status),
    ]);

    (doc as any).autoTable(columns, rows);
    doc.save('clients.pdf');
    this.toastr.success('Exported to PDF successfully!', 'Success'); // Toastr success
  }
}