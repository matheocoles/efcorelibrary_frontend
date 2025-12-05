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
    async submit() {
        // On vérifie que le form est valide et qu'on a bien un ID d'emprunt
        if (this.form.valid && this.loan.id) {
            this.isSubmitting = true;
            try {
                const dateValue = this.form.get('returnDate')?.value;

                if (!dateValue) return;

                // Construction du DTO pour l'API (Patch)
                const patchDto: PatchEffectiveReturnDto = {
                    effectiveReturningDate: dateValue.toISOString()
                };

                // Appel au service généré pour patcher la date de retour
                await firstValueFrom(this.loansService.patchEffectiveReturnEndpoint(this.loan.id, patchDto));

                this.notif.success('Succès', 'Le retour a été enregistré.');
                this.handleCancel();

                // Important : on notifie le parent pour qu'il mette à jour le tableau
                this.loanEdited.emit();
            } catch(e) {
                console.error(e);
                this.notif.error('Erreur', 'Impossible d\'enregistrer le retour.');
            } finally {
                this.isSubmitting = false;
            }
        }
    }
}