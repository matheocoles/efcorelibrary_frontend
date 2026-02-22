import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
// --- NG-ZORRO Imports ---
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import {GetLoanDto, LoansService, PatchEffectiveReturnDto} from "../../../services/api";

@Component({
    selector: 'app-edit-loan',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        NzModalModule,
        NzButtonModule,
        NzFormModule,
        NzDatePickerModule,
        NzIconModule,
        NzToolTipModule,
        NzDescriptionsModule,
        NzDividerModule
    ],
    // C'est ici qu'on fait le lien avec le fichier HTML
    templateUrl: './editloans.html'
})
export class EditLoans{
    // INPUT : L'emprunt qu'on est en train d'éditer (reçu du tableau parent)
    @Input({ required: true }) loan!: GetLoanDto;

    // OUTPUT : Signal au parent qu'il faut rafraîchir la liste après modification
    @Output() loanEdited = new EventEmitter<void>();

    private fb = inject(FormBuilder);
    private loansService = inject(LoansService);
    private notif = inject(NzNotificationService);

    isVisible = false;
    isSubmitting = false;

    // Le formulaire contient uniquement la date de retour
    form = this.fb.group({
        returnDate: [new Date(), [Validators.required]]
    });

    /**
     * Ouvre la modale et initialise la date
     */
    showModal() {
        this.isVisible = true;

        // Logique d'initialisation de la date :
        // 1. Si le livre est déjà rendu, on pré-remplit avec la date de retour existante.
        // 2. Sinon, on met la date d'aujourd'hui par défaut.
        const initialDate = this.loan.effectiveReturningDate
            ? new Date(this.loan.effectiveReturningDate)
            : new Date();

        this.form.patchValue({
            returnDate: initialDate
        });
    }

    handleCancel() {
        this.isVisible = false;
        this.form.reset();
    }

    /**
     * Envoie la modification au Backend
     */
    // editloan.component.ts

    async submit() {
        if (this.form.valid && this.loan.id) {
            this.isSubmitting = true;
            try {
                const dateValue = this.form.get('returnDate')?.value;

                if (!dateValue) return;

                // --- CORRECTION : FORMATAGE MANUEL YYYY-MM-DD ---
                const d = new Date(dateValue);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`;

                const patchDto: PatchEffectiveReturnDto = {
                    effectiveReturningDate: formattedDate // On envoie "2025-12-06"
                };

                await firstValueFrom(this.loansService.patchEffectiveReturnEndpoint(this.loan.id, patchDto));

                this.notif.success('Succès', 'Le retour a été enregistré.');
                this.handleCancel();
                this.loanEdited.emit();
            } catch(e: any) { // Typage any pour lire l'erreur
                console.error(e);

                // Affiche le message d'erreur précis du serveur
                let msg = 'Impossible d\'enregistrer le retour.';
                if(e.error && e.error.errors) msg = JSON.stringify(e.error.errors);

                this.notif.error('Erreur', msg);
            } finally {
                this.isSubmitting = false;
            }
        }
    }
}