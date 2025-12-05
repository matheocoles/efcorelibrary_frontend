import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// NG-ZORRO Imports
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { AuthService } from '../../core/auth/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        NzFormModule,
        NzInputModule,
        NzButtonModule,
        NzCardModule,
        NzIconModule
    ],
    templateUrl: './login.html',
    styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 82vh;
      background-color: #f0f2f5;
    }
    .login-card {
      width: 100%;
      max-width: 400px;
    }
    .login-header {
      text-align: center;
      margin-bottom: 24px;
    }
  `]
})
export class Login {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private notification = inject(NzNotificationService);

    isLoading = false;

    loginForm = this.fb.group({
        username: ['', [Validators.required]],
        password: ['', [Validators.required]]
    });

    submitForm(): void {
        if (this.loginForm.valid) {
            this.isLoading = true;

            const request = {
                username: this.loginForm.value.username!,
                password: this.loginForm.value.password!
            };

            this.authService.login(request).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.notification.success('Succès', 'Connexion réussie !');

                    // --- C'EST ICI QUE TU CHANGES LA REDIRECTION ---
                    this.router.navigate(['/welcome']);
                },
                error: (err) => {
                    this.isLoading = false;
                    // Gestion des erreurs (inchangée)
                    if (err.status === 401) {
                        this.notification.error('Erreur', 'Identifiant ou mot de passe incorrect.');
                    } else {
                        this.notification.error('Erreur', 'Impossible de contacter le serveur.');
                    }
                }
            });
        } else {
            // Affiche les erreurs de validation visuelles
            Object.values(this.loginForm.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({ onlySelf: true });
                }
            });
        }
    }
}