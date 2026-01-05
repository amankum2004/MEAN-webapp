import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserRegistrationComponent } from './components/user-registration/user-registration.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HobbiesGraphsComponent } from './components/hobbies-graphs/hobbies-graphs.component';

const routes: Routes = [
  { path: '', component: UserRegistrationComponent },
  { path: 'users', component: UserListComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'graphs', component: HobbiesGraphsComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }