import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Events } from 'src/providers/events/events';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-meter-detail',
  templateUrl: './meter-detail.page.html',
  styleUrls: ['./meter-detail.page.scss'],
})
export class MeterDetailPage implements OnInit {
  id: any;
  meterReading: any ={};
  meterId: any;
  meterHistories: any[];
  meterHistory: any= {};
  required = true;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public reqService: ServiceProvider,
    private common: CommonProvider,   
    private events: Events,
  ) { 
    this.meterHistories = [];
  }
  getMeterReading() {
     this.reqService.getMeterReading(this.meterId).subscribe((res)=>{
       this.meterReading = res;
       console.log(this.meterReading);
       this.getmeterReadingHistories();
     }, async (error) => {
       console.log(error);
     });
  }
  getmeterReadingHistories() {
    this.common.displayLoading();
    this.meterHistories = [];
    this.reqService.getmeterReadingHistories(this.meterId).subscribe(res => {
      this.meterHistories = res;
      this.common.stopLoading();
    }, (error) => {
      this.common.stopLoading();
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.meterId = params['id'] ? params['id'] : null;
    })
    this.getMeterReading();
  }
  back() {
    this.router.navigateByUrl('/meter-reading', {replaceUrl: true});
  }
  addMeterHistory() {
    this.common.displayLoading();
     this.meterHistory.meterId = this.meterId;
     this.meterHistory.unitName = this.meterReading.unitName;
     this.reqService.createMeterHistory(this.meterHistory).subscribe(
      (result) => {
        this.common.stopLoading();
        if (result.id) {
          this.common.alertToast(
            this.reqService.translatedata('Meter Reading added successfully')
          );
          this.getmeterReadingHistories();
        }
      },
      async (err) => {
        this.common.stopLoading();
        if (err.status == 401) {
          this.events.publish('user:inactive', {
            err: err.status,
            time: Date.now(),
          });
        } else if (err.status == 409) {
          this.common.alertToast(
            this.reqService.translatedata('recordAlreadyExist')
          );
        } else if (err.status == 500 || err.status == 0) {
          this.common.alertToast(
            this.reqService.translatedata('internalServerError')
          );
        }
      }
    );
  }
  validateInput(event) {
    event.target.value = event.target.value
      ? event.target.value.trimStart()
      : '';
    if (event.target.name) {
      switch (event.target.name) {
        case 'reading':
          this.meterHistory.reading = event.target.value;
          break;
       
        default:
          break;
      }
    }
    return event.target.value;
  }

}
