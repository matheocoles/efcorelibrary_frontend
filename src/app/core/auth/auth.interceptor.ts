import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, throwError } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const notification = inject(NzNotificationService);

    // 1. Récupérer le token
    const token = authService.getToken();

    // 2. Cloner la requête pour y ajouter le header (si le token existe)
    let authReq = req;
    if (token) {
        authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    // 3. Envoyer la requête et surveiller les erreurs
    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {

            // Si le serveur répond 401 (Non autorisé / Token périmé)
            if (error.status === 401) {
                // On évite de boucler si c'est déjà la page de login
                if (!req.url.includes('/login')) {
                    notification.error('Session expirée', 'Veuillez vous reconnecter.');
                    authService.logout(); // On déconnecte proprement l'utilisateur
                }
            }

            return throwError(() => error);
        })
    );
};