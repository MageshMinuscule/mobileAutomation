import { Component, Input, OnInit } from '@angular/core';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-audit-pf',
  templateUrl: './audit-pf.page.html',
  styleUrls: ['./audit-pf.page.scss'],
})
export class AuditPFPage implements OnInit {
  @Input('incident') incident : any;
  isPass: boolean = false;
  isFail: boolean = false;
  isNA: boolean = false;
  fillBtnPass: string = 'outline';
  fillBtnFail: string = 'outline';
  fillBtnNA: string = 'outline';
  shownTextArea: boolean = false;
  constructor(
    private common : CommonProvider
  ) { }

  ngOnInit() {
    if(this.incident && this.incident.value != '') {
      this.onClick(false, this.incident.value); 
    }
  }
  onClick(value, type) {
    if(type == 'Pass') {
      this.isPass = !value;
      this.fillBtnPass = this.isPass == true ? 'solid' : 'outline';
      this.incident.value = this.isPass == true ? type : '';
      if(this.fillBtnPass == 'solid') {
        this.isFail = this.isNA = false;
        this.fillBtnFail = this.fillBtnNA = 'outline';
      }
    }else if(type == 'Fail') {
      this.isFail = !value;
      this.fillBtnFail = this.isFail == true ? 'solid' : 'outline';
      this.incident.value = this.isFail == true ? type : '';
      if(this.fillBtnFail == 'solid') {
        this.isPass = this.isNA = false;
        this.fillBtnPass= this.fillBtnNA = 'outline';
      }
    } else {
      this.isNA = !value;
      this.fillBtnNA = this.isNA == true ? 'solid' : 'outline';
      this.incident.value = this.isNA == true ? type : '';
      if(this.fillBtnNA == 'solid') {
        this.isPass = this.isFail = false;
        this.fillBtnFail = this.fillBtnPass= 'outline';
      }
    }
  }
  shown() {
    this.shownTextArea = !this.shownTextArea;
    this.incident.reason = this.shownTextArea == false ? '' : this.incident.reason;
  }
}
