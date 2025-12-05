import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs'; // IMPORTANT

// NG-ZORRO Imports
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzModalModule } from "ng-zorro-antd/modal";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzFlexModule } from "ng-zorro-antd/flex";
import { NzNotificationService } from "ng-zorro-antd/notification";
import { NzIconModule } from 'ng-zorro-antd/icon';
import {AuthorsService} from "../../../services/api";


@Component({
    selector: 'app-addauthors',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        NzButtonModule,
        NzModalModule,
        NzFormModule,
        NzInputModule,
        NzFlexModule,
        NzIconModule
    ],
    templateUrl: './addauthors.html',
    styleUrls: ['./addauthors.css'],
})
export class AddAuthors {
    @Output() authorAdded = new EventEmitter<void>();

    // Injections modernes
    private fb = inject(FormBuilder);
    private authorsService = inject(AuthorsService);
    private notificationService = inject(NzNotificationService);

    isVisible = false;
    isSubmitting = false; // Pour gérer l'état de chargement du bouton

    createAuthorForm = this.fb.group({
        name: ['', [Validators.required]],
        firstname: ['', [Validators.required]],
    });

    showModal(): void {
        this.isVisible = true;
    }

    handleCancel(): void {
        this.isVisible = false;
        this.createAuthorForm.reset();
    }

    async submitForm(): Promise<void> {
        if (this.createAuthorForm.valid) {
            this.isSubmitting = true;
            try {
                // Utilisation de getRawValue() pour être sûr d'avoir les valeurs
                const { name, firstname } = this.createAuthorForm.getRawValue();

                // Remplacement de toPromise() par firstValueFrom()
                await firstValueFrom(this.authorsService.createAuthorEndpoint({
                    name: name!, // le ! force le type string si le form est nullable
                    firstName: firstname!,
                }));

                this.notificationService.success('Succès', 'Auteur ajouté avec succès !');
                this.isVisible = false;
                this.createAuthorForm.reset();

                // On prévient le parent qu'il faut recharger la liste
                this.authorAdded.emit();
            } catch (error) {
                this.notificationService.error('Erreur', 'Impossible d\'ajouter l\'auteur.');
                console.error(error);
            } finally {
                this.isSubmitting = false;
            }
        } else {
            // Affiche les erreurs si on clique sur valider avec des champs vides
            Object.values(this.createAuthorForm.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({ onlySelf: true });
                }
            });
        }
    }
}