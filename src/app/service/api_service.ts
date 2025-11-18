import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = 'http://localhost:5000'; // URL de base de votre API

    constructor(private http: HttpClient) {}

    getUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/api/users`);
    }

    createUser(user: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/api/users`, user);
    }
}
