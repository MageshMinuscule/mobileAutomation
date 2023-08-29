import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Events } from 'src/providers/events/events';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-work-request-list',
  templateUrl: './work-request-list.page.html',
  styleUrls: ['./work-request-list.page.scss'],
})
export class WorkRequestListPage implements OnInit, AfterViewInit{
  workRequests: any = [];
  usergroupPermissions: any;
  createRequest = false;
  createWorkorder = false;
  user: any;
  userGroupNames: any;
  profile: any = {};
  value: any = [];
  group: any;
  userDetails:any = {};
  showPowerButton: boolean;
  id: any;
  segment: string;
  noRecordFound: boolean;
  constructor(
    public reqService : ServiceProvider,
    public common : CommonProvider,
    public events : Events,
    public route : ActivatedRoute,
    public router : Router,
    public navCtrl : NavController,
  ) {
  }
  ngAfterViewInit() {
  }
  ionViewWillEnter() {
    this.common.displayLoading();
    this.workRequests = [];
    if(navigator.onLine) {
      this.profile = JSON.parse(window.localStorage.getItem('Profile'));
      this.group = this.profile.workflowType;
      if (this.profile ) {
        this.showPowerButton = this.profile && this.profile.userGroupNames && this.profile.userGroupNames.length === 1 && this.profile.userGroupNames[0].toLowerCase() === 'requestuser' ? true : false;
          if (this.profile.id === 1) {
              this.createRequest = true;
              this.createWorkorder = true;
          } else {
              // if( this.profile && this.profile.userGroupNames && this.profile.userGroupNames.includes('WorkRequestAccept'))
              // {
              // this.createWorkorder = true;
              // }
              this.profile.userPermissions.forEach(element => {
                if ((element.object_name === 'workOrder' && element.editAccess)) {
                  this.createWorkorder = true;
                }
              });
          }
          this.getAllWorkRequests();
      }
    }else {
      this.common.stopLoading();
      this.common.alertToast(this.reqService.translatedata('networkConnectivityError'));
      this.router.navigate(['home']);
    }
    
    // this.reqService.getUserProfile()
    // .then((info)=>{
    //   this.profile = info;
    // })
    // if(navigator.onLine) {
    //   this.reqService.getUserInfo()
    //   .subscribe(res => {
    //     if (res) {
    //         this.profile = res;
    //         this.group = this.profile.workflowType;
    //         if (this.profile ) {
    //           this.showPowerButton = this.profile && this.profile.userGroupNames && this.profile.userGroupNames.length === 1 && this.profile.userGroupNames[0].toLowerCase() === 'workrequest' ? true : false;
    //             if (this.profile.id === 1) {
    //                 this.createRequest = true;
    //                 this.createWorkorder = true;
    //             } else {
    //                 if( this.profile && this.profile.userGroupNames && this.profile.userGroupNames.includes('WorkRequestAccept'))
    //                 {
    //                 this.createWorkorder = true;
    //                 }
    //             }
    //             this.getAllWorkRequests();
    //         }
    //     }
    //     }, async (err)=>{
    //       this.common.stopLoading();
    //     })
    // } else {
    //   this.common.stopLoading();
    //   this.common.alertToast(this.reqService.translatedata('networkConnectivityError'));
    //   this.router.navigate(['home']);
    // }

  }
  ngOnInit() {


  }
  getAllWorkRequests() {
    if(this.createWorkorder)
    {
        this.reqService.getAllWorkRequests()
        .subscribe(
          (res) => {
          this.common.stopLoading();
          this.value = res;
          this.value.forEach(element => {
              // if( !element.requestId && element.status != 'Rejected' ){
                  this.workRequests.push(element);
              // }
          });
          if(this.workRequests.length == 0) {
            this.noRecordFound = true;
          }
      },async (error) => {
          this.noRecordFound = true;
          this.common.stopLoading();
      })

    }
    else{
        this.reqService.getworkRequestByUser(this.profile.id)
        .subscribe(
          (res) => {
            this.common.stopLoading();
            if(res && res.content && res.content.length )
            {
                this.workRequests = res.content;
                if(this.workRequests.length == 0) {
                  this.noRecordFound = true;
                }
                // this.common.stopLoading();
            }else {
              this.noRecordFound = true;
            }
        },
        async (error) => {
            this.noRecordFound = true;
            this.common.stopLoading();
        }
        )
    }

}
addWorkRequest() {
    let navigationExtras: NavigationExtras = {
      queryParams:{
        createWorkrequest: 'createWorkrequest',
        isWorkRequest: JSON.stringify(true)
      }
    }
   this.router.navigate(['/search'], navigationExtras);
}
clickItem(data) {
  let navigationExtras: NavigationExtras = {
    queryParams :{
      item : JSON.stringify(data)
    }
  }
   this.router.navigate(['/work-request-view'],navigationExtras);
}
 logoutUser() {
   this.common.logClickEvent('user_logout_btn_click', "User Logout");
   this.events.publish("user-logout", Date.now());
 }
 back() {
   this.router.navigate(['/home']);
}
home() {
  this.router.navigate(['home']);
}
workRequestList() {
  this.router.navigate(['work-request-list']);
}
settings() {
  this.router.navigate(['settings']);
}
}
