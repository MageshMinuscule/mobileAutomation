import { Component, Input, OnInit } from '@angular/core';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-toggle-reason',
  templateUrl: './toggle-reason.page.html',
  styleUrls: ['./toggle-reason.page.scss'],
})
export class ToggleReasonPage implements OnInit {

  @Input('incident') incident : any
  @Input('name') name : any
  text: string;

  constructor(
    public common: CommonProvider,
  ) {
    this.text = 'Hello World';
  }

  ngOnInit() {
    console.log(this.incident)
  }
  removeSpecialCharacter(ev) {
    ev.target.value = this.common.removeSpecialChar(ev);
  }

}
