import { Component } from '@angular/core';
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzModalModule} from "ng-zorro-antd/modal";

@Component({
  selector: 'app-addauthors',
    imports: [
        NzButtonModule, NzModalModule
    ],
  templateUrl: './addauthors.html',
  styleUrl: './addauthors.css',
})
export class Addauthors {
    isVisible = false;

    showModal(): void {
        this.isVisible = true;
    }

    handleOk(): void {
        console.log('Button ok clicked!');
        this.isVisible = false;
    }

    handleCancel(): void {
        console.log('Button cancel clicked!');
        this.isVisible = false;
    }
}