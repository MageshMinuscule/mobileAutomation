import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Events } from 'src/providers/events/events';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';
import { Config } from '../config';

@Component({
  selector: 'app-domain',
  templateUrl: './domain.page.html',
  styleUrls: ['./domain.page.scss'],
  providers: [
    ServiceProvider
  ]
})
export class DomainPage implements OnInit {
  loader: any;
  registerCredentials: any = { email: '', password: '' };
  domainCredentials: any;
  constructor(
    private common: CommonProvider, 
    public reqService: ServiceProvider,
    public events: Events,
    private navCtrl: NavController
  ) {
    let domain = window.localStorage.getItem('domain-url') && window.localStorage.getItem('domain-changed') ? window.localStorage.getItem('domain-url') : Config.backend.host;
    if (domain)
      this.domainCredentials = domain.replace('/api/', "");
    else
      this.domainCredentials = Config.backend.host.replace('/api/', "");
   }

  ngOnInit() {
  }
  saveDomainUrl() {
    this.common.displayLoading();
    if (this.domainCredentials && navigator.onLine) {
      this.domainCredentials = this.domainCredentials.replace(/([^:]\/)\/+/g, "$1");
      let url = this.domainCredentials + '/api/';
      let actualUrl = Config.backend.host;
      if (this.validateUrl(url)) {
        Config.backend.host = url;
        this.reqService.userLogin(this.registerCredentials).subscribe(res=>{
          console.log(res)
        }, async (err) =>{
          if (err) {
            this.common.stopLoading();
            if(err.status === 400) {
              window.localStorage.setItem('domain-url', this.domainCredentials);
              window.localStorage.setItem('domain-changed', this.domainCredentials);
              Config.backend.host = url;
              this.navCtrl.navigateRoot('/login');
            }
            else if (url != actualUrl)
              {this.events.publish('domain:changed',{ url: url, time : Date.now()});}
          } else {
            Config.backend.host = actualUrl;
            this.common.alertToast(this.reqService.translatedata('Url Cannot be Reached'));
          }
        })
      } else {
        this.common.stopLoading();
        this.common.alertToast(this.reqService.translatedata('InvalidURL'));
      }
    } else {
      this.common.stopLoading();
      this.common.alertToast(this.reqService.translatedata('networkConnectivityError'));
    }
  }
  validateUrl(url) {
    let ipPattern = /(https?:\/\/\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}(:\d{1,})?)/;
    if (url.match(ipPattern)) {
      return true;
    } else if (url.match(/(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/)) {
      return true;
    }
    return false;
  }
  back() {
    if(this.navCtrl){
      this.navCtrl.pop();
    }
  }
}
