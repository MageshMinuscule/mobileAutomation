import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-report-email',
  templateUrl: './report-email.page.html',
  styleUrls: ['./report-email.page.scss'],
})
export class ReportEmailPage implements OnInit {
  public emailList: any = [];
  private emailCount: number = 1;
  reportEmail: any;
  primaryEmail: any;
  constructor(
    public route:ActivatedRoute,
    private common: CommonProvider,
    private reqService: ServiceProvider,
    private modalCtrl: ModalController
  ) {
    this.route.queryParams.subscribe((params) => {
      this.primaryEmail = params
        ? params.primaryEmail
          ? params.primaryEmail
          : null
        : null;
    });
    this.emailList = [
      {
        name: 'email' + this.emailCount,
        field: 'Email ' + this.emailCount,
        email: '',
      },
    ];
  }

  ngOnInit() {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReportEmailPage');
  }
  addControl() {
    this.emailCount++;
    this.emailList = [
      ...this.emailList,
      {
        name: 'email' + this.emailCount,
        field: 'Email ' + this.emailCount,
        email: '',
      },
    ];
  }
  removeControl(index) {
    this.emailList.splice(index, 1);
  }

  async dismiss() {
    await this.modalCtrl.dismiss();
  }

  async submitRequest() {
    if (this.validateEmails()) {
      let data = {
        emailList: this.primaryEmail ?  this.primaryEmail + ';' + this.reportEmail : this.reportEmail
      };
      await this.modalCtrl.dismiss(data);
    }
  }

  async skip() {
    let data = {
      emailList: this.primaryEmail,
    };
    await this.modalCtrl.dismiss(data);
  }
  validateEmails() {
    let isValid = true;
    this.emailList.forEach((data) => {
      if (
        data.email &&
        data.email.trim() &&
        data.email.includes('@') &&
        data.email.includes('.')
      ) {
        this.reportEmail = this.reportEmail
          ? this.reportEmail + ';' + data.email
          : data.email;
      } else {
        this.common.alertToast(
          this.reqService.translatedata(
            'Please enter a valid email for ' + data.field + ' to continue.'
          )
        );
        isValid = false;
      }
    });
    return isValid;
  }
}
