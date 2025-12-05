import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { GetUserDto, UsersService} from '../../../services/api';

@Component({
    selector: 'app-editusers',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        NzModalModule,
        NzButtonModule,
        NzInputModule,
        NzFormModule,
    ],
    templateUrl: './editusers.html',
    styleUrls: ['./editusers.css']
})
export class Editusers {
    @Input() user!: GetUserDto;
    @Output() userEdited = new EventEmitter<void>();

    isModalVisible = false;
    editForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private userService: UsersService,
        private message: NzMessageService
    ) {
        this.editForm = this.fb.group({
            name: ['', Validators.required],
            firstname: ['', Validators.required],
            email: ['', Validators.required],
            birthday: ['', Validators.required],
        });
    }

    openModal(): void {
        this.editForm.patchValue({
            name: this.user.name,
            firstname: this.user.firstName,
            email: this.user.email,
            birthday: this.user.birthday,
        });
        this.isModalVisible = true;
    }

    closeModal(): void {
        this.isModalVisible = false;
    }

    async submitForm(): Promise<void> {
        if (this.editForm.valid) {
            try {
                const { name, firstname, email, birthday } = this.editForm.value;
                await this.userService.updateUserEndpoint(this.user.id!, {
                    name,
                    firstName: firstname,
                    email: email,
                    birthday: birthday,
                }).toPromise();
                this.message.success('Utilisateur mis à jour avec succès !');
                this.userEdited.emit();
                this.closeModal();
            } catch (err) {
                this.message.error('Erreur lors de la mise à jour de l\'utilisateur.');
                console.error(err);
            }
        }
    }
}
