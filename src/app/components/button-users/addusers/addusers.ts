import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs'; // Pour remplacer toPromise()

// NG-ZORRO Imports
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzModalModule } from "ng-zorro-antd/modal";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzFlexModule } from "ng-zorro-antd/flex";
import { NzDatePickerModule } from "ng-zorro-antd/date-picker"; // Module spécifique date
import { NzNotificationService } from "ng-zorro-antd/notification";

// Services
import { UsersService } from "../../../services/api";

@Component({
    selector: 'app-addusers',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        NzButtonModule,
        NzModalModule,
        NzFormModule,
        NzInputModule,
        NzFlexModule,
        NzDatePickerModule
    ],
    templateUrl: './addusers.html',
    styleUrls: ['./addusers.css'],
})
export class AddUsers {
    @Output() usersAdded = new EventEmitter<void>();

    // Injections
    private fb = inject(FormBuilder);
    private usersService = inject(UsersService);
    private notificationService = inject(NzNotificationService);

    isVisible = false;
    isSubmitting = false;

    // Définition du formulaire
    createUsersForm = this.fb.group({
        name: ['', [Validators.required]],
        firstname: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]], // Ajout validation email
        birthday: [null as Date | null, [Validators.required]], // Initialisé à null, type Date
    });

    showModal(): void {
        this.isVisible = true;
    }

    handleCancel(): void {
        this.isVisible = false;
        this.createUsersForm.reset();
    }

    async submitForm(): Promise<void> {
        if (this.createUsersForm.valid) {
            this.isSubmitting = true;
            try {
                // 1. Récupérer les valeurs brutes du formulaire
                const rawValues = this.createUsersForm.getRawValue();

                // 2. CORRECTION DATE : Transformer l'objet Date en string "YYYY-MM-DD"
                // (Évite d'envoyer l'heure et les problèmes de Timezone type 22:00 la veille)
                let formattedBirthday = '';
                if (rawValues.birthday) {
                    const d = new Date(rawValues.birthday);
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    formattedBirthday = `${year}-${month}-${day}`;
                }

                // 3. CORRECTION DU PAYLOAD (L'objet envoyé au serveur)
                // C'est ici que tu dois aligner les noms avec ton DTO C#
                const userPayload = {
                    name: rawValues.name,
                    // ATTENTION : Le C# attend souvent "firstName", ton form a "firstname"
                    firstName: rawValues.firstname,
                    email: rawValues.email,
                    birthday: formattedBirthday
                };

                console.log('Envoi au serveur :', userPayload); // Pour débuguer

                // 4. Appel au service
                await firstValueFrom(this.usersService.createUserEndpoint(userPayload));

                this.notificationService.success('Succès', 'Utilisateur ajouté avec succès !');
                this.isVisible = false;
                this.createUsersForm.reset();
                this.usersAdded.emit();

            } catch (error: any) {
                console.error('Erreur Backend détaillée :', error);

                // Affiche la vraie cause de l'erreur 400 dans la notification
                let errorMsg = 'Impossible d\'ajouter l\'utilisateur.';
                if (error.error && error.error.errors) {
                    // Récupère les messages de validation du C# (ex: "The Email field is not a valid e-mail address.")
                    errorMsg = JSON.stringify(error.error.errors);
                }

                this.notificationService.error('Erreur 400', errorMsg);
            } finally {
                this.isSubmitting = false;
            }
        } else {
            // Affiche les erreurs de validation du formulaire (champs rouges)
            Object.values(this.createUsersForm.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({ onlySelf: true });
                }
            });
        }
    }
}