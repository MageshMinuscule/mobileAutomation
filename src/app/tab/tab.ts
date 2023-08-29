import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { ModalController } from '@ionic/angular';
import { config } from 'process';
import { Events } from 'src/providers/events/events';
import { ServiceProvider } from 'src/providers/service/service';
import { AssetListPage } from '../asset-list/asset-list.page';
import { CommonProvider } from '../common/common';
import { Config } from '../config';
import { HomePage } from '../home/home.page';
import { SettingsPage } from '../settings/settings.page';
import { WorkRequestListPage } from '../work-request-list/work-request-list.page';
@Component({
  templateUrl:'tab.html'
})
export class TabPage implements OnInit{
  homePage: any = HomePage;
  settingPage: any = SettingsPage;
  assetListPage: any = AssetListPage;
  // manualPage: any = FaqPage;
  WorkRequestListPage:any =  WorkRequestListPage;
  msgCount: number = 0;
  selectedIndex: number = 0;
  viewType: any;
  workflow: any;
  respJson: any;
  constructor(
    private common : CommonProvider,
    private reqService : ServiceProvider,
    private events :Events,
    public storage : NativeStorage,
    private location :Location,
    public router : Router,
    public modalCtrl : ModalController
  ){

    this.workflow = this.common.getWorkFlowType();
    this.viewType = this.common.getViewType();
    //If user clear notification
    this.events.subscribe('notification:clear', (data:any) => {
      if (data.status == 'all') {

        this.storage.setItem(Config.constants.msgNotificationJson, []);
        this.msgCount = 0;
      } else if (data.status > 0) {
        this.msgCount = data.status;
      } else {
        this.msgCount = 0;
      }
    });
      let profile = JSON.parse(window.localStorage.getItem('Profile'));
      if (profile && profile.tenantId) {
        this.common.viewType = profile.uicustomized ? 'location' : 'user';
        this.viewType = this.common.viewType;
        this.workflow = profile.workflow == 'asset' ? 'asset' : 'facility';
      }
    
    // this.homepage();

  }
  ngOnInit() {
    console.log("ngonit calling from tab");
  }
  ionViewWillEnter() {
    this.router.navigate(['home']);
    console.log('will enter');
  }
  ionViewDidEnter() {
    console.log('did enter');
  }

  workrequest() {
    this.router.navigate(['/work-request-list']);
  }
  dismiss() {
    this.location.back();
  }
  getNotification() {
    let storageParam = Config.constants.msgNotificationJson;
    this.reqService.getMsgNotification().subscribe(response => {
      if (null != response && response.length > 0) {
        this.respJson = response;
        window.localStorage.setItem("storageParam", JSON.stringify(response));
      }
      if (this.respJson) {
        this.msgCount = response.length;
      }
    }, error => {
      this.msgCount = 0;
      if (error.status == 401) {
        this.events.publish("user:inactive", error.status);
      }
      this.respJson = JSON.parse(window.localStorage.getItem("storageParam"))
    });
  }
  // homepage() {
  //   this.router.navigate(['tab']);
  // }
}
