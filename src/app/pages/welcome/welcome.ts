import { Component } from '@angular/core';
import {Calendar} from "../../component/calendar/calendar";

@Component({
  selector: 'app-welcome',
    imports: [
        Calendar
    ],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css'
})
export class Welcome {}
