import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-registration',
  template: `
    <div class="card">
      <div class="card-header">
        <h4>User Registration</h4>
      </div>
      <div class="card-body">
        <form [formGroup]="registrationForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label">Name *</label>
            <input type="text" class="form-control" formControlName="name" placeholder="John">
            <div *ngIf="registrationForm.get('name')?.invalid && registrationForm.get('name')?.touched" 
                 class="text-danger">
              Name is required
            </div>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Email *</label>
            <input type="email" class="form-control" formControlName="email"placeholder="example@gmail.com">
            <div *ngIf="registrationForm.get('email')?.invalid && registrationForm.get('email')?.touched" 
                 class="text-danger">
              Valid email is required
            </div>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Age *</label>
            <input type="number" class="form-control" formControlName="age" placeholder="Enter your age">
            <div *ngIf="registrationForm.get('age')?.invalid && registrationForm.get('age')?.touched" 
                 class="text-danger">
              Age must be between 1 and 120
            </div>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Hobbies (comma separated) *</label>
            <input type="text" class="form-control" formControlName="hobbies" 
                   placeholder="Reading, Sports, Music">
            <div *ngIf="registrationForm.get('hobbies')?.invalid && registrationForm.get('hobbies')?.touched" 
                 class="text-danger">
              At least one hobby is required
            </div>
          </div>
          
          <button type="submit" class="btn btn-primary" [disabled]="registrationForm.invalid">
            Register
          </button>
        </form>
        
        <div *ngIf="message" class="alert mt-3" 
             [ngClass]="{'alert-success': !error, 'alert-danger': error}">
          {{ message }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      margin: 20px;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
    .form-label {
      font-weight: bold;
    }
  `]
})
export class UserRegistrationComponent {
  registrationForm: FormGroup;
  message: string = '';
  error: boolean = false;

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.registrationForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      age: [, [Validators.required, Validators.min(1), Validators.max(120)]],
      hobbies: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      const formData = this.registrationForm.value;
      const hobbies = formData.hobbies.split(',').map((h: string) => h.trim()).filter((h: string) => h);
      
      const userData = {
        ...formData,
        hobbies: hobbies
      };

      this.message = 'Registering user...';
      
        this.apiService.getHobbyAnalytics().subscribe({
        next: (response: any) => {
          this.message = 'User registered successfully!';
          this.error = false;
          this.registrationForm.reset({
            name: '',
            email: '',
            age: 25,
            hobbies: ''
          });
        },
        error: (error) => {
          this.message = 'Error registering user: ' + error.message;
          this.error = true;
        }
      });
    }
  }
}