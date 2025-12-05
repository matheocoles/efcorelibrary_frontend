import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { BooksService, GetBookDto } from '../../../services/api';

@Component({
    selector: 'app-editbooks',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        NzModalModule,
        NzButtonModule,
        NzInputModule,
        NzFormModule,
    ],
    templateUrl: './editbooks.html',
    styleUrls: ['./editbooks.css']
})
export class Editbooks {
    @Input() book!: GetBookDto;
    @Output() bookEdited = new EventEmitter<void>();

    isModalVisible = false;
    editForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private bookService: BooksService,
        private message: NzMessageService
    ) {
        this.editForm = this.fb.group({
            title: ['', Validators.required],
            releaseYear: ['', Validators.required],
            isbn: ['', Validators.required],
        });
    }

    openModal(): void {
        this.editForm.patchValue({
            title: this.book.title,
            releaseYear: this.book.releaseYear,
            isbn: this.book.isbn,
        });
        this.isModalVisible = true;
    }

    closeModal(): void {
        this.isModalVisible = false;
    }

    async submitForm(): Promise<void> {
        if (this.editForm.valid) {
            try {
                const { title, releaseYear, isbn } = this.editForm.value;
                await this.bookService.updateBookEndpoint(this.book.id!, {
                    title,
                    releaseYear,
                    isbn
                }).toPromise();
                this.message.success('Livre mis à jour avec succès !');
                this.bookEdited.emit();
                this.closeModal();
            } catch (err) {
                this.message.error('Erreur lors de la mise à jour du livre.');
                console.error(err);
            }
        }
    }
}
