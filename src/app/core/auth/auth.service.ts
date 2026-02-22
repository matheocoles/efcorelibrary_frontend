import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { tap, Observable } from 'rxjs';

// ==============================================================
// 1. DÉFINITION DES INTERFACES (DTOs)
// ==============================================================

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

// Utilisé pour la CRÉATION et la MODIFICATION
// C'est cette interface qui corrige ton erreur de typage dans le composant
export interface CreateOrUpdateLoginDto {
    id?: number;       // Optionnel (pas besoin en création)
    username: string;
    fullName: string;
    password: string;
    role: string;
}

// Utilisé pour l'AFFICHAGE (Liste)
export interface AccountDto {
    id: number;
    username: string;
    fullName: string;
    role: string; // <--- Doit être présent
}

// Utilisé pour le DÉCODAGE du Token (Session utilisateur)
export interface UserProfile {
    id: string;
    username: string;
    fullName: string;
    roles: string[];
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);

    // ⚠️ Vérifie bien que ce port correspond à ton launchSettings.json (5033 ou 7xxx)
    private apiUrl = 'http://localhost:5033/API';

    // ==============================================================
    // 2. GESTION DE L'ÉTAT (SIGNALS)
    // ==============================================================

    // Signal : Contient les infos de l'utilisateur connecté (ou null)
    currentUser = signal<UserProfile | null>(this.getUserFromStorage());

    // Computed : Vrai si l'utilisateur est connecté
    isAuthenticated = computed(() => !!this.currentUser());

    // Computed : Vrai si l'utilisateur a le rôle 'Admin'
    isAdmin = computed(() => this.currentUser()?.roles.includes('Admin') ?? false);

    constructor() {}

    // ==============================================================
    // 3. AUTHENTIFICATION
    // ==============================================================

    login(credentials: LoginRequest) {
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

    // ==============================================================
    // 4. ADMINISTRATION DES COMPTES (CRUD)
    // ==============================================================

    // Récupérer la liste (GET)
    getAccounts(): Observable<AccountDto[]> {
        return this.http.get<AccountDto[]>(`${this.apiUrl}/logins`);
    }

    // Créer un compte (POST) - Register / Add Admin
    register(data: CreateOrUpdateLoginDto): Observable<any> {
        return this.http.post(`${this.apiUrl}/logins`, data);
    }

    // Mettre à jour un compte (PUT)
    updateAccount(id: number, data: CreateOrUpdateLoginDto): Observable<any> {
        return this.http.put(`${this.apiUrl}/logins/${id}`, data);
    }

    // Supprimer un compte (DELETE)
    deleteAccount(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/logins/${id}`);
    }

    // ==============================================================
    // 5. UTILITAIRES (TOKEN & STORAGE)
    // ==============================================================

    // Utilisé par l'Interceptor pour injecter le token
    getToken(): string | null {
        return localStorage.getItem('jwt_token');
    }

    private setSession(token: string) {
        localStorage.setItem('jwt_token', token);
        const user = this.decodeToken(token);
        this.currentUser.set(user);
    }

    // Au chargement de l'app, on vérifie s'il y a déjà un token
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

        // .NET met souvent les rôles dans cette clé URL spécifique
        const roleKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

        // On récupère le rôle (soit dans la clé URL, soit dans 'role' standard)
        const rawRole = decoded[roleKey] || decoded.role || [];

        // On force un tableau même s'il n'y a qu'un seul rôle
        const roles = Array.isArray(rawRole) ? rawRole : [rawRole];

        return {
            id: decoded.UserId || '',
            username: decoded.Username || '',
            fullName: decoded.FullName || '',
            roles: roles
        };
    }
}