import { Component } from '@angular/core';
import {Addauthors} from "../../components/popup/addauthors/addauthors";
import {NzCardModule} from "ng-zorro-antd/card";
import {Test} from "../../components/popup/test/test";

@Component({
  selector: 'app-authors',
    imports: [
        NzCardModule,
        Addauthors,
        Test,
    ],
  templateUrl: './authors.html',
  styleUrl: './authors.css',
})
export class Authors {

}
