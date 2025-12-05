import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AuthService } from './core/auth/auth.service';

// --- 1. DÉFINITION DES GUARDS (SÉCURITÉ) ---

// Guard : Vérifie si l'utilisateur est connecté
const authGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }

    // Si pas connecté, on redirige vers le login
    return router.createUrlTree(['/login']);
};

// Guard : Vérifie si l'utilisateur est ADMIN
const adminGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const notification = inject(NzNotificationService);

    // On utilise le Signal "isAdmin" créé dans AuthService
    if (authService.isAdmin()) {
        return true;
    }

    // Si pas admin : Notification d'erreur et redirection vers l'accueil
    notification.error('Accès refusé', 'Cette section est réservée aux administrateurs.');
    return router.createUrlTree(['/welcome']);
};


// --- 2. DÉFINITION DES ROUTES ---

export const routes: Routes = [
    // A. ROUTE PUBLIQUE (LOGIN)
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then(m => m.Login)
    },

    // B. ROUTES PROTÉGÉES (Nécessitent une connexion)
    {
        path: '',
        canActivate: [authGuard], // <--- Verrouille tout ce qui est en dessous
        children: [
            // Redirection par défaut vers 'welcome'
            { path: '', redirectTo: 'welcome', pathMatch: 'full' },

            {
                path: 'welcome',
                loadComponent: () => import('./pages/welcome/welcome').then(m => m.Welcome),
            },
            {
                path: 'authors',
                loadComponent: () => import('./pages/authors/authors').then(m => m.Authors),
                children: [
                    {
                        path: 'add', // Accessible via /authors/add
                        loadComponent: () => import('./components/popup/addauthors/addauthors').then(m => m.Addauthors),
                    }
                ]
            },
            {
                path: 'books',
                loadComponent: () => import('./pages/books/books').then(m => m.Books),
            },
            {
                path: 'loans',
                loadComponent: () => import('./pages/loans/loans').then(m => m.Loans),
            },
            {
                path: 'users',
                loadComponent: () => import('./pages/users/users').then(m => m.Users),
            },

            // C. ROUTE ADMIN (Création de compte)
            {
                path: 'register',
                canActivate: [adminGuard], // <--- Verrouille spécifiquement pour les ADMINS
                loadComponent: () => import('./pages/register/register').then(m => m.Register),
            }
        ]
    },

    // D. WILDCARD (Si l'URL est inconnue -> Login)
    { path: '**', redirectTo: 'login' }
];