import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { tap } from 'rxjs';
import { LoginRequest, LoginResponse, UserProfile } from '../../models/auth.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);

    // ATTENTION : Ajout du /API comme défini dans ton Program.cs
    private apiUrl = 'http://localhost:5033/API';

    // --- SIGNALS (État réactif) ---

    // Signal contenant les infos de l'utilisateur (ou null si non connecté)
    currentUser = signal<UserProfile | null>(this.getUserFromStorage());

    // Signal calculé : true si currentUser n'est pas null
    isAuthenticated = computed(() => !!this.currentUser());

    // Signal calculé : liste des rôles pour faciliter les vérifications dans les templates
    currentRoles = computed(() => this.currentUser()?.roles || []);

    constructor() {}

    // --- ACTIONS ---

    login(credentials: LoginRequest) {
        // POST vers /API/login
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                this.setSession(response.token);
            })
        );
    }

    logout() {
        localStorage.removeItem('jwt_token');
        this.currentUser.set(null);
        this.router.navigate(['/login']);
    }

    // --- INTERNE ---

    private setSession(token: string) {
        localStorage.setItem('jwt_token', token);
        const user = this.decodeToken(token);
        this.currentUser.set(user);
    }

    isAdmin = computed(() => this.currentRoles().includes('Admin'));

    register(userData: any) {
        return this.http.post(`${this.apiUrl}/logins`, userData);
    }

    private getUserFromStorage(): UserProfile | null {
        const token = localStorage.getItem('jwt_token');
        if (!token) return null;
        try {
            return this.decodeToken(token);
        } catch {
            localStorage.removeItem('jwt_token');
            return null;
        }
    }

    private decodeToken(token: string): UserProfile {
        const decoded: any = jwtDecode(token);

        // .NET met les rôles dans une clé bizarre, on normalise ça :
        const roleKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
        const rawRole = decoded[roleKey] || decoded.role || [];

        // Assure que c'est toujours un tableau
        const roles = Array.isArray(rawRole) ? rawRole : [rawRole];

        return {
            username: decoded.Username || '', // Ton claim "Username"
            fullName: decoded.FullName || '', // Ton claim "FullName"
            id: decoded.UserId || '',         // Ton claim "UserId"
            roles: roles
        };
    }

    // Utilisé par l'interceptor
    getToken(): string | null {
        return localStorage.getItem('jwt_token');
    }
}