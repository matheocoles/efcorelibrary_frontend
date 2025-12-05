import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzModalModule } from "ng-zorro-antd/modal";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzFlexDirective } from "ng-zorro-antd/flex";
import { NzNotificationService } from "ng-zorro-antd/notification";
import { AuthorsService } from "../../../services/api";

@Component({
    selector: 'app-addauthors',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        NzButtonModule,
        NzModalModule,
        NzFormModule,
        NzInputModule,
        NzFlexDirective,
    ],
    templateUrl: './addauthors.html',
    styleUrls: ['./addauthors.css'],
})
export class Addauthors {
    @Output() authorAdded = new EventEmitter<void>();
    isVisible = false;
    CreateAuthorForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private authorsService: AuthorsService,
        private notificationService: NzNotificationService
    ) {
        this.CreateAuthorForm = this.fb.group({
            name: ['', { validators: [Validators.required], nonNullable: true }],
            firstname: ['', { validators: [Validators.required], nonNullable: true }],
        });
    }

    handleCancel(): void {
        this.isVisible = false;
    }

    showModal(): void {
        this.isVisible = true;
    }

    async submitForm(): Promise<void> {
        if (this.CreateAuthorForm.valid) {
            try {
                const { name, firstname } = this.CreateAuthorForm.getRawValue();
                await this.authorsService.createAuthorEndpoint({
                    name,
                    firstName: firstname,
                }).toPromise();
                this.notificationService.success('Succès', 'Auteur ajouté avec succès !');
                this.isVisible = false;
                this.CreateAuthorForm.reset();
                this.authorAdded.emit();
            } catch (error) {
                this.notificationService.error('Erreur', 'Impossible d\'ajouter l\'auteur.');
                console.error(error);
            }
        }
    }
}
