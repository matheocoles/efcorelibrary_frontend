import { Component } from '@angular/core';
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzModalModule} from "ng-zorro-antd/modal";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NzColDirective} from "ng-zorro-antd/grid";
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from "ng-zorro-antd/form";
import {NzInputDirective} from "ng-zorro-antd/input";
import {NzFlexDirective} from "ng-zorro-antd/flex";

@Component({
  selector: 'app-addauthors',
    imports: [
        NzButtonModule, NzModalModule, FormsModule, NzColDirective, NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent, NzInputDirective, ReactiveFormsModule, NzFlexDirective
    ],
  templateUrl: './addauthors.html',
  styleUrl: './addauthors.css',
})
export class Addauthors {
    isVisible = false;

    CreateAuthorForm = new FormGroup({
        name: new FormControl<string>(null, [Validators.required]),
        firstname: new FormControl<string>(null, [Validators.required]),
    })

    handleCancel(): void {
        this.isVisible = false;
    }

    showModal(): void {
        this.isVisible = true;
    }

    submitForm(): void {
        if (this.CreateAuthorForm.valid) {
            console.log(this.CreateAuthorForm.value);
            this.isVisible = false;
        }
    }

}