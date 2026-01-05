import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { registerLicense } from '@syncfusion/ej2-base';
registerLicense('YOUR_LICENSE_KEY');

import { AppComponent } from './app.component';
import { UserRegistrationComponent } from './components/user-registration/user-registration.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HobbiesGraphsComponent } from './components/hobbies-graphs/hobbies-graphs.component';

const routes: Routes = [
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: 'register', component: UserRegistrationComponent },
  { path: 'users', component: UserListComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'graphs', component: HobbiesGraphsComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    UserRegistrationComponent,
    UserListComponent,
    DashboardComponent,
    HobbiesGraphsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }