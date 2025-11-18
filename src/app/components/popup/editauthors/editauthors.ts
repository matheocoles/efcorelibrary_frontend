import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import {NzMessageService} from "ng-zorro-antd/message";

@Component({
    selector: 'app-editauthors',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        NzModalModule,
        NzTableModule,
        NzFormModule,
        NzInputModule,
        NzIconModule,
        NzButtonModule
    ],
    templateUrl: './editauthors.html',
    styleUrls: ['./editauthors.css']
})
export class EditAuthorsComponent implements OnChanges {
    @Input() authors: any[] = [];
    @Output() authorUpdated = new EventEmitter<any>();

    isSelectAuthorModalVisible = false;
    isEditAuthorModalVisible = false;
    selectedAuthorId: string | null = null;
    editAuthorForm: FormGroup;

    constructor(private fb: FormBuilder, private message: NzMessageService) {
        this.editAuthorForm = this.fb.group({
            lastName: ['', Validators.required],
            firstName: ['', Validators.required],
            bookCount: [0, Validators.min(0)],

        });

    }

    trackByAuthorId(index: number, author: any): string {
        return author.id;
    }


    ngOnChanges(changes: SimpleChanges): void {
        if (changes.authors) {
            console.log("Auteurs reçus dans EditAuthorsComponent :", this.authors);
        }
    }

    openSelectAuthorModal(): void {
        if (!this.authors || this.authors.length === 0) {
            alert('Aucun auteur disponible.');
            return;
        }
        this.isSelectAuthorModalVisible = true;
    }


    selectAuthor(id: string): void {
        this.selectedAuthorId = this.selectedAuthorId === id ? null : id;
        console.log("Auteur sélectionné :", this.selectedAuthorId);
    }


    confirmSelectAuthor(): void {
        if (!this.selectedAuthorId) {
            alert('Veuillez sélectionner un auteur.');
            return;
        }
        this.isSelectAuthorModalVisible = false;
        this.loadAuthorData(this.selectedAuthorId);
        this.isEditAuthorModalVisible = true;
    }

    loadAuthorData(id: string): void {
        const author = this.authors.find((a) => a.id === id);
        if (author) {
            this.editAuthorForm.patchValue({
                lastName: author.name.last,
                firstName: author.name.first,
                bookCount: author.bookCount,
            });
            console.log("Données de l'auteur chargé :", author);
        }
    }

    closeSelectAuthorModal(): void {
        this.isSelectAuthorModalVisible = false;
        this.selectedAuthorId = null;
    }

    closeEditAuthorModal(): void {
        this.isEditAuthorModalVisible = false;
        this.editAuthorForm.reset();
    }

    saveAuthor(): void {
        if (this.editAuthorForm.valid && this.selectedAuthorId) {
            const author = this.authors.find(a => a.id === this.selectedAuthorId);
            if (!author) return;

            const formValue = this.editAuthorForm.value;
            const hasChanged =
                author.name.last !== formValue.lastName ||
                author.name.first !== formValue.firstName ||
                author.bookCount !== formValue.bookCount;

            if (hasChanged) {
                const updatedAuthor = {
                    ...author,
                    name: {
                        ...author.name,
                        first: formValue.firstName,
                        last: formValue.lastName,
                    },
                    bookCount: formValue.bookCount,
                };
                this.authorUpdated.emit(updatedAuthor);
            }
            this.closeEditAuthorModal();
            this.message.success('Auteur mis à jour avec succès !');
            this.closeEditAuthorModal();
        }
    }

}
