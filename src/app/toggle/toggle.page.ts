import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.page.html',
  styleUrls: ['./toggle.page.scss'],
})
export class TogglePage implements OnInit {

  @Input('incident') incident : any
  @Input('name') name : any
  text: string;

  constructor() {
    this.text = 'Hello World';
  }

  ngOnInit() {
    console.log(this.incident)
  }

}
