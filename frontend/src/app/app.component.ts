import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand" routerLink="/">MEAN web app</a>
        <div class="navbar-nav">
          <a class="nav-link" routerLink="/register" routerLinkActive="active">Registration</a>
          <a class="nav-link" routerLink="/users" routerLinkActive="active">Users</a>
          <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a class="nav-link" routerLink="/graphs" routerLinkActive="active">Graphs</a>
        </div>
      </div>
    </nav>
    <div class="container mt-4">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .navbar-nav .nav-link.active {
      font-weight: bold;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
    .container {
      padding: 20px;
    }
  `]
})
export class AppComponent {
  title = 'mean-clickhouse-app';
}