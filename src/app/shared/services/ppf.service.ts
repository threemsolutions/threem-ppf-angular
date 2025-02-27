import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PpfService {

  constructor(private http:HttpClient) { }
  baseURL='http://localhost:5056/api';

  decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }   
  getRoleIdFromToken(): number | null {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: any = this.decodeToken(token);
      console.log('Decoded Token:', decoded); // ✅ Log full token payload
   
      if (decoded && decoded.RoleId) {
        return Number(decoded.RoleId); // ✅ Convert to number for comparison
      } else {
        console.error('RoleId not found in decoded token');
      }
    }
    return null;
  }
  getUserIdFromToken(): number | null {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: any = this.decodeToken(token);
      console.log('Decoded Token:', decoded); // ✅ Log full token payload
   
      if (decoded && decoded.UserId) {
        return Number(decoded.UserId); // ✅ Convert to number for comparison
      } else {
        console.error('UserId not found in decoded token');
      }
    }
    return null;
  }
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseURL}/User/getAllUsers`);
  }

  getUserById(userId: number): Observable<any> {
    return this.http.get<any>(`${this.baseURL}/User/${userId}`);
  }

  updateUser(user: any): Observable<any> {
    return this.http.put<any>(`${this.baseURL}/User/Update`, user);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseURL}/User/deleteUserById/${id}`);
  }

  
  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseURL}/Role/getAllRoles`);
  }

  createRole(role: any): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/Role/createRole`, role);
  }

  updateRole(id: number, role: any): Observable<any> {
    return this.http.put<any>(`${this.baseURL}/Role/updateRole`,  {
      id: id,  // Ensure ID is sent
      roleName: role.roleName
    });
  }

  deleteRole(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseURL}/Role/deleteRole/${id}`);
  }
  
  getClients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseURL}/Client/getAllClients`);
  }

  addClient(client: any): Observable<any> {
    return this.http.post(`${this.baseURL}/Client/createclient`, client);
  }
   
  // Update an existing client
  updateClient(client: any): Observable<any> {
    return this.http.put(`${this.baseURL}/Client/updateClient`, client);
  }
   
  // Delete a client by ID
  deleteClient(clientId: number): Observable<any> {
    return this.http.delete(`${this.baseURL}/Client/deleteClientById${clientId}`);
  }

  createUser(formData:any){
   return this.http.post(this.baseURL+'/User/Create',formData); 
  }
  CreateUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/User/Create`, user);
  }
  

  login(formData:any){
    return this.http.post(this.baseURL+'/User/login',formData); 
   }
}
