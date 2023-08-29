import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { Events } from 'src/providers/events/events';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';
import { Config } from '../config';
import { CheckIn } from '../data.model';
import { GeoCoord, HaversineService } from 'ng2-haversine';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { ModalController, NavController, } from '@ionic/angular';
import { AnnotatePage } from '../annotate/annotate.page';

@Component({
  selector: 'app-checkin',
  templateUrl: './checkin.page.html',
  styleUrls: ['./checkin.page.scss'],
  providers: [ServiceProvider]
})
export class CheckinPage implements OnInit {
  checkinType: any;
  buttonList: any = [];
  locationRange: number = 100;
  retryCount: number = 0;
  stage: number = 2;
  isTracked: boolean = false;
  defaultBtn: any = [{
    name: this.reqService.translatedata('byphoto'),
    value: "imageupload",
    icon: "camera",
    isDisabled: false
  }, {
    name: this.reqService.translatedata('scan'),
    value: "qrcode",
    icon: "scan-outline",
    isDisabled: true
  }, {
    name: this.reqService.translatedata('gps'),
    value: "gps",
    icon: "locate",
    isDisabled: true
  }, {
    name: this.reqService.translatedata('others'),
    value: "more",
    icon: "wifi",
    isDisabled: true
  }];
  selectedRequest: any;
  latitude: any;
  longitude: any;
  modelData: any;
  constructor(
    public reqService : ServiceProvider,
    public common : CommonProvider,
    public events : Events,
    public router : Router,
    public geolocation : Geolocation,
    private barcodeScanner: BarcodeScanner,
    private _haversineService: HaversineService,
    private diagnostic: Diagnostic,
    private route  : ActivatedRoute,
    private modalCtrl : ModalController,
  ) {
    this.route.queryParams.subscribe(params => {
      if(params && params.checkinType){
        this.checkinType = params.checkinType ? params.checkinType : null;
        this.checkinType = this.checkinType == 'bypass' ? 'imageupload' : (this.checkinType ? this.checkinType : 'imageupload');
        this.selectedRequest = params.selectedRequest ? JSON.parse(params.selectedRequest) : null;
        console.log(this.selectedRequest);
        this.stage = params.stage ? params.stage == "Three" ? 3 : params.stage == "four" ? 4 : 2 : null;
      }
      // else {
      // this.checkinType = this.navParams.data.checkinType ? navParams.data.checkinType : null;
      // this.checkinType = this.checkinType == 'bypass' ? 'imageupload' : (this.checkinType ? this.checkinType : 'imageupload');
      // this.selectedRequest = this.navParams.data.selectedRequest ? this.navParams.data.selectedRequest : null;
      // }
      for (let btn of this.defaultBtn) {
        if (btn.value == this.checkinType) {
          btn.isDisabled = false;
          this.buttonList.push(btn);
        }
      }
      for (let btn of this.defaultBtn) {
        if (btn.value != this.checkinType) {
          this.buttonList.push(btn);
        }
      }
    })
    let radius = JSON.parse(localStorage.getItem(Config.constants.locationRadius));
    if(radius && radius != null) {
      this.locationRange = radius;
    }
    this.route.queryParams.subscribe(params =>{
      if(params && params.upload){
        let param =  params.upload;
        let id = params.uploadId;
        this.processUpload(param, id);
      }
    })
  }

  ngOnInit() {
  }
  selectGPS(actionSheetTitle) {
    let me = this;
    let successCallback = (state) => {
      if (state) {
        me.common.alertToast("Location Enabled");
      }
    };
    this.diagnostic.registerLocationStateChangeHandler(successCallback);
    this.diagnostic.isLocationEnabled().then((state) => {
      if (state) {
        me.getUserLocation(actionSheetTitle);
      } else {
        me.common.alertToast(this.reqService.translatedata('locationDetectError'));
        me.diagnostic.switchToLocationSettings();
      }
    });
  }

  getUserLocation(actionSheetTitle) {
    this.common.displayLoading();
    this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 }).then((pos : Geoposition) => {
      this.common.stopLoading();
      var locationStr = { "lat": pos.coords.latitude, "lon": pos.coords.longitude };
      this.validateCheckIn('GPS', JSON.stringify(locationStr), actionSheetTitle);
    }).catch((err) => {
      this.common.stopLoading();
      this.common.alertToast(this.reqService.translatedata('locationDetectError'));
      
    });
  }
  async imgUpload() {
    const image = await this.modalCtrl.create({
      component: AnnotatePage,
      componentProps: {
        selectedRequest: this.selectedRequest,
        type: 'myRequest',
        mode: 'Checkin',
        stage: this.stage
      }
    });
    image.onDidDismiss().then((modelData) => {
      if (modelData !== null) {
        this.modelData = modelData.data;
        console.log('Modal Data : ' + modelData.data);
      }
    });
    return await image.present();
  }

  validateCheckIn(type, checkInData, actionSheetTitle) {
    let parsedData = type == 'GPS' ? JSON.parse(checkInData) : JSON.parse(checkInData || "{}");
    let qrCodeData = JSON.parse(checkInData);
    let isMatched = false;
    if (type == 'GPS') {
      let currentLocation: GeoCoord = {
        latitude: parsedData.lat,
        longitude: parsedData.lon
      };
      let designationLocation: GeoCoord = {
        latitude: actionSheetTitle == 'Checkout' ? +this.selectedRequest.endLocationLatitude : +this.selectedRequest.latitude,
        longitude: actionSheetTitle == 'Checkout' ? +this.selectedRequest.endLocationLongitude : +this.selectedRequest.longitude
      };
      let meters = this._haversineService.getDistanceInMeters(currentLocation, designationLocation)
      if (meters <= Number(this.locationRange)) {
        isMatched = true;
      }
    } else if (type == "QRCode") {
      let locationQRCode;
      if(this.selectedRequest.requestType == "SCHEDULE_REQUEST") {
        locationQRCode = this.selectedRequest?.assetQRCode != null ? this.selectedRequest.assetQRCode : this.selectedRequest.locationQRCode;
      }else {
        locationQRCode = this.common.getWorkFlowType() == 'asset' ? this.selectedRequest.assetQRCode : this.selectedRequest.locationQRCode;
      }
      
      if (locationQRCode == qrCodeData.qrcode) {
        isMatched = true;
      }
    } else if (type == "Image Upload") {
      isMatched = true;
    }
    if (isMatched) {
      if (!navigator.onLine) {
        this.selectedRequest.ackReq = false;
      }
      this.checkIn(type, parsedData);
    } else {
      this.retryCount++;
      let errorMsg = this.common.getWorkFlowType() == 'asset' ? this.reqService.translatedata('assetNotMatchError') : this.reqService.translatedata('locatioNotMatchError');
      this.common.alertToast(errorMsg);
      if (this.retryCount > 2) {
        this.checkinType = "imageupload";
        this.retryCount = 0;
        this.common.alertToast(this.reqService.translatedata('tryDefaultMethod'));
      }
    }
  }

  processUpload(message, uploadId) {
    if (message == "success") {
      this.common.alertToast(this.reqService.translatedata('imageSuccessfully'));
      this.checkIn("Image Upload", uploadId);
    } else if (message == "offline") {
      this.common.alertToast(this.reqService.translatedata('imageOfflineSuccess'));
      this.validateCheckIn("Image Upload", this.selectedRequest.requestHistoryId, '');
    } else {
      this.common.alertToast(this.reqService.translatedata('imageError'));
    }
  }

  selectQR(actionSheetTitle) {
    // this.common.displayLoading();
    let options: BarcodeScannerOptions = {
      showTorchButton: true
    }
    this.barcodeScanner.scan(options).then((barcodeData) => {
      // this.common.stopLoading();
      if (barcodeData.cancelled) {
        return false;
      }
      if (null != barcodeData.text) {
        var barcodeText = { "qrcode": barcodeData.text };
        this.validateCheckIn('QRCode', JSON.stringify(barcodeText), actionSheetTitle);
      } else {
        this.common.alertToast(this.reqService.translatedata('invalidBarcode'));
      }
    }, (err) => {
      // this.common.stopLoading();
    });
  }

  checkIn(type, detail) {
    let checkInList = [];
    let checkin = new CheckIn();
    checkin.checkInDetail = this.selectedRequest.checkinRequired ? { value: detail } : null;
    checkin.checkInDetail = JSON.stringify(checkin.checkInDetail);
    checkin.checkOutDetail = this.selectedRequest.checkoutRequired && !this.selectedRequest.checkinRequired ? detail : null;
    checkin.checkInType = type;
    if (type == 'GPS') {
      checkin.latitude = detail.lat;
      checkin.longitude = detail.lon;
    }
    checkin.requestHistoryId = this.selectedRequest.requestHistoryId;
    checkin.requestHistoryId = this.selectedRequest.requestHistoryId;
    if (navigator.onLine) {
      if (this.selectedRequest.checkinRequired) {
        this.common.displayLoading();
        this.reqService.genericPost("mobileservice/checkin", checkin)
        .subscribe(
          resp => {
            this.common.stopLoading();
            if (resp) {
              this.common.alertToast(this.reqService.translatedata('checkedSuccess'));
              this.selectedRequest.ackReq = false;
              this.selectedRequest.checkinRequired = false;
              this.selectedRequest.trackingRequired = false;
              console.log(this.selectedRequest);
              this.events.publish('view-checkin:success', {user: this.selectedRequest});
              setTimeout(() => {
                let navigationExtras: NavigationExtras = {
                  queryParams : {
                    checkIn:true,
                    selectedRequest: JSON.stringify(this.selectedRequest)
                  }
                }
                this.router.navigate(['request-detail'], navigationExtras)
                .then(() => {                
                });
              }, 2000);

              if (this.selectedRequest.startedBy) {
                this.common.locationWatch.unsubscribe();
              }
            } else {
              this.common.alertToast(this.reqService.translatedata('checkedSuccess'));
              this.selectedRequest.ackReq = false;
              this.selectedRequest.checkinRequired = false;
              this.selectedRequest.trackingRequired = false;
              console.log(this.selectedRequest);
              this.events.publish('view-checkin:success', {user: this.selectedRequest});
              setTimeout(() => {
                let navigationExtras: NavigationExtras = {
                  queryParams : {
                    selectedRequest: JSON.stringify(this.selectedRequest)
                  }
                }
                this.router.navigate(['request-detail'], navigationExtras)
                .then(() => {
                  // const index = this.navCtrl.getActive().index;
                  // this.navCtrl.remove(index - 1);
                  // this.navCtrl.remove(index - 2);
                  
                });
              }, 2000);

            }
          },async (err)=>{
            this.common.stopLoading();
            if (err._body && err._body.length > 0) {
              let errResp = JSON.parse(err._body);
              this.common.alertToast(errResp.detail);
            } else {
              this.common.alertToast(err.statusText);
            }
            this.common.alertToast(this.reqService.translatedata('ServerRespond'));
          }
        )
      } else {
        this.common.alertToast('CheckIn was already done..');
        this.selectedRequest.ackReq = false;
        this.selectedRequest.checkinRequired = false;
        this.selectedRequest.trackingRequired = false;
        console.log(this.selectedRequest);
        this.events.publish('view-checkin:success', {user: this.selectedRequest});
        let navigationExtras: NavigationExtras = {
          queryParams : {
            selectedRequest: JSON.stringify(this.selectedRequest)
          }
        }
        this.router.navigate(['request-detail'], navigationExtras)

      }
    } else if (!navigator.onLine) {
      checkInList.push(checkin);
      let checkInData = JSON.parse(localStorage.getItem(Config.constants.checkIn));
        if (null != checkInData) {
          for (let check_In of checkInData) {
            if (this.selectedRequest.requestHistoryId != check_In.requestHistoryId) {
              checkInList.push(check_In);
            }
          }
        }
        this.common.alertToast(this.reqService.translatedata('offlineCheckin'));
        this.selectedRequest.ackReq = false;
        this.selectedRequest.checkinRequired = false;
        this.selectedRequest.trackingRequired = false;
        console.log(this.selectedRequest);
        let navigationExtras: NavigationExtras = {
          queryParams:{
          selectedRequest: JSON.stringify(this.selectedRequest)
        }
      }
        this.router.navigate(['request-detail'],navigationExtras)
        .then(() => {
          // const index = this.navCtrl.getActive().index;
          // this.navCtrl.remove(index - 1);
          // this.navCtrl.remove(index - 2);
          this.events.publish('view-checkin:success', {user:this.selectedRequest});
        });
        if (this.selectedRequest.startedBy) {
          this.common.locationWatch.unsubscribe();
        }
        this.selectedRequest.trackingRequired = false;
        localStorage.setItem(Config.constants.checkIn, JSON.stringify(checkInList));
        // this.storage.setItem(Config.constants.checkIn, checkInList);
  
    }
  }
  back() {
    this.modalCtrl.dismiss().catch(() =>{
      window.history.back();
    })
  }

}
