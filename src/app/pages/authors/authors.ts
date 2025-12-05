import { Component, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common'; // Important pour @for

// Services & Models
import { AuthorsService, GetAuthorDto } from "../../services/api"; // Vérifie ton chemin
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';

// NG-ZORRO Imports
import { NzTableModule } from "ng-zorro-antd/table";
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from "ng-zorro-antd/divider";
import { NzSpaceModule } from "ng-zorro-antd/space";
import { NzFlexModule } from "ng-zorro-antd/flex";
import { NzIconModule } from 'ng-zorro-antd/icon';

// Components
import { EditAuthors } from "../../components/popup/editauthors/editauthors";
import { AddAuthors } from "../../components/popup/addauthors/addauthors"; // J'ai renommé le composant enfant

@Component({
    selector: 'app-authors',
    templateUrl: './authors.html',
    styleUrls: ['./authors.css'],
    standalone: true,
    imports: [
        CommonModule,
        NzTableModule,
        NzFlexModule,
        NzButtonModule,
        NzDividerModule,
        NzSpaceModule,
        NzIconModule,
        EditAuthors,
        AddAuthors,
    ],
})
export class Authors implements OnInit {
    private authorsService = inject(AuthorsService);
    private notificationService = inject(NzNotificationService);
    private modalService = inject(NzModalService);

    // Signals
    authorsLoading = signal<boolean>(false);
    authors = signal<GetAuthorDto[]>([]);

    async ngOnInit(): Promise<void> {
        await this.fetchAuthors();
    }

    async fetchAuthors(): Promise<void> {
        this.authorsLoading.set(true);
        try {
            // firstValueFrom est la méthode moderne pour convertir un Observable en Promise
            const authorsList = await firstValueFrom(this.authorsService.getAllAuthorsEndpoint());
            this.authors.set(authorsList);
        } catch (error) {
            console.error('Erreur lors du chargement des auteurs:', error);
            this.notificationService.error('Erreur', 'Erreur de communication avec l\'API');
        } finally {
            this.authorsLoading.set(false);
        }
    }

    deleteAuthor(id: number): void {
        this.modalService.confirm({
            nzTitle: 'Confirmer la suppression',
            nzContent: 'Êtes-vous sûr de vouloir supprimer cet auteur ?',
            nzOkText: 'Oui',
            nzOkType: 'primary',
            nzOkDanger: true,
            nzOnOk: async () => {
                try {
                    await firstValueFrom(this.authorsService.deleteAuthorEndpoint(id));
                    this.notificationService.success('Succès', 'L\'auteur a été supprimé avec succès.');
                    await this.fetchAuthors(); // Recharger la liste après suppression
                } catch (error) {
                    console.error('Erreur lors de la suppression:', error);
                    this.notificationService.error('Erreur', 'Impossible de supprimer l\'auteur.');
                }
            },
            nzCancelText: 'Non',
        });
    }
}