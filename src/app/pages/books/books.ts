import { Component, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from "ng-zorro-antd/table";
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { BooksService, GetBookDto } from "../../services/api";
import { Addbooks } from "../../components/button-book/addbooks/addbooks";
import { Editbooks } from "../../components/button-book/editbooks/editbooks";
import {NzDividerComponent} from "ng-zorro-antd/divider";

@Component({
    selector: 'app-books',
    templateUrl: './books.html',
    styleUrls: ['./books.css'],
    standalone: true,
    imports: [
        NzTableModule,
        NzButtonModule,
        NzSpaceModule,
        NzIconModule,
        NzModalModule,
        Addbooks,
        Editbooks,
        NzDividerComponent,
    ],
})
export class Books implements OnInit {
    private bookService = inject(BooksService);
    private notificationService = inject(NzNotificationService);
    private modalService = inject(NzModalService);

    booksLoading = signal<boolean>(false);
    books = signal<GetBookDto[]>([]);
    isAuthorModalVisible = false;
    selectedAuthor = signal<{name: string, firstName: string} | null>(null);

    async ngOnInit() {
        await this.fetchBooks();
    }

    async fetchBooks() {
        this.booksLoading.set(true);
        try {
            const books = await firstValueFrom(this.bookService.getAllBooksEndpoint());
            this.books.set(books);
        } catch (e) {
            this.notificationService.error('Erreur', 'Erreur de communication avec l\'API');
        } finally {
            this.booksLoading.set(false);
        }
    }

    async refreshBooks() {
        await this.fetchBooks();
    }

    showAuthorModal(authorName: string, authorFirstName: string): void {
        this.selectedAuthor.set({ name: authorName, firstName: authorFirstName });
        this.isAuthorModalVisible = true;
    }

    handleAuthorModalCancel(): void {
        this.isAuthorModalVisible = false;
    }

    deleteBook(id: number): void {
        this.modalService.confirm({
            nzTitle: 'Confirmer la suppression',
            nzContent: 'Êtes-vous sûr de vouloir supprimer ce livre ? Cette action est irréversible.',
            nzOkText: 'Oui, supprimer',
            nzOkType: 'primary',
            nzOkDanger: true,
            nzWidth: '450px',
            nzOnOk: async () => {
                try {
                    await firstValueFrom(this.bookService.deleteBookEndpoint(id));
                    this.notificationService.success('Succès', 'Le livre a été supprimé avec succès.');
                    await this.refreshBooks();
                } catch (e) {
                    this.notificationService.error('Erreur', 'Impossible de supprimer le livre.');
                }
            },
            nzCancelText: 'Annuler',
        });
    }
}
