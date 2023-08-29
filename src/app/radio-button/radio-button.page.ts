import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-radio-button',
  templateUrl: './radio-button.page.html',
  styleUrls: ['./radio-button.page.scss'],
})
export class RadioButtonPage implements OnInit {
  @Input('incident') incident : any;
  @Input('name') string : any
  text: string;

  constructor() { 
    console.log('Hello RadioButtonComponent Component');
    this.text = 'Hello World';
  }

  ngOnInit() {
  }

}
