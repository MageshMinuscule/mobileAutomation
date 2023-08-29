import { Component, Input, OnInit } from '@angular/core';
import { TemplateProvider } from 'src/providers/template/template';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-sign-satisfactory',
  templateUrl: './sign-satisfactory.page.html',
  styleUrls: ['./sign-satisfactory.page.scss'],
})
export class SignSatisfactoryPage implements OnInit {

  @Input('incident') incident : any;
  @Input('name') string : any
  text: string;
  name: any;

  constructor(
    public templateProvider: TemplateProvider,
    private common : CommonProvider
    ) { console.log('Hello SignSatisfactoryComponent Component');
  this.text = 'Hello World';}

  ngOnInit() {
  }

}
