import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-meter-reading',
  templateUrl: './meter-reading.page.html',
  styleUrls: ['./meter-reading.page.scss'],
})
export class MeterReadingPage implements OnInit {

  meterReadings: any[];
  s3_Url = 'https://s3.ap-south-1.amazonaws.com/cmms-admin-image/';
  profile: any;
  noRecordFound: boolean;
  constructor(
  public router: Router,
  public reqService: ServiceProvider,
  private barcodeScanner: BarcodeScanner, 
  public common : CommonProvider, 
  ) { 
    this.meterReadings =[];
    this.getAllmeterReading();
  }
  ngOnInit() {
  }
  getAllmeterReading() {
    this.reqService.getAllmeterReading().subscribe((res)=>{
      this.meterReadings = res
      if(res.length == 0) {
        this.noRecordFound = true;
      }
      //console.log(meterReading);
    },async (err) =>{
      this.noRecordFound = true;
      console.log(err); 
    })
  }
  back() {
    this.router.navigate(['/settings']);
  }
  async updateMeter(meter) {
    let navigationExtras: NavigationExtras = {
      queryParams:{
        id: meter.id
      }
    }
    this.router.navigate(['meter-detail'], navigationExtras);
  }
  scanMeter() {
    let options: BarcodeScannerOptions = {
      showTorchButton: true,
    };
    this.barcodeScanner.scan(options).then(
      (barcodeData) => {
        let isMeterFound = false;
        console.log(barcodeData);
        console.log(barcodeData.text);
        if (null != barcodeData.text) {
          this.reqService.getMeterDetailByQrcode(barcodeData.text).subscribe((res)=>{
            let meterReading = res
            isMeterFound = true;
            this.updateMeter(meterReading);
            console.log(meterReading);
          },async (err) =>{
            console.log(err); 
            this.common.alertToast(this.reqService.translatedata("notFound"));
          })
        } else {
          if (!isMeterFound) {
            this.common.alertToast(this.reqService.translatedata("notFound"));
          }
          else {
            this.common.alertToast(
              this.reqService.translatedata("invalidBarcode")
            );
          }
        }
      },
      (err) => { }
    );
  }
}
