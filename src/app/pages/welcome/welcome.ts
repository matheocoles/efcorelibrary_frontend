import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// --- IMPORTS NG-ZORRO ---
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDividerModule } from 'ng-zorro-antd/divider'; // Ajout pour les lignes de séparation

// --- IMPORTS CUSTOM ---
import { Calendar } from "../../components/calendar/calendar"; // Vérifie ton chemin
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';

@Component({
    selector: 'app-welcome',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        NzGridModule,
        NzCardModule,
        NzStatisticModule,
        NzIconModule,
        NzListModule,
        NzSpinModule,
        NzAvatarModule,
        NzDividerModule,
        Calendar
    ],
    templateUrl: './welcome.html', // Assure-toi que c'est bien .html ou .component.html selon ton projet
    styleUrl: './welcome.css'      // Idem pour le css
})
export class Welcome implements OnInit {

    private dashboardService = inject(DashboardService);

    // Loader pour éviter l'affichage vide au début
    isLoading = true;

    // Initialisation avec des valeurs par défaut pour éviter les erreurs "undefined"
    stats: DashboardStats = {
        totalBooks: 0,
        totalAuthors: 0,
        totalUsers: 0,
        totalLoans: 0,
        recentLoans: []
    };

    ngOnInit() {
        this.loadStats();
    }

    loadStats() {
        this.dashboardService.getStats().subscribe({
            next: (data) => {
                this.stats = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Erreur chargement dashboard', err);
                this.isLoading = false;
            }
        });
    }
}