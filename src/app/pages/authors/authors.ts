import { Component, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzFlexDirective } from "ng-zorro-antd/flex";
import { NzTableModule } from "ng-zorro-antd/table";
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AuthorsService, GetAuthorDto } from "../../services/api";
import { EditAuthors } from "../../components/popup/editauthors/editauthors";
import {NzDividerComponent} from "ng-zorro-antd/divider";
import {NzSpaceComponent} from "ng-zorro-antd/space";
import {Addauthors} from "../../components/popup/addauthors/addauthors";

@Component({
    selector: 'app-authors',
    templateUrl: './authors.html',
    styleUrls: ['./authors.css'],
    standalone: true,
    imports: [
        NzTableModule,
        NzFlexDirective,
        NzButtonModule,
        EditAuthors,
        NzDividerComponent,
        NzSpaceComponent,
        Addauthors,
    ],
})
export class Authors implements OnInit {
    private authorsService = inject(AuthorsService);
    private notificationService = inject(NzNotificationService);
    private modalService = inject(NzModalService);

    authorsLoading = signal<boolean>(false);
    authors = signal<GetAuthorDto[]>([]);

    async ngOnInit(): Promise<void> {
        await this.fetchAuthors();
    }

    async fetchAuthors(): Promise<void> {
        this.authorsLoading.set(true);
        try {
            const authors = await firstValueFrom(this.authorsService.getAllAuthorsEndpoint());
            this.authors.set(authors);
            console.log('Auteurs chargés :', this.authors());
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
                    await this.fetchAuthors();
                } catch (error) {
                    console.error('Erreur lors de la suppression:', error);
                    this.notificationService.error('Erreur', 'Impossible de supprimer l\'auteur.');
                }
            },
            nzCancelText: 'Non',
        });
    }
}