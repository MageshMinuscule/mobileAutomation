import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.page.html',
  styleUrls: ['./dropdown.page.scss'],
})
export class DropdownPage implements OnInit {
  @Input('incident') incident : any;
  @Input('name') string : any
  text: string;
  name: any;
  constructor() { this.text = 'Hello World'; }

  ngOnInit() {
  }
 
}
