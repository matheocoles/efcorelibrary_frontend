import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFlexDirective } from 'ng-zorro-antd/flex';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BooksService, AuthorsService, GetAuthorDto } from '../../../services/api';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-addbooks',
    standalone: true,
    imports: [
        CommonModule,
        NzButtonModule,
        NzModalModule,
        NzFormModule,
        NzInputModule,
        NzFlexDirective,
        NzSelectModule,
        ReactiveFormsModule,
    ],
    templateUrl: './addbooks.html',
    styleUrls: ['./addbooks.css'],
})
export class Addbooks implements OnInit {
    @Output() bookAdded = new EventEmitter<void>();
    isVisible = false;
    authors: GetAuthorDto[] = [];

    CreateBookForm = new FormGroup({
        title: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        releaseYear: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        isbn: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        authorId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    });

    constructor(
        private booksService: BooksService,
        private authorsService: AuthorsService,
        private notificationService: NzNotificationService
    ) {}

    ngOnInit(): void {
        this.loadAuthors();
    }

    async loadAuthors(): Promise<void> {
        try {
            this.authors = await this.authorsService.getAllAuthorsEndpoint().toPromise();
            console.log('Auteurs chargés :', this.authors);
        } catch (error) {
            this.notificationService.error('Erreur', 'Impossible de charger les auteurs.');
            console.error('Erreur lors du chargement des auteurs :', error);
        }
    }

    handleCancel(): void {
        this.isVisible = false;
    }

    showModal(): void {
        this.isVisible = true;
    }

    async submitForm(): Promise<void> {
        if (this.CreateBookForm.valid) {
            try {
                const { title, releaseYear, isbn, authorId } = this.CreateBookForm.getRawValue();
                await this.booksService.createBookEndpoint({
                    title: title,
                    releaseYear: parseInt(releaseYear, 10),
                    isbn: isbn,
                    authorId: authorId!
                }).toPromise();
                this.notificationService.success('Succès', 'Livre ajouté avec succès !');
                this.isVisible = false;
                this.CreateBookForm.reset();
                this.bookAdded.emit();
            } catch (error) {
                this.notificationService.error('Erreur', 'Impossible d\'ajouter le livre.');
                console.error('Erreur lors de l\'ajout du livre :', error);
            }
        } else {
            this.notificationService.warning('Attention', 'Veuillez remplir tous les champs obligatoires.');
        }
    }
}
