import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';
import { Attendance } from '../data.model';
import {
  BarcodeScanner,
  BarcodeScannerOptions,
} from '@ionic-native/barcode-scanner/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss'],
})
export class AttendancePage implements OnInit {
  defaultBtn: any = [
    {
      name: 'Checkin',
      value: 'checkin',
      icon: 'camera',
      isDisabled: false,
    },
    {
      name: 'Checkout',
      value: 'checkout',
      icon: 'qr-scanner',
      isDisabled: false,
    },
  ];
  shift: any = 'General';
  locationStr: any = {
    lat: 0.0,
    lon: 0.0,
  };
  isBrowser: boolean;
  attendanceType = 'checkin';
  isCheckin: boolean = false;
  isCheckout: boolean = true;
  type: any = 'qrcode';
  attendanceList: any = [];
  overallAttendanceList: any = [];
  location: any;
  attendanceData: any = new Attendance();
  locationList: any = [];
  shiftList: any = [];
  profile: any;
  selectedShift: any = 'I';
  count = {
    firstShift: 0,
    secondShift: 0,
    thirdShift: 0,
  };
  viewType: any;
  constructor(
    public reqService: ServiceProvider,
    public common: CommonProvider,
    public geolocation: Geolocation,
    public alertCtrl: AlertController,
    public router: Router,
    public barcodeScanner: BarcodeScanner,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.profile = JSON.parse(window.localStorage.getItem('profile'));
  }
  getCurrentLocation() {
    // this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 5000 }).then(pos => {
    //   this.locationStr = { "lat": pos.coords.latitude, "lon": pos.coords.longitude };
    // }).catch((err) => {
    //   this.common.alertToast(this.reqService.translatedata('locationDetectError'));
    // });
  }

  imgUpload() {
    if (navigator.onLine) {
      if (!this.isBrowser) {
        let navigationExtras: NavigationExtras = {
          queryParams: {
            location: this.locationStr,
            type: this.attendanceType,
            mode: 'Attendance',
            shift: this.shift,
          },
        };
        this.router.navigate(['/annotate'], navigationExtras);
      } else {
        this.common.alertToast(
          this.reqService.translatedata(
            'Attendance only available on mobile devices.'
          )
        );
      }
    } else {
      this.common.alertToast(
        this.reqService.translatedata('networkConnectivityError')
      );
    }
  }

  isChecked(shift) {
    return this.shift === shift;
  }

  updateShift(shift) {
    this.shift = shift;
  }

  scanUser() {
    if (navigator.onLine) {
      let options: BarcodeScannerOptions = {
        showTorchButton: true,
      };
      this.barcodeScanner.scan(options).then(
        (barcodeData) => {
          if (barcodeData.cancelled) {
            return false;
          }
          if (null != barcodeData.text) {
            let barcodeText = barcodeData.text;
            let barcodeInfo = JSON.parse(barcodeText);
            if (barcodeInfo && barcodeInfo.userId) {
              this.showAttendanceConfirmation(JSON.parse(barcodeText));
            } else {
              this.common.alertToast(
                this.reqService.translatedata('invalidBarcode')
              );
            }
          } else {
            this.common.alertToast(
              this.reqService.translatedata('invalidBarcode')
            );
          }
        },
        (err) => {
          this.common.alertToast(
            this.reqService.translatedata(
              "Sorry can't  use the QRCODE option right now!"
            )
          );
        }
      );
    } else {
      this.common.alertToast(
        this.reqService.translatedata('networkConnectivityError')
      );
    }
  }

  async showAttendanceConfirmation(barcodeText) {
    let image = '';
    let userName = barcodeText.userName ? barcodeText.userName : 'the user';
    if (barcodeText.image) {
      image =
        '<img  src="https://s3.ap-south-1.amazonaws.com/cmms-admin-image/' +
        barcodeText.image +
        '">';
    } else {
      image = '<img src="assets/img/user.png">';
    }
    let alert = this.alertCtrl.create({
      header: this.reqService.translatedata('Confirm Attendance'),
      message:
        '<div>' +
        image +
        '<span class="alert-text">' +
        this.reqService.translatedata('Are you sure to put attendance for') +
        ' ' +
        userName +
        '</span></div>',
      cssClass: 'custom-alert',
      backdropDismiss: true,

      buttons: [
        {
          text: this.reqService.translatedata('cancel'),
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
        {
          text: this.reqService.translatedata('update'),
          handler: () => {
            this.putAttendance(barcodeText);
          },
        },
      ],
    });
    (await alert).present();
  }

  getTodayAttendance() {
    if (this.location) window.localStorage.setItem('location', this.location);
    if (navigator.onLine) {
      this.reqService
        .getUserAttendanceByLocation(this.location)
        .subscribe((attendanceList) => {
          this.attendanceList = attendanceList;
          this.overallAttendanceList = attendanceList;
          this.setCount();
          this.doFilter(this.selectedShift);
        });
    } else {
      this.common.alertToast(
        this.reqService.translatedata('networkConnectivityError')
      );
    }
  }

  doFilter(shift) {
    this.attendanceList = [];
    this.selectedShift = shift;
    this.overallAttendanceList.forEach((attendance) => {
      if (attendance.shift === shift) {
        this.attendanceList.push(attendance);
      }
    });
    this.getCountValue();
  }

  setCount() {
    this.count = {
      firstShift: 0,
      secondShift: 0,
      thirdShift: 0,
    };
    this.overallAttendanceList.forEach((attendance) => {
      if (attendance.shift === 'I') {
        this.count.firstShift++;
      } else if (attendance.shift === 'II') {
        this.count.secondShift++;
      } else {
        this.count.thirdShift++;
      }
      this.count.firstShift
        ? this.doFilter('I')
        : this.count.secondShift
        ? this.doFilter('II')
        : this.doFilter('III');
      this.getCountValue();
    });
  }

  getCountValue() {
    this.shiftList.forEach((shift) => {
      if (shift.name === 'I') {
        shift.count = this.count.firstShift;
      } else if (shift.name === 'II') {
        shift.count = this.count.secondShift;
      } else {
        shift.count = this.count.thirdShift;
      }
    });
  }

  putAttendance(barcodeText) {
    if (navigator.onLine) {
      this.attendanceData.creationDate = new Date();
      this.attendanceData.organizationId = this.profile.tenantId;
      this.attendanceData.punchedInById = this.profile.id;
      this.attendanceData.updationDate = new Date();
      this.attendanceData.locationId = this.location;
      this.attendanceData.employeeUserId = barcodeText.userId;
      this.reqService
        .updateTodayAttendance(barcodeText.userId, this.attendanceData)
        .subscribe((data) => {
          if (data.id) {
            this.common.alertToast(
              this.reqService.translatedata('Attendance Confirmed')
            );
            this.getTodayAttendance();
          } else if (data.status == 400) {
            this.common.alertToast(
              this.reqService.translatedata(
                'Attendance already registered for this user'
              )
            );
          }
        });
    } else {
      this.common.alertToast(
        this.reqService.translatedata('networkConnectivityError')
      );
    }
  }
  getSoon() {
    this.common.alertToast('Under Process...');
  }
  back() {
    if(this.navCtrl){
      this.navCtrl.pop();
    }
  }
}
