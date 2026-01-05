import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/user.service';

@Component({
  selector: 'app-user-registration',
  template: `
    <div class="card">
      <div class="card-header">
        <h4>User Registration</h4>
      </div>
      <div class="card-body">
        <form [formGroup]="registrationForm" (ngSubmit)="onSubmit()">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Name *</label>
              <input type="text" class="form-control" formControlName="name"  placeholder="John"
                     [class.is-invalid]="registrationForm.get('name')?.invalid && registrationForm.get('name')?.touched">
              <div *ngIf="registrationForm.get('name')?.invalid && registrationForm.get('name')?.touched" 
                   class="invalid-feedback">
                Name is required
              </div>
            </div>
            
            <div class="col-md-6 mb-3">
              <label class="form-label">Email *</label>
              <input type="email" class="form-control" formControlName="email" placeholder="example@gmail.com"
                     [class.is-invalid]="registrationForm.get('email')?.invalid && registrationForm.get('email')?.touched">
              <div *ngIf="registrationForm.get('email')?.invalid && registrationForm.get('email')?.touched" 
                   class="invalid-feedback">
                Valid email is required
              </div>
            </div>
          </div>
          
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Age *</label>
              <input type="number" class="form-control" formControlName="age" placeholder="21" min="1" max="200"
                     [class.is-invalid]="registrationForm.get('age')?.invalid && registrationForm.get('age')?.touched">
              <div *ngIf="registrationForm.get('age')?.invalid && registrationForm.get('age')?.touched" 
                   class="invalid-feedback">
                Age must be between 1 and 200
              </div>
            </div>
            
            <div class="col-md-6 mb-3">
              <label class="form-label">Hobbies (comma separated) *</label>
              <input type="text" class="form-control" formControlName="hobbies" 
                     placeholder="e.g., Reading, Sports, Music"
                     [class.is-invalid]="registrationForm.get('hobbies')?.invalid && registrationForm.get('hobbies')?.touched">
              <div *ngIf="registrationForm.get('hobbies')?.invalid && registrationForm.get('hobbies')?.touched" 
                   class="invalid-feedback">
                At least one hobby is required
              </div>
              <small class="text-muted">Separate multiple hobbies with commas</small>
            </div>
          </div>
          
          <div class="d-grid gap-2 d-md-flex justify-content-md-end">
            <button type="button" class="btn btn-secondary me-2" (click)="resetForm()">
              Reset
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="registrationForm.invalid || loading">
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span>
              {{ loading ? 'Registering...' : 'Register User' }}
            </button>
          </div>
        </form>
        
        <div *ngIf="message" class="alert mt-3" 
             [ngClass]="{'alert-success': !error, 'alert-danger': error}">
          <div class="d-flex align-items-center">
            <i *ngIf="!error" class="bi bi-check-circle-fill me-2"></i>
            <i *ngIf="error" class="bi bi-exclamation-triangle-fill me-2"></i>
            <div>{{ message }}</div>
          </div>
        </div>
        
        <!-- FIXED: Use bracket notation to access serverError -->
        <div *ngIf="registrationForm.errors && registrationForm.errors['serverError']" 
             class="alert alert-danger mt-3">
          {{ registrationForm.errors['serverError'] }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .form-label {
      font-weight: 600;
      margin-bottom: 8px;
    }
    .alert {
      border-radius: 8px;
      border: none;
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class UserRegistrationComponent {
  registrationForm: FormGroup;
  message: string = '';
  error: boolean = false;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private apiService: ApiService
  ) {
    this.registrationForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      age: [, [Validators.required, Validators.min(1), Validators.max(120)]],
      hobbies: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      this.loading = true;
      this.message = '';
      this.error = false;
      
      // Clear any previous server errors
      this.registrationForm.setErrors(null);
      
      const formData = this.registrationForm.value;
      
      // Process hobbies from comma-separated string to array
      const hobbies = formData.hobbies
        .split(',')
        .map((h: string) => h.trim())
        .filter((h: string) => h.length > 0);
      
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        age: parseInt(formData.age),
        hobbies: hobbies
      };
      
      // Use ApiService
      this.apiService.createUser(userData).subscribe({
        next: (response: any) => {
          this.message = 'User registered successfully!';
          this.error = false;
          this.loading = false;
          
          console.log('Registration successful:', response);
          
          // Reset form with default values
          this.registrationForm.reset({
            name: '',
            email: '',
            age: 25,
            hobbies: ''
          });
          
          // Clear success message after 5 seconds
          setTimeout(() => {
            if (!this.error) {
              this.message = '';
            }
          }, 5000);
        },
        error: (error) => {
          this.loading = false;
          this.error = true;
          
          // Handle different error types
          if (error.status === 400) {
            if (error.error?.error === 'User with this email already exists') {
              this.message = 'Error: A user with this email already exists.';
            } else if (error.error?.error === 'Validation failed') {
              this.message = 'Validation error: ' + 
                (error.error.details ? Object.values(error.error.details).join(', ') : 'Please check your inputs.');
            } else {
              this.message = 'Error: ' + (error.error?.error || 'Invalid data provided.');
            }
          } else if (error.status === 0) {
            this.message = 'Error: Cannot connect to server. Please check your internet connection or try again later.';
            // Set server error on form
            this.registrationForm.setErrors({ serverError: 'Connection failed. Is the backend server running?' });
          } else if (error.status >= 500) {
            this.message = 'Error: Server error. Please try again later.';
            this.registrationForm.setErrors({ serverError: 'Server error. Please try again later.' });
          } else {
            this.message = 'Error registering user: ' + (error.error?.message || error.message || 'Unknown error');
          }
          
          console.error('Registration error:', error);
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.registrationForm);
      this.message = 'Please fix the errors in the form before submitting.';
      this.error = true;
    }
  }

  resetForm() {
    this.registrationForm.reset({
      name: '',
      email: '',
      age: 25,
      hobbies: ''
    });
    this.message = '';
    this.error = false;
    this.registrationForm.setErrors(null);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Helper method to check if a field has an error
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.registrationForm.get(fieldName);
    return field ? field.hasError(errorType) && field.touched : false;
  }
}






// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';
// import { ApiService } from 'src/app/services/user.service';

// @Component({
//   selector: 'app-user-registration',
//   template: `
//     <div class="card">
//       <div class="card-header">
//         <h4>User Registration</h4>
//       </div>
//       <div class="card-body">
//         <form [formGroup]="registrationForm" (ngSubmit)="onSubmit()">
//           <div class="mb-3">
//             <label class="form-label">Name *</label>
//             <input type="text" class="form-control" formControlName="name" placeholder="John">
//             <div *ngIf="registrationForm.get('name')?.invalid && registrationForm.get('name')?.touched" 
//                  class="text-danger">
//               Name is required
//             </div>
//           </div>
          
//           <div class="mb-3">
//             <label class="form-label">Email *</label>
//             <input type="email" class="form-control" formControlName="email"placeholder="example@gmail.com">
//             <div *ngIf="registrationForm.get('email')?.invalid && registrationForm.get('email')?.touched" 
//                  class="text-danger">
//               Valid email is required
//             </div>
//           </div>
          
//           <div class="mb-3">
//             <label class="form-label">Age *</label>
//             <input type="number" class="form-control" formControlName="age" placeholder="Enter your age">
//             <div *ngIf="registrationForm.get('age')?.invalid && registrationForm.get('age')?.touched" 
//                  class="text-danger">
//               Age must be between 1 and 120
//             </div>
//           </div>
          
//           <div class="mb-3">
//             <label class="form-label">Hobbies (comma separated) *</label>
//             <input type="text" class="form-control" formControlName="hobbies" 
//                    placeholder="Reading, Sports, Music">
//             <div *ngIf="registrationForm.get('hobbies')?.invalid && registrationForm.get('hobbies')?.touched" 
//                  class="text-danger">
//               At least one hobby is required
//             </div>
//           </div>
          
//           <button type="submit" class="btn btn-primary" [disabled]="registrationForm.invalid">
//             Register
//           </button>
//         </form>
        
//         <div *ngIf="message" class="alert mt-3" 
//              [ngClass]="{'alert-success': !error, 'alert-danger': error}">
//           {{ message }}
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [`
//     .card {
//       margin: 20px;
//       padding: 20px;
//       border: 1px solid #ccc;
//       border-radius: 5px;
//     }
//     .form-label {
//       font-weight: bold;
//     }
//   `]
// })
// export class UserRegistrationComponent {
//   registrationForm: FormGroup;
//   message: string = '';
//   error: boolean = false;

//   constructor(private fb: FormBuilder, private apiService: ApiService) {
//     this.registrationForm = this.fb.group({
//       name: ['', Validators.required],
//       email: ['', [Validators.required, Validators.email]],
//       age: [, [Validators.required, Validators.min(1), Validators.max(120)]],
//       hobbies: ['', Validators.required]
//     });
//   }

//   onSubmit() {
//     if (this.registrationForm.valid) {
//       const formData = this.registrationForm.value;
//       const hobbies = formData.hobbies.split(',').map((h: string) => h.trim()).filter((h: string) => h);
      
//       const userData = {
//         ...formData,
//         hobbies: hobbies
//       };

//       this.message = 'Registering user...';
      
//       this.http.post('/api/users/register', userData).subscribe({
//         next: (response: any) => {
//           this.message = 'User registered successfully!';
//           this.error = false;
//           this.registrationForm.reset({
//             name: '',
//             email: '',
//             age: 25,
//             hobbies: ''
//           });
//         },
//         error: (error) => {
//           this.message = 'Error registering user: ' + error.message;
//           this.error = true;
//         }
//       });
//     }
//   }
// }