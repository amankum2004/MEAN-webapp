import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-list',
  template: `
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h4>User Management</h4>
        <div>
          <button class="btn btn-primary" (click)="loadUsers()">
            <i class="bi bi-arrow-clockwise"></i> Refresh
          </button>
          <button class="btn btn-success ms-2" (click)="openAddModal()">
            <i class="bi bi-plus-circle"></i> Add User
          </button>
        </div>
      </div>
      <div class="card-body">
        <!-- Loading State -->
        <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading users...</p>
        </div>

        <!-- Users Table -->
        <div *ngIf="!loading && users.length > 0">
          <div class="table-responsive">
            <table class="table table-striped table-hover">
              <thead class="table-dark">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Age</th>
                  <th>Hobbies</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of users; let i = index">
                  <td>{{ i + 1 }}</td>
                  <td>{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.age }}</td>
                  <td>
                    <span *ngFor="let hobby of user.hobbies" class="badge bg-primary me-1 mb-1">
                      {{ hobby }}
                    </span>
                    <span *ngIf="user.hobbies.length === 0" class="text-muted">No hobbies</span>
                  </td>
                  <td>{{ formatDate(user.createdAt) }}</td>
                  <td>
                    <div class="btn-group btn-group-sm" role="group">
                      <button class="btn btn-outline-primary" (click)="openEditModal(user)">
                        <i class="bi bi-pencil"></i> Edit
                      </button>
                      <button class="btn btn-outline-danger" (click)="openDeleteModal(user)">
                        <i class="bi bi-trash"></i> Delete
                      </button>
                      <button class="btn btn-outline-info" (click)="viewUserDetails(user)">
                        <i class="bi bi-eye"></i> View
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination Info -->
          <div class="text-muted mt-3">
            Showing {{ users.length }} user(s)
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && users.length === 0" class="text-center py-5">
          <div class="alert alert-info">
            <h5>No Users Found</h5>
            <p>There are no users in the database. Click "Add User" to create one.</p>
            <button class="btn btn-primary" (click)="openAddModal()">
              <i class="bi bi-plus-circle"></i> Add First User
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit User Modal -->
    <div class="modal fade" [class.show]="showModal" [style.display]="showModal ? 'block' : 'none'" 
         [style.background-color]="showModal ? 'rgba(0,0,0,0.5)' : 'transparent'">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditMode ? 'Edit User' : 'Add New User' }}</h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          <div class="modal-body">
            <form [formGroup]="userForm" (ngSubmit)="saveUser()">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Name *</label>
                  <input type="text" class="form-control" formControlName="name" 
                         [class.is-invalid]="userForm.get('name')?.invalid && userForm.get('name')?.touched">
                  <div *ngIf="userForm.get('name')?.invalid && userForm.get('name')?.touched" 
                       class="invalid-feedback">
                    Name is required
                  </div>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label class="form-label">Email *</label>
                  <input type="email" class="form-control" formControlName="email"
                         [class.is-invalid]="userForm.get('email')?.invalid && userForm.get('email')?.touched">
                  <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" 
                       class="invalid-feedback">
                    Valid email is required
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Age *</label>
                  <input type="number" class="form-control" formControlName="age" min="1" max="120"
                         [class.is-invalid]="userForm.get('age')?.invalid && userForm.get('age')?.touched">
                  <div *ngIf="userForm.get('age')?.invalid && userForm.get('age')?.touched" 
                       class="invalid-feedback">
                    Age must be between 1 and 120
                  </div>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label class="form-label">Hobbies (comma separated) *</label>
                  <input type="text" class="form-control" formControlName="hobbies" 
                         placeholder="e.g., Reading, Sports, Music"
                         [class.is-invalid]="userForm.get('hobbies')?.invalid && userForm.get('hobbies')?.touched">
                  <div *ngIf="userForm.get('hobbies')?.invalid && userForm.get('hobbies')?.touched" 
                       class="invalid-feedback">
                    At least one hobby is required
                  </div>
                  <small class="text-muted">Separate multiple hobbies with commas</small>
                </div>
              </div>
              
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="userForm.invalid || saving">
                  <span *ngIf="saving" class="spinner-border spinner-border-sm me-1"></span>
                  {{ isEditMode ? 'Update User' : 'Create User' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" [class.show]="showDeleteModal" [style.display]="showDeleteModal ? 'block' : 'none'"
         [style.background-color]="showDeleteModal ? 'rgba(0,0,0,0.5)' : 'transparent'">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Confirm Delete</h5>
            <button type="button" class="btn-close btn-close-white" (click)="closeDeleteModal()"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete the user <strong>{{ userToDelete?.name }}</strong>?</p>
            <p class="text-danger">
              <i class="bi bi-exclamation-triangle"></i> This action cannot be undone.
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeDeleteModal()">Cancel</button>
            <button type="button" class="btn btn-danger" (click)="confirmDelete()" [disabled]="deleting">
              <span *ngIf="deleting" class="spinner-border spinner-border-sm me-1"></span>
              Delete User
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success/Error Toast -->
    <div *ngIf="showToast" class="position-fixed top-0 end-0 p-3" style="z-index: 1050;">
      <div class="toast show" [class.bg-success]="toastType === 'success'" 
           [class.bg-danger]="toastType === 'error'" 
           [class.bg-warning]="toastType === 'warning'">
        <div class="toast-header">
          <strong class="me-auto">{{ toastTitle }}</strong>
          <button type="button" class="btn-close" (click)="hideToast()"></button>
        </div>
        <div class="toast-body text-white">
          {{ toastMessage }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .badge {
      font-size: 0.8em;
      padding: 4px 8px;
    }
    .modal {
      backdrop-filter: blur(3px);
    }
    .modal.show {
      display: block;
    }
    .btn-group {
      white-space: nowrap;
    }
    .btn-group .btn {
      margin: 0 2px;
    }
    .toast {
      min-width: 300px;
    }
    table th {
      background-color: #343a40;
      color: white;
    }
    .table-hover tbody tr:hover {
      background-color: rgba(0, 123, 255, 0.05);
    }
  `]
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  loading: boolean = false;
  saving: boolean = false;
  deleting: boolean = false;
  
  // Modal states
  showModal: boolean = false;
  showDeleteModal: boolean = false;
  isEditMode: boolean = false;
  currentUserId: string = '';
  
  // Form
  userForm: FormGroup;
  userToDelete: any = null;
  
  // Toast notification
  showToast: boolean = false;
  toastTitle: string = '';
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'warning' = 'success';

  constructor(
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    // Initialize the form
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      age: [25, [Validators.required, Validators.min(1), Validators.max(120)]],
      hobbies: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.http.get('/api/users').subscribe({
      next: (users: any) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.showNotification('Error', 'Failed to load users', 'error');
        this.loading = false;
      }
    });
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentUserId = '';
    this.userForm.reset({
      name: '',
      email: '',
      age: 25,
      hobbies: ''
    });
    this.showModal = true;
  }

  openEditModal(user: any) {
    this.isEditMode = true;
    this.currentUserId = user._id;
    this.userForm.reset({
      name: user.name,
      email: user.email,
      age: user.age,
      hobbies: user.hobbies.join(', ')
    });
    this.showModal = true;
  }

  openDeleteModal(user: any) {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.saving = false;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  saveUser() {
    if (this.userForm.valid) {
      this.saving = true;
      
      const userData = {
        name: this.userForm.value.name,
        email: this.userForm.value.email,
        age: this.userForm.value.age,
        hobbies: this.userForm.value.hobbies
      };
      
      if (this.isEditMode) {
        // Update existing user
        this.http.put(`/api/users/${this.currentUserId}`, userData).subscribe({
          next: (response: any) => {
            this.showNotification('Success', 'User updated successfully', 'success');
            this.closeModal();
            this.loadUsers();
            this.saving = false;
          },
          error: (error) => {
            console.error('Error updating user:', error);
            this.showNotification('Error', error.error?.error || 'Failed to update user', 'error');
            this.saving = false;
          }
        });
      } else {
        // Create new user
        this.http.post('/api/users/register', userData).subscribe({
          next: (response: any) => {
            this.showNotification('Success', 'User created successfully', 'success');
            this.closeModal();
            this.loadUsers();
            this.saving = false;
          },
          error: (error) => {
            console.error('Error creating user:', error);
            this.showNotification('Error', error.error?.error || 'Failed to create user', 'error');
            this.saving = false;
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.userForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  confirmDelete() {
    if (this.userToDelete) {
      this.deleting = true;
      
      this.http.delete(`/api/users/${this.userToDelete._id}`).subscribe({
        next: (response: any) => {
          this.showNotification('Success', 'User deleted successfully', 'success');
          this.closeDeleteModal();
          this.loadUsers();
          this.deleting = false;
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.showNotification('Error', error.error?.error || 'Failed to delete user', 'error');
          this.deleting = false;
        }
      });
    }
  }

  viewUserDetails(user: any) {
    // You can implement a detailed view modal here
    alert(`User Details:\n\nName: ${user.name}\nEmail: ${user.email}\nAge: ${user.age}\nHobbies: ${user.hobbies.join(', ')}`);
  }

  showNotification(title: string, message: string, type: 'success' | 'error' | 'warning') {
    this.toastTitle = title;
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      this.hideToast();
    }, 5000);
  }

  hideToast() {
    this.showToast = false;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}





// import { Component, OnInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';

// @Component({
//   selector: 'app-user-list',
//   template: `
//     <div class="card">
//       <div class="card-header">
//         <h4>User List</h4>
//       </div>
//       <div class="card-body">
//         <button class="btn btn-primary mb-3" (click)="loadUsers()">Load Users</button>
        
//         <div *ngIf="loading" class="text-center">
//           <div class="spinner-border text-primary" role="status">
//             <span class="visually-hidden">Loading...</span>
//           </div>
//         </div>
        
//         <div *ngIf="users.length > 0">
//           <table class="table table-striped">
//             <thead>
//               <tr>
//                 <th>Name</th>
//                 <th>Email</th>
//                 <th>Age</th>
//                 <th>Hobbies</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr *ngFor="let user of users">
//                 <td>{{ user.name }}</td>
//                 <td>{{ user.email }}</td>
//                 <td>{{ user.age }}</td>
//                 <td>
//                   <span *ngFor="let hobby of user.hobbies" class="badge bg-secondary me-1">
//                     {{ hobby }}
//                   </span>
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
        
//         <div *ngIf="users.length === 0 && !loading" class="text-center">
//           <p>No users found. Click "Load Users" to fetch data.</p>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [`
//     .badge {
//       margin-right: 5px;
//     }
//     table {
//       margin-top: 20px;
//     }
//   `]
// })
// export class UserListComponent implements OnInit {
//   users: any[] = [];
//   loading: boolean = false;

//   constructor(private http: HttpClient) {}

//   ngOnInit() {
//     this.loadUsers();
//   }

//   loadUsers() {
//     this.loading = true;
//     this.http.get('/api/users').subscribe({
//       next: (users: any) => {
//         this.users = users;
//         this.loading = false;
//       },
//       error: (error) => {
//         console.error('Error loading users:', error);
//         this.loading = false;
//       }
//     });
//   }
// }