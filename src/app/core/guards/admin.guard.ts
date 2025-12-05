import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

export const adminGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const notification = inject(NzNotificationService);

    if (authService.isAdmin()) {
        return true;
    }

    notification.error('Accès refusé', 'Cette page est réservée aux administrateurs.');
    return router.createUrlTree(['/welcome']);
};