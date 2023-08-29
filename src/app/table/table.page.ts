import { Component, Input, OnInit } from '@angular/core';
import { TemplateProvider } from 'src/providers/template/template';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-table',
  templateUrl: './table.page.html',
  styleUrls: ['./table.page.scss'],
})
export class TablePage implements OnInit {

  @Input('incident') incident : any;
  @Input('name') string : any
  text: string;

  constructor(public templateProvider: TemplateProvider, public common: CommonProvider) { this.text = 'Hello World';}

  ngOnInit() {
    console.log('incident' + this.incident)
  }
  createNewRow(incident) {
    incident.options = incident.options ? incident.options : [];
    let field = {};
    if (incident.options && incident.options.length) {
      for (let key of this.templateProvider.keys(incident.options[0])) {
        field[key] = "";
      }
      incident.options.push(field);
    }
  }

  deleteRow(incident, index) {
    if (incident.options && incident.options.length > 1) {
      incident.options.splice(index, 1);
    } else {
      this.common.alertToast(incident.label + " can't be empty");
    }
  }
}
