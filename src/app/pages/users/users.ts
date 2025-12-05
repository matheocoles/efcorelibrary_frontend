import { Component, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzFlexDirective } from "ng-zorro-antd/flex";
import { NzTableModule } from "ng-zorro-antd/table";
import { NzButtonModule } from 'ng-zorro-antd/button';
import {AuthorsService, GetAuthorDto, GetUserDto, UsersService} from "../../services/api";
import {AddUsers} from "../../components/button-users/addusers/addusers";
import {Editusers} from "../../components/button-users/editusers/editusers";

@Component({
    selector: 'app-users',
    templateUrl: './users.html',
    styleUrls: ['./users.css'],
    standalone: true,
    imports: [
        NzTableModule,
        NzFlexDirective,
        NzButtonModule,
        AddUsers,
        Editusers,
    ],

})
export class Users implements OnInit {
    private userService = inject(UsersService);
    private notificationService = inject(NzNotificationService);
    private modalService = inject(NzModalService);

    usersLoading = signal<boolean>(false);
    user = signal<GetUserDto[]>([]);

    async ngOnInit() {
        await this.fetchUsers();
    }

    async fetchUsers() {
        this.usersLoading.set(true);
        try {
            const users = await firstValueFrom(this.userService.getAllUsersEndpoint());
            this.user.set(users);
            console.log('Utilisateurs chargés :', this.user());
        } catch (e) {
            this.notificationService.error('Erreur', 'Erreur de communication avec l\'API');
        } finally {
            this.usersLoading.set(false);
        }
    }

    deleteUser(id: number): void {
        this.modalService.confirm({
            nzTitle: 'Confirmer la suppression',
            nzContent: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
            nzOkText: 'Oui',
            nzOkType: 'primary',
            nzOkDanger: true,
            nzOnOk: async () => {
                try {
                    await firstValueFrom(this.userService.deleteUserEndpoint(id));
                    this.notificationService.success('Succès', 'L\'utilisateur a été supprimé avec succès.');
                    await this.fetchUsers();
                } catch (e) {
                    this.notificationService.error('Erreur', 'Impossible de supprimer l\'utilisateur.');
                }
            },
            nzCancelText: 'Non',
        });
    }
}
