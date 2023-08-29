import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router, RoutesRecognized } from '@angular/router';
import { ModalController, NavController, Platform } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';
import { filter, pairwise } from 'rxjs/operators';
import { ButtonActionProvider } from 'src/providers/button-action/button-action';
import { Events } from 'src/providers/events/events';
import { ServiceProvider } from 'src/providers/service/service';
import { AssetPage } from '../asset/asset.page';
import { AttachmentPage } from '../attachment/attachment.page';
import { ChatPage } from '../chat/chat.page';
import { CommonProvider } from '../common/common';
import { ContactPage } from '../contact/contact.page';
import { InventoryListPage } from '../inventory-list/inventory-list.page';
import { LabourTasksListPage } from '../labour-tasks-list/labour-tasks-list.page';
import { WorkHistoryPage } from '../work-history/work-history.page';
import { WorkUpdatePage } from '../work-update/work-update.page';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { FileTransferObject, FileTransfer } from '@ionic-native/file-transfer/ngx';
import{ File } from '@ionic-native/file/ngx';
import { Config } from '../config';

@Component({
  selector: 'app-request-detail',
  templateUrl: './request-detail.page.html',
  styleUrls: ['./request-detail.page.scss'],
})
export class RequestDetailPage implements OnInit {
  selectedRequest: any = {};
  type: string = "";
  userName: string;
  isCheckIn: boolean = false;
  isAck: boolean = false;
  isTrackEnabled: boolean = false;
  isDraft: boolean = false;
  rejectComment: any = {};
  checkoutAction: any;
  requestTitle: any = "Request Detail";
  showAssetUpdate: boolean = false;
  isNowTracked: boolean;
  tenantId: any;
  workFlowType: any;
  assetId: any;
  modelData: any;
  shown: boolean;
  shownUpdate: boolean = false;
  shownStart: boolean;
  shownCheckIn: boolean;
  tab: any;
  subHeader: string;
  labourTaskCount: number = 0;
  count: any ={}
  previousUrl: string;
  currentUrl: string;
  reqType: any;
  module: any;
  instanceId: any;
  isCalendar: any;
  requestType: any;
  target: string;
  constructor(
    private route : ActivatedRoute,
    private reqService : ServiceProvider,
    public router : Router, 
    public buttonActionProvider : ButtonActionProvider,
    public events : Events,
    public common : CommonProvider,
    private modalCtrl : ModalController,
    public navCtrl : NavController,
    private platform: Platform,
    private transfer: FileTransfer,
    private file: File,
    private fileOpener: FileOpener
  ) {
    this.selectedRequest = {};
    this.route.queryParams.subscribe(params =>{
      if(params && params.selectedRequest && params.type){
        // this.shownUpdate = params.buttonShown ? params.buttonShown : false;
        this.requestType = params && params.requestTile ? params.requestTile : null;
        this.reqType = params && params.reqType ? params.reqType : 'preventive';
        this.tab = params && params.tab ? params.tab : null;
        this.subHeader = params && params.subHeader ? params.subHeader: null ;
        this.selectedRequest= params.selectedRequest ? JSON.parse(params.selectedRequest) : null;
        this.isCalendar = params.isCalendar;
        this.type = params.type
        if(this.selectedRequest && this.selectedRequest.id && undefined == this.selectedRequest.requestId )
          this.selectedRequest.requestId = this.selectedRequest.id;
        this.selectedRequest.routeForm = this.selectedRequest.routeForm
        ? this.selectedRequest.routeForm
        : this.selectedRequest.routeFormString
          ? JSON.parse(this.selectedRequest.routeFormString)
          : null;
        
      // this.requestTitle = this.selectedRequest && this.selectedRequest.requestKey ? this.selectedRequest.requestKey : this.selectedRequest.requestId;
      this.requestTitle = this.selectedRequest && this.selectedRequest.requestType == "SCHEDULE_REQUEST" ? 'Preventive' : 'Work Order';
      this.selectedRequest.requestCost = this.selectedRequest.requestCost
        ? this.selectedRequest.requestCost
        : 0;
        this.route.queryParams.subscribe(params => {
          if(params && params.assetId){
            this.showAssetUpdate = params.assetId ? true : false;
            this.assetId = params.assetId;
          }
        })
        this.route.queryParams.subscribe(params => {
          if(params && params.isDraft){
            this.showAssetUpdate = params.isDraft;
          }
        })
      this.isCheckIn = this.selectedRequest.checkinRequired;
      this.isAck = this.selectedRequest.ackReq;
      this.isTrackEnabled = this.selectedRequest.trackingRequired;
      }
      this.route.queryParams.subscribe(params => {
        this.selectedRequest = params.selectedRequest ? JSON.parse(params.selectedRequest) : null
      })

    })
      let profile = JSON.parse(window.localStorage.getItem('Profile'));
      if (profile && profile.tenantId) {
        this.tenantId = profile.tenantId;
        this.workFlowType = profile.workflow;
      }
    this.route.queryParams.subscribe(params => {
      if(params && params.type){
        this.type = params.type;
        this.route.queryParams.subscribe(params => {
          if(params && params.isAlert){
            this.type = "job";
          }
        })
      }
    })
 

   
    this.route.queryParams.subscribe(params => {
      if(params && params.isMessage){
        this.showChat();
      }
    })
    if (this.selectedRequest && this.selectedRequest.startedBy) {
      this.reqService.getUserProfile().then(profile => {
        if (
          profile &&
          profile.id == this.selectedRequest.startedById &&
          this.selectedRequest.checkinRequired &&
          !this.route.queryParams.subscribe(params =>{
            if(params && params.mode){
            }
          })
        ) {
          this.isNowTracked = true;
          let navigationExtras: NavigationExtras = {
            queryParams: {
              lat: JSON.stringify(this.selectedRequest.latitude),
              lng:  JSON.stringify(this.selectedRequest.longitude),
              location:  JSON.stringify(this.selectedRequest.locationName),
              selectedRequest: JSON.stringify(this.selectedRequest)
            }
          }
          this.router.navigate(['/track-user'], navigationExtras)
        }
      });      
    }
  }
  ngOnInit() {
    this.events.subscribe("startWork:error", (data: any) => {
      this.shownStart = false;
    } );
  }
  ionViewDidEnter() {
    this.route.queryParams.subscribe((params: any) => {
      this.shownUpdate =false;
      if(params && (params.checkIn || params.tab == 'labour' || params.tab == 'inventory' || params.tab == 'assetHistory' || params.module =='asset-detail' || params.module == 'myCreation' || params.module == 'job-list' || params.module == 'schedule-job-instance') ) {
        this.subHeader = params.subHeader ? params.subHeader : null;
        this.selectedRequest = params.selectedRequest ? JSON.parse(params.selectedRequest ) : null;
        this.requestTitle = this.selectedRequest && this.selectedRequest?.requestType == "SCHEDULE_REQUEST" ? 'Preventive' : 'Work Order';
        this.isCheckIn = this.selectedRequest.checkinRequired;
        this.isAck = this.selectedRequest.ackReq;
        this.instanceId = params.module == 'schedule-job-instance' ? params.instanceId : null;
        this.isTrackEnabled = this.selectedRequest.trackingRequired;
        this.module = params && params.module ? params.module : null;
        this.labourTaskCount = params.labourTaskCount ? params.labourTaskCount : 0;
        this.count = {
          labourTaskCount: this.labourTaskCount
        }
        this.tab = params.tab ? params.tab :null;
        if(this.selectedRequest && this.selectedRequest.id && undefined == this.selectedRequest.requestId )
        this.selectedRequest.requestId = this.selectedRequest.id;
      this.selectedRequest.routeForm = this.selectedRequest.routeForm
      ? this.selectedRequest.routeForm
      : this.selectedRequest.routeFormString
        ? JSON.parse(this.selectedRequest.routeFormString)
        : null;
      }else if(params.tab == 'request') {
        this.tab = params.tab;
      }
    })
    this.events.subscribe("view-acknowledge:success", (data: any) => {
      this.acknowledgeSuccess(data.user);
    });
    this.events.subscribe("view-checkin:success", ( data : any ) => {
      this.checkinSuccess(data.user, data.nav);
    });
    this.events.subscribe("view-startwork:success", incident => {
      this.startWorkSuccess(incident);
    });
  }
  ionViewDidLeave() {
    localStorage.removeItem('assetDetails');
    let AssetRemove = localStorage.setItem('assetDetails',JSON.stringify(""));
    console.log(""+AssetRemove);
    this.events.destroy("view-acknowledge:success");
    this.events.destroy("view-checkin:success");
    this.events.destroy("view-startwork:success");
  }

  acknowledge() {
    this.shown =  true;
    this.buttonActionProvider.acknowledge(this.selectedRequest, "view");
  }

  acknowledgeSuccess(incident) {
    console.count();
    this.isAck = incident.ackReq;
    // this.selectedRequest.version += 2;
    this.common.alertToast(
      this.reqService.translatedata("successfullyAcknowledged")
    );
    if (this.selectedRequest.trackingRequired) {
      this.isTrackEnabled = true;
      this.selectedRequest.ackReq = false;
    } else if (this.selectedRequest.checkinRequired) {
      this.isCheckIn = true;
      this.selectedRequest.ackReq = false;
    } else {
      this.selectedRequest.ackReq = false;
      this.isCheckIn = false;
    }
  }

  startWork() {
    this.shownStart = true;
    this.buttonActionProvider.startWork(this.selectedRequest, "view");
  }

  startWorkSuccess(incident) {
    this.isCheckIn = incident.checkinRequired;
    this.isNowTracked = true;
    this.isTrackEnabled = incident.trackingRequired;
    let navigationExtras: NavigationExtras = {
      queryParams:{
        lat: JSON.stringify(this.selectedRequest.latitude),
        lng:  JSON.stringify(this.selectedRequest.longitude),
        location:  JSON.stringify(this.selectedRequest.locationName),
        selectedRequest: JSON.stringify(this.selectedRequest)
      }
    }
    this.router.navigate(['/track-user'],navigationExtras);
  }

  //Open Action  form
  async updateWork() {
    this.shownUpdate = true;
    const modal = await this.modalCtrl.create({
      component: WorkUpdatePage,
      componentProps: {
        selectedRequest: this.selectedRequest,
        isDraft: this.isDraft
      },
    });
    modal.onDidDismiss().then((detail: OverlayEventDetail) => {
      console.log(detail)
      this.shownUpdate = false;
    })
    return await modal.present();
  }

  async showChat() {
    if(!navigator.onLine) {
      this.common.alertToast(this.reqService.translatedata('networkConnectivityError'));
      return;
    }
    const modal = await this.modalCtrl.create({
      component: ChatPage,
      componentProps: {
        selectedRequestId: this.selectedRequest.requestId,
        title:
          this.selectedRequest.workflowName +
          " / " +
          this.selectedRequest.locationName
      },
    });
    return await modal.present();

  }

  workUpdateCallback = data => {
  };

  async gotoAdd(type) {
    const modal = await this.modalCtrl.create({
      component: AssetPage,
      componentProps: {
         isFromPending: true,
        requestId: this.selectedRequest.requestId,
        selectedRequest: this.selectedRequest,
        assetId: this.assetId,
        isCost: type == "cost" ? true : false,
        isRequired: true
      },
    });
    return await modal.present();
  }
  async back() {
    localStorage.removeItem('assetDetails');
    let AssetRemove = localStorage.setItem('assetDetails',JSON.stringify(""));
    console.log(""+AssetRemove);
      this.modalCtrl.dismiss().catch(() => {
        if(this.module == 'job-list') {
          this.router.navigate(['/job-list'],{replaceUrl:true});
        }
        else if(this.module == 'myCreation') {
          let navigationExtras: NavigationExtras = {
            queryParams: {
              tab:this.tab
            },replaceUrl:true
          }
          this.router.navigate(['/request-list'],navigationExtras);
        }else if(this.module == 'asset-detail') {
          let navigationExtras: NavigationExtras = {
            queryParams: {
              assetId:this.selectedRequest && this.selectedRequest.assetId ? this.selectedRequest.assetId :null,
            },replaceUrl:true
          }
          this.router.navigate(['asset-detail'], navigationExtras)
        }else if(this.module == 'schedule-job-instance' || this.isCalendar) {
          let navigationExtras : NavigationExtras = {
          queryParams:{
            tittle:this.requestTitle,
            instanceId :this.instanceId
          },replaceUrl:true
        }
        this.router.navigate(['events'],navigationExtras)

        } else {
          var type = this.requestType == 'Preventive' ? this.requestType : this.requestTitle;
          let navigationExtras : NavigationExtras = {
            queryParams:{
              tittle:type,
              subHeader: this.subHeader == 'Work In Progress' ? 'wip' : 'pending'
            },replaceUrl:true
          }
          this.router.navigate(['pending-list'], navigationExtras);
        }
      });

  }

  async viewAsset(type) {
    const modal = await this.modalCtrl.create({
      component: AssetPage,
      componentProps: {
         isFromPending: true,
        assetId:  this.selectedRequest.assetId,
        isCost: false,
        isRequired: true
      },
    });
    return await modal.present();
  }
  

  async gotoParts() {
    const modal = await this.modalCtrl.create({
      component: InventoryListPage,
      componentProps: {
        requestId: this.selectedRequest.requestId,
        assetId: this.selectedRequest.assetId,
        partsUpdate: 'Update Parts'
      },
    });
    return await modal.present();
  }

  async gotoAttachment() {
    const modal = await this.modalCtrl.create({
      component: AttachmentPage,
      componentProps: {
        requestId: this.selectedRequest.requestId,
        assetId: this.selectedRequest.assetId,
        locationId: this.selectedRequest && this.selectedRequest.assetId === null ? this.selectedRequest.locationId : null
      },
    });
    return await modal.present();
  }
  async getAssetHistory() {
    const modal = await this.modalCtrl.create({
        component: WorkHistoryPage,
        componentProps:{
          assetId: this.selectedRequest.assetId
      },
    });
    return await modal.present();

  }
  async gotoLabourTasks() {
    let navigationExtras : NavigationExtras = {
      queryParams: {
           requestId: this.selectedRequest.requestId,
           status: this.selectedRequest.status,
           locationId: this.selectedRequest.locationId
         }
    }
    this.router.navigate(['labour-tasks-list'], navigationExtras);
    // const modal = await this.modalCtrl.create({
    //   component: LabourTasksListPage,
    //   componentProps: {
    //     requestId: this.selectedRequest.requestId,
    //     status: this.selectedRequest.status,
    //     locationId: this.selectedRequest.locationId
    //   },
    // });
    // (await modal)
    // .onDidDismiss()
    // .then((detail: OverlayEventDetail) => {
    //   console.log(detail);
    // })
    // return await modal.present();
  }

  async gotoContact() {
    const modal = await this.modalCtrl.create({
      component: ContactPage,
      componentProps: {
        companyId: this.selectedRequest.companyId
      }
    });
  
    return await modal.present();
  }

  async userCheckin() {
    this.shownCheckIn = true;
    this.common.logClickEvent("checkin_btn_click", "Request Detail Page");
    if (this.selectedRequest.checkInType == "bypass") {
      this.buttonActionProvider.checkIn(this.selectedRequest, "view");
    } else {
      if (this.isNowTracked === true) {
        let navigationExtras: NavigationExtras = {
          queryParams:{
            lat: JSON.stringify(this.selectedRequest.latitude),
            lng:  JSON.stringify(this.selectedRequest.longitude),
            location: this.selectedRequest.locationName,
            selectedRequest: JSON.stringify(this.selectedRequest)
          }
        }
        this.router.navigate(['/track-user'],navigationExtras);
      } else {
        // const modal = await this.modalCtrl.create({
        //   component: CheckinPage,
        //   componentProps: {
        //     checkinType: this.selectedRequest.checkInType,
        //     selectedRequest: this.selectedRequest
        //   }
        // });
      
        // return await modal.present();
        let navigationExtras: NavigationExtras = {
          queryParams:{
            checkinType: this.selectedRequest.checkInType,
            selectedRequest: JSON.stringify(this.selectedRequest)
          }
        }
        this.router.navigate(['checkin'],navigationExtras);
      }
    }
  }
  checkinSuccess(incident, navOption?) {
    this.isAck = incident.ackReq;
    this.selectedRequest.version += 1;
    this.isCheckIn = incident.checkinRequired;
    if (navOption) {
      const index = document.activeElement.childElementCount;
      window.history.go(index - 2)
      // this.navCtrl.remove(index - 1);
    }
  }
  downloadReport() {
    this.common.displayLoading();
    this.target = this.platform.is('android')
      ? this.file.externalApplicationStorageDirectory
      : this.file.documentsDirectory;
    let fileMIMEType = 'application/pdf';
    let auth = localStorage.getItem('auth-token');
    console.log('download started');
    this.common.alertToast('Downloading.....');
    const fileTransfer: FileTransferObject = this.transfer.create();
    let downloadUrl = Config.backend.host+'requests/downloadPdf/' + this.selectedRequest.requestId;
    // let downloadUrl = '/api/reports/generateWorkClosedReport/' + this.selectedRequest.requestId + '/Closed?';
    fileTransfer
      .download(encodeURI(downloadUrl), this.target + 'request', false, {
        headers: {
          Authorization: auth,
        },
      })
      .then((entry) => {
        this.fileOpener
          .open(entry.toURL(), fileMIMEType)
          .then(() => {
            this.common.alertToast('Downloaded Successfully....');
            this.common.stopLoading();
          })
          .catch((e) => {
            this.common.alertToast(
              'Cant open this attachment file. Please try again after some time'
            );
            this.common.stopLoading();
          });
      })
      .catch((e) => {
        this.common.alertToast(
          'Cant open this attachment file. Please Try again after some time'
        );
        this.common.stopLoading();
      });
  }  

}
