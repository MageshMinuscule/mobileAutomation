import { Component, Input, OnInit } from '@angular/core';
import { TemplateProvider } from 'src/providers/template/template';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-satisfactory',
  templateUrl: './satisfactory.page.html',
  styleUrls: ['./satisfactory.page.scss'],
})
export class SatisfactoryPage implements OnInit {

  @Input('incident') incident : any;
  @Input('name') string : any
  text: string;
  name: any;
  constructor(
    public templateProvider : TemplateProvider,
    private common : CommonProvider
    ) { 
    console.log('Hello SignSatisfactoryComponent Component');
    this.text = 'Hello World';
  }

  ngOnInit() {
    console.log(this.incident)
  }
event() {
  console.log("clicked")
}
selectEmoji(emoji, incident) {
  this.templateProvider.selectEmoji(emoji, incident)
  // incident.value = emoji;
}
}
