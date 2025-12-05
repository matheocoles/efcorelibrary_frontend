import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface correspondant au DTO du Backend
export interface CalendarEvent {
    date: string;
    title: string;
    type: 'success' | 'warning' | 'error' | 'processing' | 'default';
}

// Interface pour les stats (rappel si tu en as besoin)
export interface RecentLoan {
    bookTitle: string;
    userName: string;
    loanDate: string;
}

export interface DashboardStats {
    totalBooks: number;
    totalAuthors: number;
    totalUsers: number;
    totalLoans: number;
    recentLoans: RecentLoan[];
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private http = inject(HttpClient);

    // URL de base de ton API (Vérifie bien ton port, ici 5033)
    private apiUrlBase = 'http://localhost:5033/API';

    // Récupérer les statistiques globales
    getStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.apiUrlBase}/dashboard/stats`);
    }

    // Récupérer les événements du calendrier
    getCalendarEvents(): Observable<CalendarEvent[]> {
        return this.http.get<CalendarEvent[]>(`${this.apiUrlBase}/calendar/events`);
    }
}