import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './core/auth/auth.service';

// Imports NG-ZORRO
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
    selector: 'app-root',
    standalone: true, // IMPORTANT car tu utilises loadComponent dans tes routes
    imports: [
        CommonModule,
        RouterOutlet,
        RouterLink,
        NzLayoutModule,
        NzMenuModule,
        NzIconModule,
        NzButtonModule
    ],
    templateUrl: './app.html',
    styleUrls: ['./app.css']
})
export class App {
    // Injection du AuthService pour accéder aux Signals (isAuthenticated, isAdmin, etc.)
    authService = inject(AuthService);

    isCollapsed = false;

    logout() {
        this.authService.logout();
    }
}