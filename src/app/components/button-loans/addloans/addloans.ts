import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

// NG-ZORRO
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzIconModule } from 'ng-zorro-antd/icon';
import {BooksService, CreateLoanDto, LoansService, UsersService} from "../../../services/api";

@Component({
    selector: 'app-add-loan',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        NzModalModule,
        NzButtonModule,
        NzFormModule,
        NzSelectModule,
        NzDatePickerModule,
        NzIconModule
    ],
    templateUrl: './addloans.html'
})
export class AddLoanComponent implements OnInit {
    @Output() loanAdded = new EventEmitter<void>();

    private fb = inject(FormBuilder);
    private loansService = inject(LoansService);
    private booksService = inject(BooksService);
    private usersService = inject(UsersService);
    private notif = inject(NzNotificationService);

    isVisible = false;
    isSubmitting = false;

    booksList: any[] = [];
    usersList: any[] = [];

    // Formulaire adapté : Juste une date simple
    form = this.fb.group({
        bookId: [null as number | null, [Validators.required]],
        userId: [null as number | null, [Validators.required]],
        date: [new Date(), [Validators.required]] // Par défaut aujourd'hui
    });

    async ngOnInit() {
        try {
            const [books, users] = await Promise.all([
                firstValueFrom(this.booksService.getAllBooksEndpoint()),
                firstValueFrom(this.usersService.getAllUsersEndpoint())
            ]);
            this.booksList = books;
            this.usersList = users;
        } catch (e) {
            console.error('Erreur chargement listes', e);
        }
    }

    showModal() { this.isVisible = true; }

    handleCancel() {
        this.isVisible = false;
        this.form.reset({ date: new Date() }); // Reset avec date du jour
    }

    // src/app/components/popup/addloan/addloan.component.ts

    async submit() {
        if (this.form.valid) {
            this.isSubmitting = true;
            try {
                const val = this.form.value;

                // 1. CORRECTION DATE : On formate en "YYYY-MM-DD"
                // C'est le seul format que DateOnly accepte sans broncher
                let formattedDate = '';
                if (val.date) {
                    const d = new Date(val.date);
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    formattedDate = `${year}-${month}-${day}`;
                }

                // 2. CONSTRUCTION DU PAYLOAD
                // On envoie la date formatée
                const newLoanPayload: any = {
                    bookId: val.bookId,
                    userId: val.userId,
                    date: formattedDate // Envoie "2025-12-05" au lieu de l'ISO complet
                };

                console.log('Envoi corrigé :', newLoanPayload);

                // Appel au service
                await firstValueFrom(this.loansService.createLoanEndpoint(newLoanPayload));

                this.notif.success('Succès', 'Emprunt créé');
                this.handleCancel();
                this.loanAdded.emit();
            } catch (e: any) {
                console.error('Erreur Backend :', e);

                // Gestion d'erreur améliorée
                let msg = 'Impossible de créer l\'emprunt';
                if(e.error && e.error.errors) {
                    msg = JSON.stringify(e.error.errors);
                } else if (e.error && e.error.message) {
                    msg = e.error.message;
                }
                this.notif.error('Erreur', msg);
            } finally {
                this.isSubmitting = false;
            }
        }
    }
}