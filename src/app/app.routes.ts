import { Routes } from '@angular/router';
import { HomeComponent } from './User/home/home.component';
import { RegisterComponent } from './User/register/register.component';
import { LoginComponent } from './User/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ClientComponent } from './management/client/client.component';
import { RoleComponent } from './management/role/role.component';
import { UserComponent } from './management/user/user.component';

export const routes: Routes = [
    {path:'',component:HomeComponent},
    {path:'home',component:HomeComponent},
     {path:'register',component:RegisterComponent},
     {path:'login',component:LoginComponent},
     {path:'dashboard',component:DashboardComponent},
     {path:'client',component:ClientComponent},
     {path:'role',component:RoleComponent},
     {path:'user',component:UserComponent},


];
