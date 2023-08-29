import { Component, Input, OnInit } from '@angular/core';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-text-area',
  templateUrl: './text-area.page.html',
  styleUrls: ['./text-area.page.scss'],
})
export class TextAreaPage implements OnInit {
  @Input('incident') incident : any = {};
  @Input('name') name : any;
  text: string;

  constructor(
    private common : CommonProvider
  ) {
    this.text = 'Hello World';
    console.log('text area page !!!!!!!!!!!!!!!!!!!!!')
    console.log(this.incident);
  }

  ngOnInit() {
    console.log(this.incident);
    this.incident.value = this.incident.type == "textArea" && (this.incident.default && this.incident.default != '') ? this.incident.default : this.incident.value;
  }
  Blur(ev) {
    this.incident.default = ev.target.value; 
  }

}
