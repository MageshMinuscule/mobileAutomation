import { Component, Input, OnInit } from '@angular/core';
import { TemplateProvider } from 'src/providers/template/template';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-signature',
  templateUrl: './signature.page.html',
  styleUrls: ['./signature.page.scss'],
})
export class SignaturePage implements OnInit {
  @Input('incident') incident : any;
  @Input('name') string : any
  text: string;
  name: any;
  constructor(public templateProvider: TemplateProvider, 
    private common: CommonProvider) {
    this.text = 'Hello World';
  }

  ngOnInit() {
  }

}
