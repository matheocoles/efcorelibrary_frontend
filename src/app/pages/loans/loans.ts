import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';


// NG-ZORRO
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';

// Components Enfants
import {GetLoanDto, LoansService} from "../../services/api";
import {AddLoanComponent} from "../../components/button-loans/addloans/addloans";
import {EditLoans} from "../../components/button-loans/editloans/editloans";

@Component({
    selector: 'app-loans',
    standalone: true,
    imports: [
        CommonModule,
        NzTableModule,
        NzButtonModule,
        NzIconModule,
        NzTagModule,
        NzSpaceModule,
        NzDividerModule,
        NzToolTipModule,
        AddLoanComponent,
        EditLoans,

    ],
    templateUrl: './loans.html'
})
export class Loans implements OnInit {
    private loansService = inject(LoansService);
    private notification = inject(NzNotificationService);
    private modal = inject(NzModalService);

    // On utilise le DTO généré GetLoanDto
    loans = signal<GetLoanDto[]>([]);
    isLoading = signal<boolean>(false);

    ngOnInit() {
        this.fetchLoans();
    }

    async fetchLoans() {
        this.isLoading.set(true);
        try {
            // Appel à la méthode générée getAllLoansEndpoint
            const data = await firstValueFrom(this.loansService.getAllLoansEndpoint());
            this.loans.set(data);
        } catch (e) {
            this.notification.error('Erreur', 'Impossible de charger les emprunts');
            console.error(e);
        } finally {
            this.isLoading.set(false);
        }
    }

    deleteLoan(id: number) {
        this.modal.confirm({
            nzTitle: 'Supprimer cet emprunt ?',
            nzContent: 'Cette action est irréversible.',
            nzOkDanger: true,
            nzOnOk: async () => {
                try {
                    // Appel à la méthode générée deleteLoanEndpoint
                    await firstValueFrom(this.loansService.deleteLoanEndpoint(id));
                    this.notification.success('Succès', 'Emprunt supprimé');
                    this.fetchLoans();
                } catch (e) {
                    this.notification.error('Erreur', 'Impossible de supprimer');
                }
            }
        });
    }

    // Helper pour vérifier les retards
    isLate(loan: GetLoanDto): boolean {
        if (loan.effectiveReturningDate) return false;

        // Ton DTO C# s'appelle PlannedReturningDate, donc en JS/TS c'est souvent plannedReturningDate (camelCase)
        if (loan.plannedReturningDate) {
            const due = new Date(loan.plannedReturningDate);
            const today = new Date();
            return due < today;
        }
        return false;
    }
}