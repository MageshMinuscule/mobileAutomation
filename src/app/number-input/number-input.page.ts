import { Component, Input, OnInit } from '@angular/core';
import { TemplateProvider } from 'src/providers/template/template';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-number-input',
  templateUrl: './number-input.page.html',
  styleUrls: ['./number-input.page.scss'],
})
export class NumberInputPage implements OnInit {

  @Input('incident') incident : any;
  @Input('name') string : any
  text: string;
  name: any;
  constructor(
    public templateProvider: TemplateProvider,
    public common : CommonProvider
    ) { this.text = 'Hello World'; }

  ngOnInit() {
  }

}
