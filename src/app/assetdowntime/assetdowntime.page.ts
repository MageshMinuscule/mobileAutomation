import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ModalController, NavParams } from '@ionic/angular';
import { ServiceProvider } from 'src/providers/service/service';
import { AssetDownTimeTracking } from '../data.model';

@Component({
  selector: 'app-assetdowntime',
  templateUrl: './assetdowntime.page.html',
  styleUrls: ['./assetdowntime.page.scss'],
})
export class AssetdowntimePage implements OnInit {
  required = true;
  assetDownTimeShown: boolean;
  selectedRequest: any;
  assetDowntime: any = {};
  isToggle: boolean;
  mindate: any;
  maxdate: any;
  requestId: any;
  toggleShown: boolean;
  isMinutes: any;
  constructor(
    public modalCtrl: ModalController,
    public reqService: ServiceProvider,
    public navparms: NavParams,
    public router: Router
  ) {
    if (this.navparms.data.assetDownTimeShowns && this.navparms.data.template) {
      this.selectedRequest = this.navparms.data.template;
      this.assetDownTimeShown = this.navparms.data.assetDownTimeShowns;
      // this.isToggle = this.assetDownTimeShown ? true : false;
      this.requestId = this.navparms.data.requestIds;
      this.assetDowntime.requestId = this.requestId;
      this.findAssetDownTimeByRequestId();
    } else {
      this.selectedRequest = navparms.data.requestData
        ? navparms.data.requestData
        : null;
      this.assetDownTimeShown = navparms.data.assetDownTimeShown;
      this.requestId = navparms.data.requestId;
      this.assetDowntime.requestId = this.requestId;
      this.findAssetDownTimeByRequestId();
    }
  }
  ngOnInit() { }
  submit() {
    this.assetDowntime.assetId = this.selectedRequest.assetId;
    this.assetDowntime.overrideTimeTaken = this.assetDowntime && this.assetDowntime.overrideTimeTaken ? this.assetDowntime.overrideTimeTaken : false;
    this.assetDowntime.requestId = this.requestId;
    if (this.requestId && !this.assetDowntime.id) {
      this.reqService.assetDownTime(this.assetDowntime).subscribe(
        (res) => {
          console.log(res);
          this.modalCtrl.dismiss(this.assetDowntime).catch(() => { });
        },
        async (error) => {
          this.modalCtrl.dismiss().catch(() => { });
          console.error(error);
        }
      );
    } else if (this.requestId && this.assetDowntime && this.assetDowntime.id) {
      this.reqService.updateAssetDownTimeTracking(this.assetDowntime).subscribe( (res) => {
        console.log(res);
        this.modalCtrl.dismiss(this.assetDowntime).catch(() => { });
      }, err => {
        console.log(err);
        this.modalCtrl.dismiss().catch(() => { });
      });
    } else {
      this.modalCtrl.dismiss(this.assetDowntime).catch(() => { });
    }

  }
  cancel() {
    this.modalCtrl.dismiss().catch(() => { });
  }
  toggle() {
    this.isToggle = !this.isToggle
  }
  setDate(){
    this.mindate = this.assetDowntime.issueStartTime;
    if(this.assetDowntime && this.assetDowntime.issueEndTime) {
      this.calculateDownTime();
    }
  }
  maxDate() {
    this.maxdate = this.assetDowntime.issueEndTime;
    this.calculateDownTime();

  }
  calculateDownTime() {
    let min = this.diffHours(this.assetDowntime.issueEndTime,this.assetDowntime.issueStartTime);
    this.assetDowntime.totalMins = this.assetDowntime?.overrideTimeTaken? this.isMinutes ? this.isMinutes : min : min;
    const hours = Math.floor(this.assetDowntime.totalMins / 60);
    const minutes = this.assetDowntime.totalMins % 60;
    this.assetDowntime.downTimeDurationInHours = Number(hours);
    this.assetDowntime.downTimeDurationMinutes = Number(minutes);
  }
  diffHours(dt2, dt1) {
    var date1 = new Date(dt1);
    var date2 = new Date(dt2)
    var diff =(date2.getTime() - date1.getTime()) / 1000;
    // diff /= (60 * 60); //hours
    diff /= 60; //minutes
    return Math.abs(Math.round(diff));
  }
  timeTaken(ev) {
    let min = ev.target.value;
    // this.assetDowntime.totalMins = this.isMinutes ? this.isMinutes : min;
    if(this.assetDowntime.overrideTimeTaken) {
    this.assetDowntime.totalMins = min;
    }
    // else {
    //   this.assetDowntime.totalMins = this.isMinutes ? this.isMinutes : min;
    // }
    const hours = Math.floor(this.assetDowntime.totalMins / 60);
    const minutes = this.assetDowntime.totalMins % 60;
    this.assetDowntime.downTimeDurationInHours = Number(hours);
    this.assetDowntime.downTimeDurationMinutes = Number(minutes);
  }

  findAssetDownTimeByRequestId() {
    this.reqService.getAsserDownTimeTrackingById(this.requestId).subscribe(res => {
      console.log(res);
      if (res && res.body) {
        let downTimeValue = res.body;
        this.assetDowntime = downTimeValue;
        if (this.assetDowntime && this.assetDowntime.id) {
          this.isToggle = true;
          this.toggleShown = true;
        }
        this.assetDowntime.issueStartTime = downTimeValue.issueStartTime;
        this.assetDowntime.issueEndTime = downTimeValue.issueEndTime;
        this.assetDowntime.totalMins = downTimeValue.totalMins;
        this.assetDowntime.downTimeDurationInHours = downTimeValue.downTimeDurationInHours;
        this.assetDowntime.downTimeDurationMinutes = downTimeValue.downTimeDurationMinutes;
        this.assetDowntime.overrideTimeTaken = downTimeValue.overrideTimeTaken;
        this.assetDowntime.rootCause = downTimeValue.rootCause;
        this.assetDowntime.correctiveAction = downTimeValue.correctiveAction;
        this.assetDowntime.totalMins = this.isMinutes = this.timeTakenInMinutes();
        console.log('Total Mins : ', this.isMinutes);
      } else {
        console.log('No data found');
      }
    }, err => {
      console.log(err);
    });
  }

  timeTakenInMinutes() {
    if(this.assetDowntime && (this.assetDowntime.downTimeDurationInHours || this.assetDowntime.downTimeDurationMinutes)) {
      return (this.assetDowntime.downTimeDurationInHours * 60) + this.assetDowntime.downTimeDurationMinutes;
    }
  }
  changeTime(val) {
    if(!this.assetDowntime.overrideTimeTaken) {
      this.calculateDownTime();
    } 
  }

}
