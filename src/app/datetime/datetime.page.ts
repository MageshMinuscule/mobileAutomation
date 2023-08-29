import { Component, Input, OnInit, ViewChildren } from '@angular/core';
import { TemplateProvider } from 'src/providers/template/template';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-datetime',
  templateUrl: './datetime.page.html',
  styleUrls: ['./datetime.page.scss'],
})
export class DatetimePage implements OnInit {
  @ViewChildren('datePicker') datePicker: any;
  @Input('incident') incident: any
  @Input('name') name: any
  @Input('templatedata') templatedata: any

  text: string;
  constructor(public templateProvider: TemplateProvider, public common: CommonProvider) {
    this.text = 'Hello World';
    setTimeout(() => {
      this.templateProvider.datePicker = this.datePicker;
    }, 100);
  }

  ngOnInit() {
    console.log(this.incident)
    console.log(this.datePicker)
  }

  onChange(event) {
  console.log('Selected date:', event.detail.value);
  let date = event.detail.value.split('T')[0];
  console.log(date);
  this.incident.value = date;
}       
  // dateTime() {
  //   this.incident.value =  this.common.getUTCTimeString();
  // }
  openDatepicker(picker, form) {
    picker.value = this.common.getUTCTimeString();
    // picker.value = this.common.getCurrentDate();
    // let count = 0;
    // for (let incident of this.templateProvider.keys(form)) {
    //   for (let key of this.templateProvider.keys(form[incident])) {
    //     if (form[incident][key].type == 'dateTime') {
    //       if (form[incident][key].label == picker.label) {
    //         if (!picker.value)
    //           picker.value = this.common.getUTCTimeString();
    //         setTimeout(() => {
    //           if (this.datePicker)
    //             this.datePicker._results[count].open();
    //         }, 100);
    //         break;
    //       }
    //       count++;
    //     }
    //   }
    // }
  }
}
