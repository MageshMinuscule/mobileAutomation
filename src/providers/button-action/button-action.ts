import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Acknowledge, CheckIn, StartWork } from '../../app/data.model';
import { ServiceProvider } from '../service/service';
import { Config } from '../../app/config';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { CommonProvider } from 'src/app/common/common';
import { Events } from '../events/events';

@Injectable()
export class ButtonActionProvider {
  retry: boolean;
  constructor(
    public reqService: ServiceProvider,
    public http: HttpClient,
    public diagnostic: Diagnostic,
    public geolocation: Geolocation,
    public common: CommonProvider,
    public events: Events
  ) {}
  // ACKNOWLEDGE DONE HERE
  acknowledge(incident, isFrom) {
    this.common.displayLoading();
    let ackList = [];
    if (navigator.onLine) {
      if (null != incident.requestHistoryId) {
        this.common.logClickEvent('acknowledge_btn_click', 'Pending Page');
        incident.ackReq = false;
        let acknowledge = new Acknowledge();
        acknowledge.acknowledge = true;
        acknowledge.requestHistoryId = incident.requestHistoryId;
        acknowledge.requestType = incident.requestType;
        this.reqService
          .genericPost('mobileservice/acknowledge', acknowledge)
          .subscribe(
            (response) => {
              this.common.stopLoading();
              if (null != response) {
                if (isFrom == 'list') {
                  if (!incident.checkinRequired) {
                    this.events.publish('list-acknowledge:success', {user:incident});
                  }
                } else {
                  this.events.publish('view-acknowledge:success', {user:incident});
                }
              }
            },async (err) => {
              this.common.stopLoading();
              if (err.status == 409) {
                this.common.alertToast('Already acknowledged by another user.');
              } else if (err.error && err.error.length > 0) {
                let errResp = (err.error);
                this.common.alertToast(errResp.detail);
              } else {
                this.common.alertToast(
                  this.reqService.translatedata('serverError')
                );
              }
              incident.ackReq = true;
            }
          )

      }
    } else {
      this.common.stopLoading();
      if (null != incident.requestHistoryId) {
        this.common.logClickEvent('acknowledge_btn_click', 'Pending Page');
        // this.common.displayLoading();
        incident.ackReq = false;
        let acknowledge = new Acknowledge();
        acknowledge.acknowledge = true;
        acknowledge.requestHistoryId = incident.requestHistoryId;
        acknowledge.requestType = incident.requestType;
        incident.version += 1;
        ackList.push(acknowledge);
        incident.requestStatus = 'Acknowledge / (offline)';
        let ackData = JSON.parse(localStorage.getItem(Config.constants.ackDraft));
          if (null != ackData) {
            for (let ack of ackData) {
              if (incident.requestHistoryId != ack.requestHistoryId) {
                ackList.push(ack);
              }
            }
          }
          localStorage.setItem(Config.constants.ackDraft, JSON.stringify(ackList));

        // this.common.stopLoading();
        if (isFrom == 'list') {
          this.events.publish('list-acknowledge:success', {user:incident});
        } else {
          this.events.publish('view-acknowledge:success', {user:incident});
        }
      }
    }
  }

  updateUserCheckin(incident, isFrom?, data?, navOption?, location?) {
    let checkInList = [];
    let checkin = new CheckIn();
    checkin.checkInDetail = data ? JSON.stringify({ value: data }) : null;
    checkin.longitude = location ? location.lng : '0.0000';
    checkin.latitude = location ? location.lat : '0.0000';
    checkin.checkOutDetail = null;
    checkin.checkInType =
      incident.checkInType == 'imageupload'
        ? 'Image Upload'
        : incident.checkInType;
    checkin.requestHistoryId = incident.requestHistoryId;
    if (navigator.onLine) {
      if (incident.checkinRequired) {
        this.common.displayLoading();
        this.reqService
          .genericPost('mobileservice/checkin', checkin)
          .subscribe(
            (resp) => {
              this.common.stopLoading();
              if (resp) {
                this.common.alertToast(
                  this.reqService.translatedata('checkedSuccess')
                );
                incident.ackReq = false;
                incident.checkinRequired = false;
                incident.trackingRequired = false;
                if (isFrom == 'list') {
                  this.events.publish('list-checkin:success', {user:incident});
                } else {
                  this.events.publish(
                    'view-checkin:success',{  user:incident,
                      nav:navOption}
                  );
                }
              }
            },async (err)=>{
              this.common.stopLoading();
              if (err.error && err.error.length > 0) {
                let errResp = JSON.parse(err.error);
                this.common.alertToast(errResp.detail);
              } else {
                this.common.alertToast(
                  this.reqService.translatedata('serverError')
                );
              }
            }
          )

      }
    } else if (!navigator.onLine) {
      checkInList.push(checkin);
      let checkInData = JSON.parse(localStorage.getItem(Config.constants.checkIn));
        if (null != checkInData) {
          for (let check_In of checkInData) {
            if (incident.requestHistoryId != check_In.requestHistoryId) {
              checkInList.push(check_In);
            }
          }
        }
        incident.trackingRequired = false;
        incident.checkinRequired = false;
        incident.requestStatus = 'Checkin / (offline)';
        localStorage.setItem(Config.constants.checkIn, JSON.stringify(checkInList));
        if (isFrom == 'list') {
          if (!incident.checkinRequired) {
            this.events.publish('list-checkin:success', incident);
          }
        } else {
          this.events.publish('view-checkin:success', {user: incident});
        }

    }
  }

  startWork(incident, isFrom) {
    let me = this;
    console.log('startWork');
    let successCallback = (state) => {
      if (state) {
        // me.getUserLocation(incident, isFrom);
        me.common.alertToast('Location Enabled');
      }
    };
    this.diagnostic.registerLocationStateChangeHandler(successCallback);
    this.diagnostic.isLocationEnabled().then((state) => {
      if (state) {
        me.getUserLocation(incident, isFrom);
      } else {
        me.common.alertToast(
          this.reqService.translatedata('locationDetectError')
        );
        me.diagnostic.switchToLocationSettings();
      }
    });
  }

  checkIn(incident, isFrom?, data?, navOption?) {
    if (incident.startedBy) {
      this.getUserLocation(incident, isFrom, data, navOption, 'Checkin');
    } else {
      this.updateUserCheckin(incident, isFrom, data, navOption);
    }
  }

  updateUserLocation(incident, isFrom, location?) {
    if (navigator.onLine) {
      if (null != incident.requestHistoryId) {
        this.common.logClickEvent('start_work_btn_click', 'Pending Page');
        this.common.displayLoading();
        incident.ackReq = false;
        let startWork = new StartWork();
        startWork.latitude = location.lat;
        startWork.longitude = location.lng;
        startWork.started = true;
        startWork.requestHistoryId = incident.requestHistoryId;
        this.reqService
          .genericPost('mobileservice/started', startWork)
          .subscribe(
            (response) => {
              this.common.stopLoading();
              console.log('Start Work Response ===> ' + JSON.stringify(response));
              if (null != response) {
                this.events.publish('user:started', Date.now());
                this.common.alertToast('Work Started Successfully');
                incident.trackingRequired = false;
                if (isFrom == 'list') {
                  this.events.publish('list-startwork:success', {user:incident});
                } else {
                  this.events.publish('view-startwork:success', {user:incident});
                }
              } else {

              }
            },async (err)=>{
              this.common.stopLoading();
              this.events.publish('startWork:error', true);
              if (err.error && err.error.length > 0) {
                let errResp = (err.error);
                this.common.alertToast(errResp?.detail? errResp?.detail: 'Error Occured');
              } else {
                this.common.alertToast(err.statusText);
              }
              incident.trackingRequired = true;
            }
          )
      }
    } else {
      this.common.alertToast(
        this.reqService.translatedata('networkConnectivityError')
      );
    }
  }

  getUserLocation(incident, isFrom?, data?, navOption?, type?) {
    let me = this;
    console.log('getUserLocation');
    this.geolocation
      .getCurrentPosition({
        timeout: 20000,
        enableHighAccuracy: true,
        maximumAge: 36000,
      })
      .then((resp) => {
        let currentlocation = {
          lat: resp.coords.latitude,
          lng: resp.coords.longitude,
        };
        if (type) {
          this.updateUserCheckin(
            incident,
            isFrom,
            data,
            navOption,
            currentlocation
          );
        } else {
          this.updateUserLocation(incident, isFrom, currentlocation);
        }
      })
      .catch((error) => {
        if (me.retry) {
          me.getUserLocation(incident, isFrom);
          me.retry = false;
        } else {
          this.common.alertToast(
            this.reqService.translatedata('locationDetectError')
          );
        }
      });
  }
}
