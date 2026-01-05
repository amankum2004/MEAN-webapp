import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from 'src/app/services/user.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="card">
      <div class="card-header">
        <h4>Dashboard</h4>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-3" *ngFor="let stat of stats">
            <div class="card text-white bg-primary mb-3">
              <div class="card-body">
                <h5 class="card-title">{{ stat.title }}</h5>
                <h2 class="card-text">{{ stat.value }}</h2>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-4">
          <h5>Backend Status</h5>
          <div *ngIf="backendStatus" class="alert alert-success">
            {{ backendStatus }}
          </div>
          <div *ngIf="!backendStatus" class="alert alert-warning">
            Checking backend connection...
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      margin-bottom: 20px;
    }
    .row {
      margin: 20px 0;
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: any[] = [
    { title: 'Total Users', value: 'Loading...' },
    { title: 'Average Age', value: 'Loading...' },
    { title: 'Total Hobbies', value: 'Loading...' },
    { title: 'System Status', value: 'Active' }
  ];
  
  backendStatus: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.checkBackend();
    this.loadStats();
  }

  checkBackend() {
    this.apiService.healthCheck().subscribe({
      next: (response: any) => {
        this.backendStatus = `Backend connected: ${response.message}`;
      },
      error: (error) => {
        this.backendStatus = `Backend connection failed: ${error.message}`;
      }
    });
  }

  loadStats() {
    this.apiService.getUsers().subscribe({
      next: (users: any) => {
        const totalUsers = users.length;
        const avgAge = users.reduce((sum: number, user: any) => sum + user.age, 0) / totalUsers || 0;
        const totalHobbies = users.reduce((sum: number, user: any) => sum + (user.hobbies?.length || 0), 0);
        
        this.stats = [
          { title: 'Total Users', value: totalUsers },
          { title: 'Average Age', value: avgAge.toFixed(1) },
          { title: 'Total Hobbies', value: totalHobbies },
          { title: 'System Status', value: 'Active' }
        ];
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }
}