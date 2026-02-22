import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

// Services
import {AuthService, AccountDto, CreateOrUpdateLoginDto} from '../../core/auth/auth.service';

// NG-ZORRO
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'; // Pour confirmer la suppression
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        NzFormModule,
        NzInputModule,
        NzButtonModule,
        NzCardModule,
        NzSelectModule,
        NzTableModule,
        NzIconModule,
        NzPopconfirmModule,
        NzTagModule
    ],
    templateUrl: './register.html', // Assure-toi que le nom correspond
    styles: [`
        .container { padding: 24px; }
        .form-card { max-width: 800px; margin: 0 auto 24px auto; }
    `]
})
export class Register implements OnInit { // Tu peux renommer en AccountManagement
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private notification = inject(NzNotificationService);

    // Données
    accounts = signal<AccountDto[]>([]);
    isLoading = false;
    isEditing = false; // Mode édition activé ?
    currentId: number | null = null; // ID du compte en cours d'édition

    rolesList = [
        { label: 'Utilisateur', value: 'User' },
        { label: 'Administrateur', value: 'Admin' }
    ];

    // Formulaire
    accountForm = this.fb.group({
        username: ['', [Validators.required]],
        fullName: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        role: ['User', [Validators.required]]
    });

    ngOnInit() {
        this.loadAccounts();
    }

    // --- CHARGEMENT ---
    async loadAccounts() {
        this.isLoading = true;
        try {
            const data = await firstValueFrom(this.authService.getAccounts());
            this.accounts.set(data);
        } catch (e) {
            this.notification.error('Erreur', 'Impossible de charger les comptes.');
        } finally {
            this.isLoading = false;
        }
    }

    // --- SOUMISSION (CRÉATION OU MODIFICATION) ---
    async submitForm() {
        if (this.accountForm.valid) {
            this.isLoading = true;

            const val = this.accountForm.getRawValue() as CreateOrUpdateLoginDto;

            try {
                if (this.isEditing && this.currentId) {
                    // MODE UPDATE
                    // On s'assure d'envoyer toutes les données requises
                    await firstValueFrom(this.authService.updateAccount(this.currentId, {
                        id: this.currentId,
                        username: val.username,
                        fullName: val.fullName,
                        password: val.password,
                        role: val.role
                    }));
                    this.notification.success('Succès', 'Compte mis à jour.');
                } else {
                    // MODE CRÉATION
                    // Ici 'val' est maintenant typé correctement grâce au 'as ...'
                    await firstValueFrom(this.authService.register(val));
                    this.notification.success('Succès', 'Compte créé.');
                }

                this.resetForm();
                this.loadAccounts();
            } catch (e) {
                this.notification.error('Erreur', 'Opération échouée.');
                console.error(e);
            } finally {
                this.isLoading = false;
            }
        } else {
            // ... gestion des erreurs de validation ...
            Object.values(this.accountForm.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({ onlySelf: true });
                }
            });
        }
    }

    // --- ACTIONS D'ÉDITION ---
    startEdit(account: any) { // Type 'any' car ton GetLoginDto n'a peut-être pas encore 'role'
        this.isEditing = true;
        this.currentId = account.id;

        // On remplit le formulaire avec les données existantes
        this.accountForm.patchValue({
            username: account.username,
            fullName: account.fullName,
            role: account.role || 'User',
            password: '' // On vide le mot de passe car on ne peut pas le récupérer (hashé)
        });

        // Optionnel : Tu peux rendre le mot de passe non-obligatoire en édition si ton back le gère,
        // mais ton code C# actuel requiert un mot de passe pour l'update.
    }

    resetForm() {
        this.isEditing = false;
        this.currentId = null;
        this.accountForm.reset({ role: 'User' });
    }

    // --- SUPPRESSION ---
    async deleteAccount(id: number) {
        try {
            await firstValueFrom(this.authService.deleteAccount(id));
            this.notification.success('Succès', 'Compte supprimé.');
            this.loadAccounts();
        } catch (e) {
            this.notification.error('Erreur', 'Impossible de supprimer ce compte.');
        }
    }
}