import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {GetAuthorDto} from "../../../services/api";

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
    templateUrl: 'editauthors.html',
    styleUrls: ['./editauthors.css']
})
export class EditAuthors implements OnChanges {
    @Input() authors: GetAuthorDto[] = []; // Utilisez directement GetAuthorDto[]
    @Output() authorUpdated = new EventEmitter<GetAuthorDto>();
    private http = inject(HttpClient);
    private notificationService = inject(NzNotificationService);
    private message = inject(NzMessageService);

    isSelectAuthorModalVisible = false;
    isEditAuthorModalVisible = false;
    selectedAuthor: GetAuthorDto | null = null;
    selectedAuthorId: number | null = null;

    editAuthorForm: FormGroup;

    constructor(private fb: FormBuilder) {
        this.editAuthorForm = this.fb.group({
            lastName: ['', Validators.required],
            firstName: ['', Validators.required],
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.authors) {
            console.log("Auteurs reçus dans EditAuthorsComponent :", this.authors);
        }
    }

    openSelectAuthorModal(): void {
        if (!this.authors || this.authors.length === 0) {
            this.notificationService.error('Erreur', 'Aucun auteur disponible.');
            return;
        }
        this.isSelectAuthorModalVisible = true;
    }

    selectAuthor(author: GetAuthorDto): void {
        this.selectedAuthor = author;
        this.selectedAuthorId = author.id;
    }

    confirmSelectAuthor(): void {
        if (!this.selectedAuthor) {
            this.notificationService.error('Erreur', 'Veuillez sélectionner un auteur.');
            return;
        }
        this.isSelectAuthorModalVisible = false;
        this.loadAuthorData(this.selectedAuthor);
        this.isEditAuthorModalVisible = true;
    }

    loadAuthorData(author: GetAuthorDto): void {
        this.editAuthorForm.patchValue({
            lastName: author.name,
            firstName: author.firstName,
        });
    }

    closeSelectAuthorModal(): void {
        this.isSelectAuthorModalVisible = false;
        this.selectedAuthor = null;
        this.selectedAuthorId = null;
    }

    closeEditAuthorModal(): void {
        this.isEditAuthorModalVisible = false;
        this.editAuthorForm.reset();
    }

    async saveAuthor(): Promise<void> {
        if (this.editAuthorForm.valid && this.selectedAuthor) {
            const formValue = this.editAuthorForm.value;
            try {
                const updatedAuthor = {
                    Id: this.selectedAuthor.id,
                    Name: formValue.lastName,
                    FristName: formValue.firstName,
                };

                // Appel direct à l'API
                await this.http.put(`/API/authors/${this.selectedAuthor.id}`, updatedAuthor).toPromise();

                this.message.success('Auteur mis à jour avec succès !');
                this.authorUpdated.emit({
                    id: this.selectedAuthor.id,
                    name: formValue.lastName,
                    firstName: formValue.firstName,
                });
                this.closeEditAuthorModal();
            } catch (error) {
                this.notificationService.error('Erreur', 'Impossible de mettre à jour l\'auteur.');
                console.error("Erreur lors de la mise à jour de l'auteur :", error);
            }
        }
    }
}
