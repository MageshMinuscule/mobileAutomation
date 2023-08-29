import { Component, Input, OnInit } from '@angular/core';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-audit',
  templateUrl: './audit.page.html',
  styleUrls: ['./audit.page.scss'],
})
export class AuditPage implements OnInit {
  isYes: boolean = false;
  isNo: boolean = false;
  isNA: boolean = false;
  shownTextArea : boolean = false;
  @Input('incident') incident : any;
  fillBtnYes: string = 'outline';
  fillBtnNo: string = 'outline';
  fillBtnNA: string = 'outline';
  constructor(
    private common : CommonProvider
  ) { }

  ngOnInit() {
    if(this.incident && this.incident.value != '') {
      this.onClick(false, this.incident.value); 
    }
  }
  onClick(value, type) {
    if(type == 'Yes') {
      this.isYes = !value;
      this.fillBtnYes = this.isYes == true ? 'solid' : 'outline';
      this.incident.value = this.isYes == true ? type : '';
      if(this.fillBtnYes == 'solid') {
        this.isNo = this.isNA = false;
        this.fillBtnNo = this.fillBtnNA = 'outline';
      }
    }else if(type == 'No') {
      this.isNo = !value;
      this.fillBtnNo = this.isNo == true ? 'solid' : 'outline';
      this.incident.value = this.isNo == true ? type : '';
      if(this.fillBtnNo == 'solid') {
        this.isYes = this.isNA = false;
        this.fillBtnYes= this.fillBtnNA = 'outline';
      }
    } else if((type == 'N/A' || type == true)){
      this.isNA = !value;
      type = type == true ? 'N/A' : type == 'N/A' ? 'N/A' : '';
      this.fillBtnNA = this.isNA == true ? 'solid' : 'outline';
      this.incident.value = this.isNA == true ? type : '';
      if(this.fillBtnNA == 'solid') {
        this.isYes = this.isNo = false;
        this.fillBtnNo = this.fillBtnYes= 'outline';
      }
    }
  }
  shown() {
    this.shownTextArea = !this.shownTextArea;
    this.incident.reason = this.shownTextArea == false ? '' : this.incident.reason;
  }
}
