import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ModalController, NavController, NavParams } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';
import { Events } from 'src/providers/events/events';
import { ServiceProvider } from 'src/providers/service/service';
import { AssetPage } from '../asset/asset.page';
import { AttachmentPage } from '../attachment/attachment.page';
import { CommonProvider } from '../common/common';
import { Config } from '../config';
import { ModalViewPage } from '../modal-view/modal-view.page';
import { RequestTimer } from '../data.model';
import { WorkGuidePage } from '../work-guide/work-guide.page';
import { AngularFirestore } from '@angular/fire/firestore';
import { async } from '@angular/core/testing';

@Component({
  selector: 'app-work-update',
  templateUrl: './work-update.page.html',
  styleUrls: ['./work-update.page.scss'],
})
export class WorkUpdatePage implements OnInit {
  selectedRequest: any;
  workUpdateCallback: any;
  rejectComment: any;
  isDraft: boolean = false;
  requestData: any;
  reqType: any = "routeRequest";
  showAssetUpdate: boolean;
  tenantId: any;
  modelData: any;
  onLine: boolean = true;
  rmOfflineShown: boolean = false;
  isStartStopWatch: boolean = false;
  requestTimer: any;
  time: any = {
    hour: "0"+0, min:"0"+0, sec: "0"+0
  };
  profile: any;
  account: any;
  userInvolvedRequestTimerList: any = [];
  tab: any = "Releated Request";
  inProgressRequests: any = [];
  constructor( 
    public events: Events,
    public reqService: ServiceProvider,
    public common: CommonProvider, 
    public route : ActivatedRoute,
    public navCtrl : NavController, 
    public router: Router,
    public modalCtrl : ModalController,
    public navParams : NavParams,
    public firestore: AngularFirestore,
  ) {
    this.onLine = navigator.onLine;

    this.route.queryParams.subscribe(params => {
      if(params && params.selectedRequest){
        this.selectedRequest = params.selectedRequest ? JSON.parse(params.selectedRequest) : null;
      }
      else {
        this.modalCtrl.dismiss();
      }
    })
    this.route.queryParams.subscribe(params => {
      this.workUpdateCallback = params ? params.workUpdateCallback : null
    })
    let profile = JSON.parse(window.localStorage.getItem('Profile'));
      if (profile && profile.tenantId) {
        this.tenantId = profile.tenantId;
        this.showAssetUpdate = profile.workflow == 'asset' ? true : false;
      }
    this.route.queryParams.subscribe(params =>{
      if(params && params.selectedRequest){
        this.selectedRequest =  params.selectedRequest ? JSON.parse(params.selectedRequest) : null
        this.selectedRequest.requestCost = this.selectedRequest.requestCost
        ? this.selectedRequest.requestCost
        : 0;
        this.selectedRequest.routeForm =
        this.selectedRequest.routeFormString &&
          typeof this.selectedRequest.routeFormString === "string"
          ? JSON.parse(this.selectedRequest.routeFormString)
          : this.selectedRequest.routeForm;
          this.route.queryParams.subscribe(params =>{
            if(params && params.isDraft){
              if (this.selectedRequest && this.selectedRequest.rejectionComments) {
                this.rejectComment =
                  typeof this.selectedRequest.rejectionComments == "string"
                    ? JSON.parse(this.selectedRequest.rejectionComments || "{}")
                    : this.selectedRequest.rejectionComments;
              }
            }
          })
      }
    }) 
    if(this.navParams && this.navParams.data.selectedRequest){
        this.profile = JSON.parse(window.localStorage.getItem('Profile'));
        this.account = JSON.parse(window.localStorage.getItem('account'));
        // this.isStartStopWatch = true;
        this.selectedRequest = this.navParams.data.selectedRequest ? this.navParams.data.selectedRequest : null;
        if(this.account?.pauseAndPlayTimer) {
          this.getUserInvloedRequestTimer();
        }
        this.selectedRequest.requestCost = this.selectedRequest.requestCost
        ? this.selectedRequest.requestCost
        : 0;
        this.selectedRequest.routeForm =
        this.selectedRequest.routeFormString &&
          typeof this.selectedRequest.routeFormString === "string"
          ? JSON.parse(this.selectedRequest.routeFormString)
          : this.selectedRequest.routeForm;
        this.isDraft = this.navParams.data.isDraft ? this.navParams.data.isDraft : false;

    }
    setTimeout(() => {
      let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
      this.rmOfflineShown = ids?.includes(this.selectedRequest?.requestId);
    }, 500);
    console.log(this.selectedRequest+"   "+ this.isDraft);
   }
  getUserInvloedRequestTimer() {
    this.reqService.getUserCurrentStatus('InProgress',this.profile.id).then((data: any) => {
      this.userInvolvedRequestTimerList = data.body;
      if(this.userInvolvedRequestTimerList?.length == 0) {
        this.isStartStopWatch = true;
        this.startTimer();
        return;
      }
      this.inProgressRequests.push(this.userInvolvedRequestTimerList[0]);
      if(this.selectedRequest.requestId == this.userInvolvedRequestTimerList[0]?.requestId) {
        this.isStartStopWatch = true;
        this.requestTimer = this.userInvolvedRequestTimerList[0];
        this.inProgressRequests = [];
      }
      let title = 'Attention'
      let msg = `Currently you have been working in this work order (#${this.inProgressRequests[0]?.requestKey}). Do you want to pause it and continue here? `;
      if(this.inProgressRequests.length > 0) {
        this.openModalView(title,msg,this.inProgressRequests[0]?.requestId);
      }
    },async (err) => {
      this.common.alertToast("Error From Get Current User Status: "+err?.error?.message);
    })
  }
  toStart() {
    this.isStartStopWatch = true;
  }

  ngOnInit() {
  }
  back() {
    let AssetRemove = localStorage.setItem('assetDetails',JSON.stringify(""));
    console.log(""+AssetRemove);
    this.modalCtrl.dismiss().catch(() => {
      this.navCtrl.back();
    })
  }
  updateStatus(item) {
    this.workUpdateCallback(item).then(() => {
      this.navCtrl.pop();
    });
  }
  getAssetHistory() {
    let navigationExtras : NavigationExtras = {
      queryParams: {
        assetId: this.selectedRequest.assetId,
        selectedRequest: JSON.stringify(this.selectedRequest),
        // subHeader: this.subHeader
      },replaceUrl:true
    }
    this.router.navigate(['work-history'], navigationExtras);
  }

  async gotoAsset() {
    const modal = await this.modalCtrl.create({
      component: AssetPage,
      componentProps: {
        isFromPending: true,
        requestId: this.selectedRequest.requestId,
        selectedRequest: this.selectedRequest,
        assetId: this.selectedRequest.assetId,
        isCost: false,
        isRequired: true
      },
    });
  
    modal.onDidDismiss().then((detail: OverlayEventDetail) => {
      let modelData = detail.data;
      if (modelData !== null) {
        this.modelData = modelData;
        console.log('Modal Data : modelData');
      }
    });
    return await modal.present();
  }

  async gotoPart() {
    let navigationExtras : NavigationExtras = {
      queryParams: {
          requestId: this.selectedRequest.requestId,
          assetId: this.selectedRequest.assetId,
          partsUpdate: 'Update Parts',
          selectedRequest: JSON.stringify(this.selectedRequest),
          module: 'workUpdate'
          // subHeader: this.subHeader
      },
      replaceUrl:true
    }
    this.router.navigate(['inventory-list'], navigationExtras);
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
  async gotoLabourTasks() {
    let navigationExtras : NavigationExtras = {
      queryParams: {
           requestId: this.selectedRequest.requestId,
           status: this.selectedRequest.status,
           locationId: this.selectedRequest.locationId,
         },replaceUrl:true
    }
    this.router.navigate(['labour-tasks-list'], navigationExtras);
  }

  ionViewDidLeave() {
    document.addEventListener("pause", ()=>{
      let AssetRemove = localStorage.setItem('assetDetails',JSON.stringify(" "));
      console.log(" "+AssetRemove);
      console.log("pause event is fired"); 
      }, false);
  }
  ngOnDestroy() {
    let AssetRemove = localStorage.setItem('assetDetails',JSON.stringify(" "));
    console.log(" "+AssetRemove);

  }
  async removeSync() {
    let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
    // let requests = JSON.parse(window.localStorage.getItem(Config.constants.routeDraftRequest));
    let requests:any = await this.common.getStorageValue(Config.constants.routeDraftRequest);
    let id = this.selectedRequest.requestId;
    const index = ids.indexOf(id);
    if (index > -1) {
      ids.splice(index, 1);
    }
    if(requests && requests?.length > 0) {
      requests.forEach(element => {
        if(element.requestId == id) {
          const idx = requests.indexOf(element);
          if (idx > -1) {
            requests.splice(idx, 1);
          }
        }
      });
    }
    window.localStorage.setItem('offlineRequetsIds', JSON.stringify(ids));
    // await this.common.setStorageValue(Config.constants.routeDraftRequest,requests);
    window.localStorage.setItem(Config.constants.routeDraftRequest, JSON.stringify(requests));
    this.router.navigate(['home'],{replaceUrl:true});
  }
  async startTimer() {
    let requestTimer = new RequestTimer();
    requestTimer.requestId = this.selectedRequest.requestId,
      requestTimer.userId = this.profile.id,
      requestTimer.requestHistoryId = this.selectedRequest.requestHistoryId,
      requestTimer.status = 'InProgress';
      requestTimer.isPauseExistingRequests = this.inProgressRequests.length > 0 ? true : false;
      requestTimer.requestKey = this.inProgressRequests.length > 0 ? this.selectedRequest.requestKey : null;
    this.reqService.createRequestTimer(requestTimer).subscribe(res => {
      this.requestTimer = res.body;
    }, async (err) => {
      console.log(err);
    });
  }

  async openDialog(ev) {
    console.log(ev);
    if (ev == true) {
      const modal = await this.modalCtrl.create({
        component: ModalViewPage,
        componentProps: {
          title: "Pending Reason",
        },
      });
      modal.onDidDismiss().then((detail: OverlayEventDetail) => {
        let modelData = detail.data;
        if (modelData !== null) {
          console.log(`Modal Dismiss Data : ${modelData}`);
          if (modelData != null && modelData != undefined && modelData != "") {
            this.requestTimer.pauseReason = modelData;
            // this.requestTimer.version = this.requestTimer.version + 1;
            this.requestTimer.status = 'Paused';
            this.requestTimer.creationDate = null;
            this.requestTimer.updationDate = null;
            this.requestTimer.isPauseExistingRequests = false;
            this.requestTimer.requestKey = null;
            this.reqService.updateRequestTimer(this.requestTimer).subscribe(res => {
              console.log(res);
              this.initSaveAsDraft();
            })
          }
        }
      });
      return await modal.present();
    }
  }
  //route to save as draft
  initSaveAsDraft() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        templatedata: JSON.stringify(this.selectedRequest),
        isDraft: true,
        isFromPaused: true, 
        requestTimer: JSON.stringify(this.requestTimer),
        buttons: JSON.stringify(this.selectedRequest.routeForm.button),
        templateForm: JSON.stringify(this.selectedRequest.routeForm.templateForm),
        requestData: JSON.stringify(this.requestData),
        msg: 'Request has been paused successfully.',
      },replaceUrl:true
    }
    this.router.navigate(['button'], navigationExtras);
  }
  async openworkGuide() {
    const modal = await this.modalCtrl.create({
      component: WorkGuidePage,
      componentProps: {
        selectedRequest: this.selectedRequest,
      },
    });
    modal.onDidDismiss().then((detail: OverlayEventDetail) => {
      let modelData = detail.data;
      if (modelData !== null) {
        console.log(`Modal Dismiss Data : ${modelData}`);
        this.routeRequestId(modelData);
      }
    })
    return await modal.present();
}
  async openModalView(title:string,msg: string,requestId:any) {
  const modal = await this.modalCtrl.create({
    component: ModalViewPage,
    componentProps: {
      title: title,
      msg: msg,
      buttons:['cancel','Go to Previous','Pause & Continue']
    },
  });
  modal.onDidDismiss().then((detail: OverlayEventDetail) => {
    let modelData = detail.data;
    if (modelData !== null) {
      console.log(`Modal Dismiss Data : ${modelData}`);
      if (modelData == 'Go to Previous') {
        this.modalCtrl.dismiss();
        this.routeRequestId(requestId);
      }else if(modelData == 'Pause & Continue'){
        this.isStartStopWatch = true;
        this.common.alertToast(`Your # ( ${this.inProgressRequests[0]?.requestKey })Request Paused Successfully`);
        this.startTimer();
      }else  {
        this.modalCtrl.dismiss();
        this.routeRequestId(this.selectedRequest.requestId);
      }
    }
  });
  return await modal.present();
}
  routeRequestId(requestId: any) {
    this.modalCtrl.dismiss();
    let profile = JSON.parse(localStorage.getItem('Profile'));
    let getRequestData = this.firestore
      .collection('organization')
      .doc(this.profile.tenantId)
      .collection(this.common.viewType)
      .doc(JSON.stringify(profile.id))
      .collection('pendingAction', (ref) =>
        ref
          .where('requestId', '==', requestId)
      );
    getRequestData.get().subscribe((ss) => {
      ss.forEach((doc) => {
        let data = doc?.data();
        this.modalCtrl.dismiss();
        let navigationExtras: NavigationExtras = {
          queryParams:
          {
            selectedRequest: JSON.stringify(data),
            workflowId: data.workflowId,
            locationId: data.locationId,
            assetId: data.assetId,
            type: 'pending',
            isDraft: data.action == 'saveAsDraft' ? true : false,
          }
        }
        this.router.navigate(['/request-detail'], navigationExtras);
      });
    }, async (err) => {
      console.log(err);
    });
  }


}

