import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-schedule-demo',
  templateUrl: './schedule-demo.page.html',
  styleUrls: ['./schedule-demo.page.scss'],
})
export class ScheduleDemoPage implements OnInit {
  email: ''
  forgot: any = { email: '',contact: '' };
  constructor(
    private common : CommonProvider,
    private reqService: ServiceProvider,
    public router : Router,
    private navCtrl : NavController,
  ) { }

  ngOnInit() {
  }
  forgotPwd() {
    this.common.stopLoading();
    this.forgot.email = this.forgot.email.trim();
    if (this.forgot.email.includes('@') && this.forgot.email.includes('.')) {
      this.reqService.ResetPassword(this.forgot.email)
      .subscribe(
        result => {
          if (result) {
            this.common.alertToast(this.reqService.translatedata('If you\'re registered customer, you will get a reset password details in your email.'));
            this.router.navigate(['/login'])
          } 
        },async (result)=> {
           if (result.status == 400 && result.error == "e-mail address not registered") {
            this.common.alertToast(this.reqService.translatedata('E-mail address not registered'));
          }else if(result.status == 200 && result.error.text == "e-mail was sent"){
            this.common.alertToast(this.reqService.translatedata('If you\'re registered customer, you will get a reset password details in your email.'));
            
          } else {
            this.common.alertToast(this.reqService.translatedata('internalServerError' + result.status));
          }
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
          
        }
      )
    } else if (!this.forgot.email) {
      this.common.alertToast(this.reqService.translatedata('Please enter email address'));
    } else {
      this.common.alertToast(this.reqService.translatedata('Invalid email address'));
    }
  }
  back() {
    if(this.navCtrl){
      this.navCtrl.pop();
    }
  }
}
