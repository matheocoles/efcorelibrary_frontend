import { Component, EventEmitter, Output } from '@angular/core';
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzModalModule } from "ng-zorro-antd/modal";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { NzColDirective } from "ng-zorro-antd/grid";
import { NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent } from "ng-zorro-antd/form";
import { NzInputDirective } from "ng-zorro-antd/input";
import { NzFlexDirective } from "ng-zorro-antd/flex";
import { NzNotificationService } from "ng-zorro-antd/notification";
import {AuthorsService, BooksService, UsersService} from "../../../services/api";
import {NzDatePickerComponent} from "ng-zorro-antd/date-picker";

@Component({
    selector: 'app-addusers',
    standalone: true,
    imports: [
        NzButtonModule, NzModalModule, FormsModule, NzColDirective, NzFormControlComponent,
        NzFormDirective, NzFormItemComponent, NzFormLabelComponent, NzInputDirective,
        ReactiveFormsModule, NzFlexDirective, NzDatePickerComponent
    ],
    templateUrl: './addusers.html',
    styleUrls: ['./addusers.css'],
})
export class Addusers {
    @Output() usersAdded = new EventEmitter<void>();
    isVisible = false;
    date = null;

    CreateUsersForm = new FormGroup({
        name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        firstname: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        email: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        birthday: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    });

    constructor(
        private usersService: UsersService,
        private notificationService: NzNotificationService
    ) {}

    onChange(result: Date): void {
        console.log('onChange: ', result);
    }

    handleCancel(): void {
        this.isVisible = false;
    }

    showModal(): void {
        this.isVisible = true;
    }

    async submitForm(): Promise<void> {
        if (this.CreateUsersForm.valid) {
            try {
                const { name, firstname, email, birthday } = this.CreateUsersForm.getRawValue();
                await this.usersService.createUserEndpoint({
                    name: name,
                    firstname: firstname,
                    email: email,
                    birthday: birthday
                }).toPromise();
                this.notificationService.success('Succès', 'Utilisateur ajouté avec succès !');
                this.isVisible = false;
                this.CreateUsersForm.reset();
                this.usersAdded.emit();
            } catch (error) {
                this.notificationService.error('Erreur', 'Impossible d\'ajouter l\'utilisateur.');
            }
        }
    }
}
