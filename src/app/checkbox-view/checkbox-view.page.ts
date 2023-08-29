import { Component, Input, OnInit } from '@angular/core';
import { TemplateProvider } from 'src/providers/template/template';

@Component({
  selector: 'app-checkbox-view',
  templateUrl: './checkbox-view.page.html',
  styleUrls: ['./checkbox-view.page.scss'],
})
export class CheckboxViewPage implements OnInit {

  @Input('incident') incident : any;
  @Input('name') string : any
  selectedCheckList: any = [];
  
  constructor(public templateProvider: TemplateProvider) { }

  ngOnInit() {
    console.log(this.incident);
  }
  addOption(event, option, incident) {
    if (event.detail.checked) {
      incident.options[option] = true;
      if (incident.value.length > 0) {
        incident.value = incident.value.replace(/^,|,$/g, '');
        incident.value += ',';
      }
      incident.value += option;
    } else {
      incident.options[option] = false;
      incident.value = incident.value.replace(option, '');
      incident.value = incident.value.replace(/^,|,$/g, '');
    }
  }

}
