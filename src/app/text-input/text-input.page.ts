import { Component, Input, OnInit } from '@angular/core';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-text-input',
  templateUrl: './text-input.page.html',
  styleUrls: ['./text-input.page.scss'],
})
export class TextInputPage implements OnInit {
@Input('incident') incident : any
@Input('name') name : any
  constructor(
    public common : CommonProvider
  ) { }

  ngOnInit() {
    this.incident.value = this.incident.type == "textInput" && (this.incident.default && this.incident.default != '') ? this.incident.default : this.incident.value;
  }
  Blur(ev) {
    this.incident.default = ev.target.value; 
  }

}
