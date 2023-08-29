import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Platform, AlertController } from '@ionic/angular';
import { Events } from 'src/providers/events/events';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';
import { Config } from '../config';
import { AssetFilter, JobsFilter } from '../data.model';
import { EventsPage } from '../events/events.page';
import { JobListPage } from '../job-list/job-list.page';
import { PendingListPage } from '../pending-list/pending-list.page';
import { RequestListPage } from '../request-list/request-list.page';
import { SearchPage } from '../search/search.page';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Device } from '@ionic-native/device/ngx';
import Chart from 'chart.js/auto';
import { OfflineProvider } from 'src/providers/offline/offline';
import { MenuController } from '@ionic/angular';
import * as forge from 'node-forge';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
declare var cordova;
declare var google: any;


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  @ViewChild('pendingChartWrk') private pendingChartWrk: ElementRef;
  @ViewChild('pendingChartPrv') private pendingChartPrv: ElementRef;
  myRequests: number = 0;
  pendings: number = 0;
  jobs: number = 0;
  workReq: number = 0;
  loopCount: number = 1;
  drafts: number = 0;
  userName: any;
  profile: any;
  logoSrc: any;
  pageConfig: any = [];
  userList: any;
  position: any = [1, 2, 3, 4, 5, 6];
  homeScreen: any = 'default';
  searchParam: any;
  machineCount: number = 0;
  machineList: any = [];
  viewType: any;
  workflow: any;
  msgCount: number = 0;
  respJson: any;
  segment: string;
  hrefUrl: any;
  states: any;
  assetList: any;
  totalCount: any;
  jobsFilter: JobsFilter;
  currentlocation: any = {};
  lastTimeTracking: any;
  timeDiff: number;
  allowLocationTracker: boolean;
  cutOutSize: number = 0;
  width: number = 0;
  requestType: string = 'workOrder';
  scheduleReq: number = 0;
  overDueCount: number = 0;
  wipcount: number = 0;
  workoverDueCount: number = 0;
  workWipCount: number = 0;
  pendingCount: number = 0;
  workPendingCount: number = 0;
  scheduleoverDueCount: number = 0;
  scheduleWipCount: number = 0;
  schedulePendingCount: number = 0;
  url: any;
  Url: any;
  loader: boolean;
  assetFilter: AssetFilter;
  offlineShown: boolean;
  onLine: boolean;
  imgId: any;
  workOrderCount: number = 0;
  wrkWipPerc: number = 0;
  wrkPendingPerc: number = 0;
  wrkOverduePerc: number = 0;
  workOrderPerc: number[];
  prvWipPerc: number = 0;
  prvPendingPerc: number = 0;
  prvCount: number = 0;
  prvOverduePerc: number = 0;
  schedulePerc: number[];
  wipPercentage: number = 0;
  pendingPercentage: number = 0;
  overDuePercentage: number = 0;
  DoughnutChartwrk: Chart<"doughnut", number[], string>;
  DoughnutChartPrv: Chart<"doughnut", number[], string>;
  prvNewCount: number;
  backDropDismiss:boolean = false;
  requestCount: any;
  userData: any;
  toggleShown: boolean = false;
  publicKey: any;
  privateKey: any;
  userDatas: any;
  confirmReset: boolean;
  fingerPrintAIO: boolean;

  constructor(
    public router: Router,
    public common: CommonProvider,
    private events: Events,
    private reqService: ServiceProvider,
    private firestore: AngularFirestore,
    private platform: Platform,
    public fba: FirebaseAnalytics,
    public route: ActivatedRoute,
    public storage: NativeStorage,
    private geolocation: Geolocation,
    private device: Device,
    private offline: OfflineProvider,
    private menu: MenuController,
    private alertCtrl: AlertController,
    private faio: FingerprintAIO,
  ) {
    this.scheduleReq = 0;
    this.overDueCount = 0;
    this.wipcount = 0;
    this.workoverDueCount = 0;
    this.workWipCount = 0;
    this.pendingCount = 0;
    this.workPendingCount = 0;
    this.scheduleoverDueCount = 0;
    this.scheduleWipCount = 0;
    this.schedulePendingCount = 0;
    this.overDuePercentage = 0;
    this.wipPercentage = 0;
    this.pendingPercentage = 0;
    this.pendings = 0;
    this.workReq = 0;
    this.scheduleReq = 0;
    this.onLine = navigator.onLine;
    this.drafts = 0;
  }

  ngOnInit() {
    this.jobsFilter = new JobsFilter();
    this.assetFilter = new AssetFilter();
    this.scheduleReq = 0;
    this.overDueCount = 0;
    this.wipcount = 0;
    this.workoverDueCount = 0;
    this.workWipCount = 0;
    this.pendingCount = 0;
    this.workPendingCount = 0;
    this.scheduleoverDueCount = 0;
    this.scheduleWipCount = 0;
    this.schedulePendingCount = 0;
    this.overDuePercentage = 0;
    this.wipPercentage = 0;
    this.pendingPercentage = 0;
    this.pendings = 0;
    this.workReq = 0;
    this.scheduleReq = 0;
    this.onLine = navigator.onLine;
    this.drafts = 0;
    console.log("get Device info", this.common.getdeviceInfo());
    this.workflow = this.common.getWorkFlowType();
    this.viewType = this.common.getViewType();
    //If user clear notification
    this.events.subscribe('notification:clear', (data: any) => {
      if (data.status == 'all') {
        window.localStorage.setItem(Config.constants.msgNotificationJson, JSON.stringify([]));
        this.msgCount = 0;
      } else if (data.status > 0) {
        this.msgCount = data.status;
      } else {
        this.msgCount = 0;
      }
    });
    let profile = JSON.parse(window.localStorage.getItem('Profile'));
    this.common.viewType = profile.uicustomized ? 'location' : 'user';
    this.viewType = this.common.viewType;
    this.workflow = profile.workflowType == 'asset' ? 'asset' : 'facility';
    let drafts = JSON.parse(window.localStorage.getItem(Config.constants.draftNewReqs));
    if (null != drafts) {
      this.drafts = drafts.length;
    }
  }
  getJobResource() {
    let profile = JSON.parse(window.localStorage.getItem('Profile'));
    this.jobsFilter.userIds = [profile.id]
    let options = {
      page: 0,
      size: 50
    }
    this.reqService.jobResource(options, this.jobsFilter).subscribe(
      (res: HttpResponse<any>) => this.onSuccess(res.body, res.headers),
      (res: HttpErrorResponse) => this.onError(res.message)
    )
  }
  onError(message: string): void {
    console.error(message)
  }
  onSuccess(body: any, headers: HttpHeaders): void {
    this.totalCount = headers.get('X-Total-Count');
    this.jobs = this.totalCount;
  }
  getPendingCollection(profile) {
    try {
      let pendingCollectionRef = this.firestore
        .collection('organization')
        .doc(profile.tenantId)
        .collection(this.common.viewType)
        .doc(this.searchParam)
        .collection('pendingAction', (ref) => ref.orderBy('id', 'desc'));
      pendingCollectionRef.valueChanges().subscribe((res) => {
        this.pendings = res?.length >= 1 ? res?.length : 0;;
        localStorage.setItem('pending', this.pendings + '');
        this.common.pendingList = res;
        this.common.pendigCount = this.pendings;
      });
    } catch (error) {
      this.pendings = 0;
      console.log('Error in Pendings==>' + error);
    }
    let workReqCollectionRef = this.firestore
      .collection('organization')
      .doc(profile.tenantId)
      .collection(this.common.viewType)
      .doc(this.searchParam)
      .collection('pendingAction', (ref) =>
        ref.where('requestType', '==', 'WORK_REQUEST').orderBy('id', 'desc')
      );
    workReqCollectionRef.valueChanges().subscribe((res) => {
      this.workReq = res?.length >= 1 ? res?.length : 0;
    },async(err)=>{
      this.workReq = 0;
    });
    let scheduleCollectionRef = this.firestore
      .collection('organization')
      .doc(profile.tenantId)
      .collection(this.common.viewType)
      .doc(this.searchParam)
      .collection('pendingAction', (ref) =>
        ref.where('requestType', '==', 'SCHEDULE_REQUEST').orderBy('id', 'desc')
      );
    scheduleCollectionRef.valueChanges().subscribe((res) => {
      this.scheduleReq = res?.length >= 1 ? res?.length : 0;
    },async(err)=>{
      this.scheduleReq = 0;
  });
    if (this.common.viewType === 'location') {
      let workReqCollectionRef = this.firestore
        .collection('organization')
        .doc(profile.tenantId)
        .collection(this.common.viewType)
        .doc(this.searchParam)
        .collection('pendingAction', (ref) =>
          ref.where('requestType', '==', 'WORK_REQUEST').orderBy('id', 'desc')
        );
      workReqCollectionRef.valueChanges().subscribe((res) => {
        this.workReq = res.length;
      });
    }
  }
  getMyRequestCollection(profile) {
    console.log(` this.myRequests count starting from ${this.myRequests}`);
    try {
      let myRequestCollectionRef = this.firestore
        .collection('organization')
        .doc(profile.tenantId)
        .collection(this.common.viewType)
        .doc(this.searchParam)
        .collection('myRequest', (ref) => ref.orderBy('id', 'desc'));
      myRequestCollectionRef.valueChanges().subscribe((res) => {
        this.myRequests = res.length;
        localStorage.setItem('myRequests', this.myRequests + '');
        this.common.requestCount = this.myRequests;
        this.events.publish('offlineSubmit');
      });
    } catch (error) {
      console.log('Error in Myrequest==>' + error);
    }
  }
  getTagCollection(profile) {
    try {
      let tagsCollectionRef = this.firestore
        .collection('organization')
        .doc(profile.tenantId)
        .collection('tag', (ref) => ref.orderBy('id', 'asc'));
      tagsCollectionRef.valueChanges().subscribe((res) => {
        this.common.tagList = res;
      });
    } catch (error) {
      console.log('Error in Tags==>' + error);
    }
  }
  async getFireStoreData(profile) {
    try {
      this.getMyRequestCollection(profile);
      this.getJobResource();
      // this.getPendingCollection(profile);
      // this.getPendingCount(profile)
    } catch (error) {
      console.log('Error in Home==>' + error);
    }
  }
  getPendingCount(profile: any) {
    let currentDate = this.common.getUTCTime();
    let workReqCollectionRef = this.firestore
      .collection('organization')
      .doc(profile.tenantId)
      .collection(this.common.viewType)
      .doc(this.searchParam)
      .collection('pendingAction', (ref) =>
        ref
          .where('requestType', '==', 'WORK_REQUEST')
          .where('requestStatus', '==', 'WIP')
      );
    workReqCollectionRef.valueChanges().subscribe((res) => {
      this.workWipCount = this.common.getOnlyNotOverDueData(res)?.length;
    }, async (err) => {
      console.log(err)
    });
    let workReqPendingCollectionRef = this.firestore
      .collection('organization')
      .doc(profile.tenantId)
      .collection(this.common.viewType)
      .doc(this.searchParam)
      .collection('pendingAction', (ref) =>
        ref
          .where('requestType', '==', 'WORK_REQUEST')
          .where('requestStatus', '==', 'Pending')
      );
    workReqPendingCollectionRef.valueChanges().subscribe((res) => {
      this.workPendingCount = res.length;
    }, async (err) => {
      console.log(err)
    })
    let workReqDueCollectionRef = this.firestore
      .collection('organization')
      .doc(profile.tenantId)
      .collection(this.common.viewType)
      .doc(this.searchParam)
      .collection('pendingAction', (ref) =>
        ref
          .where('requestType', '==', 'WORK_REQUEST')
          .where('requestExpectedEndDate', '<', currentDate)
      );
    workReqDueCollectionRef.valueChanges().subscribe((res) => {
      this.workoverDueCount = this.common.getOverdueNotPending(res).length;

    }, async (err) => {
      console.log(err)
    })
    let prevReqCollectionRef = this.firestore
      .collection('organization')
      .doc(profile.tenantId)
      .collection(this.common.viewType)
      .doc(this.searchParam)
      .collection('pendingAction', (ref) =>
        ref
          .where('requestType', '==', 'SCHEDULE_REQUEST')
          .where('requestStatus', '==', 'New')
      );
    prevReqCollectionRef.valueChanges().subscribe((res) => {
      this.prvNewCount = this.common.getOnlyNotOverDueData(res)?.length;;
    }, async (err) => {
      console.log(err)
    });
    let prevReqCollectionRef1 = this.firestore
    .collection('organization')
    .doc(profile.tenantId)
    .collection(this.common.viewType)
    .doc(this.searchParam)
    .collection('pendingAction', (ref) =>
      ref
        .where('requestType', '==', 'SCHEDULE_REQUEST')
        .where('requestStatus', '==','WIP')
    );
  prevReqCollectionRef1.valueChanges().subscribe((response) => {
    this.scheduleWipCount = this.prvNewCount + this.common.getOnlyNotOverDueData(response)?.length;;
  },async(err)=>{
    this.scheduleWipCount = this.prvNewCount;
  })
    let PendingCollectionRef = this.firestore
      .collection('organization')
      .doc(profile.tenantId)
      .collection(this.common.viewType)
      .doc(this.searchParam)
      .collection('pendingAction', (ref) =>
        ref
          .where('requestType', '==', 'SCHEDULE_REQUEST')
          .where('requestStatus', '==', 'Pending')
      );
    PendingCollectionRef.valueChanges().subscribe((res) => {
      this.schedulePendingCount = res.length;
    }, async (err) => {
      console.log(err)
    })
    let prevReqDueCollectionRef = this.firestore
      .collection('organization')
      .doc(profile.tenantId)
      .collection(this.common.viewType)
      .doc(this.searchParam)
      .collection('pendingAction', (ref) =>
        ref
          .where('requestType', '==', 'SCHEDULE_REQUEST')
          .where('requestExpectedEndDate', '<', currentDate)
      );
    prevReqDueCollectionRef.valueChanges().subscribe((res) => {
      this.scheduleoverDueCount = this.common.getOverdueNotPending(res).length;
      setTimeout(() => {
        setTimeout(() => {
          this.barChartRequestCount();  
        }, 1000);
      }, 500);
    }, async (err) => {
      setTimeout(() => {
        this.getPercentageCount();
        this.segmentChanged('','workOrder')
        setTimeout(() => {
          this.barChartRequestCount();  
        }, 1000);
      }, 500);
      console.log(err)
    })

  }
  getPercentageCount() {
    this.workOrderCount =  this.workWipCount+this.workPendingCount +this.workoverDueCount;
    this.prvCount = this.scheduleWipCount+this.schedulePendingCount+this.scheduleoverDueCount;
    this.wrkWipPerc = this.workWipCount != null ? Math.round((this.workWipCount / this.workOrderCount) * 100) : 0;
    this.wrkPendingPerc = this.workPendingCount != null ? Math.round((this.workPendingCount / this.workOrderCount) * 100) : 0;
    this.wrkOverduePerc = this.workoverDueCount  != null ? Math.round(( this.workoverDueCount / this.workOrderCount) * 100) : 0;
    this.prvWipPerc = this.scheduleWipCount != null ?Math.round((this.scheduleWipCount / this.prvCount) * 100) : 0;
    this.prvPendingPerc = this.schedulePendingCount  != null ?Math.round((this.schedulePendingCount / this.prvCount) * 100) : 0;
    this.prvOverduePerc = this.scheduleoverDueCount != null ? Math.round((this.scheduleoverDueCount / this.prvCount) * 100) : 0;
  }
  ionViewDidEnter() {
    let fingerPrintAIO = window.localStorage.getItem('fingerPrintAIO');
    let profile = JSON.parse(window.localStorage.getItem('Profile'));
    let localPublicKey = window.localStorage.getItem('publicKey');
    this.reqService.getUser(profile.id).subscribe(async (res) => {
      if (res && res.publicKey && (res.privateKey == '' || res.privateKey == null) && (localPublicKey != res.publicKey)) { 
       this.toggleShown = false;
      }
      else if (fingerPrintAIO === 'true' && (localPublicKey == res.publicKey)) {
        this.fingerPrintAIO = true;
        this.toggleShown = true;
        }
    })
    this.idleFunc();
    this.reqService.getUserInfo().subscribe((res) => {
      console.log('user Info :', res)
      window.localStorage.setItem("userInfo", JSON.stringify(res));
      this.imgId = res?.s3ImageId;
      if (res.isMultiOrg) {
        this.reqService.refreshJWTToken()
          .then(
            res => {
              if (res && (res.id_token != null && res.id_token != '' && res.id_token != undefined)) {
                localStorage.setItem('auth-token', 'Bearer ' + res.id_token);
              } else {
                this.common.alertToast(this.reqService.translatedata('sessionExpired'));
                this.common.clearStroage();
              }
            }
          ).catch(err => {
            if (err && err.status) {
              this.common.alertToast(this.reqService.translatedata('sessionExpired'));
              this.common.clearStroage();
              // this.logoutUser();
            }
          })
      }
    }, async (err) => {
      let userInfo = JSON.parse(window.localStorage.getItem('userInfo'));
      if (userInfo.isMultiOrg) {
        if (err.status == 0 && err.statusText === 'Unknown Error') {
          this.common.alertToast(this.reqService.translatedata('sessionExpired'));
          this.common.clearStroage();
        }
      }
      console.log(err);
    })
    this.storage.getItem("userProfile").then((info) => {
      let profile = JSON.parse(info);
      this.profile = profile;
    });
    console.log(` this.myRequests count starting from ionViewDidEnter ${this.myRequests}`);
    if (this.platform.is('cordova')) {
      let foo = this
      let bool = true;
      foo.fba.setEnabled(bool);
    }
    try {
      let stateCollectionRef = this.firestore
        .collection("organization")
        .doc(this.profile.tenantId)
        .collection("location_state");
      stateCollectionRef.valueChanges().subscribe((res) => {
        this.states = res;
        this.storage.setItem("location_state", res);
      });
    } catch (e) {
      console.log("Company Error==>" + e);
    }

  }
  public async ionViewWillEnter() {
    this.getAccount();
    this.route.queryParams.subscribe((params)=>{
      if(params && params.type == 'offline') {
        this.router.navigate(['home'],{replaceUrl:true});
      }
    })
    let uuid = JSON.parse(window.localStorage.getItem('UniqueId'));
    // this.toggleShown = (uuid == '' || uuid == undefined || uuid == null) ? false  : true;
    this.menu.close();
    this.getrequestCount('SCHEDULE_REQUEST');
    this.getrequestCount('WORK_REQUEST');
    // let locData = JSON.parse(window.localStorage.getItem(Config.constants.routeDraftRequest));
    let locData:any = await this.common.getStorageValue(Config.constants.routeDraftRequest);
    if (locData && locData?.length && navigator.onLine) {
      this.offlineShown = true;
    }
    this.segment = "home";
    this.myRequests = 0;
    this.drafts = 0;
    var date = new Date();
    this.lastTimeTracking = JSON.parse(window.localStorage.getItem('previousTime'));
    window.localStorage.setItem('previousTime', JSON.stringify(date));
    this.timeDiff = this.diffHours(this.lastTimeTracking, date);
    console.log('time fiff : ', this.timeDiff)
    if (this.lastTimeTracking == null || this.timeDiff >= 1) {
      if (this.lastTimeTracking == null && !this.allowLocationTracker) {
        this.LocationTracker();
      }
      setInterval(() => {
        this.allowLocationTracker = true;
        this.LocationTracker();
      }, 1000 * 60 * 60)
      // 300000
      // 3600000
    }

    console.log(` this.myRequests count starting from ionViewWillEnter ${this.myRequests}`);
    this.events.subscribe('reqCount', (data: any) => {
      this.pendings = data.reqType == 'pendings' ? data.count : this.pendings;
      this.myRequests =
        data.reqType == 'myRequests' ? data.count : this.myRequests;
    });
    this.reqService.getOrganizationLogo().then((src) => {
      this.logoSrc = src;
    });
    this.homeScreen = 'default';
    this.reqService.getAuthHeaders();
    this.common.viewType = this.common.getViewType()
      ? this.common.getViewType()
      : 'user';
    let userData = JSON.parse(window.localStorage.getItem('Profile'));
    this.profile = {};
    let profile = userData;
    this.profile = profile;
    if (this.profile && this.profile.tenantId) {
      this.homeScreen = this.profile.uicustomized ? 'custom' : 'default';
      this.homeScreen =
        !this.profile.uicustomized && this.profile.mobileUITemplateId
          ? 'dynamic'
          : this.homeScreen;
      this.common.viewType = this.profile.uicustomized ? 'location' : 'user';
      this.common.setViewType(this.common.viewType);
      this.searchParam = JSON.stringify(profile.id);
      this.userName = this.profile.firstName;
      // this.common.dynamicLoading();
      if (this.homeScreen == 'default') {
        this.getFireStoreData(profile);
      } else {
        if (profile.mobileUITemplateId) {
          let userListCollectionRef = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection('mobile_ui', (ref) =>
              ref.where('templateId', '==', profile.mobileUITemplateId)
            );
          userListCollectionRef.valueChanges().subscribe((res) => {
            if (res && res.length) {
              let menu: any;
              menu = res ? res[0] : {};
              let list = [];
              list = menu.homeTile ? JSON.parse(menu.homeTile) : menu.tile;
              this.common.appRights = menu.appRights
                ? menu.appRights
                : 'write';
              this.pageConfig = [];
              if (this.homeScreen && this.homeScreen != 'default') {
                this.position.forEach((index) => {
                  list.forEach((tile) => {
                    if (tile.active && tile.position == index)
                      this.pageConfig.push(tile);
                  });
                });
              } else {
                this.homeScreen = 'default';
              }
              if (this.common.getViewType() == 'user') {
                this.searchParam = JSON.stringify(profile.id);
              } else if (this.common.getViewType() == 'location') {
                this.searchParam = this.common.getLocationId();
              } else {
                this.searchParam = 'user';
              }
              this.getFireStoreData(profile);
            } else {
              this.homeScreen = 'default';
              this.getFireStoreData(profile);
            }
          });
        } else {
          this.logoutUser();
        }
      }
    } else {
      this.logoutUser();
    }

    this.events.subscribe('offlineSubmit', () => {
      this.drafts = 0;
      let drafts = JSON.parse(window.localStorage.getItem(Config.constants.draftNewReqs));
      if (null != drafts) {
        this.drafts = drafts.length;
      }
    });
    this.common.viewType = this.common.getViewType()
      ? this.common.getViewType()
      : 'user';
    this.logoSrc = this.common.logo;
    console.log("home page in ionViewWillEnter");
    this.events.publish('offlineSubmit');
  }
  getAccount() {
    window.localStorage.setItem('account',JSON.stringify(null));
    this.reqService.getAccount().subscribe((res) => {
      window.localStorage.setItem('account', JSON.stringify(res));
     });
  }
  getTagId(tagName) {
    let tagId;
    if (this.common.tagList.length) {
      this.common.tagList.forEach((tag) => {
        if (tag.name.toLowerCase() === tagName) {
          tagId = tag.id;
        }
      });
    }
    return tagId;
  }
  getLocationName() {
    let locationName;
    this.common.locationList.forEach((location) => {
      if (this.common.getLocationId() == location.id) {
        locationName = location.name;
      }
    });
    return locationName;
  }
  logoutUser() {
    // this.common.displayLoading();
    if (navigator.onLine) {
      this.common.logClickEvent('user_logout_btn_click', 'User Logout');
      this.events.publish('user-logout', { time: Date.now() });
    } else {
      this.common.displayLoading();
      this.offlineLogoutAlert();
      setTimeout(() => {
        this.common.stopLoading();
      }, 200)
    }

    // 
  }

  async offlineLogoutAlert() {
    let alert = await this.alertCtrl.create({
      header: this.reqService.translatedata('logout'),
      subHeader: this.reqService.translatedata("Thank you for working with us. Do you wish to logout?"),
      buttons: [
        {
          text: this.reqService.translatedata('cancel'),
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: this.reqService.translatedata('logout'),
          handler: () => {
            this.common.clearStroage();
          }
        }
      ]
    });
    await alert.present();
  }

  pendingList(type?, filter?) {
    this.common.logClickEvent('pending_list_card_click', 'Pendinglist Page');
    let navigationExtras: NavigationExtras = {
      queryParams: {
        type: type,
        filter: filter,
        request: this.requestType,
        tittle: this.requestType == 'workOrder' ? 'WorkOrder' : 'Schedule'
      }, replaceUrl: true
    };
    this.router.navigate(['/pending-list'], navigationExtras);
  }
  requestList() {
    this.common.logClickEvent('myrequest_list_card_click', 'My Request Page');
    this.router.navigate(['/request-list'], { replaceUrl: true });
  }
  newRequest() {
    this.common.logClickEvent(
      'create_request_card_click',
      'Create Request Page'
    );
    let navigationExtras: NavigationExtras = {
      queryParams: { isWorkRequest: JSON.stringify(false) },replaceUrl:true
    };
    this.router.navigate(['/search'], navigationExtras);
  }
  jobList() {
    this.common.logClickEvent('job_list_card_click', 'JobList Page');
    this.router.navigate(['/job-list'],{replaceUrl:true});
  }
  viewCalendar() {
    this.common.logClickEvent('calendar_list_card_click', 'Calendar Page');
    this.router.navigate(['/events']);
  }
  viewMaterial() {
  }
  getPage(page) {
    let navPage;
    switch (page) {
      case 'RequestListPage':
        navPage = RequestListPage;
        break;
      case 'JobListPage':
        navPage = JobListPage;
        break;
      case 'PendingListPage':
        navPage = PendingListPage;
        break;
      case 'EventsPage':
        navPage = EventsPage;
        break;
      case 'SearchPage':
        navPage = SearchPage;
        break;
      default:
        navPage = RequestListPage;
        break;
    }
    return navPage;
  }
  getCount(page, tile) {
    let count;
    switch (page) {
      case 'myRequest':
        count = this.myRequests + this.drafts;
        break;
      case 'myJobs':
        count = this.jobs;
        break;
      case 'work':
        count = this.workReq;
        break;
      case 'machine':
        let machineCount = 0;
        if (this.machineList && this.machineList.length) {
          this.machineList.forEach((element) => {
            if (tile.authorize) {
              if (element.routeName == 'Authorization') {
                machineCount++;
              }
            } else if (element.routeName != 'Authorization') {
              machineCount++;
            }
          });
        }
        count = machineCount;
        break;
      default:
        count = 0;
        break;
    }
    return count;
  }
  gotoMsg() {
  }
  validateLoading(count) {
    if (this.loopCount <= 0) {
      // this.common.stopDynamicLoading();
    }
  }
  home() {
    this.router.navigate(['home']);
  }
  workRequestList() {
    this.router.navigate(['work-request-list']);
  }
  settings() {
    this.router.navigate(['settings'], {replaceUrl:true});
  }
  getNotification() {
    let storageParam = Config.constants.msgNotificationJson;
    this.reqService.getMsgNotification().subscribe(response => {
      if (null != response && response.length > 0) {
        this.respJson = response;
        window.localStorage.setItem("storageParam", JSON.stringify(response));
      }
      if (this.respJson) {
        this.msgCount = response.length;
      }
    }, error => {
      this.msgCount = 0;
      if (error.status == 401) {
        this.events.publish("user:inactive", error.status);
      }
      this.respJson = JSON.parse(window.localStorage.getItem("storageParam"));
    });
  }
  LocationTracker(userData?) {
    let profile = JSON.parse(window.localStorage.getItem("Profile"));
    this.geolocation
      .getCurrentPosition({
        timeout: 20000,
        enableHighAccuracy: true,
      })
      .then((resp) => {
        this.currentlocation = {
          lat: resp.coords.latitude,
          lng: resp.coords.longitude,
        };
        console.log(JSON.stringify(this.currentlocation));
        let track = {
          latitude: this.currentlocation.lat,
          longitude: this.currentlocation.lng,
          uuid: this.device.uuid,
          userId:profile.id,
          active: true
        }
        console.log("track", track);
        this.reqService.locationTracking(track).subscribe(res => {
          // alert('location tracked successfully')
          console.log(res);
        },async(err)=>alert('location tracking failed'))
      })
      .catch((error) => {
        // alert('unable to accesslocation')
        console.log(error + " ---catch error in get userloaction---");
        this.common.alertToast(
          this.reqService.translatedata('locationDetectError')
        );
      });
  }
  diffHours(dt2, dt1) {
    var date1 = new Date(dt1);
    var date2 = new Date(dt2)
    var diff = (date2.getTime() - date1.getTime()) / 1000;
    diff /= (60 * 60); //hours
    // diff /= 60; //minutes
    return Math.abs(Math.round(diff));
  }
  barChartRequestCount() {
    this.loader = true;
    var w = window.innerWidth;
    var h = window.innerHeight;
  
    console.log("width: " + w, "height: " + h);
    this.width = w;
    this.cutOutSize = w >= 768 ? 70 : 40;
    if(this.pendingChartWrk != undefined) {
      this.DoughnutChartwrk = new Chart(this.pendingChartWrk.nativeElement, {
        type: 'doughnut',
        data: {
          // labels: ['WIP', 'Pendind with Reason','Overdue'],
          datasets: [
            {
              label: 'WorkOrder Count',
              data:[
                this.wrkWipPerc,
                this.wrkPendingPerc,
                this.wrkOverduePerc,
              ],
              backgroundColor: [
                '#21B1E4',
                '#FF8A31',
                '#EF717F',
                'rgba(75, 192, 192, 1)',
                'rgba(54, 162, 235, 1)',
              ],
              borderColor: [
                '#21B1E4',
                '#FF8A31',
                '#EF717F',
                'rgba(75, 192, 192, 1)',
                'rgba(54, 162, 235, 1)',
              ],
            },
          ],
        },
        options: {
          cutout: this.cutOutSize,
          plugins: {
            legend: {
              display: false,
            },
          },
          animations: {
            tension: {
              duration: 1000,
              easing: 'easeOutCirc',
              from: 1,
              to: 0,
              loop: true,
            },
          },
        },
      });
      this.barChartPrv();
    }else {
      let profile = JSON.parse(window.localStorage.getItem('Profile'))
      this.getFireStoreData(profile);
    }
    
  }
  barChartPrv() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    
    console.log("width: " + w, "height: " + h);
    this.width = w;
    this.cutOutSize = w >= 768 ? 70 : 40;
    this.DoughnutChartPrv = new Chart(this.pendingChartPrv.nativeElement, {
      type: 'doughnut',
      data: {
        // labels: ['WIP', 'Pendind with Reason','Overdue'],
        datasets: [
          {
            label: 'Preventive Count',
            data:[
               this.prvWipPerc,
               this.prvPendingPerc,
               this.prvOverduePerc,
            ],
            backgroundColor: [
              '#21B1E4',
              '#FF8A31',
              '#EF717F',
              'rgba(75, 192, 192, 1)',
              'rgba(54, 162, 235, 1)',
            ],
            borderColor: [
              '#21B1E4',
              '#FF8A31',
              '#EF717F',
              'rgba(75, 192, 192, 1)',
              'rgba(54, 162, 235, 1)',
            ],
          },
        ],
      },
      options: {
        cutout: this.cutOutSize,
        plugins: {
          legend: {
            display: false,
          },
        },
        animations: {
          tension: {
            duration: 1000,
            easing: 'easeOutCirc',
            from: 1,
            to: 0,
            loop: true,
          },
        },
      },
    });
  }
  segmentChanged(ev, type) {
    this.backDropDismiss = true;
    this.requestType = type != '' ? type : ev.target.value;
    if (this.requestType == 'workOrder') {
      this.overDueCount = this.workoverDueCount;
      this.wipcount = this.workWipCount;
      this.pendingCount = this.workPendingCount;
      this.wipPercentage = this.wrkWipPerc;
      this.pendingPercentage = this.wrkPendingPerc;
      this.overDuePercentage = this.wrkOverduePerc;
      this.backDropDismiss = false;
    } else {
      this.overDueCount = this.scheduleoverDueCount;
      this.wipcount = this.scheduleWipCount;
      this.pendingCount = this.schedulePendingCount;
      this.wipPercentage = this.prvWipPerc;
      this.pendingPercentage = this.prvPendingPerc;
      this.overDuePercentage = this.prvOverduePerc;
      this.backDropDismiss = false;
    }
  }
  gotoAbout() {
    this.router.navigate(['about'],{replaceUrl:true});
  }
  contactUS() {
    window.location.href = 'https://www.cryotos.com/helpcenter'
  }
  idleFunc() {
  }
  offlineSync() {
    this.offline.prepareOfflineSubmission();
  }
  getrequestCount(type) {
    let userProfile = JSON.parse(window.localStorage.getItem('Profile'));
    let today = new Date().toISOString().split('T')[0];
    console.log(today);
    let data = {
      fromDate:"2018-01-01",
      holdById:userProfile.id,
      requestType:type,
      toDate:today,
    }
    this.reqService.getPendingCount(data).subscribe((res)=>{
      this.requestCount = res.body;
      console.log(this.requestCount.wip)
      if(type == 'WORK_REQUEST') {
        this.workReq = this.workOrderCount = this.requestCount.total - (this.requestCount.closed + this.requestCount.rejected);;
        this.workWipCount  = this.requestCount.wip != null ? this.requestCount.wip : 0;
        this.workPendingCount = this.requestCount.pending != null ? this.requestCount.pending: 0;
        this.workoverDueCount = this.requestCount.slaBreached != null ? this.requestCount.slaBreached :0;
        this.pendings = this.workReq + this.scheduleReq;
      }else if(type == 'SCHEDULE_REQUEST') {
        this.scheduleReq = this.prvCount = this.requestCount.total - (this.requestCount.closed + this.requestCount.rejected);
        this.scheduleWipCount  = this.requestCount.wip != null ? this.requestCount.wip : 0;
        this.schedulePendingCount = this.requestCount.pending != null ? this.requestCount.pending: 0;
        this.scheduleoverDueCount = this.requestCount.slaBreached != null ? this.requestCount.slaBreached :0;
      }
      this.pendings = this.workReq + this.scheduleReq;
      let tab = type == 'WORK_REQUEST' ? 'workOrder' : 'preventive';
      setTimeout(() => {
        this.getPercentageCount();
        this.segmentChanged('','workOrder');
        this.barChartRequestCount();
      }, 100);
      let offlineData = {
        workReq:this.workReq,
        workWipCount:this.workWipCount,
        workPendingCount:this.workPendingCount,
        workoverDueCount:this.workoverDueCount,
        scheduleReq:this.scheduleReq,
        scheduleWipCount:this.scheduleWipCount,
        schedulePendingCount:this.schedulePendingCount,
        scheduleoverDueCount:this.scheduleoverDueCount,
        pendings:this.pendings
      }
      window.localStorage.setItem('offlinePendingData', JSON.stringify(offlineData));
    },async(err)=>{
      this.loader = true;
      if(!navigator.onLine) {
        let PendingData = JSON.parse(window.localStorage.getItem('offlinePendingData'));
        this.workReq = PendingData.workReq;
        this.workWipCount = PendingData.workWipCount;
        this.workPendingCount = PendingData.workPendingCount;
        this.workoverDueCount = PendingData.workoverDueCount;
        this.scheduleReq = PendingData.scheduleReq;
        this.scheduleWipCount = PendingData.scheduleWipCount;
        this.schedulePendingCount = PendingData.schedulePendingCount;
        this.scheduleoverDueCount = PendingData.scheduleoverDueCount;
        this.pendings = PendingData.pendings;
        setTimeout(() => {
          this.getPercentageCount();
          this.segmentChanged('','workOrder');
          this.barChartRequestCount();
        }, 100);
      }
      this.pendings = this.workReq + this.scheduleReq;
      console.log(err)
    })
  }
  updateUuid(ev,shown) {
    this.confirmReset = false;
    let fingerPrintAIO = window.localStorage.getItem('fingerPrintAIO');
    let signedMessage = window.localStorage.getItem('signedMessage');
    if (fingerPrintAIO === 'true' && (signedMessage == '' || signedMessage == null || signedMessage == 'null' || signedMessage == undefined)) {
      this.fingerPrintAIO = true;
      // this.common.alertToast('Biometric already enabled for this account');
      return;
    }
    console.log(this.toggleShown)
    let userData = JSON.parse(window.localStorage.getItem('Profile'));
    if(!shown) {
      let id = userData && userData.id ? userData.id : null;
      if (id) {
      this.reqService.getUser(id).subscribe(async (res) => {
        console.log('update Response', res);
        this.userDatas = res;
        this.userDatas.uuid =  this.device.uuid;
      if (this.userDatas && this.userDatas.publicKey && (this.userDatas.privateKey == '' || this.userDatas.privateKey == null)) { 
        this.resetBiometric(this.userDatas);
      }
      if (!this.confirmReset) {
      this.userDatas.isGenerateAsymmetricKey = true;
      this.userDatas.uuid =  this.device.uuid;
      this.userDatas.deviceName = await this.common.getdeviceInfo();
      this.reqService.updateUser(this.userDatas).subscribe((res)=>{
        console.log('update Response', res);
        this.fingerPrintAIO = true;
        if(this.fingerPrintAIO == true) {
          let data = 'true';
          window.localStorage.setItem('fingerPrintAIO', data);
        }
        this.publicKey = res && res.publicKey ? res.publicKey : null;
        this.privateKey = res && res.privateKey ? res.privateKey : null;
        window.localStorage.setItem('publicKey', this.publicKey);
        if (this.privateKey) {
          let base64 = this.privateKey;
          const privateKey = this.setPrivateKey((base64)); 
          const messageLength = 6;
          // Generate a random message using the Forge library
          const messageBytes = forge.random.getBytesSync(messageLength);
          const randomMessage = forge.util.bytesToHex(messageBytes); 
          // const randomMessage = 'Success';
          window.localStorage.setItem('randomMessage', randomMessage);
          let signedMessage = this.signMessage(randomMessage,privateKey);
          console.log('signedMessage', signedMessage);
          window.localStorage.setItem('signedMessage', signedMessage);
        }
        this.toggleShown = this.publicKey ? true  : false;
        this.common.alertToast('Biometric Enabled Successfully');
        console.log(res);
      },async(err)=>{      
        this.common.alertToast('Biometric Disabled ');
        this.updateUser(userData, 'disable');
        let data = 'false'
        window.localStorage.setItem('fingerPrintAIO', data);
        console.log(err);
      })
    }
      })
      }
    }else {
      window.localStorage.setItem('signedMessage', null);
      this.updateUser(userData, 'disable')
      let data = 'false'
      window.localStorage.setItem('fingerPrintAIO', data);
      this.common.alertToast('Biometric Disabled');
    }
  }

  setPrivateKey(privateKeyStr: string) {
    // var forge = require('node-forge');
    const privateKeyBytes = forge.util.decode64(privateKeyStr);
    // Convert to ASN.1 object
    const privateKeyAsn1 = forge.asn1.fromDer(privateKeyBytes);
    // Convert to private key object
    const privateKey = forge.pki.privateKeyFromAsn1(privateKeyAsn1);
    return privateKey;
  }

  signMessage(message: string, privateKey): string {
    const md = forge.md.sha256.create();
    md.update(message, 'utf8');
    const signature = privateKey.sign(md);
    console.log('signature:  ',forge.util.encode64(signature));
    return forge.util.encode64(signature);
  }

  async resetBiometric(response) {
    this.confirmReset = true;
    let msg =
    response.privateKey === ""
        ? "Biometric authentication is already activated for this account on another device!! Do you want to reset it?"
        : "Biometric authentication is already activated for this account on another device!! Do you want to reset it?";
    let alert =  await this.alertCtrl.create({
      header: 'Confirm Biometric',
      message: '<div><span class="alert-text">' + msg + "</span></div>",
      cssClass: "custom-alert",
      backdropDismiss : false,
      buttons: [
        {
          text: this.reqService.translatedata("Cancel"),
          role: "Cancel",
          handler: () => {
            this.backDropDismiss = false;
            this.toggleShown = false;
            // console.log("Cancel clicked");
          },
        },
        {
          text: this.reqService.translatedata("confirm"),
          handler: () => {
            this.updateUser(response, 'update');     
          },
        },
      ],
    });
    await alert.present();
  }

  async updateUser(response, update) {
    if (update == 'update') {
    response.isGenerateAsymmetricKey = true;
      response.uuid =  this.device.uuid;
      response.deviceName = await this.common.getdeviceInfo();
      this.reqService.updateUser(response).subscribe((res)=>{
        console.log('update Response', res);
        this.fingerPrintAIO = true;
        if(this.fingerPrintAIO == true) {
          let data = 'true';
          window.localStorage.setItem('fingerPrintAIO', data);
          this.toggleShown = true;
        }
        this.publicKey = res && res.publicKey ? res.publicKey : null;
        this.privateKey = res && res.privateKey ? res.privateKey : null;
        window.localStorage.setItem('publicKey', this.publicKey);
        if (this.privateKey) {
          let base64 = this.privateKey;
          const privateKey = this.setPrivateKey((base64));
          const messageLength = 6;
          // Generate a random message using the Forge library
          const messageBytes = forge.random.getBytesSync(messageLength);
          const randomMessage = forge.util.bytesToHex(messageBytes); 
          // const randomMessage = 'Success';
          console.log('randomMessage', randomMessage);
          window.localStorage.setItem('randomMessage', randomMessage);
          let signedMessage = this.signMessage(randomMessage,privateKey);
          console.log('signedMessage', signedMessage);
          window.localStorage.setItem('signedMessage', signedMessage);
        }
        this.toggleShown = this.publicKey ? true  : false;
        this.common.alertToast('Biometric Enabled Successfully')
        console.log(res);
      },async(err)=>{      
        this.common.alertToast('Biometric Disabled ')
        console.log(err);
      });
  } else {
    response.resetPublicKey = true;
    response.uuid = null;
    response.deviceName = null;
    this.reqService.updateUser(response).subscribe((res)=>{
      console.log('userProfile', res);
    },async(err)=>{      
      this.common.alertToast('Biometric Disabled ')
      console.log(err);
    });
  }
  }

  openFaceId(ev,shown) {
    if (!shown) {
    this.faio.isAvailable().then((result: any) => {
      console.log('isBiometric :' ,result);
      // alert(result);
      if (result) {
      this.faio.show({
        cancelButtonTitle: 'Cancel',
        description: "Some biometric description",
        subtitle: 'This SubTitle'
      })
        .then((result: any) => {
          console.log(result);
          // navigator.vibrate(200);
          this.updateUuid(ev,shown);
          // alert(result);
          // this.faceRecoginationAuth(signedMessage);
        })
        .catch(async (error: any) => {
          // alert(error);
          this.backDropDismiss = false;
          this.fingerPrintAIO = false;
          this.toggleShown = false;
          // navigator.vibrate(200);
          this.common.alertToast('FingerPrint not recognised');
        });
      }
    })
      .catch((error: any) => {
        if (error.message) {
          let data = 'false'
        window.localStorage.setItem('fingerPrintAIO', data);
        this.common.alertToast('To use this feature, you\'ll need to set up your biometric on your device first.');
        console.log('eroor ',error.message);
        // this.updateUser(userData, 'disable');
        let datas = 'false'
        window.localStorage.setItem('fingerPrintAIO', datas);
        this.toggleShown == false;
        }
        // let errors = JSON.stringify
        // alert(error.message);
      });
  } else {
    this.updateUuid(ev,shown);
  }
  }
  myActivity() {
    this.router.navigate(['my-activity'],{replaceUrl:true})
    }
}
