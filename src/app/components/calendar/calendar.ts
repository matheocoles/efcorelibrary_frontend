import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// Imports NG-Zorro
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';

// Import du Service
import { DashboardService, CalendarEvent } from '../../core/services/dashboard.service';

@Component({
    selector: 'app-calendar',
    standalone: true,
    imports: [
        CommonModule,
        NzBadgeModule,
        NzCalendarModule
    ],
    templateUrl: './calendar.html',
    styleUrl: './calendar.css',
})
export class Calendar implements OnInit {
    private dashboardService = inject(DashboardService);

    // Stockage optimisé des événements : { "2023-12-05": [Event1, ...], ... }
    eventsMap: Record<string, CalendarEvent[]> = {};

    ngOnInit() {
        this.dashboardService.getCalendarEvents().subscribe({
            next: (data) => {
                this.processEvents(data);
            },
            error: (err) => console.error('Erreur chargement calendrier', err)
        });
    }

    /**
     * Convertit la liste plate reçue du serveur en un objet Map indexé par date (YYYY-MM-DD)
     */
    private processEvents(data: CalendarEvent[]) {
        const map: Record<string, CalendarEvent[]> = {};

        data.forEach(evt => {
            // evt.date est au format "2023-12-05T00:00:00..."
            // On coupe au "T" pour garder juste "2023-12-05"
            const dateKey = evt.date.split('T')[0];

            if (!map[dateKey]) {
                map[dateKey] = [];
            }
            map[dateKey].push(evt);
        });

        this.eventsMap = map;
    }

    /**
     * Méthode appelée par le HTML pour chaque cellule du calendrier
     */
    getEventsForDate(date: Date): CalendarEvent[] {
        // On convertit la date de la cellule (Objet Date JS) en string "YYYY-MM-DD"
        // pour pouvoir la chercher dans notre eventsMap
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0 en JS
        const day = String(date.getDate()).padStart(2, '0');

        const key = `${year}-${month}-${day}`;

        // Retourne la liste des événements pour ce jour, ou un tableau vide
        return this.eventsMap[key] || [];
    }
}