import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${id}`);
  }

  createUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register`, user);
  }

  updateUser(id: string, user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, user);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  getHobbyAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/analytics/hobbies`);
  }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/stats/dashboard`);
  }

  healthCheck(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }
}

// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from 'src/environments/environment';

// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   age: number;
//   hobbies: string[];
// }

// export interface HobbyStat {
//   hobby: string;
//   user_count: number;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class UserService {

//   private apiUrl = `${environment.apiUrl}/users`;

//   constructor(private http: HttpClient) {}

//   createUser(user: Partial<User>): Observable<any> {
//     return this.http.post(this.apiUrl, user);
//   }

//   getUsers(): Observable<User[]> {
//     return this.http.get<User[]>(this.apiUrl);
//   }

//   getHobbyStats(): Observable<HobbyStat[]> {
//     return this.http.get<HobbyStat[]>(
//       `${environment.apiUrl}/users/analytics/hobbies`
//     );
//   }
// }




// // import { Injectable } from '@angular/core';
// // import { HttpClient } from '@angular/common/http';
// // import { Observable } from 'rxjs';

// // export interface User {
// //   id: string;
// //   name: string;
// //   email: string;
// //   age: number;
// //   hobbies: string[];
// // }

// // export interface HobbyStat {
// //   hobby: string;
// //   user_count: number;
// // }

// // @Injectable({
// //   providedIn: 'root'
// // })
// // export class UserService {
// //   private apiUrl = '/api/users';

// //   constructor(private http: HttpClient) {}

// //   createUser(user: Partial<User>): Observable<any> {
// //     return this.http.post(this.apiUrl, user);
// //   }

// //   getUsers(): Observable<User[]> {
// //     return this.http.get<User[]>(this.apiUrl);
// //   }

// //   getHobbyStats(): Observable<HobbyStat[]> {
// //     return this.http.get<HobbyStat[]>('/api/users/analytics/hobbies');
// //   }
// // }