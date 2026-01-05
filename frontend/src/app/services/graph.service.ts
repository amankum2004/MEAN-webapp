import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GraphData {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class GraphService {
  private apiUrl = '/api/graphs';

  constructor(private http: HttpClient) {}

  getGraphData(type: string): Observable<GraphData[]> {
    return this.http.get<GraphData[]>(`${this.apiUrl}/${type}`);
  }
}