import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { icons } from './icons-provider';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { fr_FR, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import fr from '@angular/common/locales/fr';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
// 1. AJOUT DE 'withInterceptors' DANS LES IMPORTS
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// 2. IMPORT DE TON INTERCEPTEUR
import { authInterceptor } from './core/auth/auth.interceptor';

registerLocaleData(fr);

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideNzIcons(icons),
        provideNzI18n(fr_FR),
        provideAnimationsAsync(),

        // 3. MODIFICATION ICI : On active l'intercepteur
        provideHttpClient(withInterceptors([authInterceptor]))
    ]
};