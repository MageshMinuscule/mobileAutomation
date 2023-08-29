import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';
// import { ViewController } from 'ionic-angular';
@Component({
  selector: 'app-schedule-job-instance',
  templateUrl: './schedule-job-instance.page.html',
  styleUrls: ['./schedule-job-instance.page.scss'],
})
export class ScheduleJobInstancePage implements OnInit {

  instanceId: any;
  scheduleInstance: any = {};
  profile: any={};
  userName: any;
  usergroupList = [];
  userList = [];
  assignees: any=[];
  activatedRoute: any;
  data: any;

  constructor(
    public route:ActivatedRoute,
    public navCtrl: NavController,
   private common: CommonProvider,
    private reqService: ServiceProvider,
    private router :Router
  ) {
    this.route.queryParams.subscribe(params => {
      if(params && params.instanceId){
        this.instanceId = params.instanceId
      }
        if (this.instanceId) {
          this.common.displayLoading();
          // let service = this.isNewRequest ? this.reqService.getAllWorkRequests() : this.reqService.getAllWorkRequestsByActive();
          this.reqService.getJobInstance(this.instanceId)
          .subscribe(
            (res) => {
              this.scheduleInstance = res;
              this.scheduleInstance.usergroupNamesList
              this.common.stopLoading();
            },
            (error) => {
              this.common.stopLoading();
              console.log(error)
              
            }
          )
        }
    });
  }
  ngOnInit(){
  }
  goToDetail(requestId) {
    this.common.displayLoading();
    this.reqService.getRequestDetail(requestId)
    .subscribe(
      incidents => {
        this.common.stopLoading();
        if (incidents != null && incidents.detail != null) {
          let type = 'pending';
          if (incidents.type == "jobs") {
            type = 'job';
          }
          this.goDetailPage(incidents.detail, type);
        }else {
          this.common.alertToast("No Instance in This Request")
        }
      }
    ) ,async(err)=>{
      this.common.stopLoading();
    }
  }
  goDetailPage(incident, type) {
    
    let navigationExtras: NavigationExtras = {
      queryParams: {
      selectedRequest: JSON.stringify(incident),
      type: type,
      isDraft: false,
      isCalendar: true,
      module:'schedule-job-instance',
      instanceId:this.instanceId
      },replaceUrl:true
    }
    this.common.stopLoading();
    this.router.navigate(['/request-detail'],navigationExtras);
  }  
  back() 
  {
    this.router.navigate(['/events']);
  }
}
