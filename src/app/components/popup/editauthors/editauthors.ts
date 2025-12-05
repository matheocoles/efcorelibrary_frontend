import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { AuthorsService, GetAuthorDto } from '../../../services/api';

@Component({
    selector: 'app-editauthors',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        NzModalModule,
        NzButtonModule,
        NzInputModule,
        NzFormModule,
    ],
    templateUrl: './editauthors.html',
    styleUrls: ['./editauthors.css']
})
export class EditAuthors {
    @Input() author!: GetAuthorDto;
    @Output() authorEdited = new EventEmitter<void>();

    isModalVisible = false;
    editForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private authorService: AuthorsService,
        private message: NzMessageService
    ) {
        this.editForm = this.fb.group({
            name: ['', [Validators.required]],
            firstName: ['', [Validators.required]],
        });
    }

    openModal(): void {
        this.editForm.patchValue({
            name: this.author.name,
            firstName: this.author.firstName,
        });
        this.isModalVisible = true;
    }

    closeModal(): void {
        this.isModalVisible = false;
    }

    async submitForm(): Promise<void> {
        if (this.editForm.valid) {
            try {
                const { name, firstName } = this.editForm.value;
                await this.authorService.updateAuthorEndpoint(this.author.id!, {
                    name,
                    firstName,
                }).toPromise();
                this.message.success('Auteur mis à jour avec succès !');
                this.authorEdited.emit();
                this.closeModal();
            } catch (err) {
                this.message.error('Erreur lors de la mise à jour de l\'auteur.');
                console.error(err);
            }
        }
    }
}
