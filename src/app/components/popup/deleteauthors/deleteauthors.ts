import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
    selector: 'app-deleteauthors',
    standalone: true,
    imports: [
        CommonModule,
        NzModalModule,
        NzTableModule,
        NzButtonModule,
        NzIconModule
    ],
    templateUrl: './deleteauthors.html',
    styleUrls: ['./deleteauthors.css']
})
export class DeleteAuthorsComponent {
    @Input() authors: any[] = [];
    @Output() authorDeleted = new EventEmitter<string>();

    isSelectAuthorModalVisible = false;
    isConfirmDeleteModalVisible = false;

    selectedAuthorId: string | null = null;

    // Ouvrir la première modale
    openSelectAuthorModal(): void {
        this.isSelectAuthorModalVisible = true;
    }

    // Sélection visuelle
    selectAuthor(id: string): void {
        this.selectedAuthorId = id;
    }

    // Valider sélection → aller à confirmation
    confirmSelectAuthor(): void {
        if (!this.selectedAuthorId) {
            alert('Veuillez sélectionner un auteur.');
            return;
        }

        this.isSelectAuthorModalVisible = false;
        this.isConfirmDeleteModalVisible = true;
    }

    // Annulation
    closeSelectAuthorModal(): void {
        this.isSelectAuthorModalVisible = false;
        this.selectedAuthorId = null;
    }

    closeConfirmDeleteModal(): void {
        this.isConfirmDeleteModalVisible = false;
    }

    // Suppression finale
    deleteAuthor(): void {
        if (!this.selectedAuthorId) return;

        this.authorDeleted.emit(this.selectedAuthorId);
        this.closeConfirmDeleteModal();

        this.selectedAuthorId = null;
    }
}
