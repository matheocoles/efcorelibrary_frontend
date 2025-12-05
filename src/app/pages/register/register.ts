import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

// Imports NG-Zorro
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSelectModule } from 'ng-zorro-antd/select'; // Si tu veux choisir le rôle

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
        NzSelectModule
    ],
    templateUrl: './register.html',
    styles: [`
    .register-card { max-width: 600px; margin: 24px auto; }
  `]
})
export class Register {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private notification = inject(NzNotificationService);

    isLoading = false;

    registerForm = this.fb.group({
        username: ['', [Validators.required]],
        fullName: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]]
        // Tu pourrais ajouter un champ "role" ici si ton DTO backend le gère
    });

    submitForm(): void {
        if (this.registerForm.valid) {
            this.isLoading = true;

            this.authService.register(this.registerForm.value).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.notification.success('Succès', 'Utilisateur créé avec succès !');
                    this.router.navigate(['/users']); // Retour à la liste des utilisateurs
                },
                error: (err) => {
                    this.isLoading = false;
                    this.notification.error('Erreur', 'Impossible de créer l\'utilisateur.');
                    console.error(err);
                }
            });
        } else {
            Object.values(this.registerForm.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({ onlySelf: true });
                }
            });
        }
    }
}