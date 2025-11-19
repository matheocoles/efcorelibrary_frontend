import { Component, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {Addauthors} from "../../components/popup/addauthors/addauthors";
import {NzFlexDirective} from "ng-zorro-antd/flex";
import {NzTableModule} from "ng-zorro-antd/table";
import {AuthorsService, GetAuthorDto} from "../../services/api";
import {Editauthors} from "../../components/popup/editauthors/editauthors";

@Component({
    selector: 'app-authors',
    templateUrl: './authors.html',
    styleUrls: ['./authors.css'],
    standalone: true,
    imports: [
        NzTableModule,
        NzFlexDirective,
        Addauthors,
        Editauthors,
    ],
})

export class Authors implements OnInit {
    private authorsService = inject(AuthorsService);
    private notificationService = inject(NzNotificationService);

    authorsLoading = signal<boolean>(false);
    authors = signal<GetAuthorDto[]>([]);

    async ngOnInit() {
        await this.fetchAuthors();
    }

    async fetchAuthors() {
        this.authorsLoading.set(true);
        try {
            const authors = await firstValueFrom(this.authorsService.getAllAuthorsEndpoint());
            this.authors.set(authors);
            console.log('Auteurs chargés :', this.authors());
        } catch (e) {
            this.notificationService.error('Erreur', 'Erreur de communication avec l\'API');
        }
        this.authorsLoading.set(false);
    }



// deleteAuthor(id: string): void {
    //     this.modal.confirm({
    //         nzTitle: 'Confirmer la suppression',
    //         nzContent: 'Êtes-vous sûr de vouloir supprimer cet auteur ?',
    //         nzOkText: 'Oui',
    //         nzOkType: 'primary',
    //         nzOkDanger: true,
    //         nzOnOk: () => {
    //             this.listOfRandomUser = this.listOfRandomUser.filter((item) => item.id !== id);
    //             this.modal.success({
    //                 nzTitle: 'Suppression réussie',
    //                 nzContent: 'L\'auteur a été supprimé avec succès.',
    //             });
    //         },
    //         nzCancelText: 'Non',
    //         nzOnCancel: () => {
    //             this.modal.info({
    //                 nzTitle: 'Suppression annulée',
    //                 nzContent: 'La suppression a été annulée.',
    //             });
    //         },
    //     });
    // }
    //
    // // Sélectionne un auteur depuis le tableau
    // selectAuthor(id: string): void {
    //     this.selectedAuthorId = id;
    // }
    //
    // // Met à jour un auteur dans la liste
    // onAuthorUpdated(updatedAuthor: RandomUser): void {
    //     const index = this.listOfRandomUser.findIndex((a) => a.id === updatedAuthor.id);
    //     if (index !== -1) {
    //         this.listOfRandomUser[index] = updatedAuthor;
    //     }
    // }
}
