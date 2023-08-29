import { filter, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { DatePipe, Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';
import { ButtonActionProvider } from 'src/providers/button-action/button-action';
import { Events } from 'src/providers/events/events';
import { FirebaseProvider } from 'src/providers/firebase/firebase';
import { OfflineProvider } from 'src/providers/offline/offline';
import { ServiceProvider } from 'src/providers/service/service';
import { AssetFilterPage } from '../asset-filter/asset-filter.page';
import { ChatPage } from '../chat/chat.page';
import { CommonProvider } from '../common/common';
import { Config } from '../config';
import {
  AssetFilter,
  Incident,
  pendingCountDto,
  PendingFilter,
} from '../data.model';
import { PendingFilterPage } from '../pending-filter/pending-filter.page';
import { Subscriber, Subscription, Observable, fromEvent, Subject } from 'rxjs';

@Component({
  selector: 'app-pending-list',
  templateUrl: './pending-list.page.html',
  styleUrls: ['./pending-list.page.scss'],
})
export class PendingListPage implements OnInit {
  @ViewChild("searchBar", { static: false }) private searchbarElem: any;
  incidents: Incident[] = [];
  incidentList: Incident[] = [];
  copyIncidentList: Incident[] = [];
  filterType: string = 'ack';
  pendingRoutes: Incident[] = [];
  offlineAckDrafts: any = [];
  offlineCheckinDrafts: any = [];
  requestType: string = '';
  sortNew: boolean = true;
  reqType: any;
  wrkReqCount: number = 0;
  scheduleCount: number = 0;
  endCount: number = 20;
  stopScroll: boolean = false;
  progFilter: boolean = false;
  chckFilter: boolean = false;
  ackFilter: boolean = true;
  workList: any = {};
  scheduleList: any = {};
  ackCount: number = 0;
  checkinCount: number = 0;
  progressCount: number = 0;
  isPendingUpdate: boolean = false;
  isAckUpdate: boolean = false;
  showSortBy: boolean;
  selectedFilter: any = [];
  filterButtons: any = [];
  tagId: any;
  navType: any;
  defaultView: boolean = true;
  title: any = 'myworks';
  shiftType: any = 'I';
  shiftACount: number = 0;
  shiftBCount: number = 0;
  shiftCCount: number = 0;
  authorize: boolean;
  isFounded: boolean;
  filteredReqId: any;
  offlineSyncCount: number = 0;
  profile: any;
  searchKeyword: any;
  navCtrl: any;
  modelData: any;
  showSearchBar: any;
  shouldShowCancel: any;
  category: any;
  childCategories: any;
  selectedCategory: any;
  childLocations: any;
  selectedLocation: any;
  location: any;
  assetFilter: AssetFilter;
  workflow: any;
  selectedWorkflow: any;
  asset: any;
  selectedAsset: any;
  isScroll: boolean = false;
  pendingFilter: PendingFilter;
  workOrderCount: number;
  preventiveCount: number;
  wrkAckCount: number;
  wrkCheckinCount: number;
  wrkProgressCount: number;
  prvProgressCount: number;
  prvAckCount: number;
  prvCheckinCount: number;
  lastInResponse: any;
  pendingLists: any = [];
  condition: boolean;
  workReqCheckIn: any = [];
  workReqProgress: any = [];
  workReqAcknowledge: any = [];
  prevCheckIn: any = [];
  prevProgress: any = [];
  prevAcknowledge: any = [];
  wrkCheckInLasrRes: any;
  prevCheckInLasrRes: any;
  wrkProgressLastRes: any;
  prevProgressLastRes: any;
  wrkAckLastRes: any;
  prvAckLastResponse: any;
  filterResults: any;
  check: number;
  FullScheduleIncidentList: any;
  fullWorkOrderList: any;
  fullWorkOrderAckList: any;
  searchControl: FormControl;
  filter: boolean;
  filterCount: number;
  noRecordFound: boolean;
  placeHolder: string = 'search By Id/PM Name';
  sort: any = 'desc';
  workReqWip: any;
  wrkWipLastRes: any;
  prevWip: any;
  prvWipCount: any;
  prvWipLastResponse: any;
  wipCount: any;
  workReqPending: any;
  wrkPendingLastRes: any;
  prevPending: any;
  prvPendingLastResponse: any;
  wrkPendingCount: any;
  request: any;
  tittle: string;
  subHeader: string;
  datePipe = new DatePipe('en-US');
  selectedCustomer: any;
  customer: any;
  workReqOverdue: any;
  wrkOverdueLastRes: any;
  prevOverdue: any;
  prvOverdueLastResponse: any;
  prvPendingCount: any;
  prvOverdueCount: any;
  wrkOverdueCount: any;
  prevNew: any;
  prvNewLastResponse: any;
  filterResultsValue: Incident[];
  wrkNewLastResp: any;
  wrkNewOverdueLastRes: any;
  requestKeyData: any;
  searchNameData: any;
  Subscription: Observable<unknown>;
  getWipNewDataShown: boolean;
  subject: Subject<any>;
  getPendingReqShown: boolean;
  getOverDueDataShown: boolean;
  nextWipDataShown: boolean;
  nextPendingDataShown: boolean;
  nextOverDueData: boolean;
  nextOverDueDataShown: boolean;
  searchDataShown: boolean;
  filterDataShown: boolean;
  filterSubscrition: Subscription;
  searchCollectionSubscription: Subscription;
  prvOverdueLastNewResponse: any;
  prvOverdueNewExcepEndDate: any;
  prvOverdueExcepEndDate: any;
  workNewLastDateResp: any;
  wrkWipLastDateRes: any;
  prvNewLastDateResponse: any;
  prvWipLastDateResponse: any;
  wrkNewOverdueLastDateRes: any;
  wrkOverdueLastDateRes: any;
  selectedStatus: any;
  cancel: string = 'cancel';

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    public events: Events,
    public reqService: ServiceProvider,
    public fbProvider: FirebaseProvider,
    public local: NativeStorage,
    public common: CommonProvider,
    public firestore: AngularFirestore,
    private offlineProvider: OfflineProvider,
    private actionSheetCtrl: ActionSheetController,
    public buttonActionProvider: ButtonActionProvider,
    public _location: Location,
    public modalCtrl: ModalController
  ) {

  }
  async ionViewWillEnter() {
    await this.clearAppliedFilter();
    this.route.queryParams.subscribe((params) => {
      if (params && params.type) {
        this.navType = params.type;
      }
      if (params && params.filter) {
        this.filterType = params.filter;
        this.subHeader = params.filter == 'wip' ? 'Work In Progress' : params.filter == 'overdue' ? 'Due' : 'Pending With Reason';
      }
      if (params && params.request) {
        this.request = params.request == 'preventive' ? 'Schedule' : 'Work';
      }
      if (params && params.tittle) {
        this.tittle = params.tittle;
      }
    });
    this.reqType = 'SCHEDULE_REQUEST';
    this.events.subscribe('checkinSuccess', (incident) => {
      this.incidentList.splice(this.incidentList.indexOf(incident), 1);
      this.copyIncidentList = this.incidentList;
      this.checkinCount--;
      this.progressCount++;
      if (this.reqType == 'SCHEDULE_REQUEST') {
        this.scheduleList.checkIn.splice(
          this.scheduleList.checkIn.indexOf(incident),
          1
        );
        this.scheduleList.workInProgress.push(incident);
      } else {
        this.workList.checkIn.splice(
          this.workList.checkIn.indexOf(incident),
          1
        );
        this.workList.workInProgress.push(incident);
      }
    });
    this.events.subscribe('list-acknowledge:success', (data: any) => {
      console.log("ack Subscribe count: ");
      console.count();
      this.acknowledgeSuccess(data.user);
    });
    this.events.subscribe('list-checkin:success', (data: any) => {
      this.goDetailPage(data.user);
    });
    this.events.subscribe('list-startwork:success', (data: any) => {
      this.startWorkSuccess(data.user);
    });

    this.prepareData();
    let ackData = [];
    ackData = JSON.parse(localStorage.getItem(Config.constants.ackDraft));
    this.offlineAckDrafts = ackData ? ackData : [];
    let profile = JSON.parse(window.localStorage.getItem('Profile'));
    this.profile = profile;
    if (this.profile && this.profile.tenantId) {
      this.getFirestoreData(profile);
      this.showRequest(this.request);
    }

  }
  clearAppliedFilter() {
    this.category = []
    this.childCategories = []
    this.selectedCategory = [];
    this.childLocations = []
    this.selectedLocation = [];
    this.location = [];
    this.workflow = [];
    this.selectedWorkflow = [];
    this.asset = [];
    this.selectedAsset = [];
    this.selectedCustomer = [];
    this.selectedStatus = [];
    this.customer = [];
    this.pendingFilter = new PendingFilter();
    this.searchControl = new FormControl();
    this.filteredReqId = '';
    this.searchKeyword = '';
    this.filterCount = 0;
    this.scheduleList.acknowledgeFull = [];
    this.scheduleList.checkInFull = [];
    this.scheduleList.workInProgress = [];
    this.scheduleList.wipFull = [];
    this.scheduleList.overdueFull = [];
    this.scheduleList.pendingFull = [];
    this.workList.acknowledgeFull = [];
    this.workList.checkInFull = [];
    this.workList.workInProgressFull = [];
    this.workList.wipFull = [];
    this.workList.pendingFull = [];
    this.workList.overdueFull = [];
    this.filter = false;
  }
  focusInput() {
    setTimeout(() => {
      this.searchbarElem.setFocus();
    }, 500);
  }
  getAckData(type?) {
    let profile = JSON.parse(window.localStorage.getItem('Profile'));
    this.profile = profile;
    // this.sort = 'asc';
    let searchParam =
      this.common.viewType == 'user'
        ? JSON.stringify(this.profile.id)
        : this.common.getLocationId();
    if (this.reqType != 'SCHEDULE_REQUEST') {
      let pendingWorkReqAckCollectionRef = this.firestore
        .collection('organization')
        .doc(this.profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .where('requestType', '==', 'WORK_REQUEST')
            .where('ackReq', '==', true)
            .orderBy('id', this.sort)
            .limit(10)
        );
      pendingWorkReqAckCollectionRef.valueChanges().subscribe(
        (res) => {
          this.workReqAcknowledge = res;
          if (!navigator.onLine) {
            let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
            console.log(ids);
          }
          this.workList.acknowledge = this.workReqAcknowledge.concat(res);
          if (res && res.length != 0) {
            this.wrkAckLastRes = res[res.length - 1].id;
          }
          this.incidentList = Array.from(new Set(this.workList.acknowledge.map(a => a.id))).map(id => {
            return this.workList.acknowledge.find(a => a.id === id);
          });
          this.noRecordFound = false;
          this.noRecFound();
        },
        async (err) => {
          this.noRecFound();
        }
      );
    } else {
      let pendingPrevReqAckCollectionRef = this.firestore
        .collection('organization')
        .doc(this.profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .where('requestType', '==', 'SCHEDULE_REQUEST')
            .where('ackReq', '==', true)
            .orderBy('id', this.sort)
            .limit(10)
        );
      pendingPrevReqAckCollectionRef.valueChanges().subscribe((res) => {
        this.prevAcknowledge = res;
        this.scheduleList.acknowledge = this.prevAcknowledge.concat(res);
        if (this.prevAcknowledge && this.prevAcknowledge.length != 0) {
          this.prvAckLastResponse = res[res.length - 1].id;
        }
        this.prevAcknowledge.forEach(res => {
          if (res.requestStatus == null) {
            res.requestStatus = "WIP";
          }
          if (res.requestPriority == null) {
            res.requestPriority = "NORMAL"
          }
        })
        this.incidentList = Array.from(new Set(this.scheduleList.acknowledge.map(a => a.id))).map(id => {
          return this.scheduleList.acknowledge.find(a => a.id === id);
        });
        this.noRecordFound = false;
        this.noRecFound();
      }, async (err) => {
        this.noRecFound();
      });
    }
  }
  getWipData(type?) {
    // this.getWipNewDataShown = true;
    let currDate = this.common.getUTCTime()
    const start = Date.now();
    let currentDate = this.common.getUTCTime();
    let profile = JSON.parse(window.localStorage.getItem('Profile'));
    this.profile = profile;
    let searchParam =
      this.common.viewType == 'user'
        ? JSON.stringify(this.profile.id)
        : this.common.getLocationId();
    if (this.reqType != 'SCHEDULE_REQUEST') {
      let workorderNewPendingData = this.firestore
        .collection('organization')
        .doc(this.profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .orderBy('requestExpectedEndDate' , this.sort)
            .orderBy('id', this.sort)
            .where('requestType', '==', 'WORK_REQUEST')
            .where('requestStatus', '==', 'New')
            .where('requestExpectedEndDate', '>', currDate)
            .limit(10)
        );
      workorderNewPendingData.get().subscribe(async (res: any) => {
        res = res.size != 0 ? await this.common.getDocValue(res) : [];
        this.workList.new = [];
        this.workList.new = res;
        this.wrkNewLastResp = res && res?.length != 0 ? res[res.length - 1].id : 1;
        this.workNewLastDateResp = res && res.length != 0 ? res[res.length - 1].requestExpectedEndDate : 1
      }, async (err) => {
        let res = this.workList.new;
        this.workList.new = res && res.length >= 1 ? this.workList.new : [];
        console.log(err);
      });
      let pendingWorkReqAckCollectionRef = this.firestore
        .collection('organization')
        .doc(this.profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .orderBy('requestExpectedEndDate', this.sort)
            .orderBy('id' , this.sort)
            .where('requestType', '==', 'WORK_REQUEST')
            .where('requestStatus', '==', 'WIP')
            .where('requestExpectedEndDate', '>', currDate)
            .limit(10)
        );
      pendingWorkReqAckCollectionRef.get().subscribe(
        async (res: any) => {
          res = res.size != 0 ? await this.common.getDocValue(res) : [];
          if (res && res.length >= 1) {
            this.getWipNewDataShown = false;
            let resp = this.workList.new;
            this.workList.wip = [];
            this.wrkWipLastDateRes = res && res?.length != 0 ? res[res.length - 1].requestExpectedEndDate : 1;
            this.wrkWipLastRes = res && res?.length != 0 ? res[res.length - 1].id : 1;
            this.workReqWip = resp && resp.length >= 1 ? this.workReqWip.concat(this.workList.new) : res;
            for (let i = 0; i < res?.length; i++) {
              if (!navigator.onLine) {
                let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
                console.log(ids);
                if (ids?.includes(res[i].requestId)) {
                  res[i].offline = true;
                }
              }
              res[i].requestSubmissionDate = this.datePipe.transform(res[i].requestSubmissionDate, 'yyyy-MM-ddTHH:mm:ss');
              res[i].requestSubmissionDate = this.common.getTimeAgo(res[i].requestSubmissionDate);
            }
            this.workList.wip = this.workList.wip?.concat(this.workReqWip);
            this.incidentList = this.common.removeDuplicateArrayobj(this.workList.wip);
            this.incidentList = this.common.sortData(this.incidentList, this.reqType, this.sortNew);
            const end = Date.now();
            console.log(`workrequest wip Execution time: ${end - start} ms`);
            this.noRecordFound = false;
            this.noRecFound();
          } else {
            let res = this.workList.new;
            if (res && res.length >= 1) {
              this.workList.wip = [];
              this.workReqWip = res;
              for (let i = 0; i < res?.length; i++) {
                if (!navigator.onLine) {
                  let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
                  console.log(ids);
                  if (ids?.includes(res[i].requestId)) {
                    res[i].offline = true;
                  }
                }
                res[i].requestSubmissionDate = this.datePipe.transform(res[i].requestSubmissionDate, 'yyyy-MM-ddTHH:mm:ss');
                res[i].requestSubmissionDate = this.common.getTimeAgo(res[i].requestSubmissionDate);
              }
              this.workList.wip = this.workList.wip?.concat(this.workReqWip);
              this.incidentList = this.common.removeDuplicateArrayobj(this.workList.wip);
              this.incidentList = this.common.sortData(this.incidentList, this.reqType, this.sortNew);
              const end = Date.now();
              console.log(`workrequest wip Execution time: ${end - start} ms`);
              this.noRecordFound = false;
              this.noRecFound();
            }
            this.noRecFound();


          }

        },
        async (err) => {
          let res = this.workList.new;
          if (res && res.length >= 1) {
            this.workList.wip = [];
            this.workReqWip = res;
            for (let i = 0; i < res?.length; i++) {
              if (!navigator.onLine) {
                let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
                console.log(ids);
                if (ids?.includes(res[i].requestId)) {
                  res[i].offline = true;
                }
              }
              res[i].requestSubmissionDate = this.datePipe.transform(res[i].requestSubmissionDate, 'yyyy-MM-ddTHH:mm:ss');
              res[i].requestSubmissionDate = this.common.getTimeAgo(res[i].requestSubmissionDate);
            }
            this.workList.wip = this.workList.wip?.concat(this.workReqWip);
            this.incidentList = this.common.removeDuplicateArrayobj(this.workList.wip);
            this.incidentList = this.common.sortData(this.incidentList, this.reqType, this.sortNew);
            const end = Date.now();
            console.log(`workrequest wip Execution time: ${end - start} ms`);
            this.noRecordFound = false;
            this.noRecFound();
          }
          console.log(err);
          this.noRecFound();
        }
      );
    } else {
      let currDate = this.common.getUTCTime();
      let pendingPrevReqAckCollectionRef = this.firestore
        .collection('organization')
        .doc(this.profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
          .orderBy('requestExpectedEndDate',this.sort)
            .orderBy('id', this.sort)
            .where('requestType', '==', 'SCHEDULE_REQUEST')
            .where('requestStatus', '==', 'New')
            .where('requestExpectedEndDate', '>', currDate)
            .limit(10)
        );
      pendingPrevReqAckCollectionRef.get().subscribe(async (res: any) => {
        res = res.size != 0 ? await this.common.getDocValue(res) : [];
        this.scheduleList.new = [];
        this.scheduleList.new = res;
        this.noRecordFound = false;
        this.prvNewLastDateResponse = res && res.length >= 1 ? res[res.length - 1].requestExpectedEndDate : 1;
        this.prvNewLastResponse = res && res.length >= 1 ? res[res.length - 1].id : 1;
        this.getPrvWipData(profile, searchParam, start);
      }, async (err) => {
        let res = this.scheduleList.new
        this.scheduleList.new = res && res.length >= 1 ? res : [];
        this.getPrvWipData(profile, searchParam, start);
        console.log(err)
      });
    }

  }
  getPrvWipData(profile: any, searchParam: any, start?) {
    let currDate = this.common.getUTCTime();
    let wipPrevReqAckCollectionRef = this.firestore
      .collection('organization')
      .doc(profile.tenantId)
      .collection(this.common.viewType)
      .doc(searchParam)
      .collection('pendingAction', (ref) =>
        ref
          .orderBy('requestExpectedEndDate',this.sort)
          .orderBy('id', this.sort)
          .where('requestType', '==', 'SCHEDULE_REQUEST')
          .where('requestStatus', '==', 'WIP')
          .where('requestExpectedEndDate', '>', currDate)
          .limit(10)
      );
    wipPrevReqAckCollectionRef.get().subscribe(async (res: any) => {
      res = res.size != 0 ? await this.common.getDocValue(res) : [];
      this.scheduleList.wip = [];
      this.scheduleList.wip = res;
      this.prvWipLastDateResponse = res && res.length >= 1 ? res[res.length - 1].requestExpectedEndDate : 1;
      this.prvWipLastResponse = res && res.length >= 1 ? res[res.length - 1].id : 1;
      this.scheduleList.wip = this.scheduleList?.wip?.concat(this.scheduleList.new);
      if (this.scheduleList.wip && this.scheduleList.wip.length != 0) {
        this.getWipNewDataShown = false;
        for (let i = 0; i < this.scheduleList.wip.length; i++) {
          if (!navigator.onLine) {
            let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
            console.log(ids);
            if (ids?.includes(this.scheduleList.wip[i].requestId)) {
              this.scheduleList.wip[i].offline = true;
            }
          }
          this.scheduleList.wip[i].requestPriority = this.scheduleList.wip[i].requestPriority == null ? "NORMAL" : this.scheduleList.wip[i].requestPriority;
          this.scheduleList.wip[i].scheduleTime = this.scheduleList.wip[i].scheduleStartDateTime;
          this.scheduleList.wip[i].scheduleTime = this.datePipe.transform(this.scheduleList.wip[i].scheduleTime, 'yyyy-MM-ddTHH:mm:ss');
          this.scheduleList.wip[i].scheduleTime = this.common.getTimeAgo(this.scheduleList.wip[i].scheduleTime);
        }
        this.incidentList = this.common.removeDuplicateArrayobj(this.scheduleList.wip);
        this.incidentList = this.common.sortData(this.incidentList,this.reqType, this.sortNew);
        this.noRecordFound = false;
        this.noRecFound();
      } else {
        this.noRecFound();
      }
    }, async (err) => {
      console.log(err);
      let res = this.scheduleList.wip;
      this.scheduleList.wip = res && res.length >= 1 ? res : [];
      this.scheduleList.wip = this.scheduleList?.wip?.concat(this.scheduleList.new);
      for (let i = 0; i < this.scheduleList.wip.length; i++) {
        if (!navigator.onLine) {
          let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
          console.log(ids);
          if (ids?.includes(this.scheduleList.wip[i].requestId)) {
            this.scheduleList.wip[i].offline = true;
          }
        }
        this.scheduleList.wip[i].requestPriority = this.scheduleList.wip[i].requestPriority == null ? "NORMAL" : this.scheduleList.wip[i].requestPriority;
        this.scheduleList.wip[i].scheduleTime = this.scheduleList.wip[i].scheduleStartDateTime;
        this.scheduleList.wip[i].scheduleTime = this.datePipe.transform(this.scheduleList.wip[i].scheduleTime, 'yyyy-MM-ddTHH:mm:ss');
        this.scheduleList.wip[i].scheduleTime = this.common.getTimeAgo(this.scheduleList.wip[i].scheduleTime);
      }
      this.incidentList = this.common.removeDuplicateArrayobj(this.scheduleList.wip);
      this.incidentList = this.common.sortData(this.incidentList, this.reqType, this.sortNew);
      const end = Date.now();
      console.log(`workrequest wip Execution time: ${end - start} ms`);
      this.noRecordFound = false;
      this.noRecFound();
    });
  }
  getPendingdata(type?) {
    this.getPendingReqShown = true;
    var clicks = fromEvent(document, 'click');
    let profile = JSON.parse(window.localStorage.getItem('Profile'));
    this.profile = profile;
    let searchParam =
      this.common.viewType == 'user'
        ? JSON.stringify(this.profile.id)
        : this.common.getLocationId();
    if (this.reqType != 'SCHEDULE_REQUEST') {
      let pendingWorkReqAckCollectionRef = this.firestore
        .collection('organization')
        .doc(this.profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .where('requestType', '==', 'WORK_REQUEST')
            .where('requestStatus', '==', 'Pending')
            .orderBy('id', this.sort)
            .limit(10)
        );
      pendingWorkReqAckCollectionRef.get().subscribe(async (res: any) => {
        res = res.size != 0 ? await this.common.getDocValue(res) : [];
        if (res && res.length != 0 && this.getPendingReqShown) {
          this.getPendingReqShown = false;
          this.workReqPending = res;
          for (let i = 0; i < res.length; i++) {
            if (!navigator.onLine) {
              let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
              console.log(ids);
              if (ids?.includes(res[i].requestId)) {
                res[i].offline = true;
              }
            }
            res[i].requestSubmissionDate = this.datePipe.transform(res[i].requestSubmissionDate, 'yyyy-MM-ddTHH:mm:ss');
            res[i].requestSubmissionDate = this.common.getTimeAgo(res[i].requestSubmissionDate);
          }
          this.workList.pending = this.workReqPending.concat(res);
          if (res && res.length != 0) {
            this.wrkPendingLastRes = res[res.length - 1].id;
          }
          this.incidentList = this.common.removeDuplicateArrayobj(this.workList.pending);
          this.incidentList = this.common.sortData(this.incidentList, this.reqType, this.sortNew);
          this.noRecordFound = false;
          this.noRecFound();
        } else {
          this.noRecFound();
        }
      },
        async (err) => {
          console.log(err);
          this.noRecFound();
        }
      );
    } else {
      let pendingPrevReqAckCollectionRef = this.firestore
        .collection('organization')
        .doc(this.profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .where('requestType', '==', 'SCHEDULE_REQUEST')
            .where('requestStatus', '==', 'Pending')
            .orderBy('id', this.sort)
            .limit(10)
        );
      pendingPrevReqAckCollectionRef.get().subscribe(async (res: any) => {
        res = res.size != 0 ? await this.common.getDocValue(res) : [];
        if (res && res.length != 0 && this.getPendingReqShown) {
          this.getPendingReqShown = false;
          this.prevPending = res;
          for (let i = 0; i < res.length; i++) {
            if (!navigator.onLine) {
              let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
              console.log(ids);
              if (ids?.includes(res[i].requestId)) {
                res[i].offline = true;
              }
            }
            res[i].scheduleTime = res[i].scheduleStartDateTime;
            res[i].scheduleTime = this.datePipe.transform(res[i].scheduleTime, 'yyyy-MM-ddTHH:mm:ss');
            res[i].scheduleTime = this.common.getTimeAgo(res[i].scheduleTime);
          }
          this.scheduleList.pending = this.prevPending.concat(res);
          if (this.prevPending && this.prevPending.length != 0) {
            this.prvPendingLastResponse = res[res.length - 1].id;
          }
          this.prevPending.forEach(res => {
            if (res.requestPriority == null) {
              res.requestPriority = "NORMAL"
            }
          })
          this.incidentList = this.common.removeDuplicateArrayobj(this.scheduleList.pending);
          this.incidentList = this.common.sortData(this.incidentList, this.reqType, this.sortNew);
          this.noRecordFound = false;
          this.noRecFound();
        } else {
          this.noRecordFound = true;
        }
      }, async (err) => {
        this.noRecFound();
      });
    }
  }
  getOverduedata(type?) {
    this.getOverDueDataShown = true;
    let currentDate = this.common.getUTCTime();
    const clicks = fromEvent(document, 'click');
    let profile = JSON.parse(window.localStorage.getItem('Profile'));
    this.profile = profile;
    // this.sort = 'asc';
    let searchParam =
      this.common.viewType == 'user'
        ? JSON.stringify(this.profile.id)
        : this.common.getLocationId();
    if (this.reqType != 'SCHEDULE_REQUEST') {
      let overdueWorkReqNewData = this.firestore
        .collection('organization')
        .doc(this.profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .orderBy('requestExpectedEndDate', this.sort)
            .orderBy('id', this.sort)
            .where('requestType', '==', 'WORK_REQUEST')
            .where('requestStatus', '==', 'New')
            .where('requestExpectedEndDate', '<', currentDate)
            .limit(10)
        );
      overdueWorkReqNewData.get().subscribe(async (res: any) => {
        res = res.size != 0 ? await this.common.getDocValue(res) : [];
        this.workList.new = [];
        this.workList.new = this.workList.new.concat(res);
        this.wrkNewOverdueLastRes = res && res.length != 0 ? res[res.length - 1]?.id : 1;
        this.wrkNewOverdueLastDateRes = res && res.length != 0 ? res[res.length - 1]?.requestExpectedEndDate : 1;
      }, async (err) => {
        console.log(err);
        let res = this.workList.new;
        this.workList.new = res && res.length >= 1 ? res : [];
      })
      let overdueWorkReqAckCollectionRef = this.firestore
        .collection('organization')
        .doc(this.profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .orderBy('requestExpectedEndDate', this.sort)
            .orderBy('id', this.sort)
            .where('requestType', '==', 'WORK_REQUEST')
            .where('requestStatus', '==', 'WIP')
            .where('requestExpectedEndDate', '<', currentDate)
            .limit(10)
        );
      overdueWorkReqAckCollectionRef.get().subscribe(async (res: any) => {
        res = res.size != 0 ? await this.common.getDocValue(res) : [];
        let resp = this.workList.new;
        this.workReqOverdue = [];
        this.workReqOverdue = res;
        this.wrkOverdueLastDateRes = res && res.length != 0 ? res[res.length - 1]?.requestExpectedEndDate : 1;
        this.wrkOverdueLastRes = res && res.length != 0 ? res[res.length - 1]?.id : 1;
        this.workReqOverdue = resp && resp.length >= 1 ? this.workReqOverdue.concat(resp) : this.workReqOverdue;
        if (this.workReqOverdue && this.workReqOverdue.length != 0 && this.getOverDueDataShown) {
          this.getOverDueDataShown = false;
          for (let i = 0; i < res.length; i++) {
            if (!navigator.onLine) {
              let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
              console.log(ids);
              if (ids?.includes(res[i].requestId)) {
                res[i].offline = true;
              }
            }
            res[i].requestSubmissionDate = this.datePipe.transform(res[i].requestSubmissionDate, 'yyyy-MM-ddTHH:mm:ss');
            res[i].requestSubmissionDate = this.common.getTimeAgo(res[i].requestSubmissionDate);
          }
          this.workList.overdue = this.workReqOverdue;
          this.incidentList = this.common.removeDuplicateArrayobj(this.workList.overdue);
          this.incidentList = this.common.sortData(this.incidentList, this.reqType, this.sortNew);
          this.noRecordFound = false;
          this.noRecFound();
        } else {
          this.noRecFound();
        }
      },
        async (err) => {
          this.noRecFound();
        }
      );
    } else {
      let pendingPrevNewReqAckCollectionRef = this.firestore
        .collection('organization')
        .doc(this.profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .orderBy('requestExpectedEndDate', this.sort)
            .orderBy('id', this.sort)
            .where('requestType', '==', 'SCHEDULE_REQUEST')
            .where('requestExpectedEndDate', '<', currentDate)
            .where('requestStatus', '==', 'New')
            .limit(10)
        );
      pendingPrevNewReqAckCollectionRef.get().subscribe(async (resp: any) => {
        resp = resp.size != 0 ? await this.common.getDocValue(resp) : [];
        this.scheduleList.new = resp;
        this.prvOverdueLastNewResponse = resp && resp.length != 0 ? resp[resp.length - 1]?.id : 1;
        this.prvOverdueNewExcepEndDate = resp && resp.length != 0 ? resp[resp.length - 1]?.requestExpectedEndDate : 1;

        let pendingPrevReqAckCollectionRef = this.firestore
        .collection('organization')
        .doc(this.profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .orderBy('requestExpectedEndDate', this.sort)
            .orderBy('id', this.sort)
            .where('requestType', '==', 'SCHEDULE_REQUEST')
            .where('requestExpectedEndDate', '<', currentDate)
            .where('requestStatus', '==', 'WIP')
            .limit(10)
        );
      pendingPrevReqAckCollectionRef.get().subscribe(async (res: any) => {
        let resp = this.scheduleList.new;
        res = res.size != 0 ? await this.common.getDocValue(res) : [];
        this.prvOverdueLastResponse = res && res.length != 0 ? res[res.length - 1].id : 1;
        this.prvOverdueExcepEndDate = resp && resp.length != 0 ? resp[resp.length - 1]?.requestExpectedEndDate : 1;
        res = resp && resp.length != 0 ? res.concat(resp) : res;
        if (res && res.length != 0 && this.getOverDueDataShown) {
          this.getOverDueDataShown = false;
          this.prevOverdue = res;
          for (let i = 0; i < res.length; i++) {
            if (!navigator.onLine) {
              let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
              console.log(ids);
              if (ids?.includes(res[i].requestId)) {
                res[i].offline = true;
              }
            }
            res[i].scheduleTime = res[i].scheduleStartDateTime;
            res[i].scheduleTime = this.datePipe.transform(res[i].scheduleTime, 'yyyy-MM-ddTHH:mm:ss');
            res[i].scheduleTime = this.common.getTimeAgo(res[i].scheduleTime);
          }
          this.scheduleList.overdue = (this.prevOverdue.concat(res));
          this.prevOverdue.forEach(res => {
            if (res.requestPriority == null) {
              res.requestPriority = "NORMAL"
            }
          })
          this.incidentList = this.common.removeDuplicateArrayobj(this.scheduleList.overdue);
          this.incidentList = this.common.sortData(this.incidentList, this.reqType, this.sortNew);
          this.noRecordFound = false;
          this.noRecFound();
        } else {
          this.noRecFound();
        }
      }, async (err) => {
        console.log(err)
        this.noRecFound();
      });

      }, async (err) => {
        console.log(err);
      });



    }
  }
  noRecFound() {
    if (this.incidentList.length == 0) {
      this.noRecordFound = true;
    }
  }
  getCheckInData(type?) {
    let profile = JSON.parse(window.localStorage.getItem('Profile'));
    this.profile = profile;
    // this.sort = 'asc';
    let searchParam =
      this.common.viewType == 'user'
        ? JSON.stringify(profile.id)
        : this.common.getLocationId();
    if (this.reqType != 'SCHEDULE_REQUEST') {
      let pendingWorkReqCheckinCollectionRef = this.firestore
        .collection('organization')
        .doc(profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .where('requestType', '==', 'WORK_REQUEST')
            .where('checkinRequired', '==', true)
            .where('ackReq', '==', false)
            .orderBy('id', this.sort)
            .limit(10)
        );
      pendingWorkReqCheckinCollectionRef.valueChanges().subscribe(
        (res) => {
          this.workReqCheckIn = res;
          this.workList.checkIn = this.workReqCheckIn.concat(res);
          if (res && res.length != 0) {
            this.wrkCheckInLasrRes = res[res.length - 1].id;
          }
          this.incidentList = Array.from(new Set(this.workList.checkIn.map(a => a.id))).map(id => {
            return this.workList.checkIn.find(a => a.id === id);
          });
          this.noRecordFound = false;
          this.noRecFound();
        },
        async (err) => {
          this.noRecFound();
          // this.common.alertToast('Error While Fetch a Check In Data ');
        }
      );
    } else {
      let pendingPrevReqCheckinCollectionRef = this.firestore
        .collection('organization')
        .doc(profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .where('requestType', '==', 'SCHEDULE_REQUEST')
            .where('checkinRequired', '==', true)
            .where('ackReq', '==', false)
            .orderBy('id', this.sort)
            .limit(10)
        );
      pendingPrevReqCheckinCollectionRef.valueChanges().subscribe(
        (res) => {
          this.prevCheckIn = res;
          this.scheduleList.checkIn = this.prevCheckIn.concat(res);
          if (res && res.length != 0) {
            this.prevCheckInLasrRes = res[res.length - 1].id;
          }
          this.incidentList = Array.from(new Set(this.scheduleList.checkIn.map(a => a.id))).map(id => {
            return this.scheduleList.checkIn.find(a => a.id === id);
          });
          // if(type == 'asc') {
          //   this.incidentList = this.incidentList.length > 0 ? this.incidentList.reverse() : this.incidentList;
          // }
          this.noRecordFound = false;
          this.noRecFound();
        },
        async (err) => {
          this.noRecFound();
        }
      );
    }

  }
  getProgressData(type?) {
    let profile = JSON.parse(window.localStorage.getItem('Profile'));
    this.profile = profile;
    // this.sort = 'asc';
    let searchParam =
      this.common.viewType == 'user'
        ? JSON.stringify(profile.id)
        : this.common.getLocationId();
    if (this.reqType != 'SCHEDULE_REQUEST') {
      let pendingWorkReqProgressCollectionRef = this.firestore
        .collection('organization')
        .doc(profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .where('requestType', '==', 'WORK_REQUEST')
            .where('checkinRequired', '==', false)
            .where('ackReq', '==', false)
            .orderBy('id', this.sort)
            .limit(10)
        );
      pendingWorkReqProgressCollectionRef.valueChanges().subscribe(
        (res) => {
          this.workReqProgress = res;
          this.workList.workInProgress = this.workReqProgress.concat(res);
          if (res && res.length != 0) {
            this.wrkProgressLastRes = res[res.length - 1].id;
          }
          this.incidentList = Array.from(new Set(this.workList.workInProgress.map(a => a.id))).map(id => {
            return this.workList.workInProgress.find(a => a.id === id);
          });
          // if(type == 'asc') {
          //   this.incidentList = this.incidentList.length > 0 ? this.incidentList.reverse() : this.incidentList;
          // }
          this.noRecordFound = false;
          this.noRecFound();
        },
        async (err) => {
          this.noRecFound();
        }
      );
    } else {
      let pendingPrevReqProgressCollectionRef = this.firestore
        .collection('organization')
        .doc(profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .where('requestType', '==', 'SCHEDULE_REQUEST')
            .where('checkinRequired', '==', false)
            .where('ackReq', '==', false)
            .orderBy('id', this.sort)
            .limit(10)
        );
      pendingPrevReqProgressCollectionRef.valueChanges().subscribe(
        (res) => {
          this.prevProgress = res;
          this.scheduleList.workInProgress = this.prevProgress.concat(res);
          if (res && res.length != 0) {
            this.prevProgressLastRes = res[res.length - 1].id;
          }
          this.incidentList = Array.from(new Set(this.scheduleList.workInProgress.map(a => a.id))).map(id => {
            return this.scheduleList.workInProgress.find(a => a.id === id);
          });
          this.noRecordFound = false;
          this.noRecFound();
        },
        async (err) => {
          this.noRecFound();
          // this.common.alertToast(
          //   'Error while Fetch a Data From Work In Progress'
          // );
        }
      );
    }
  }
  getRequestCount(type?) {
    let profile = JSON.parse(window.localStorage.getItem('Profile'));
    this.profile = profile;
    let searchParam =
      this.common.viewType == 'user'
        ? JSON.stringify(profile.id)
        : this.common.getLocationId();
    this.firestore
      .collection('organization')
      .doc(profile.tenantId)
      .collection(this.common.viewType)
      .doc(searchParam)
      .collection(
        'pendingAction',
        (ref) => ref
          .where('requestType', '==', 'SCHEDULE_REQUEST')
      )
      .get()
      .subscribe((res) => (this.scheduleCount = res.size));
    this.firestore
      .collection('organization')
      .doc(profile.tenantId)
      .collection(this.common.viewType)
      .doc(searchParam)
      .collection('pendingAction', (ref) =>
        ref
          .where('requestType', '==', 'SCHEDULE_REQUEST')
          .where('ackReq', '==', true)
      )
      .get()
      .subscribe((res) => (this.prvAckCount = res.size), async (err) => console.log(err));
    this.firestore
      .collection('organization')
      .doc(profile.tenantId)
      .collection(this.common.viewType)
      .doc(searchParam)
      .collection('pendingAction', (ref) =>
        ref
          .where('requestType', '==', 'SCHEDULE_REQUEST')
          .where('ackReq', '==', false)
          .where('checkinRequired', '==', true)
      )
      .get()
      .subscribe((res) => (this.prvCheckinCount = res.size));
    this.firestore
      .collection('organization')
      .doc(profile.tenantId)
      .collection(this.common.viewType)
      .doc(searchParam)
      .collection('pendingAction', (ref) =>
        ref
          .where('requestType', '==', 'SCHEDULE_REQUEST')
          .where('checkinRequired', '==', false)
          .where('ackReq', '==', false)
      )
      .get()
      .subscribe((res) => {
        this.prvProgressCount = res.size;
      });
    this.firestore
      .collection('organization')
      .doc(profile.tenantId)
      .collection(this.common.viewType)
      .doc(searchParam)
      .collection('pendingAction', (ref) =>
        ref.where('requestType', '==', 'WORK_REQUEST')
      )
      .get()
      .subscribe((res) => (this.wrkReqCount = res.size));
    this.firestore
      .collection('organization')
      .doc(profile.tenantId)
      .collection(this.common.viewType)
      .doc(searchParam)
      .collection('pendingAction', (ref) =>
        ref
          .where('requestType', '==', 'WORK_REQUEST')
          .where('ackReq', '==', true)
      )
      .get()
      .subscribe((res) => (this.wrkAckCount = res.size));
    this.firestore
      .collection('organization')
      .doc(profile.tenantId)
      .collection(this.common.viewType)
      .doc(searchParam)
      .collection('pendingAction', (ref) =>
        ref
          .where('requestType', '==', 'WORK_REQUEST')
          .where('ackReq', '==', false)
          .where('checkinRequired', '==', true)
      )
      .get()
      .subscribe((res) => (this.wrkCheckinCount = res.size));
    this.firestore
      .collection('organization')
      .doc(profile.tenantId)
      .collection(this.common.viewType)
      .doc(searchParam)
      .collection('pendingAction', (ref) =>
        ref
          .where('requestType', '==', 'WORK_REQUEST')
          .where('checkinRequired', '==', false)
          .where('ackReq', '==', false)
      )
      .get()
      .subscribe((res) => {
        this.wrkProgressCount = res.size;
        this.displayCount(type);
      });

  }
  nextWipData(lastRes?, lastres2?) {
    this.nextWipDataShown = true;
    let currDate = this.common.getUTCTime();
    let profile = JSON.parse(window.localStorage.getItem('Profile'));
    this.profile = profile;
    let searchParam =
      this.common.viewType == 'user'
        ? JSON.stringify(this.profile.id)
        : this.common.getLocationId();
    if (this.reqType != 'SCHEDULE_REQUEST') {
      let nextworkorderNewPendingData = this.firestore
        .collection('organization')
        .doc(this.profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .orderBy('requestExpectedEndDate', this.sort)
            .orderBy('id', this.sort)
            .where('requestType', '==', 'WORK_REQUEST')
            .where('requestStatus', '==', 'New')
            .where('requestExpectedEndDate', '>', currDate)
            .limit(10)
            .startAfter(lastres2.date, lastres2.id)
        );
      nextworkorderNewPendingData.get().subscribe(async (res: any) => {
        res = res.size != 0 ? await this.common.getDocValue(res) : [];
        let resp = this.workList.new;
        this.workList.new = resp && resp.length >= 1 ? resp.concat(res) : res;
        this.wrkNewLastResp = res && res?.length != 0 ? res[res.length - 1].id : 1;
        this.workNewLastDateResp = res && res.length != 0 ? res[res.length - 1].requestExpectedEndDate : 1
      }, async (err) => {
        let res = this.workList.new;
        this.workList.new = res && res.length >= 1 ? this.workList.new : [];
        console.log(err);
      });
      let nextpendingWorkReqAckCollectionRef = this.firestore
        .collection('organization')
        .doc(this.profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .orderBy('requestExpectedEndDate', this.sort)
            .orderBy('id', this.sort)
            .where('requestType', '==', 'WORK_REQUEST')
            .where('requestStatus', '==', 'WIP')
            .where('requestExpectedEndDate', '>', currDate)
            .limit(10)
            .startAfter(lastRes.date, lastRes.id)
        );
      nextpendingWorkReqAckCollectionRef.get().subscribe(async (res: any) => {
        res = res.size != 0 ? await this.common.getDocValue(res) : [];
        let resp = this.workList.new;
        this.workReqWip = [];
        this.workReqWip = resp && resp.length == 0 ? res : res.concat(resp);
        if (this.workReqWip && this.workReqWip.length != 0 && this.nextWipDataShown) {
          this.nextWipDataShown = false;
          this.wrkWipLastDateRes = res && res?.length != 0 ? res[res.length - 1].requestExpectedEndDate : 1;
          this.wrkWipLastRes = res && res?.length != 0 ? res[res.length - 1].id : 1;
          for (let i = 0; i < this.workReqWip.length; i++) {
            if (this.workReqWip[i]?.requestSubmissionDate?.includes('T')) {
              if (!navigator.onLine) {
                let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
                console.log(ids);
                if (ids?.includes(this.workReqWip[i].requestId)) {
                  this.workReqWip[i].offline = true;
                }
              }
              this.workReqWip[i].requestSubmissionDate = this.datePipe.transform(this.workReqWip[i].requestSubmissionDate, 'yyyy-MM-ddTHH:mm:ss');
              this.workReqWip[i].requestSubmissionDate = this.common.getTimeAgo(this.workReqWip[i].requestSubmissionDate);
            }
          }
          this.workList.wip = this.workList.wip?.concat(this.workReqWip);
          this.incidentList = this.incidentList.concat(this.workList.wip);
          this.incidentList = this.common.removeDuplicateArrayobj(this.incidentList);
          this.incidentList = this.common.sortData(this.incidentList, this.reqType, this.sortNew);
          this.noRecordFound = false;
          this.noRecFound();
        } else {
          this.noRecFound();
        }
      },
        async (err) => {
          this.noRecFound();
        }
      );
    } else {
      let currDate = this.common.getUTCTime()
      let nextNewPrevReqAckCollectionRef = this.firestore
        .collection('organization')
        .doc(this.profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
          .orderBy('requestExpectedEndDate',this.sort)
            .orderBy('id',this.sort)
            .where('requestType', '==', 'SCHEDULE_REQUEST')
            .where('requestStatus', '==', 'New')
            .where('requestExpectedEndDate', '>', currDate)
            .limit(10)
            .startAfter(lastres2.date, lastres2.id)
        );
      nextNewPrevReqAckCollectionRef.get().subscribe(async (res: any) => {
        res = res.size != 0 ? await this.common.getDocValue(res) : [];
        let resp = this.scheduleList.new;
        this.prevNew = [];
        this.prevNew = res;
        this.prvNewLastDateResponse = res && res.length >= 1 ? res[res.length - 1].requestExpectedEndDate : 1;
        this.prvNewLastResponse = res && res.length >= 1 ? res[res.length - 1].id : 1;
        this.scheduleList.new = resp && resp.length >= 1 ? this.scheduleList.new?.concat(res) : this.prevNew;
        this.noRecordFound = false;
        this.noRecFound();
        this.nextPrvWipData(lastRes, profile, searchParam);
      }, async (err) => {
        console.log(err);
        this.nextPrvWipData(lastRes, profile, searchParam);
        this.noRecFound();
      });
    }
  }
  nextPrvWipData(lastRes: any, profile: any, searchParam: string) {
    let currDate = this.common.getUTCTime()
    let nextPendingPrevReqAckCollectionRef = this.firestore
      .collection('organization')
      .doc(this.profile.tenantId)
      .collection(this.common.viewType)
      .doc(searchParam)
      .collection('pendingAction', (ref) =>
        ref
          .orderBy('requestExpectedEndDate' , this.sort)
          .orderBy('id',this.sort)
          .where('requestType', '==', 'SCHEDULE_REQUEST')
          .where('requestStatus', '==', 'WIP')
          .where('requestExpectedEndDate', '>', currDate)
          .limit(10)
          .startAfter(lastRes.date, lastRes.id)
      );
    nextPendingPrevReqAckCollectionRef.get().subscribe(async (res: any) => {
      res = res.size != 0 ? await this.common.getDocValue(res) : [];
      let resp = this.scheduleList.wip
      this.prevWip = [];
      this.prevWip = res;
      this.prvWipLastDateResponse = res && res.length >= 1 ? res[res.length - 1].requestExpectedEndDate : 1;
      this.prvWipLastResponse = res && res.length >= 1 ? res[res.length - 1].id : 1;
      this.scheduleList.wip = resp && resp.length >= 1 ? this.scheduleList.wip?.concat(this.prevWip) : this.prevWip;
      this.scheduleList.wip = this.scheduleList.wip?.concat(this.scheduleList.new);
      if (this.scheduleList.wip && this.scheduleList.wip.length != 0 && this.nextWipDataShown) {
        this.nextWipDataShown = false;
        for (let i = 0; i < this.scheduleList.wip.length; i++) {
          if (this.scheduleList.wip[i].scheduleStartDateTime?.includes('T')) {
            if (!navigator.onLine) {
              let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
              console.log(ids);
              if (ids?.includes(this.scheduleList.wip[i].requestId)) {
                this.scheduleList.wip[i].offline = true;
              }
            }
            this.scheduleList.wip[i].requestPriority = this.scheduleList.wip[i].requestPriority == null ? "NORMAL" : this.scheduleList.wip[i].requestPriority;
            this.scheduleList.wip[i].scheduleTime = this.scheduleList.wip[i].scheduleStartDateTime;
            this.scheduleList.wip[i].scheduleTime = this.datePipe.transform(this.scheduleList.wip[i].scheduleTime, 'yyyy-MM-ddTHH:mm:ss');
            this.scheduleList.wip[i].scheduleTime = this.common.getTimeAgo(this.scheduleList.wip[i].scheduleTime);
          }
        }
        this.incidentList = this.common.removeDuplicateArrayobj(this.scheduleList.wip);
        this.incidentList = this.common.sortData(this.incidentList, this.reqType, this.sortNew);
        this.noRecordFound = false;
        this.noRecFound();
      } else {
        this.noRecFound();
      }
    }, async (err) => {
      console.log(err);
      let res = this.scheduleList.new;
      this.scheduleList.wip = this.scheduleList.wip?.concat(res);
      for (let i = 0; i < this.scheduleList.wip.length; i++) {
        if (this.scheduleList.wip[i]?.scheduleStartDateTime?.includes('T')) {
          if (!navigator.onLine) {
            let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
            console.log(ids);
            if (ids?.includes(this.scheduleList.wip[i].requestId)) {
              this.scheduleList.wip[i].offline = true;
            }
          }
          this.scheduleList.wip[i].scheduleTime = this.scheduleList.wip[i].scheduleStartDateTime;
          this.scheduleList.wip[i].scheduleTime = this.datePipe.transform(this.scheduleList.wip[i].scheduleTime, 'yyyy-MM-ddTHH:mm:ss');
          this.scheduleList.wip[i].scheduleTime = this.common.getTimeAgo(this.scheduleList.wip[i].scheduleTime);
        }
      }
      this.incidentList = this.common.removeDuplicateArrayobj(this.scheduleList.wip);
      this.incidentList = this.common.sortData(this.incidentList, this.reqType, this.sortNew);
      this.noRecFound();
    });
  }
  nextPendingData(lastRes?) {
    this.nextPendingDataShown = true;
    let profile = JSON.parse(window.localStorage.getItem('Profile'));
    this.profile = profile;
    let searchParam =
      this.common.viewType == 'user'
        ? JSON.stringify(this.profile.id)
        : this.common.getLocationId();
    if (this.reqType != 'SCHEDULE_REQUEST') {
      let NextpendingWorkReqCollectionRef = this.firestore
        .collection('organization')
        .doc(this.profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .where('requestType', '==', 'WORK_REQUEST')
            .where('requestStatus', '==', 'Pending')
            .orderBy('id', this.sort)
            .limit(10)
            .startAfter(lastRes)
        );
      NextpendingWorkReqCollectionRef.get().subscribe(async (res: any) => {
        res = res.size != 0 ? await this.common.getDocValue(res) : [];
        if (res && res.length != 0 && this.nextPendingDataShown) {
          this.nextPendingDataShown = false;
          this.workReqPending = res;
          for (let i = 0; i < res.length; i++) {
            if (!navigator.onLine) {
              let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
              console.log(ids);
              if (ids?.includes(res[i].requestId)) {
                res[i].offline = true;
              }
            }
            res[i].requestSubmissionDate = this.datePipe.transform(res[i].requestSubmissionDate, 'yyyy-MM-ddTHH:mm:ss');
            res[i].requestSubmissionDate = this.common.getTimeAgo(res[i].requestSubmissionDate);
          }
          this.workList.pending = this.workList.pending?.concat(this.workReqPending?.concat(res));
          if (res && res.length != 0) {
            this.wrkPendingLastRes = res[res.length - 1].id;
          }
          this.incidentList = this.common.removeDuplicateArrayobj(this.workList.pending);
          this.incidentList = this.common.sortData(this.incidentList, this.reqType, this.sortNew);
          this.noRecordFound = false;
          this.noRecFound();
        } else {
          this.noRecFound();
        }
      },
        async (err) => {
          this.noRecFound();
        }
      );
    } else {
      let nextpendingScheduleCollectionRef = this.firestore
        .collection('organization')
        .doc(this.profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .where('requestType', '==', 'SCHEDULE_REQUEST')
            .where('requestStatus', '==', 'Pending')
            .orderBy('id', this.sort)
            .limit(10)
            .startAfter(lastRes)
        );
      nextpendingScheduleCollectionRef.get().subscribe(async (res: any) => {
        res = res.size != 0 ? await this.common.getDocValue(res) : [];
        if (res && res.length != 0 && this.nextPendingDataShown) {
          this.nextPendingDataShown = false;
          this.prevPending = res;
          for (let i = 0; i < res.length; i++) {
            if (!navigator.onLine) {
              let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
              console.log(ids);
              if (ids?.includes(res[i].requestId)) {
                res[i].offline = true;
              }
            }
            res[i].scheduleTime = res[i].scheduleStartDateTime;
            res[i].scheduleTime = this.datePipe.transform(res[i].scheduleTime, 'yyyy-MM-ddTHH:mm:ss');
            res[i].scheduleTime = this.common.getTimeAgo(res[i].scheduleTime);
          }
          this.scheduleList.pending = this.scheduleList.pending?.concat(this.prevPending?.concat(res));
          if (this.prevPending && this.prevPending.length != 0) {
            this.prvPendingLastResponse = res[res.length - 1].id;
          }
          this.prevPending.forEach(res => {
            if (res.requestPriority == null) {
              res.requestPriority = "NORMAL"
            }
          })
          this.incidentList = this.common.removeDuplicateArrayobj(this.scheduleList.pending);
          this.incidentList = this.common.sortData(this.incidentList, this.reqType, this.sortNew);
          this.noRecordFound = false;
          this.noRecFound();
        } else {
          this.noRecFound();
        }
      }, async (err) => {
        this.noRecFound();
      });
    }
  }
  nextAckData(lastRes?) {
    let profile = JSON.parse(window.localStorage.getItem('Profile'));
    this.profile = profile;
    let searchParam =
      this.common.viewType == 'user'
        ? JSON.stringify(profile.id)
        : this.common.getLocationId();
    if (this.reqType != 'SCHEDULE_REQUEST') {
      let pendingWorkReqAckCollectionRef = this.firestore
        .collection('organization')
        .doc(profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .where('requestType', '==', 'WORK_REQUEST')
            .where('ackReq', '==', true)
            .orderBy('id', this.sort)
            .limit(25)
            .startAfter(lastRes)
        );
      pendingWorkReqAckCollectionRef.valueChanges().subscribe(
        (res) => {
          this.workReqAcknowledge = res;
          this.workList.acknowledge = this.workList.acknowledge.concat(this.workReqAcknowledge);
          this.wrkAckLastRes = res[res.length - 1].id;
          this.incidentList = Array.from(new Set(this.workList.acknowledge.map(a => a.id))).map(id => {
            return this.workList.acknowledge.find(a => a.id === id);
          });
        },
        async (err) => {
          // this.common.alertToast('Error While Fetch a Acknowledge Data ');
        }
      );
    } else {
      let pendingPrevReqAckCollectionRef = this.firestore
        .collection('organization')
        .doc(profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .where('requestType', '==', 'SCHEDULE_REQUEST')
            .where('ackReq', '==', true)
            .orderBy('id', this.sort)
            .limit(25)
            .startAfter(lastRes)
        );
      pendingPrevReqAckCollectionRef.valueChanges().subscribe((res) => {
        this.prevAcknowledge = res;
        this.scheduleList.acknowledge = this.scheduleList.acknowledge.concat(this.prevAcknowledge);
        this.prvAckLastResponse = res[res.length - 1].id;
        this.prevAcknowledge.forEach(res => {
          if (res.requestStatus == null) {
            res.requestStatus = "WIP";
          }
          if (res.requestPriority == null) {
            res.requestPriority = "NORMAL"
          }
        })
        this.incidentList = this.scheduleList.acknowledge.filter((req, index, self) =>
          index === self.findIndex((t) => (
            t.id === req.id
          ))
        )
      });
    }

  }
  nextCheckInData(lastRes?) {
    let profile = JSON.parse(window.localStorage.getItem('Profile'));
    this.profile = profile;
    let searchParam =
      this.common.viewType == 'user'
        ? JSON.stringify(profile.id)
        : this.common.getLocationId();
    if (this.reqType != 'SCHEDULE_REQUEST') {
      let pendingWorkReqCheckinCollectionRef = this.firestore
        .collection('organization')
        .doc(profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .where('requestType', '==', 'WORK_REQUEST')
            .where('ackReq', '==', false)
            .where('checkinRequired', '==', true)
            .orderBy('id', this.sort)
            .limit(25)
            .startAfter(lastRes)
        );
      pendingWorkReqCheckinCollectionRef.valueChanges().subscribe(
        (res) => {
          this.workReqCheckIn = res;
          this.workList.checkIn = this.workList.checkIn.concat(this.workReqCheckIn);
          this.wrkCheckInLasrRes = res[res.length - 1].id;
          this.incidentList = Array.from(new Set(this.workList.checkIn.map(a => a.id))).map(id => {
            return this.workList.checkIn.find(a => a.id === id);
          });
        },
        async (err) => {
          // this.common.alertToast('Error While Fetch a Check In Data ');
        }
      );
    } else {
      let pendingPrevReqCheckinCollectionRef = this.firestore
        .collection('organization')
        .doc(profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .where('requestType', '==', 'SCHEDULE_REQUEST')
            .where('ackReq', '==', false)
            .where('checkinRequired', '==', true)
            .orderBy('id', this.sort)
            .limit(25)
            .startAfter(lastRes)
        );
      pendingPrevReqCheckinCollectionRef.valueChanges().subscribe(
        (res) => {
          this.prevCheckIn = res;
          this.scheduleList.checkIn = this.scheduleList.checkIn.concat(this.prevCheckIn);
          this.prevCheckInLasrRes = res[res.length - 1].id;
          this.incidentList = Array.from(new Set(this.scheduleList.checkIn.map(a => a.id))).map(id => {
            return this.scheduleList.checkIn.find(a => a.id === id);
          });
        },
        async (err) => {
          // this.common.alertToast('Error While Fetch a Check In Data ');
        }
      );
    }
  }
  nextProgressData(lastRes?) {
    let profile = JSON.parse(window.localStorage.getItem('Profile'));
    this.profile = profile;
    let searchParam =
      this.common.viewType == 'user'
        ? JSON.stringify(profile.id)
        : this.common.getLocationId();
    if (this.reqType != 'SCHEDULE_REQUEST') {
      let pendingWorkReqProgressCollectionRef = this.firestore
        .collection('organization')
        .doc(profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .where('requestType', '==', 'WORK_REQUEST')
            .where('checkinRequired', '==', false)
            .where('ackReq', '==', false)
            .orderBy('id', this.sort)
            .limit(25)
            .startAfter(lastRes)
        );
      pendingWorkReqProgressCollectionRef.valueChanges().subscribe(
        (res) => {
          this.workReqProgress = res;
          this.workList.workInProgress = this.workList.workInProgress.concat(this.workReqProgress);
          this.wrkProgressLastRes = res[res.length - 1].id;
          this.incidentList = Array.from(new Set(this.workList.workInProgress.map(a => a.id))).map(id => {
            return this.workList.workInProgress.find(a => a.id === id);
          });
        },
        async (err) => {
          console.log(err);
        }
      );
    } else {
      let pendingPrevReqProgressCollectionRef = this.firestore
        .collection('organization')
        .doc(profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .where('requestType', '==', 'SCHEDULE_REQUEST')
            .where('checkinRequired', '==', false)
            .where('ackReq', '==', false)
            .orderBy('id', this.sort)
            .limit(25)
            .startAfter(lastRes)
        );
      pendingPrevReqProgressCollectionRef.valueChanges().subscribe(
        (res) => {
          this.prevProgress = res;
          this.scheduleList.workInProgress = this.scheduleList.workInProgress.concat(this.prevProgress);
          this.prevProgressLastRes = res[res.length - 1].id;
          this.incidentList = Array.from(new Set(this.scheduleList.workInProgress.map(a => a.id))).map(id => {
            return this.scheduleList.workInProgress.find(a => a.id === id);
          });
        },
        async (err) => {
        }
      );
    }
  }
  nextOverdueData(lastRes?, lastRes2?) {
    this.nextOverDueDataShown = true;
    let currentDate = this.common.getUTCTime();
    let profile = JSON.parse(window.localStorage.getItem('Profile'));
    this.profile = profile;
    let searchParam =
      this.common.viewType == 'user'
        ? JSON.stringify(this.profile.id)
        : this.common.getLocationId();
    if (this.reqType != 'SCHEDULE_REQUEST') {
      if (lastRes2 != undefined) {
        let nextoverdueWorkNewCollectionRef = this.firestore
          .collection('organization')
          .doc(this.profile.tenantId)
          .collection(this.common.viewType)
          .doc(searchParam)
          .collection('pendingAction', (ref) =>
            ref
              .orderBy('requestExpectedEndDate', this.sort)
              .orderBy('id', this.sort)
              .where('requestType', '==', 'WORK_REQUEST')
              .where('requestStatus', '==', 'New')
              .where('requestExpectedEndDate', '<', currentDate)
              .startAfter(lastRes2.date, lastRes2.id)
              .limit(20)
          );
        nextoverdueWorkNewCollectionRef.get().subscribe(async (res: any) => {
          res = res.size != 0 ? await this.common.getDocValue(res) : [];
          let resp = this.workList.new;
          this.workList.new = resp && resp.length ? resp.concat(res) : res;
          this.wrkNewOverdueLastRes = res && res.length != 0 ? res[res.length - 1]?.id : 1;
          this.wrkNewOverdueLastDateRes = res && res.length != 0 ? res[res.length - 1]?.requestExpectedEndDate : 1;
        }, async (err) => {
          let resp = this.workList.new;
          this.workList.new = resp && resp.length >= 1 ? resp : [];
        })
      }
      let nextoverdueReqAckCollectionRef = this.firestore
        .collection('organization')
        .doc(this.profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .orderBy('requestExpectedEndDate', this.sort)
            .orderBy('id', this.sort)
            .where('requestType', '==', 'WORK_REQUEST')
            .where('requestStatus', '==', 'WIP')
            .where('requestExpectedEndDate', '<', currentDate)
            .startAfter(lastRes.date, lastRes.id)
            .limit(10)
        );
      nextoverdueReqAckCollectionRef.get().subscribe(async (res: any) => {
        res = res.size != 0 ? await this.common.getDocValue(res) : [];
        let resp = this.workList.new;
        this.wrkOverdueLastDateRes = res && res.length != 0 ? res[res.length - 1]?.requestExpectedEndDate : 1;
        this.wrkOverdueLastRes = res && res.length != 0 ? res[res.length - 1]?.id : 1;
        this.workReqOverdue = resp && resp.length >= 1 ? resp.concat(res) : res;
        if (this.workReqOverdue && this.workReqOverdue.length != 0 && this.nextOverDueDataShown) {
          this.nextOverDueDataShown = false;
          for (let i = 0; i < this.workReqOverdue.length; i++) {
            if (this.workReqOverdue[i]?.requestSubmissionDate?.includes('T'))
              if (!navigator.onLine) {
                let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
                console.log(ids);
                if (ids?.includes(this.workReqOverdue[i].requestId)) {
                  this.workReqOverdue[i].offline = true;
                }
              }
            this.workReqOverdue[i].requestSubmissionDate = this.datePipe.transform(this.workReqOverdue[i].requestSubmissionDate, 'yyyy-MM-ddTHH:mm:ss');
            this.workReqOverdue[i].requestSubmissionDate = this.common.getTimeAgo(this.workReqOverdue[i].requestSubmissionDate);
          }
          this.workList.overdue = this.workList.overdue.concat(this.workReqOverdue);
          this.incidentList = this.common.removeDuplicateArrayobj(this.workList.overdue);
          this.incidentList = this.common.sortData(this.incidentList, this.reqType, this.sortNew);
          this.noRecordFound = false;
          this.noRecFound();

        } else {
          this.noRecFound();
        }
      },
        async (err) => {
          this.noRecFound();
        }
      );
    } else {
      let pendingPrevNewReqAckCollectionRef = this.firestore
        .collection('organization')
        .doc(this.profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .orderBy('requestExpectedEndDate', this.sort)
            .orderBy('id', this.sort)
            .where('requestType', '==', 'SCHEDULE_REQUEST')
            .where('requestExpectedEndDate', '<', currentDate)
            .where('requestStatus', '==', 'New')
            .startAfter(lastRes2.date, lastRes2.id)
            .limit(10)
        );
      pendingPrevNewReqAckCollectionRef.get().subscribe(async (resp: any) => {
        let res = this.scheduleList.new;
        resp = resp.size != 0 ? await this.common.getDocValue(resp) : [];
        this.prvOverdueLastNewResponse = resp && resp.length != 0 ? resp[resp.length - 1]?.id : 1;
        this.prvOverdueNewExcepEndDate = resp && resp.length != 0 ? resp[resp.length - 1]?.requestExpectedEndDate : 1;
        this.scheduleList.new = res && res.length != 0 ? res.concat(resp) : resp;
      }, async (err) => {
        console.log(err);
      })
      let nextpendingPrevCollectionRef = this.firestore
        .collection('organization')
        .doc(this.profile.tenantId)
        .collection(this.common.viewType)
        .doc(searchParam)
        .collection('pendingAction', (ref) =>
          ref
            .orderBy('requestExpectedEndDate', this.sort)
            .orderBy('id', this.sort)
            .where('requestType', '==', 'SCHEDULE_REQUEST')
            .where('requestExpectedEndDate', '<', currentDate)
            .where('requestStatus', '==', 'WIP')
            .startAfter(lastRes.date, lastRes.id)
            .limit(10)
        );

      nextpendingPrevCollectionRef.get().subscribe(async (res: any) => {
        let resp = this.scheduleList.new;
        res = res.size != 0 ? await this.common.getDocValue(res) : [];
        this.prvOverdueLastResponse = res && res.length != 0 ? res[res.length - 1]?.id : 1;
        this.prvOverdueExcepEndDate = resp && resp.length != 0 ? resp[resp.length - 1]?.requestExpectedEndDate : 1;
        res = resp && resp.length != 0 ? res.concat(resp) : res;
        if (res && res.length != 0 && this.nextOverDueDataShown) {
          this.nextOverDueDataShown = false;
          this.prevOverdue = res;
          for (let i = 0; i < res.length; i++) {
            if (!navigator.onLine) {
              let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
              console.log(ids);
              if (ids?.includes(res[i].requestId)) {
                res[i].offline = true;
              }
            }

            res[i].scheduleTime = res[i].scheduleStartDateTime;
            res[i].scheduleTime = this.datePipe.transform(res[i].scheduleTime, 'yyyy-MM-ddTHH:mm:ss');
            res[i].scheduleTime = this.common.getTimeAgo(res[i].scheduleTime);
          }
          this.scheduleList.overdue = this.scheduleList.overdue.concat(this.prevOverdue.concat(res));
          this.prevOverdue.forEach(res => {
            if (res.requestPriority == null) {
              res.requestPriority = "NORMAL"
            }
          })
          this.incidentList = this.common.removeDuplicateArrayobj(this.scheduleList.overdue);
          this.incidentList = this.common.sortData(this.incidentList, this.reqType, this.sortNew);
          this.noRecordFound = false;
          this.noRecFound();
        } else {
          this.noRecFound();
        }
      }, async (err) => {
        console.log(err)
        this.noRecFound();
      });

    }
  }

  startListeners() {
    console.log("pending list start listeners");
    this.events.subscribe('list-acknowledge:success', (data: any) => {
      setTimeout(() => {
        this.acknowledgeSuccess(data.user);
      }, 1000);
    });
    this.events.subscribe('list-checkin:success', (data: any) => {
      this.goDetailPage(data.user);
    });
    this.events.subscribe('list-startwork:success', (data: any) => {
      this.startWorkSuccess(data.user);
    });
    this.events.subscribe('click:detail', (data: any) => {
      console.log('Welcome', data.user, 'at', data.type);
      setTimeout(() => {
        this.doClickAction(data.user, data.type);
      }, 1000);
    });
  }
  ionViewDidLeave() {
  }
  ngAfterViewInit() {
    this.pendingFilter = new PendingFilter();
    this.assetFilter = new AssetFilter();
    let instance = this;
    this.events.subscribe('click:detail', (data: any) => {
      instance.doClickAction(data.user, data.type);
    });
  }

  stopListener(listenerName) {
    this.events.subscribe(listenerName, null);
  }

  getFirestoreData(profile) {
    this.isScroll = false;
    try {
      let tagsCollectionRef = this.firestore
        .collection('organization')
        .doc(profile.tenantId)
        .collection('tag', (ref) => ref.orderBy('id', 'asc'));
      tagsCollectionRef.valueChanges().subscribe((res) => {
        this.common.tagList = res;
        this.setFilterButtons();
      });
    } catch (error) {
      console.log('Error==>' + error);
    }
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

  filterCompletedRequest(res) {
    let result = res;
    this.common.pendingList = [];
    for (let request of result) {
      if (request.requestStatus != 'Completed') {
        this.common.pendingList.push(request);
      }
    }
    this.getPendingList();
  }

  filterRequestByAssetId(assetId) {
    if (assetId && this.common.viewType == 'user') {
      try {
        let pendingCollectionRef = this.firestore
          .collection('organization')
          .doc(this.profile.org_id)
          .collection(this.common.viewType)
          .doc(JSON.stringify(this.profile.id))
          .collection('pendingAction', (ref) =>
            ref.where('assetId', '==', +assetId).orderBy('id', 'desc')
          );
        pendingCollectionRef.valueChanges().subscribe((res) => {
          this.common.pendingList = res;
          this.selectedFilter = [];
          this.getPendingList();
          this.selectedFilter.push({
            name: 'AssetId - ' + assetId,
          });
        });
      } catch (error) {
        console.log('Error==>' + error);
      }
    }
  }

  isShiftwiseRecord(incident) {
    if (!this.defaultView) {
      if (this.navType == 'daily') {
        if (incident.shift == this.shiftType) {
          return true;
        }
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  getShiftwiseCount() {
    this.shiftACount = 0;
    this.shiftBCount = 0;
    this.shiftCCount = 0;
    this.common.pendingList.forEach((incident) => {
      if (incident.shift == 'I') {
        this.shiftBCount++;
      } else if (incident.shift == 'II') {
        this.shiftCCount++;
      } else if (incident.shift == 'III') {
        this.shiftACount++;
      }
    });
    this.shiftType = this.shiftACount ? 'I' : this.shiftBCount ? 'II' : 'III';
  }

  showShitWiseRequest(shift) {
    this.shiftType = this.getShiftValue(shift);
    this.doFilter(this.filterType);
  }

  getShiftValue(shift) {
    switch (shift) {
      case 'I':
        return 'III';
      case 'II':
        return 'I';
      case 'III':
        return 'II';
      default:
        break;
    }
  }

  prepareData() {
    this.scheduleList = new pendingCountDto();
    this.workList = new pendingCountDto();
  }
  getPendingList(type?) {
    let prevCount = 0;
    let wrkCount = 0;
    this.prepareData();
    let authorizeList = [];
    let nonAuthorizeList = [];
    let workRequestList = [];

    for (let record of this.common.pendingList) {
      if (record.requestType == 'SCHEDULE_REQUEST') {
        if (this.authorize && record.routeName == 'Authorization') {
          authorizeList.push(record);
        } else if (record.routeName != 'Authorization') {
          nonAuthorizeList.push(record);
        }
      } else {
        workRequestList.push(record);
      }
    }
    this.common.pendingList = this.authorize ? authorizeList : nonAuthorizeList;
    this.common.pendingList = [...this.common.pendingList, ...workRequestList];
    for (let record of this.common.pendingList) {
      this.setWorkDuration(record);
      if (record.requestType == 'SCHEDULE_REQUEST') {
        this.splitRequest(this.scheduleList, record, record.requestType);
        prevCount++;
      } else if (record.requestType == 'WORK_REQUEST') {
        this.splitRequest(this.workList, record, record.requestType);
        wrkCount++;
      }
      record.tag = this.getTagName(record.tagId);
    }
    if (!this.defaultView) {
      this.getShiftwiseCount();
    }
    this.finalizePrepare();
    console.log(`work order count ===>${wrkCount}`);
    console.log(`preventive maintenance count===>${prevCount}`);
  }

  splitRequest(requestList, incident, reqType?) {
    if (incident.ackReq) {
      if (requestList.acknowledgeCount < 20) {
        requestList.acknowledge.push(incident);
      }
      requestList.acknowledgeFull.push(incident);
      requestList.acknowledgeCount++;
    }
    if (!incident.ackReq && incident.checkinRequired) {
      if (requestList.checkInCount < 20) {
        requestList.checkIn.push(incident);
      }
      requestList.checkInFull.push(incident);
      requestList.checkInCount++;
    }
    if (!incident.ackReq && !incident.checkinRequired) {
      if (requestList.workInProgressCount < 20) {
        requestList.workInProgress.push(incident);
      }
      requestList.workInProgressFull.push(incident);
      requestList.workInProgressCount++;
    }
  }

  finalizePrepare() {
    // this.scheduleCount =
    //   this.scheduleList.acknowledgeCount +
    //   this.scheduleList.checkInCount +
    //   this.scheduleList.workInProgressCount;
    // this.wrkReqCount =
    //   this.workList.acknowledgeCount +
    //   this.workList.checkInCount +
    //   this.workList.workInProgressCount;
    this.reqType = this.reqType
      ? this.reqType
      : this.scheduleCount
        ? 'SCHEDULE_REQUEST'
        : 'WORK_REQUEST';
    if (!this.common.isWorkLoaded) {
      this.common.isWorkLoaded = true;
    }
    this.prepareList();
  }

  getTagName(tagId) {
    let field = '';
    this.common.tagList.forEach((tag) => {
      if (tag.id == tagId) {
        field = tag;
      }
    });
    return field;
  }

  doFilter(key, type?, isScroll?, tagId?, revType?) {
    this.isScroll = false;
    this.filterType = key;
    tagId = this.tagId;
    type = this.reqType;
    this.incidentList = [];
    this.chckFilter = false;
    this.ackFilter = false;
    this.progFilter = false;

    switch (key) {
      case 'wip':
        if (this.filteredReqId) {
          this.filterResult('', this.filteredReqId);
          return;
        };
        if (this.filter) {
          this.filterPending(this.pendingFilter);
          return;
        }
        this.getWipData(revType);
        this.getDrafts(type);
        if (tagId) this.doTagFilter(tagId);
        break;
      case 'pending':
        if (this.filteredReqId) {
          this.filterResult('', this.filteredReqId);
          return;
        };
        if (this.filter) {
          this.filterPending(this.pendingFilter);
          return;
        }
        this.getPendingdata(revType);
        this.getDrafts(type);
        if (tagId) this.doTagFilter(tagId);
        break;
      case 'overdue':
        if (this.filteredReqId) {
          this.filterResult('', this.filteredReqId);
          return;
        };
        if (this.filter) {
          this.filterPending(this.pendingFilter);
          return;
        }
        this.getOverduedata(revType);
        this.getDrafts(type);
        if (tagId) this.doTagFilter(tagId);
        break;
      case 'ack':
        this.chckFilter = false;
        this.progFilter = false;
        this.ackFilter = true;
        if (this.filteredReqId) {
          this.filterResult('', this.filteredReqId);
          return;
        };
        if (this.filter) {
          this.filterPending(this.pendingFilter);
          return;
        }
        this.getAckData(revType);
        this.common.logClickEvent(
          this.reqType + '_Acknowledge_tab_click_from_pending',
          'Pending Page'
        );
        this.getDrafts(type);
        if (tagId) this.doTagFilter(tagId);

        break;
      case 'check':
        this.chckFilter = true;
        this.progFilter = false;
        this.ackFilter = false;
        if (this.filteredReqId) {
          this.filterResult('', this.filteredReqId);
          return;
        };
        if (this.filter) {
          this.filterPending(this.pendingFilter);
          return;
        }
        this.getCheckInData(revType);
        this.common.logClickEvent(
          this.reqType + '_Checkin_tab_click_from_pending',
          'Pending Page'
        );
        this.getDrafts(type);
        if (tagId) this.doTagFilter(tagId);
        break;
      case 'progress':
        this.chckFilter = false;
        this.progFilter = true;
        this.ackFilter = false;
        if (this.filteredReqId) {
          this.filterResult('', this.filteredReqId);
          return;
        };
        if (this.filter) {
          this.filterPending(this.pendingFilter);
          return;
        }
        this.getProgressData(revType);
        this.common.logClickEvent(
          this.reqType + '_Inprogress_tab_click_from_pending',
          'Pending Page'
        );
        if (!isScroll) this.getDrafts(type);
        if (tagId) this.doTagFilter(tagId);
        break;

      default:
        this.ackFilter = true;
        this.incidentList =
          type == 'SCHEDULE_REQUEST'
            ? this.scheduleList.acknowledge
            : this.workList.acknowledge;
        this.copyIncidentList = this.incidentList;
        this.getDrafts(type);
        if (tagId) this.doTagFilter(tagId);
        if (this.filteredReqId) this.filterResult('', this.filteredReqId);
        break;
    }
  }

  doTagFilter(tagId) {
    let filteredArray = [];
    this.incidentList.forEach((request) => {
      if (+tagId == request.tagId) {
        filteredArray.push(request);
      }
    });
    this.incidentList = filteredArray;
    this.copyIncidentList = this.incidentList;
  }

  doInfinite(infiniteScroll?) {
    let pendingData = JSON.parse(window.localStorage.getItem('offlinePendingData'));
    if (this.reqType == 'SCHEDULE_REQUEST') {
      if (this.filterType == 'wip') {
        this.scheduleList.wip = this.common.removeDuplicateArrayobj(this.scheduleList.wip);
      } else if (this.filterType == 'pending') {
        this.scheduleList.pending = this.common.removeDuplicateArrayobj(this.scheduleList.pending);
      } else if (this.filterType == 'overdue') {
        this.scheduleList.overdue = this.common.removeDuplicateArrayobj(this.scheduleList.overdue);
      }
      // setTimeout(() => {
      switch (this.filterType) {
        case 'ack':
          if (this.scheduleList.acknowledge.length != this.prvAckCount) {
            this.nextAckData(this.prvAckLastResponse);
            setTimeout(() => {
              infiniteScroll.target.complete();
            }, 3000);
          } else {
            this.isScroll = true
          }

          break;
        case 'check':
          if (this.scheduleList.checkIn.length != this.prvCheckinCount) {
            this.nextCheckInData(this.prevCheckInLasrRes);
          }
          setTimeout(() => {
            infiniteScroll.target.complete();
          }, 3000);

          break;
        case 'progress':
          if (
            this.scheduleList.workInProgress.length != this.prvProgressCount
          ) {
            this.nextProgressData(this.prevProgressLastRes);
          }
          setTimeout(() => {
            infiniteScroll.target.complete();
          }, 3000);
          break;
        case 'wip':
          let data = {
            id: this.prvWipLastResponse,
            date: this.prvWipLastDateResponse
          }
          let data2 = {
            id: this.prvNewLastResponse,
            date: this.prvNewLastDateResponse
          }
          if (this.scheduleList.wip.length != pendingData.scheduleWipCount) {
            this.nextWipData(data, data2);
            setTimeout(() => {
              infiniteScroll.target.complete();
            }, 3000);
          } else {
            this.isScroll = true
          }
          break;
        case 'pending':
          if (this.scheduleList.pending.length != pendingData.schedulePendingCount) {
            this.nextPendingData(this.prvPendingLastResponse);
            setTimeout(() => {
              infiniteScroll.target.complete();
            }, 3000);
          } else {
            this.isScroll = true
          }
          break;
        case 'overdue':
          if (this.scheduleList.overdue.length != pendingData.scheduleoverDueCount) {
            let data = {
              id: this.prvOverdueLastResponse,
              date: this.prvOverdueExcepEndDate
            }
            let data2 = {
              id: this.prvOverdueLastNewResponse,
              date: this.prvOverdueNewExcepEndDate
            }
            this.nextOverdueData(data, data2);
            setTimeout(() => {
              infiniteScroll.target.complete();
            }, 3000);
          } else {
            this.isScroll = true
          }
          break;
        default:
          infiniteScroll.target.complete();
          break;
      }
      // }, 500);
    } else {
      if (this.filterType == 'wip') {
        this.workList.wip = this.common.removeDuplicateArrayobj(this.workList.wip);
      } else if (this.filterType == 'pending') {
        this.workList.pending = this.common.removeDuplicateArrayobj(this.workList.pending);
      } else if (this.filterType == 'overdue') {
        this.workList.overdue = this.common.removeDuplicateArrayobj(this.workList.overdue);
      }
      setTimeout(() => {
        switch (this.filterType) {
          case 'ack':
            if (this.workList.acknowledge.length != this.wrkAckCount) {
              this.nextAckData(this.wrkAckLastRes);
            }
            infiniteScroll.target.complete();
            break;
          case 'check':
            if (this.workList.checkIn.length == this.wrkCheckinCount) {
              this.nextCheckInData(this.wrkCheckInLasrRes);
            }
            infiniteScroll.target.complete();
            break;
          case 'progress':
            if (this.workList.workInProgress.length != this.wrkProgressCount) {
              this.nextProgressData(this.wrkProgressLastRes);
            }
            infiniteScroll.target.complete();
            break;
          case 'wip':
            let wipData = {
              id: this.wrkWipLastRes,
              date: this.wrkWipLastDateRes
            }
            let NewWipData = {
              id: this.wrkNewLastResp,
              date: this.workNewLastDateResp
            }
            if (this.workList.wip.length != pendingData.workWipCount) {
              this.nextWipData(wipData, NewWipData);
              setTimeout(() => {
                infiniteScroll.target.complete();
              }, 3000);
            } else {
              this.isScroll = true;
            }

            break;
          case 'pending':
            if (this.workList.pending.length != pendingData.workPendingCount) {
              this.nextPendingData(this.wrkPendingLastRes);
              setTimeout(() => {
                infiniteScroll.target.complete();
              }, 3000);
            } else {
              this.isScroll = true;
            }

            break;
          case 'overdue':
            let overdueDataNew = {
              id: this.wrkNewOverdueLastRes,
              date: this.wrkNewOverdueLastDateRes
            }
            let overdueDataWip = {
              id: this.wrkOverdueLastRes,
              date: this.wrkOverdueLastDateRes
            }
            if (this.workList.overdue.length != pendingData.workoverDueCount) {
              this.nextOverdueData(overdueDataWip, overdueDataNew);
              setTimeout(() => {
                infiniteScroll.target.complete();
              }, 3000);
            } else {
              this.isScroll = true;
            }

            break;
          default:
            infiniteScroll.target.complete();
            break;
        }
      }, 500);
    }
  }

  doAcknowledgeScroll(requestList) {
    let startCount = 0;
    if (this.endCount <= requestList.acknowledgeFull.length + 10) {
      requestList.acknowledge = [];
      for (let record of requestList.acknowledgeFull) {
        if (startCount < this.endCount) {
          requestList.acknowledge.push(record);
          startCount++;
        }
      }
    }
  }

  doCheckinScroll(requestList) {
    let startCount = 0;
    if (this.endCount <= requestList.checkInFull.length + 10) {
      requestList.checkIn = [];
      for (let record of requestList.checkInFull) {
        if (startCount < this.endCount) {
          requestList.checkIn.push(record);
          startCount++;
        }
      }
    }
  }

  doProgressScroll(requestList) {
    let startCount = 0;
    if (this.endCount <= requestList.workInProgressFull.length + 10) {
      requestList.workInProgress = [];
      for (let record of requestList.workInProgressFull) {
        if (startCount < this.endCount) {
          requestList.workInProgress.push(record);
          startCount++;
        }
      }
    }
  }
  ngOnInit() {


  }

  showRequest(type) {
    if (type == 'Schedule') {
      this.reqType = 'SCHEDULE_REQUEST';
      this.placeHolder = 'Search By Id/PM Name'
    } else {
      this.reqType = 'WORK_REQUEST';
      this.placeHolder = 'Search By Id/Description'
    }
    this.endCount = 10;
    this.stopScroll = false;
    this.isPendingUpdate = false;
    this.isAckUpdate = false;
    this.incidentList = [];
    this.common.logClickEvent(
      this.reqType + '_tab_click_from_pending',
      'Pending Page'
    );
    this.doFilter(this.filterType);
    this.displayCount(this.reqType);
  }
  displayCount(reqType?) {
    this.ackCount = reqType == 'SCHEDULE_REQUEST'
      ? this.prvAckCount : this.wrkAckCount;
    this.checkinCount = reqType == 'SCHEDULE_REQUEST'
      ? this.prvCheckinCount : this.wrkCheckinCount;
    this.progressCount = reqType == 'SCHEDULE_REQUEST'
      ? this.prvProgressCount : this.wrkProgressCount;
  }

  goDetailPage(incident) {
    console.log(incident);
    if (
      incident.action != 'submit' &&
      incident.action != 'closeIncident' &&
      incident.action != 'reject'
    ) {
      this.common.logClickEvent('Pending_Request_Detail', 'Pending Page');
      let navigationExtras: NavigationExtras = {
        queryParams: {
          selectedRequest: JSON.stringify(incident),
          workflowId: incident.workflowId,
          locationId: incident.locationId,
          assetId: incident.assetId,
          type: 'pending',
          isDraft: incident.action == 'saveAsDraft' ? true : false,
          subHeader: this.subHeader
        },
      };
      console.count();
      // setTimeout(() => {
        this.router.navigate(['/request-detail'], navigationExtras);
      // }, 10);
    }
  }

  getDrafts(requestType) {
    this.pendingRoutes = [];
    this.offlineAckDrafts = [];
    this.getAcknowledgeDraft(requestType);
    this.getCheckinDraft(requestType);
    this.getRouteDraft(requestType);
  }

  getAcknowledgeDraft(requestType) {
    let ackCount = 0;
    let ackData = JSON.parse(localStorage.getItem(Config.constants.ackDraft));
    if (null != ackData) {
      if (this.incidentList && this.incidentList.length > 0) {
        for (let finalPendingRoute of ackData) {
          for (let finalIncident of this.incidentList) {
            if (
              finalIncident.requestHistoryId ==
              finalPendingRoute.requestHistoryId
            ) {
              if (this.filterType == 'ack') {
                finalIncident.ackReq = false;
                finalIncident.requestStatus =
                  finalIncident.requestStatus &&
                    finalIncident.requestStatus.includes('/ (offline)')
                    ? finalIncident.requestStatus
                    : 'Acknowledge / (offline)';
                this.incidentList.splice(
                  this.incidentList.indexOf(finalIncident),
                  1
                );
                this.copyIncidentList = this.incidentList;
                if (requestType == 'SCHEDULE_REQUEST') {
                  ackCount = this.setAcknowledgeCount(
                    finalIncident,
                    this.scheduleList
                  )
                    ? ackCount++
                    : ackCount;
                } else {
                  ackCount = this.setAcknowledgeCount(
                    finalIncident,
                    this.workList
                  )
                    ? ackCount++
                    : ackCount;
                }
              }
            }
          }
        }
      }
      for (let finalPendingRoute of ackData) {
        if (finalPendingRoute.requestType == requestType) {
          this.offlineAckDrafts.push(finalPendingRoute);
        }
      }
      if (this.offlineAckDrafts.length && !this.isAckUpdate) {
        this.ackCount = this.ackCount
          ? this.ackCount - this.offlineAckDrafts.length
            ? this.ackCount - this.offlineAckDrafts.length
            : 0
          : this.ackCount;
        this.checkinCount = this.checkinCount
          ? this.checkinCount + ackCount
          : this.checkinCount;
        this.isAckUpdate = true;
      }
    }
  }

  getCheckinDraft(requestType) {
    let checkinCount = 0;
    let checkInData = JSON.parse(
      localStorage.getItem(Config.constants.checkIn)
    );
    if (null != checkInData && checkInData.length) {
      checkinCount = checkInData.length;
      if (this.incidentList && this.incidentList.length > 0) {
        for (let finalPendingRoute of checkInData) {
          for (let finalIncident of this.incidentList) {
            if (
              finalIncident.requestHistoryId ==
              finalPendingRoute.requestHistoryId
            ) {
              if (this.filterType == 'check') {
                finalIncident.checkinRequired = false;
                finalIncident.trackingRequired = false;
                finalIncident.requestStatus =
                  finalIncident.requestStatus &&
                    finalIncident.requestStatus.includes('/ (offline)')
                    ? finalIncident.requestStatus
                    : 'Checkin / (offline)';
                finalIncident.requestStatus = 'Checkin';
              }
              if (this.filterType == 'ack') {
                finalIncident.checkinRequired = false;
                finalIncident.requestStatus =
                  finalIncident.requestStatus &&
                    finalIncident.requestStatus.includes('/ (offline)')
                    ? finalIncident.requestStatus
                    : 'Checkin / (offline)';
              }
            }
          }
        }
      }
      for (let finalPendingRoute of checkInData) {
        if (finalPendingRoute.requestType == requestType) {
          this.offlineCheckinDrafts.push(finalPendingRoute);
        }
      }
      if (requestType == 'SCHEDULE_REQUEST') {
        this.setCheckinCount(checkInData, this.scheduleList, checkinCount);
      } else {
        this.setCheckinCount(checkInData, this.workList, checkinCount);
      }
    }
  }

  async getRouteDraft(requestType) {
    // let drafts = JSON.parse(
    //   localStorage.getItem(Config.constants.routeDraftRequest)
    // );
    let drafts :any = await this.common.getStorageValue(Config.constants.routeDraftRequest);
    if (drafts) {
      for (let pending of drafts) {
        pending.active = false;
        if (pending.requestType == requestType) {
          this.pendingRoutes.push(pending);
        }
      }
      if (requestType == 'SCHEDULE_REQUEST') {
        this.setRouteDraft(this.scheduleList);
      } else {
        this.setRouteDraft(this.workList);
      }
      if (this.pendingRoutes.length) {
        this.progressCount += this.pendingRoutes.length;
      }
    }
    if (this.incidentList && this.incidentList.length > 0) {
      for (let finalPendingRoute of this.pendingRoutes) {
        for (let finalIncident of this.incidentList) {
          if (finalIncident.id == finalPendingRoute.id) {
            this.incidentList.splice(
              this.incidentList.indexOf(finalIncident),
              1
            );
            this.copyIncidentList = this.incidentList;
          }
        }
      }
      if (this.incidentList.length > 10) {
        this.stopScroll = false;
      } else {
        this.stopScroll = true;
      }
    } else {
      this.stopScroll = true;
    }
    if (this.filterType != 'progress') {
      this.pendingRoutes = [];
    }

    for (let finalPendingRoute of this.pendingRoutes) {
      if (finalPendingRoute.action != 'saveAsDraft') {
        this.offlineSyncCount++;
      }
    }
    if (
      this.offlineSyncCount &&
      !this.common.isSyncStarted &&
      navigator.onLine
    ) {
      console.log('Pending List');
      this.offlineProvider.prepareOfflineSubmission();
    }
  }

  setAcknowledgeCount(finalIncident, requestList) {
    let ackCount = 0;
    if (!this.isAckUpdate && finalIncident.checkinRequired) {
      finalIncident.requestStatus = 'Checkin';
      ackCount++;
      requestList.checkIn = [finalIncident, ...requestList.checkIn];
    } else if (!this.isAckUpdate && !finalIncident.checkinRequired) {
      finalIncident.requestStatus = 'Update';
      ackCount++;
      requestList.workInProgress = [
        finalIncident,
        ...requestList.workInProgress,
      ];
    }
    return ackCount;
  }
  setCheckinCount(checkInData, requestList, checkinCount) {
    for (let finalPendingRoute of checkInData) {
      for (let finalIncident of requestList.checkInFull) {
        if (
          finalIncident.requestHistoryId == finalPendingRoute.requestHistoryId
        ) {
          requestList.checkInFull.splice(
            requestList.checkInFull.indexOf(finalIncident),
            1
          );
        }
      }
      this.checkinCount = requestList.checkInFull.length;
      this.checkinCount = this.checkinCount
        ? this.checkinCount + checkinCount
        : this.checkinCount;
    }
  }
  setRouteDraft(requestList) {
    for (let finalPendingRoute of this.pendingRoutes) {
      for (let finalIncident of requestList.workInProgressFull) {
        if (finalIncident.id == finalPendingRoute.id) {
          requestList.workInProgressFull.splice(
            requestList.workInProgressFull.indexOf(finalIncident),
            1
          );
        }
      }
      this.progressCount = requestList.workInProgressFull.length;
    }
  }

  prepareList() {
    this.ackCount =
      this.reqType == 'WORK_REQUEST' ? this.wrkAckCount : this.prvAckCount;
    this.checkinCount =
      this.reqType == 'WORK_REQUEST'
        ? this.wrkCheckinCount
        : this.prvCheckinCount;
    this.progressCount =
      this.reqType == 'WORK_REQUEST'
        ? this.wrkProgressCount
        : this.prvProgressCount;
    this.isAckUpdate = false;

    if (!this.defaultView && this.navType == 'daily') {
      this.showShitWiseRequest(this.shiftType);
    }
    let filter = this.filterType;
    this.reqType == 'WORK_REQUEST'
      ? this.setFilter(this.workList)
      : this.setFilter(this.scheduleList);
    this.filterType =
      filter && this.checkFilterType(filter) ? filter : this.filterType;
  }

  checkFilterType(filter) {
    return this.reqType == 'WORK_REQUEST'
      ? this.validateFilter(filter, this.workList)
      : this.validateFilter(filter, this.scheduleList);
  }

  setFilter(requestList) {
    if (requestList.acknowledgeCount > 0) this.filterType = 'ack';
    else if (requestList.checkInCount > 0) this.filterType = 'check';
    else this.filterType = 'progress';
  }

  validateFilter(filter, requestList) {
    let isValid = false;
    switch (filter) {
      case 'ack':
        isValid = requestList.acknowledgeCount ? true : false;
        break;
      case 'check':
        isValid = requestList.checkInCount ? true : false;
        break;
      case 'progress':
        isValid = requestList.workInProgressCount ? true : false;
        break;
      default:
        break;
    }
    return isValid;
  }

  setWorkDuration(list) {
    let start: any;
    let end: any;
    let seconds: number;
    let minutes: number;
    let hours: number;
    let days: number;

    start = new Date(list.scheduleStartDateTime);
    end = new Date(list.scheduleEndDateTime);

    seconds = Math.floor((end - start) / 1000);
    minutes = Math.floor(seconds / 60);
    hours = Math.floor(minutes / 60);
    days = Math.floor(hours / 24);

    hours = hours - days * 24;
    minutes = minutes - days * 24 * 60 - hours * 60;
    seconds = seconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60;

    list.Duration =
      (days != 0 ? days + ' D ' : '') +
      (hours != 0 ? hours + ' H ' : '') +
      (minutes != 0 ? minutes + ' M ' : '');
  }

  acknowledge(incident) {
    console.log("ack call");
    this.buttonActionProvider.acknowledge(incident, 'list');
  }

  acknowledgeSuccess(incident) {
    if (!navigator.onLine) {
      this.updateLocalData(incident);
    }
    console.log("detail page :")
    this.goDetailPage(incident);
  }

  startWork(incident) {
    this.buttonActionProvider.startWork(incident, 'list');
  }

  startWorkSuccess(incident) {
    if (!incident.checkinRequired) {
      this.goDetailPage(incident);
    }
    this.updateLocalData(incident);
    let navigationExtras: NavigationExtras = {
      queryParams: {
        lat: JSON.stringify(incident.latitude),
        lng: JSON.stringify(incident.longitude),
        location: incident.locationName,
        selectedRequest: JSON.stringify(incident),
      },
    };
    this.router.navigate(['/track-user'], navigationExtras);
  }

  async gotoCommentsPage(incident) {
    const modal = await this.modalCtrl.create({
      component: ChatPage,
      componentProps: {
        selectedRequestId: incident.requestId,
        title: incident.workflowName + ' / ' + incident.locationName,
      },
    });

    modal.onDidDismiss().then((detail: OverlayEventDetail) => {
      let modelData = detail.data;
      if (modelData !== null) {
        this.modelData = modelData;
        console.log('Modal Data : ' + modelData);
      }
    });

    return await modal.present();
  }

  setFilterButtons() {
    this.filterButtons = [];
    let btnName = this.reqType == 'SCHEDULE_REQUEST' ? 'Preventive Created : ' : 'WorkOrder Created  :';
    this.filterButtons = [
      {
        text: this.reqService.translatedata(btnName) + this.reqService.translatedata(' Latest'),
        cssClass: 'action-sheet-custom-button sortBy',
        icon: 'arrow-down-circle-outline',
        handler: () => {
          this.tagId = null;
          if (!this.sortNew) {
            this.noRecordFound = false;
            this.doFilter(this.filterType, 'desc');
            this.sortNew = !this.sortNew;
          }
          this.selectedFilter = [
            { id: 1, name: 'Recent', color: 'rgb(255, 159, 26)' },
          ];
        },
      },
      {
        text: this.reqService.translatedata(btnName) + this.reqService.translatedata(' Earliest'),
        cssClass: 'sortBy',
        icon: 'arrow-up-circle-outline',
        handler: () => {
          this.tagId = null;
          if (this.sortNew) {
            this.noRecordFound = false;
            this.doFilter(this.filterType, 'asc');
            this.sortNew = !this.sortNew;
          }
          this.selectedFilter = [
            { id: 2, name: 'Old to Recent', color: 'rgb(255, 159, 26)' },
          ];
        },
      },
    ];
    this.common.tagList.forEach((tag) => {
      this.filterButtons.push({
        text: tag.name,
        icon: 'pricetag-outline',
        cssClass: tag.name,
        handler: () => {
          this.tagId = tag.id;
          this.doFilter(this.filterType, this.reqType, false, tag.id);
          this.selectedFilter = [tag];
        },
      });
    });
  }

  async openSortBy() {
    let actionSheetControl = await this.actionSheetCtrl.create({
      header: this.reqService.translatedata('Sort By'),
      cssClass: 'action-sort-sheet',
      buttons: this.filterButtons,
    });
    await actionSheetControl.present();
  }

  updateLocalData(incident) {
    this.ackCount--;
    incident.ackReq = false;
    if (!navigator.onLine)
      incident.requestStatus =
        incident.requestStatus && incident.requestStatus.includes('/ (offline)')
          ? incident.requestStatus
          : incident.requestStatus + ' / (offline)';
    if (!this.incidentList.length) {
      this.doFilter('check');
    }
    this.reqType == 'SCHEDULE_REQUEST'
      ? this.updateLocalRequest(incident, this.scheduleList)
      : this.updateLocalRequest(incident, this.workList);
  }

  updateLocalRequest(incident, requestList) {
    requestList.acknowledge.splice(
      requestList.acknowledge.indexOf(incident),
      1
    );
    if (incident.checkinRequired) {
      incident.requestStatus = 'Checkin';
      requestList.checkIn.push(incident);
      this.checkinCount++;
      this.doFilter('ack');
    } else {
      incident.requestStatus =
        this.reqType == 'SCHEDULE_REQUEST' ? 'Update' : 'New';
      requestList.workInProgress = [incident, ...requestList.workInProgress];
      this.progressCount++;
      this.doFilter('progress');
    }
  }

  clearFilter() {
    this.selectedFilter = [];
    this.sortNew = true;
    this.doFilter(this.filterType, 'desc');
  }

  doClickAction(incident, type) {
    switch (type) {
      case 'view':
        this.goDetailPage(incident);
        break;
      case 'acknowledge':
        this.acknowledge(incident);
        break;
      case 'checkin':
        this.checkin(incident);
        break;
      case 'startwork':
        this.startWork(incident);
        break;
      default:
        break;
    }
    // this.events.destroy('click:detail');
  }

  checkin(incident) {
    this.common.logClickEvent('checkin_btn_click', 'Pending Page');
    if (incident.checkInType == 'bypass') {
      this.buttonActionProvider.checkIn(incident, 'list');
    } else {
      const checkinType = incident.checkInType;
      let navigationExtras: NavigationExtras = {
        queryParams: {
          checkinType: checkinType,
          selectedRequest: JSON.stringify(incident),
          stage: 'Three',
        },
      };
      this.router.navigate(['/checkin'], navigationExtras);
    }
  }
  checkNumber(inputtxt) {
    const specialChars = /^[0-9]+$/;
    return specialChars.test(inputtxt);
  }

  filterResult(event, value?) {
    this.incidentList = [];
    const start = Date.now();
    let val;
    let valueChanges;
    var incidentFullList;
    valueChanges = val = value ? value : event.target.value;
    let bool = this.checkNumber(val);
    this.isScroll = true;
    val = val
      ? val.trim()
        ? val.trim().replace(new RegExp("\\s+", "gm"), " ")
        : ""
      : "";
    this.filteredReqId = val;
    var profile = JSON.parse(window.localStorage.getItem('Profile'));
    this.profile = profile;
    var searchParam =
      this.common.viewType == 'user'
        ? JSON.stringify(profile.id)
        : this.common.getLocationId();

    if (val.length != 0) {
      this.common.displayLoading();
      this.incidentList = [];
      if (this.filter) {
        incidentFullList = this.filterResultsValue;
      } else {
        incidentFullList = this.common.removeDuplicateArrayobj(this.getIncidentFullList());
      }
      if (this.reqType == 'SCHEDULE_REQUEST') {
        this.incidentList = incidentFullList.filter(r =>
          r.requestId && r.requestId.toString().includes(val) ||
          r.scheduleName.toLowerCase().includes(val.toLowerCase()) ||
          (r.requestKey && r.requestKey.toString().toLowerCase().includes(val.toString().toLowerCase()))
        )
        this.incidentList = this.incidentList.slice(0, 10);
        setTimeout(() => {
          this.common.stopLoading();
          this.noRecordFound = this.incidentList.length == 0 ? true : false;
        }, 500);
      } else {
        this.incidentList = incidentFullList.filter(r =>
          r.requestId && r.requestId.toString().includes(val.toString()) ||
          r.requestDescription.toLowerCase().includes(val.toLowerCase()) ||
          (r.requestKey && r.requestKey.toString().toLowerCase().includes(val.toString().toLowerCase()))
        )
        this.incidentList = this.incidentList.slice(0, 10);
        setTimeout(() => {
          this.common.stopLoading();
          this.noRecordFound = this.incidentList.length == 0 ? true : false;
        }, 500);
      }
      if (this.incidentList.length == 0) {
        this.noRecordFound = true;
      } else {
        this.noRecordFound = false;
      }
    }
    // if(val.length != 0 ){
    //   val = val.toUpperCase();
    //   let searchPendingCollection = this.firestore 
    //   .collection('organization')
    //   .doc(profile.tenantId)
    //   .collection(this.common.viewType)
    //   .doc(searchParam)
    //   .collection('pendingAction', (ref) =>
    //     ref
    //     .orderBy('requestKey')
    //     .orderBy('scheduleName')
    //     .startAt(val, val)
    //     .limit(10)
    //   );
    //   searchPendingCollection.valueChanges().subscribe((res :any)=>{
    //     console.log(res);
    //     this.incidentList =[];   
    //     this.searchNameData = [];     
    //     this.searchNameData = res;
    //     let value = this.searchNameData;
    //     this.incidentList = value.filter(r =>
    //       // r.requestId && r.requestId.toString().includes(val) ||
    //       r.scheduleName && r.scheduleName.toLowerCase().includes(val.toLowerCase()) ||
    //       (r.requestKey && r.requestKey.toString().toLowerCase().includes(val.toString().toLowerCase()))
    //     )
    //     setTimeout(() => {
    //       this.noRecordFound = this.incidentList.length == 0 ? true : false;
    //     }, 500);
    //   },async(err)=>{
    //     console.log(err);
    // })
    
    // }
    else {
      this.isScroll = false;
      this.noRecordFound = false;
      this.incidentList = [];
      this.getCurrentIncidentList();
      this.filteredReqId = null;
    }
  }

  getIncidentFullList() {
    switch (this.filterType) {
      case 'ack':
        return this.reqType == 'SCHEDULE_REQUEST'
          ? this.scheduleList.acknowledgeFull
          : this.workList.acknowledgeFull;
      case 'check':
        return this.reqType == 'SCHEDULE_REQUEST'
          ? this.scheduleList.checkInFull
          : this.workList.checkInFull;
      case 'progress':
        return this.reqType == 'SCHEDULE_REQUEST'
          ? this.scheduleList.workInProgressFull
          : this.workList.workInProgressFull;
      case 'wip':
        return this.reqType == 'SCHEDULE_REQUEST'
          ? this.scheduleList.wipFull
          : this.workList.wipFull;
      case 'pending':
        return this.reqType == 'SCHEDULE_REQUEST'
          ? this.scheduleList.pendingFull
          : this.workList.pendingFull;
      case 'overdue':
        return this.reqType == 'SCHEDULE_REQUEST'
          ? this.scheduleList.overdueFull
          : this.workList.overdueFull;
      default:
        return;
    }
  }
  searchCancel() {
    this.searchKeyword = '';
    this.showSearchBar = false;
    this.filteredReqId = null;
    this.isScroll = false;
    this.noRecordFound = false;
    this.incidentList = [];
    this.getCurrentIncidentList();
  }
  onCancel(event) {
    this.searchKeyword = '';
    // this.showSearchBar = false;
    this.filteredReqId = null;
    this.isScroll = false;
    this.noRecordFound = false;
    this.incidentList = [];
    this.getCurrentIncidentList();
  }
  back() {
    this.router.navigate(['/home'], { replaceUrl: true });
  }
  async beginFilter() {
    this.searchKeyword = null;
    this.filteredReqId = '';
    let assetFilterModal = await this.modalCtrl.create({
      component: PendingFilterPage,
      componentProps: {
        category: this.category,
        childCategories: this.childCategories,
        selectedCategory: this.selectedCategory,
        childLocations: this.childLocations,
        selectedLocation: this.selectedLocation,
        location: this.location,
        workflow: this.workflow,
        selectedWorkflow: this.selectedWorkflow,
        asset: this.asset,
        selectedAsset: this.selectedAsset,
        reqType: this.reqType,
        selectedCustomer: this.selectedCustomer,
        customer: this.customer,
        selectedStatus: this.selectedStatus
      },
    });
    (await assetFilterModal)
      .onDidDismiss()
      .then((detail: OverlayEventDetail) => {
        this.noRecordFound = false;
        let data = detail.data;
        if (data) {
          this.filter = true;
          this.selectedCustomer = data.selectedCustomer;
          this.customer = data.customer;
          this.selectedCategory = data.selectedCategory;
          this.category = data.category;
          this.childCategories = data.childCategories;
          this.childLocations = data.childLocations;
          this.location = data.location;
          this.workflow = data.workflow;
          this.selectedWorkflow = data.selectedWorkflow;
          this.asset = data.asset;
          this.selectedAsset = data.selectedAsset;
          this.selectedLocation = data.selectedLocation;
          this.selectedStatus = data.selectedStatus;
          this.pendingFilter.selectedAsset = data.selectedAsset;
          this.pendingFilter.selectedCategory = data.selectedCategory;
          this.pendingFilter.selectedLocation = data.selectedLocation;
          this.pendingFilter.selectedWorkflow = data.selectedWorkflow;
          this.pendingFilter.childLocations = data.childLocations;
          this.pendingFilter.selectedCustomer = data.selectedCustomer;
          this.pendingFilter.selectedStatus = data.selectedStatus;
          this.filterCount = data.count;
          this.filterPending(this.pendingFilter);
        }
      });
    await assetFilterModal.present();
  }
  filterPending(filter) {
    this.incidentList = [];
    this.isScroll = true;
    this.filterDataShown = true;
    if (this.filterDataShown) {
      this.filterDataShown = false;
      if (
        (filter.selectedLocation && filter.selectedLocation.id) ||
        (filter.selectedCategory && filter.selectedCategory.id) ||
        (filter.selectedWorkflow && filter.selectedWorkflow.id) ||
        (filter.selectedCustomer && filter.selectedCustomer.id) ||
        (filter.selectedAsset && filter.selectedAsset.id) || 
        (filter.selectedStatus)
      ) {
        var profile = JSON.parse(window.localStorage.getItem('Profile'));
        this.profile = profile;
        var searchParam =
          this.common.viewType == 'user'
            ? JSON.stringify(profile.id)
            : this.common.getLocationId();
        if (filter.selectedLocation.id && filter.selectedCategory.id && filter.selectedWorkflow.id && filter.selectedAsset.id && filter.selectedCustomer.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('locationId', '==', filter.selectedLocation.id)
                .where('categoryId', '==', filter.selectedCategory.id)
                .where('workflowId', '==', filter.selectedWorkflow.id)
                .where('assetId', '==', filter.selectedAsset.id)
                .where('companyId', '==', filter.selectedCustomer.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedCustomer.id && filter.selectedCategory.id && filter.selectedLocation.id && filter.selectedAsset.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('companyId', '==', filter.selectedCustomer.id)
                .where('categoryId', '==', filter.selectedCategory.id)
                .where('locationId', '==', filter.selectedLocation.id)
                .where('assetId', '==', filter.selectedAsset.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedCustomer.id && filter.selectedCategory.id && filter.selectedAsset.id && filter.selectedWorkflow.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('companyId', '==', filter.selectedCustomer.id)
                .where('categoryId', '==', filter.selectedCategory.id)
                .where('workflowId', '==', filter.selectedWorkflow.id)
                .where('assetId', '==', filter.selectedAsset.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedCustomer.id && filter.selectedCategory.id && filter.selectedLocation.id && filter.selectedWorkflow.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('companyId', '==', filter.selectedCustomer.id)
                .where('categoryId', '==', filter.selectedCategory.id)
                .where('locationId', '==', filter.selectedLocation.id)
                .where('workflowId', '==', filter.selectedWorkflow.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedCustomer.id && filter.selectedAsset.id && filter.selectedLocation.id && filter.selectedWorkflow.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('companyId', '==', filter.selectedCustomer.id)
                .where('assetId', '==', filter.selectedAsset.id)
                .where('locationId', '==', filter.selectedLocation.id)
                .where('workflowId', '==', filter.selectedWorkflow.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedCategory.id && filter.selectedAsset.id && filter.selectedLocation.id && filter.selectedWorkflow.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('categoryId', '==', filter.selectedCategory.id)
                .where('assetId', '==', filter.selectedAsset.id)
                .where('locationId', '==', filter.selectedLocation.id)
                .where('workflowId', '==', filter.selectedWorkflow.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedCustomer.id && filter.selectedCategory.id && filter.selectedAsset.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('companyId', '==', filter.selectedCustomer.id)
                .where('categoryId', '==', filter.selectedCategory.id)
                .where('assetId', '==', filter.selectedAsset.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedCustomer.id && filter.selectedAsset.id && filter.selectedLocation.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('companyId', '==', filter.selectedCustomer.id)
                .where('assetId', '==', filter.selectedAsset.id)
                .where('locationId', '==', filter.selectedLocation.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedCustomer.id && filter.selectedLocation.id && filter.selectedWorkflow.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('companyId', '==', filter.selectedCustomer.id)
                .where('locationId', '==', filter.selectedLocation.id)
                .where('workflowId', '==', filter.selectedWorkflow.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedCustomer.id && filter.selectedCategory.id && filter.selectedWorkflow.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('companyId', '==', filter.selectedCustomer.id)
                .where('categoryId', '==', filter.selectedCategory.id)
                .where('workflowId', '==', filter.selectedWorkflow.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedCustomer.id && filter.selectedAsset.id && filter.selectedWorkflow.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('companyId', '==', filter.selectedCustomer.id)
                .where('assetId', '==', filter.selectedAsset.id)
                .where('workflowId', '==', filter.selectedWorkflow.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedCustomer.id && filter.selectedCategory.id && filter.selectedLocation.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('companyId', '==', filter.selectedCustomer.id)
                .where('categoryId', '==', filter.selectedCategory.id)
                .where('locationId', '==', filter.selectedLocation.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedCategory.id && filter.selectedAsset.id && filter.selectedWorkflow.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('categoryId', '==', filter.selectedCategory.id)
                .where('assetId', '==', filter.selectedAsset.id)
                .where('workflowId', '==', filter.selectedWorkflow.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedCategory.id && filter.selectedLocation.id && filter.selectedWorkflow.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('categoryId', '==', filter.selectedCategory.id)
                .where('locationId', '==', filter.selectedLocation.id)
                .where('workflowId', '==', filter.selectedWorkflow.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedAsset.id && filter.selectedLocation.id && filter.selectedWorkflow.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('assetId', '==', filter.selectedAsset.id)
                .where('locationId', '==', filter.selectedLocation.id)
                .where('workflowId', '==', filter.selectedWorkflow.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedCustomer.id && filter.selectedCategory.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('companyId', '==', filter.selectedCustomer.id)
                .where('categoryId', '==', filter.selectedCategory.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedCustomer.id && filter.selectedAsset.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('companyId', '==', filter.selectedCustomer.id)
                .where('assetId', '==', filter.selectedAsset.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedCustomer.id && filter.selectedLocation.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('companyId', '==', filter.selectedCustomer.id)
                .where('locationId', '==', filter.selectedLocation.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedCustomer.id && filter.selectedWorkflow.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('companyId', '==', filter.selectedCustomer.id)
                .where('workflowId', '==', filter.selectedWorkflow.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedCategory.id && filter.selectedAsset.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('categoryId', '==', filter.selectedCategory.id)
                .where('assetId', '==', filter.selectedAsset.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedCategory.id && filter.selectedLocation.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('categoryId', '==', filter.selectedCategory.id)
                .where('locationId', '==', filter.selectedLocation.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedCategory.id && filter.selectedWorkflow.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('categoryId', '==', filter.selectedCategory.id)
                .where('workflowId', '==', filter.selectedWorkflow.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedAsset.id && filter.selectedLocation.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('assetId', '==', filter.selectedAsset.id)
                .where('locationId', '==', filter.selectedLocation.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedAsset.id && filter.selectedWorkflow.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('assetId', '==', filter.selectedAsset.id)
                .where('workflowId', '==', filter.selectedWorkflow.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedLocation.id && filter.selectedWorkflow.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('locationId', '==', filter.selectedLocation.id)
                .where('workflowId', '==', filter.selectedWorkflow.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedLocation.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('locationId', '==', filter.selectedLocation.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedCategory.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('categoryId', '==', filter.selectedCategory.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedWorkflow.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('workflowId', '==', filter.selectedWorkflow.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
            // data.unsubscribe();

          }, async (err) => {
            this.incidentList = [];
          })
        } else if (filter.selectedAsset.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref.where('assetId', '==', filter.selectedAsset.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            // console.log(res);
          }, async (err) => {
            console.error(err);
            this.incidentList = [];
          })
        } else if (filter.selectedCustomer.id) {
          let pendingListsFilterCollection = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref.where('companyId', '==', filter.selectedCustomer.id)
            );
          this.filterSubscrition = pendingListsFilterCollection.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            this.getFilterValue(res);
            console.log(res);
          }, async (err) => {
            console.error(err);
            this.incidentList = [];
          })
        } else if(filter.selectedStatus == 'Yet to Ack' || filter.selectedStatus == 'Check In' || filter.selectedStatus == 'Progress') {
          let currDate = this.common.getUTCTime();
            if(this.filterType == 'wip') {
              let workorderNewPendingData = this.firestore
              .collection('organization')
              .doc(this.profile.tenantId)
              .collection(this.common.viewType)
              .doc(searchParam)
              .collection('pendingAction', (ref) =>
                ref
                  .where('requestType', '==', this.reqType)
                  .where('requestStatus', '==', 'New')
                  .where('requestExpectedEndDate', '>', currDate)
              );
              workorderNewPendingData.get().subscribe(async (res:any)=>{
                res = res && res.size != 0 ? await this.common.getDocValue(res) : [];
                let workorderWipPendingData = this.firestore
                .collection('organization')
                .doc(this.profile.tenantId)
                .collection(this.common.viewType)
                .doc(searchParam)
                .collection('pendingAction', (ref) =>
                  ref
                    .where('requestType', '==', this.reqType)
                    .where('requestStatus', '==', 'WIP')
                    .where('requestExpectedEndDate', '>', currDate)
                );
                workorderWipPendingData.get().subscribe(async (resp:any)=>{
                  resp = resp && resp.size != 0 ? await this.common.getDocValue(resp) : [];
                  res = resp && resp.length != 0 ? res.concat(resp) : res;
                  res = await this.getFilterStatus(res , filter.selectedStatus);
                  this.getFilterValue(res);
                },async(err)=>{
                  console.log(err)
                })
              },async(err)=>{
                console.log(err);
              })

            }else if(this.filterType == 'pending') {
              let pendingWorkReqAckCollectionRef = this.firestore
              .collection('organization')
              .doc(this.profile.tenantId)
              .collection(this.common.viewType)
              .doc(searchParam)
              .collection('pendingAction', (ref) =>
                ref
                  .where('requestType', '==', this.reqType)
                  .where('requestStatus', '==', 'Pending')
              );
              pendingWorkReqAckCollectionRef.get().subscribe(async (res:any)=>{
                res = res && res.size != 0 ? await this.common.getDocValue(res) : [];
                res = this.getFilterStatus(res , filter.selectedStatus);
                this.getFilterValue(res);
              },async(err)=>{
                console.log(err);
                this.incidentList = [];
              })
            }else if(this.filterType == 'overdue') {
              let overdueWorkReqNewData = this.firestore
              .collection('organization')
              .doc(this.profile.tenantId)
              .collection(this.common.viewType)
              .doc(searchParam)
              .collection('pendingAction', (ref) =>
                ref
                  .where('requestType', '==', this.reqType)
                  .where('requestStatus', '==', 'New')
                  .where('requestExpectedEndDate', '<', currDate)
              );
              overdueWorkReqNewData.get().subscribe(async (res:any)=>{
                let overdueWorkReqWipData = this.firestore
                .collection('organization')
                .doc(this.profile.tenantId)
                .collection(this.common.viewType)
                .doc(searchParam)
                .collection('pendingAction', (ref) =>
                  ref
                    .where('requestType', '==', this.reqType)
                    .where('requestStatus', '==', 'WIP')
                    .where('requestExpectedEndDate', '<', currDate)
                );
                overdueWorkReqWipData.get().subscribe(async (resp :any)=>{
                  resp = resp && resp.size != 0 ? await this.common.getDocValue(resp) : [];
                  res = res && res.size != 0 ? await this.common.getDocValue(res) : [];
                  res = resp && resp.length != 0 ? res.concat(resp) : res;
                  res = this.getFilterStatus(res , filter.selectedStatus);
                  this.getFilterValue(res);
                })

              },async(err)=>{
                console.log(err)
                this.incidentList = [];
              })
            }
        }else {

        }
      } else {
        this.noRecordFound = false;
        this.filter = false;
        this.isScroll = false;
        this.getCurrentIncidentList();
      }
    } else {
      this.noRecordFound = false;
      this.filter = false;
      this.isScroll = false;
      this.getCurrentIncidentList();
    }

  }
  getFilterStatus(res: any, selectedStatus: any): any {
    if(res && res.length != 0) {
      if(selectedStatus == 'Yet to Ack') {
        return res.filter((r)=>r.ackReq == true);
      }else if(selectedStatus == 'Check In') {
        return res.filter((r)=> r.ackReq == false && r.checkinRequired == true);
      }else if(selectedStatus == 'Progress') {
        return res.filter((r)=> r.ackReq == false && r.checkinRequired == false);
      }
    }
  }
  getCurrentIncidentList() {
    this.incidentList = [];
    if (this.reqType == 'SCHEDULE_REQUEST') {
      switch (this.filterType) {
        case 'ack':
          if (this.filteredReqId) {
            this.filterResult('', this.filteredReqId);
            return;
          };
          if (this.filter) {
            this.filterPending(this.pendingFilter);
            return;
          }
          this.incidentList = this.common.removeDuplicateArrayobj(this.scheduleList.acknowledge);
          if (this.incidentList && this.incidentList.length == 0) {
            this.getAckData();
          }
          break;
        case 'check':
          this.incidentList = this.scheduleList.checkIn;
          if (this.incidentList && this.incidentList.length == 0) {
            this.getCheckInData();
          }
          break;
        case 'progress':
          this.incidentList = this.scheduleList.workInProgress;
          if (this.incidentList && this.incidentList.length == 0) {
            this.getProgressData();
          }
          break;
        case 'wip':
          if (this.filteredReqId) {
            this.filterResult('', this.filteredReqId);
            return;
          };
          if (this.filter) {
            this.filterPending(this.pendingFilter);
            return;
          }
          this.incidentList = this.common.removeDuplicateArrayobj(this.scheduleList.wip);
          if (this.incidentList && this.incidentList.length == 0) {
            this.getWipData();
          }
          break;
        case 'pending':
          if (this.filteredReqId) {
            this.filterResult('', this.filteredReqId);
            return;
          };
          if (this.filter) {
            this.filterPending(this.pendingFilter);
            return;
          }
          this.incidentList = this.common.removeDuplicateArrayobj(this.scheduleList.pending);
          if (this.incidentList && this.incidentList.length == 0) {
            this.getPendingdata();
          }
          break;
        case 'overdue':
          if (this.filteredReqId) {
            this.filterResult('', this.filteredReqId);
            return;
          };
          if (this.filter) {
            this.filterPending(this.pendingFilter);
            return;
          }
          this.incidentList = this.common.removeDuplicateArrayobj(this.scheduleList.overdue);
          if (this.incidentList && this.incidentList.length == 0) {
            this.getOverduedata();
          }
          break;
        default:
          break;
      }

    } else {
      switch (this.filterType) {
        case 'ack':
          this.incidentList = this.workList.acknowledge;
          if (this.incidentList && this.incidentList.length == 0) {
            this.getAckData();
          }
          break;
        case 'check':
          this.incidentList = this.workList.checkIn;
          if (this.incidentList && this.incidentList.length == 0) {
            this.getCheckInData();
          }
          break;
        case 'progress':
          this.incidentList = this.workList.workInProgress;
          if (this.incidentList && this.incidentList.length == 0) {
            this.getProgressData();
          }
          break;
        case 'wip':
          if (this.filteredReqId) {
            this.filterResult('', this.filteredReqId);
            return;
          };
          if (this.filter) {
            this.filterPending(this.pendingFilter);
            return;
          }
          this.incidentList = this.common.removeDuplicateArrayobj(this.workList.wip);
          if (this.incidentList && this.incidentList.length == 0) {
            this.getWipData();
          }
          break;
        case 'pending':
          if (this.filteredReqId) {
            this.filterResult('', this.filteredReqId);
            return;
          };
          if (this.filter) {
            this.filterPending(this.pendingFilter);
            return;
          }
          this.incidentList = this.common.removeDuplicateArrayobj(this.workList.pending);
          if (this.incidentList && this.incidentList.length == 0) {
            this.getPendingdata();
          }
          break;
        case 'overdue':
          if (this.filteredReqId) {
            this.filterResult('', this.filteredReqId);
            return;
          };
          if (this.filter) {
            this.filterPending(this.pendingFilter);
            return;
          }
          this.incidentList = this.common.removeDuplicateArrayobj(this.scheduleList.overdue);
          if (this.incidentList && this.incidentList.length == 0) {
            this.getOverduedata();
          }
          break;
        default:
          break;
      }
    }
  }
  getFilterValue(filterType) {
    // this.filterSubscrition.unsubscribe();
    console.log(this.filter);
    this.incidentList = [];
    let currentDate = this.common.getUTCTime();
    for (let i = 0; i < filterType?.length; i++) {
      if (!navigator.onLine) {
        let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
        console.log(ids);
        if (ids?.includes(filterType[i][i].requestId)) {
          filterType[i][i].offline = true;
        }
      }
      filterType[i].requestSubmissionDate = this.datePipe.transform(filterType[i].requestSubmissionDate, 'yyyy-MM-ddTHH:mm:ss');
      filterType[i].requestSubmissionDate = this.common.getTimeAgo(filterType[i].requestSubmissionDate);
      if (this.filterType == 'SCHEDULE_REQUEST') {
        for (let i = 0; i < filterType[i]?.length; i++) {
          filterType[i][i].scheduleTime = filterType[i][i].scheduleStartDateTime;
          filterType[i][i].scheduleTime = this.datePipe.transform(filterType[i][i].scheduleTime, 'yyyy-MM-ddTHH:mm:ss');
          filterType[i][i].scheduleTime = this.common.getTimeAgo(filterType[i][i].scheduleTime);
        }
      }
      if (filterType[i].requestPriority == null) {
        filterType[i].requestPriority = 'NORMAL';
      }
    }
    if (filterType?.length == 0) {
      this.noRecordFound = true;
      this.incidentList = [];
      this.filterResultsValue = [];
      this.isScroll = false;
    } else {
      this.noRecordFound = false;
      filterType.forEach((req) => {
        if (this.reqType == 'SCHEDULE_REQUEST') {
          if (this.filterType == 'ack') {
            if (req.requestType == 'SCHEDULE_REQUEST' && req.ackReq == true) {
              this.incidentList.push(req);
              this.checkValue(this.incidentList);
            }
          } else if (this.filterType == 'check') {
            if (req.requestType == 'SCHEDULE_REQUEST' && req.checkinRequired == true && req.ackReq == false) {
              this.incidentList.push(req);
              this.checkValue(this.incidentList);
            }
          } else if (this.filterType == 'pending') {
            if (req.requestType == 'SCHEDULE_REQUEST' && req.requestStatus == "Pending") {
              if(this.pendingFilter.selectedStatus == 'Yet to Ack') {
                if(req.ackReq == true) {
                  this.incidentList.push(req);
                }
              }else if(this.pendingFilter.selectedStatus == 'Check In') {
                if(req.checkinRequired == true && req.ackReq == false) {
                  this.incidentList.push(req);
                }
              }else if(this.pendingFilter.selectedStatus == 'Progress') {
                if(req.checkinRequired == false && req.ackReq == false) {
                  this.incidentList.push(req);
                }
              }else {
                this.incidentList.push(req);
              }
              setTimeout(() => {
                this.checkValue(this.incidentList);
              }, 1000);
              
            }
          } else if (this.filterType == 'wip') {
            if (req.requestType == 'SCHEDULE_REQUEST' && (req.requestStatus == "WIP" || req.requestStatus == "New") && currentDate < req.requestExpectedEndDate) {
              if(this.pendingFilter.selectedStatus == 'Yet to Ack') {
                if(req.ackReq == true) {
                  this.incidentList.push(req);
                }
              }else if(this.pendingFilter.selectedStatus == 'Check In') {
                if(req.checkinRequired == true && req.ackReq == false) {
                  this.incidentList.push(req);
                }
              }else if(this.pendingFilter.selectedStatus == 'Progress') {
                if(req.checkinRequired == false && req.ackReq == false) {
                  this.incidentList.push(req);
                }
              }else {
                this.incidentList.push(req);
              }
              setTimeout(() => {
                this.checkValue(this.incidentList);
              }, 1000);
            }
          } else if (this.filterType == 'overdue') {
            if (req.requestType == 'SCHEDULE_REQUEST' && (req.requestStatus == "WIP" || req.requestStatus == "New") && currentDate > req.requestExpectedEndDate) {
              if(this.pendingFilter.selectedStatus == 'Yet to Ack') {
                if(req.ackReq == true) {
                  this.incidentList.push(req);
                }
              }else if(this.pendingFilter.selectedStatus == 'Check In') {
                if(req.checkinRequired == true && req.ackReq == false) {
                  this.incidentList.push(req);
                }
              }else if(this.pendingFilter.selectedStatus == 'Progress') {
                if(req.checkinRequired == false && req.ackReq == false) {
                  this.incidentList.push(req);
                }
              }else {
                this.incidentList.push(req);
              }
              setTimeout(() => {
                this.checkValue(this.incidentList);
              }, 1000);
            }
          } else {
            if (req.requestType == 'SCHEDULE_REQUEST' && (req.requestStatus == "WIP" || req.requestStatus == "New") && currentDate > req.requestExpectedEndDate) {
              // this.incidentList.push(req);
              // this.checkValue(this.incidentList);
              this.incidentList = [];
            }
          }
        } else {
          if (this.filterType == 'ack') {
            if (req.requestType == "WORK_REQUEST" && req.ackReq == true) {
              this.incidentList.push(req);
              this.checkValue(this.incidentList);
            }
          } else if (this.filterType == 'pending') {
            if (req.requestType == "WORK_REQUEST" && req.requestStatus == "Pending") {
              if(this.pendingFilter.selectedStatus == 'Yet to Ack') {
                if(req.ackReq == true) {
                  this.incidentList.push(req);
                }
              }else if(this.pendingFilter.selectedStatus == 'Check In') {
                if(req.checkinRequired == true && req.ackReq == false) {
                  this.incidentList.push(req);
                }
              }else if(this.pendingFilter.selectedStatus == 'Progress') {
                if(req.checkinRequired == false && req.ackReq == false) {
                  this.incidentList.push(req);
                }
              }else {
                this.incidentList.push(req);
              }
              setTimeout(() => {
                this.checkValue(this.incidentList);
              }, 1000);
            }
          } else if (this.filterType == 'wip') {
            if (req.requestType == "WORK_REQUEST" && (req.requestStatus == "WIP" || req.requestStatus == "New") && currentDate < req.requestExpectedEndDate) {
              if(this.pendingFilter.selectedStatus == 'Yet to Ack') {
                if(req.ackReq == true) {
                  this.incidentList.push(req);
                }
              }else if(this.pendingFilter.selectedStatus == 'Check In') {
                if(req.checkinRequired == true && req.ackReq == false) {
                  this.incidentList.push(req);
                }
              }else if(this.pendingFilter.selectedStatus == 'Progress') {
                if(req.checkinRequired == false && req.ackReq == false) {
                  this.incidentList.push(req);
                }
              }else {
                this.incidentList.push(req);
              }
              setTimeout(() => {
                this.checkValue(this.incidentList);
              }, 1000);
            }
          } else if (this.filterType == 'check') {
            if (req.requestType == "WORK_REQUEST" && req.checkinRequired == true) {
              this.incidentList.push(req);
              this.checkValue(this.incidentList);
            }
          } else if (this.filterType == 'overdue') {
            if (req.requestType == "WORK_REQUEST" && (req.requestStatus == "WIP" || req.requestStatus == "New") && currentDate > req.requestExpectedEndDate) {
              if(this.pendingFilter.selectedStatus == 'Yet to Ack') {
                if(req.ackReq == true) {
                  this.incidentList.push(req);
                }
              }else if(this.pendingFilter.selectedStatus == 'Check In') {
                if(req.checkinRequired == true && req.ackReq == false) {
                  this.incidentList.push(req);
                }
              }else if(this.pendingFilter.selectedStatus == 'Progress') {
                if(req.checkinRequired == false && req.ackReq == false) {
                  this.incidentList.push(req);
                }
              }else {
                this.incidentList.push(req);
              }
              setTimeout(() => {
                this.checkValue(this.incidentList);
              }, 1000);
            }
          } else {
            if (req.requestType == "WORK_REQUEST" && req.ackReq == false && req.checkinRequired == false) {
              // this.incidentList.push(req);
              // this.checkValue(this.incidentList);
              this.incidentList = [];
            }
          }
        }
      })
      this.checkValue(this.incidentList);
    }

  }
  checkValue(incidentList: Incident[]) {
    this.incidentList = this.incidentList.slice(0, 50);
    this.incidentList = this.common.sortData(this.incidentList, this.reqType, this.sortNew);
    this.filterResultsValue = incidentList;
    if (incidentList.length == 0) {
      this.noRecordFound = true;
    }
  }

  ionViewDidEnter() {
    this.pendingFilter = new PendingFilter();
    this.route.queryParams.subscribe((params) => {
      if (params && params.pushReference) {
        this.reqService.getRequests('Pending').then(
          (response) => {
            if (response) {
              this.incidents = response as Incident[];
              this.goDetailPage(this.incidents);
            } else if (!response.length) {
            }
          },
          (error) => {
            console.error(error);
          }
        );
      }
    });
    setTimeout(() => {
      this.searchDataShown = true;
      const start = Date.now();
      let profile = JSON.parse(window.localStorage.getItem('Profile'));
      let currentDate = this.common.getUTCTime();
      this.profile = profile;
      let type = this.filterType == 'wip' ? 'WIP' : 'Pending';
      let searchParam =
        this.common.viewType == 'user'
          ? JSON.stringify(this.profile.id)
          : this.common.getLocationId();
      if (this.filterType == 'overdue') {
        if (this.request != 'Schedule') {
          let pendingWorkReqAckCollectionRef = this.firestore
            .collection('organization')
            .doc(this.profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('requestType', '==', 'WORK_REQUEST')
                .where('requestExpectedEndDate', '<', currentDate)
              // .where('requestStatus', '==', 'WIP')
              // .where('requestStatus', '==', 'New')
            );
          this.searchCollectionSubscription = pendingWorkReqAckCollectionRef.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            if (res && res.length != 0 && this.searchDataShown) {
              this.searchDataShown = false;
              const end = Date.now();
              console.log(`pending Execution time: ${end - start} ms`);
              for (let i = 0; i < res?.length; i++) {
                if (!navigator.onLine) {
                  let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
                  console.log(ids);
                  if (ids?.includes(res[i].requestId)) {
                    res[i].offline = true;
                  }
                }
                res[i].requestSubmissionDate = this.datePipe.transform(res[i].requestSubmissionDate, 'yyyy-MM-ddTHH:mm:ss');
                res[i].requestSubmissionDate = this.common.getTimeAgo(res[i].requestSubmissionDate);
              }
              this.fullWorkOrderList = res;

              if (!this.filter) {
                this.SplitPendingList();
              }
            }
          }, async (err) => {
            console.log(err);
          })
        } else {
          let pendingPrevReqAckCollectionRef = this.firestore
            .collection('organization')
            .doc(this.profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('requestType', '==', 'SCHEDULE_REQUEST')
                .where('requestExpectedEndDate', '<', currentDate)
            );
          this.searchCollectionSubscription = pendingPrevReqAckCollectionRef.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            if (res && res.length != 0 && this.searchDataShown) {
              this.searchDataShown = false;
              const end = Date.now();
              console.log(`pending Execution time: ${end - start} ms`);
              for (let i = 0; i < res?.length; i++) {
                if (!navigator.onLine) {
                  let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
                  console.log(ids);
                  if (ids?.includes(res[i].requestId)) {
                    res[i].offline = true;
                  }
                }
                res[i].scheduleTime = res[i].scheduleStartDateTime;
                res[i].scheduleTime = this.datePipe.transform(res[i].scheduleTime, 'yyyy-MM-ddTHH:mm:ss');
                res[i].scheduleTime = this.common.getTimeAgo(res[i].scheduleTime);
              }
              this.FullScheduleIncidentList = res;
              this.FullScheduleIncidentList.forEach(res => {
                if (res.requestStatus == null) {
                  res.requestStatus = "WIP";
                }
                if (res.requestPriority == null) {
                  res.requestPriority = "NORMAL"
                }
              })
              if (!this.filter) {
                this.SplitPendingList();
              }
            }
            // data.unsubscribe();
          }, async (err) => {
            console.log(err)
          });
        }
      } else if (this.filterType == 'pending') {
        if (this.request != 'Schedule') {
          let pendingWorkReqAckCollectionRefdata = this.firestore
            .collection('organization')
            .doc(this.profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('requestType', '==', 'WORK_REQUEST')
                .where('requestStatus', '==', type)
            );
          this.searchCollectionSubscription = pendingWorkReqAckCollectionRefdata.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            if (res && res.length != 0 && this.searchDataShown) {
              this.searchDataShown = false;
              const end = Date.now();
              console.log(`pending Execution time: ${end - start} ms`);
              for (let i = 0; i < res?.length; i++) {
                if (!navigator.onLine) {
                  let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
                  console.log(ids);
                  if (ids?.includes(res[i].requestId)) {
                    res[i].offline = true;
                  }
                }
                res[i].requestSubmissionDate = this.datePipe.transform(res[i].requestSubmissionDate, 'yyyy-MM-ddTHH:mm:ss');
                res[i].requestSubmissionDate = this.common.getTimeAgo(res[i].requestSubmissionDate);
              }
              this.fullWorkOrderList = res;
              // data.unsubscribe();
              if (!this.filter) {
                this.SplitPendingList();
              }
            }
          }, async (err) => {
            console.log(err)
          });
        } else {
          let pendingPrevReqAckCollectionRefSchedule = this.firestore
            .collection('organization')
            .doc(this.profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('requestType', '==', 'SCHEDULE_REQUEST')
            );
          this.searchCollectionSubscription = pendingPrevReqAckCollectionRefSchedule.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            if (res && res.length != 0 && this.searchDataShown) {
              this.searchDataShown = false;
              const end = Date.now();
              console.log(`pending Execution time: ${end - start} ms`);
              for (let i = 0; i < res?.length; i++) {
                if (!navigator.onLine) {
                  let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
                  console.log(ids);
                  if (ids?.includes(res[i].requestId)) {
                    res[i].offline = true;
                  }
                }
                res[i].scheduleTime = res[i].scheduleStartDateTime;
                res[i].scheduleTime = this.datePipe.transform(res[i].scheduleTime, 'yyyy-MM-ddTHH:mm:ss');
                res[i].scheduleTime = this.common.getTimeAgo(res[i].scheduleTime);
              }
              this.FullScheduleIncidentList = res;
              this.FullScheduleIncidentList.forEach(res => {
                if (res.requestStatus == null) {
                  res.requestStatus = "WIP";
                }
                if (res.requestPriority == null) {
                  res.requestPriority = "NORMAL"
                }
              })
              if (!this.filter) {
                this.SplitPendingList();
              }
            }
            // data.unsubscribe();
          }, async (err) => {
            console.log(err)
          });
        }
      } else {
        if (this.request != 'Schedule') {
          let pendingWorkReqwipNewCollectionRef = this.firestore
            .collection('organization')
            .doc(this.profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('requestType', '==', 'WORK_REQUEST')
                .where('requestExpectedEndDate', '>', currentDate)
            );
          this.searchCollectionSubscription = pendingWorkReqwipNewCollectionRef.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            if (res && res.length != 0 && this.searchDataShown) {
              this.searchDataShown = false;
              const end = Date.now();
              console.log(`pending Execution time: ${end - start} ms`);
              for (let i = 0; i < res?.length; i++) {
                if (!navigator.onLine) {
                  let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
                  console.log(ids);
                  if (ids?.includes(res[i].requestId)) {
                    res[i].offline = true;
                  }
                }
                res[i].requestSubmissionDate = this.datePipe.transform(res[i].requestSubmissionDate, 'yyyy-MM-ddTHH:mm:ss');
                res[i].requestSubmissionDate = this.common.getTimeAgo(res[i].requestSubmissionDate);
              }
              this.fullWorkOrderList = res;
              if (!this.filter) {
                this.SplitPendingList();
              }
            }
            // data.unsubscribe();
          }, async (err) => {
            console.log(err)
          });
        } else {
          let scheduleWipNewCollectionRef = this.firestore
            .collection('organization')
            .doc(this.profile.tenantId)
            .collection(this.common.viewType)
            .doc(searchParam)
            .collection('pendingAction', (ref) =>
              ref
                .where('requestType', '==', 'SCHEDULE_REQUEST')
                .where('requestExpectedEndDate', '>', currentDate)
            );
          this.searchCollectionSubscription = scheduleWipNewCollectionRef.get().subscribe(async (res: any) => {
            res = res.size != 0 ? await this.common.getDocValue(res) : [];
            if (res && res.length != 0 && this.searchDataShown) {
              this.searchDataShown = false;
              const end = Date.now();
              console.log(`pending Execution time: ${end - start} ms`);
              for (let i = 0; i < res?.length; i++) {
                if (!navigator.onLine) {
                  let ids = JSON.parse(window.localStorage.getItem('offlineRequetsIds'));
                  console.log(ids);
                  if (ids?.includes(res[i].requestId)) {
                    res[i].offline = true;
                  }
                }
                res[i].scheduleTime = res[i].scheduleStartDateTime;
                res[i].scheduleTime = this.datePipe.transform(res[i].scheduleTime, 'yyyy-MM-ddTHH:mm:ss');
                res[i].scheduleTime = this.common.getTimeAgo(res[i].scheduleTime);
              }
              this.FullScheduleIncidentList = res;
              // data.unsubscribe();
              this.FullScheduleIncidentList.forEach(res => {
                if (res.requestStatus == null) {
                  res.requestStatus = "WIP";
                }
                if (res.requestPriority == null) {
                  res.requestPriority = "NORMAL"
                }
              })
              if (!this.filter) {
                this.SplitPendingList();
              }
            }
          }, async (err) => {
            console.log(err)
          });
        }
      }
    }, 4000)
    setTimeout(() => {
      this.getUserData();
      this.idleFunc();
    }, 5000)
  }
  idleFunc() {
    let options = {
      page: 0,
      size: 1500
    }
    setTimeout(() => {
      this.reqService.getAssetByFilter(options, this.assetFilter).subscribe(res => {
        let assetLists = res.body;
        window.localStorage.setItem('AssetLists', JSON.stringify(assetLists));
      })
    }, 6000)
  }
  getUserData() {
    let profile = JSON.parse(window.localStorage.getItem('Profile'));
    this.profile = profile;
    let userCollectionRef = this.firestore
      .collection('organization')
      .doc(profile.tenantId)
      .collection('userGroup', (ref) => ref.where('active', '==', true));
    userCollectionRef.valueChanges().subscribe((res) => {
      let usergroupList = res;
      window.localStorage.setItem('usergroupList', JSON.stringify(usergroupList));
    });
    let userListCollectionRef = this.firestore
      .collection('organization')
      .doc(profile.tenantId)
      .collection('user_base', (ref) => ref.where('active', '==', true));
    userListCollectionRef.valueChanges().subscribe((res) => {
      let userList = res;
      window.localStorage.setItem('userList', JSON.stringify(userList));
    });
  }
  SplitPendingList() {
    // this.searchCollectionSubscription.unsubscribe();
    let currentDate = this.common.getUTCTime();
    this.scheduleList.acknowledgeFull = [];
    this.scheduleList.checkInFull = [];
    this.scheduleList.workInProgress = [];
    this.scheduleList.wipFull = [];
    this.scheduleList.overdueFull = [];
    this.scheduleList.pendingFull = [];
    this.workList.acknowledgeFull = [];
    this.workList.checkInFull = [];
    this.workList.workInProgressFull = [];
    this.workList.wipFull = [];
    this.workList.pendingFull = [];
    this.workList.overdueFull = [];
    this.FullScheduleIncidentList = this.common.removeDuplicateArrayobj(this.FullScheduleIncidentList);
    this.fullWorkOrderList = this.common.removeDuplicateArrayobj(this.fullWorkOrderList);
    this.FullScheduleIncidentList.forEach((req) => {
      if (this.filterType == 'overdue' && (req.requestStatus == 'WIP' || req.requestStatus == 'New')) {
        this.scheduleList.overdueFull.push(req)
      } else if (this.filterType == 'wip' && (req.requestStatus == 'WIP' || req.requestStatus == 'New')) {
        this.scheduleList.wipFull.push(req);
      } else if (this.filterType == 'pending' && req.requestStatus == 'Pending') {
        this.scheduleList.pendingFull.push(req);
      } else if (req.ackReq) {
        this.scheduleList.acknowledgeFull.push(req)
      } else if (!req.ackReq && req.checkinRequired) {
        this.scheduleList.checkInFull.push(req)
      } else if (!req.ackReq && !req.checkinRequired) {
        this.scheduleList.workInProgressFull.push(req)
      }
    })
    this.fullWorkOrderList.forEach((req) => {
      if (this.filterType == 'overdue' && (req.requestStatus == 'WIP' || req.requestStatus == 'New')) {
        this.workList.overdueFull.push(req)
      } else if (this.filterType == 'wip' && (req.requestStatus == 'WIP' || req.requestStatus == 'New')) {
        this.workList.wipFull.push(req);
      } else if (this.filterType == 'pending' && req.requestStatus == 'Pending') {
        this.workList.pendingFull.push(req);
      } else if (req.ackReq) {
        this.workList.acknowledgeFull.push(req)
      } else if (!req.ackReq && req.checkinRequired) {
        this.workList.checkInFull.push(req)
      } else if (!req.ackReq && !req.checkinRequired) {
        this.workList.workInProgressFull.push(req)
      }
    })

  }

}
