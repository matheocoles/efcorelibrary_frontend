// addauthors.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzModalModule } from "ng-zorro-antd/modal";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { NzColDirective } from "ng-zorro-antd/grid";
import { NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent } from "ng-zorro-antd/form";
import { NzInputDirective } from "ng-zorro-antd/input";
import { NzFlexDirective } from "ng-zorro-antd/flex";
import { NzNotificationService } from "ng-zorro-antd/notification";
import {AuthorsService} from "../../../services/api";

@Component({
    selector: 'app-addauthors',
    imports: [
        NzButtonModule, NzModalModule, FormsModule, NzColDirective, NzFormControlComponent,
        NzFormDirective, NzFormItemComponent, NzFormLabelComponent, NzInputDirective,
        ReactiveFormsModule, NzFlexDirective
    ],
    templateUrl: './addauthors.html',
    styleUrls: ['./addauthors.css'],
})
export class Addauthors {
    @Output() authorAdded = new EventEmitter<void>(); // Événement pour notifier le parent

    isVisible = false;
    CreateAuthorForm = new FormGroup({
        name: new FormControl<string>('', [Validators.required]),
        firstname: new FormControl<string>('', [Validators.required]),
    });

    constructor(
        private authorsService: AuthorsService,
        private notificationService: NzNotificationService
    ) {}

    handleCancel(): void {
        this.isVisible = false;
    }

    showModal(): void {
        this.isVisible = true;
    }

    async submitForm(): Promise<void> {
        if (this.CreateAuthorForm.valid) {
            try {
                const { name, firstname } = this.CreateAuthorForm.value;
                await this.authorsService.createAuthorEndpoint({
                    name: name!, firstName: firstname!
                }).toPromise();
                this.notificationService.success('Succès', 'Auteur ajouté avec succès !');
                this.isVisible = false;
                this.CreateAuthorForm.reset();
                this.authorAdded.emit(); // Notifie le parent pour rafraîchir la liste
            } catch (error) {
                this.notificationService.error('Erreur', 'Impossible d\'ajouter l\'auteur.');
            }
        }
    }
}
