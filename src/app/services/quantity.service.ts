import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuantityService {

  // private baseUrl = 'http://localhost:8080/api/v1/quantities'; // API Gateway
  private baseUrl = 'https://laudable-youthfulness-production-a722.up.railway.app/api/v1/quantities'; 
  constructor(private http: HttpClient) {}

  convert(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/convert`, data);
  }

  calculate(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/calculate`, data);
  }
  getApiByOperation(operation: string) {
    return `https://laudable-youthfulness-production-a722.up.railway.app/api/v1/quantities/${operation}`;
  }
  postData(url: string, data: any) {
    return this.http.post(url, data);
  }
}