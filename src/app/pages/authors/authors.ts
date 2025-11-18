import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NzTableComponent, NzTableQueryParams, NzThAddOnComponent } from 'ng-zorro-antd/table';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzFlexDirective } from 'ng-zorro-antd/flex';
import { Addauthors } from "../../components/popup/addauthors/addauthors";
import {EditAuthorsComponent} from "../../components/popup/editauthors/editauthors";

export interface RandomUser {
    id: string;
    gender: string;
    email: string;
    name: {
        title: string;
        first: string;
        last: string;
    };
    bookCount: number;
}

@Component({
    selector: 'app-authors',
    templateUrl: './authors.html',
    styleUrls: ['./authors.css'],
    standalone: true,
    imports: [
        Addauthors,
        NzTableComponent,
        NzThAddOnComponent,
        NzFlexDirective,
        EditAuthorsComponent,
    ],
})
export class Authors implements OnInit {
    listOfRandomUser: RandomUser[] = [];
    loading = true;
    total = 1;
    pageSize = 10;
    pageIndex = 1;
    selectedAuthorId: string | null = null;
    filterGender = [
        { text: 'male', value: 'male' },
        { text: 'female', value: 'female' },
    ];

    constructor(
        private http: HttpClient,
        private modal: NzModalService
    ) {}

    ngOnInit(): void {
        this.loadDataFromServer(this.pageIndex, this.pageSize, null, null, []);
        console.log("Liste des auteurs :", this.listOfRandomUser); // Vérifiez la console
    }


    loadDataFromServer(
        pageIndex: number,
        pageSize: number,
        sortField: string | null,
        sortOrder: string | null,
        filter: Array<{ key: string; value: string[] }>
    ): void {
        this.loading = true;
        this.getUsers(pageIndex, pageSize, sortField, sortOrder, filter).subscribe({
            next: (data) => {
                this.loading = false;
                this.total = 200;
                this.listOfRandomUser = data.results.map((user, index) => ({
                    ...user,
                    id: `${pageIndex}-${index}`,
                    bookCount: Math.floor(Math.random() * 20),
                }));
                console.log("Données chargées :", this.listOfRandomUser); // Vérifiez ici
            },
            error: (err) => {
                console.error("Erreur lors du chargement des données :", err);
                this.loading = false;
            },
        });
    }


    onQueryParamsChange(params: NzTableQueryParams): void {
        const { pageSize, pageIndex, sort, filter } = params;
        const currentSort = sort.find((item) => item.value !== null);
        const sortField = (currentSort && currentSort.key) || null;
        const sortOrder = (currentSort && currentSort.value) || null;
        this.loadDataFromServer(pageIndex, pageSize, sortField, sortOrder, filter);
    }

    getUsers(
        pageIndex: number,
        pageSize: number,
        sortField: string | null,
        sortOrder: string | null,
        filters: Array<{ key: string; value: string[] }>
    ): Observable<{ results: Omit<RandomUser, 'id'>[] }> {
        let params = new HttpParams()
            .append('page', `${pageIndex}`)
            .append('results', `${pageSize}`)
            .append('sortField', `${sortField}`)
            .append('sortOrder', `${sortOrder}`);
        filters.forEach((filter) => {
            filter.value.forEach((value) => {
                params = params.append(filter.key, value);
            });
        });
        return this.http
            .get<{ results: Omit<RandomUser, 'id'>[] }>('https://api.randomuser.me/', { params })
            .pipe(catchError(() => of({ results: [] })));
    }

    deleteAuthor(id: string): void {
        this.modal.confirm({
            nzTitle: 'Confirmer la suppression',
            nzContent: 'Êtes-vous sûr de vouloir supprimer cet auteur ?',
            nzOkText: 'Oui',
            nzOkType: 'primary',
            nzOkDanger: true,
            nzOnOk: () => {
                this.listOfRandomUser = this.listOfRandomUser.filter((item) => item.id !== id);
                this.modal.success({
                    nzTitle: 'Suppression réussie',
                    nzContent: 'L\'auteur a été supprimé avec succès.',
                });
            },
            nzCancelText: 'Non',
            nzOnCancel: () => {
                this.modal.info({
                    nzTitle: 'Suppression annulée',
                    nzContent: 'La suppression a été annulée.',
                });
            },
        });
    }

    // Sélectionne un auteur depuis le tableau
    selectAuthor(id: string): void {
        this.selectedAuthorId = id;
    }

    // Met à jour un auteur dans la liste
    onAuthorUpdated(updatedAuthor: RandomUser): void {
        const index = this.listOfRandomUser.findIndex((a) => a.id === updatedAuthor.id);
        if (index !== -1) {
            this.listOfRandomUser[index] = updatedAuthor;
        }
    }
}
