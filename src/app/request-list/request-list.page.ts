import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { OfflineProvider } from 'src/providers/offline/offline';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';
import { Config } from '../config';
import { Incident } from '../data.model';


@Component({
  selector: 'app-request-list',
  templateUrl: './request-list.page.html',
  styleUrls: ['./request-list.page.scss'],
})
export class RequestListPage implements OnInit {
  @ViewChild('searchBar') searchBar : any;
  incidents: any = [];
  profile: any
  drafts: Incident[] = [];
  isrequest: boolean = false;
  productsCollectionRef: AngularFirestoreCollection<{}>;
  incidentList: any = [];
  lastVisible: any;
  hasNoRecord: boolean = false;
  isFetched: boolean;
  searchKeyword: any;
  showSearchBar: boolean;
  results: any;
  value: number;
  page = 0;
  shouldShowCancel: any;
  draftShown: boolean;
  progressShown: boolean;
  draftsCopy: Incident[];
  noRecordFound: boolean = false;
  searchValue: string = '';
  tab: 'drafts';
  draftLastres: any;
  progressLastres: any;
  fullResRequestList: any;
  FullincidentsList: any;
  datePipe = new DatePipe('en-US');
  tabVal = 'drafts';
  constructor(
    public firestore: AngularFirestore,
    private router : Router,
    public storage : NativeStorage,
    public common : CommonProvider, 
    public offlineProvider: OfflineProvider,
    public reqService: ServiceProvider,
    public route:ActivatedRoute

  ) { 
    
  }
  ionViewWillEnter() {
    this.tabChange('', 'drafts');    
  }
  ngOnInit() {
  }

  goDetailPage(incident, isDraft?, isMessage?, isStatus?) {
    if(navigator.onLine) {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          selectedRequest: JSON.stringify(incident),
          type: 'job',
          tab: this.tab,
          module:'myCreation',
        isMessage: isMessage ? isMessage : '',
        isStatus: isStatus ? isStatus : ''
        },replaceUrl:true
      };
      this.router.navigate(['/request-detail'],navigationExtras );
    } else {
      this.common.alertToast(
        this.common.alertToast(this.reqService.translatedata('networkConnectivityError'))
      );
    }
  }
  loadDrafts() {
    let data = JSON.parse(window.localStorage.getItem(Config.constants.draftNewReqs));
    console.log(data);
    return (data)
  }

  prepareList() {
    let offlineSyncCount = 0;
    this.loadDrafts();
    let localInc = JSON.parse(window.localStorage.getItem(Config.constants.draftNewReqs));
    console.log(localInc);
      if (null != localInc) {
        for (let draft of localInc) {
          this.drafts.push(draft);
        }
        this.hasNoRecord = false;
      }
      for (let incident of this.incidents) {
        if (incident.stage == "draft") {
          this.drafts.push(incident);
        }
        else {
          incident.requestId = incident.id;
          this.incidentList.push(incident);
          this.incidentList = this.common.removeDuplicateArrayobj(this.incidentList)
        }
      }
      for (let draft of this.drafts) {
        if (draft.action != 'saveAsDraft') {
          offlineSyncCount++;
        }
      }
      this.drafts = this.common.removeDuplicateArrayobj(this.drafts);
      this.incidentList.forEach(element => {
        element.seachField = element.companyName + ' / ' + element.locationName + ' / ' + element.id + ' / ' + element.assetSerialNo + ' / ' + element.workflowName;
      });
      this.results = this.common.removeDuplicateArrayobj(this.incidentList);
      this.draftsCopy = this.drafts;
      if (offlineSyncCount && !this.common.isSyncStarted && navigator.onLine) {
        console.log("My Requests");
        this.offlineProvider.prepareOfflineSubmission()
      }
      if(this.tab == 'drafts' && this.drafts && this.drafts.length == 0) {
        this.noRecordFound = true;
      }else if(this.tab != 'drafts' && this.incidentList && this.incidentList.length == 0) {
        this.noRecordFound = true;
      }else {
        this.noRecordFound = false
      }
  }

  editRequest(draftRequest) {
    if(navigator.onLine) {
      if (draftRequest.action != 'submit' && draftRequest.action != 'closeIncident') {
        let navigationExtras: NavigationExtras = {
          queryParams:{
            draftRequest : JSON.stringify(draftRequest),
            module:'request-list'
          },replaceUrl:true
        }
        this.router.navigate(['/new-request'], navigationExtras);
      }
    } else {
      this.common.alertToast("Check Your Network Connection");
    }

  }
  back(){
    this.router.navigate(['/home'],{replaceUrl:true})
  }
  beginSearch() {
    this.showSearchBar = !this.showSearchBar;
    setTimeout(() => {
      if (this.showSearchBar)
        this.searchBar.setFocus();
    }, 500);
  }

  filterResult(Keyword, value?) {
    let copy;
    let val = value ? value : Keyword.target.value;
    val = val ? (val.trim() ? val.trim().replace(new RegExp("\\s+", "gm"), ' ') : '') : '';
    this.searchValue = val;
    if(this.draftShown) {     
      if (val && val.length >= 1) {
        this.common.displayLoading();
        copy = this.common.removeDuplicateArrayobj(this.FullincidentsList);
        this.drafts = copy.filter(
          request =>
           ( request.id.toString().includes(val.toString()) ||
            (request.requestKey && request.requestKey.toString().toLowerCase().includes(val.toString().toLowerCase())) ||
            ((request.assetSerialNo &&
              request.assetSerialNo.toLowerCase().includes(val.toLowerCase())) )) && request.stage== 'draft');
        if(this.drafts.length == 0 ) {
          this.incidentList = [];
          this.drafts = [];
          this.noRecordFound = true;
        }
        this.common.stopLoading();
      } else {
        this.drafts = this.common.removeDuplicateArrayobj(this.draftsCopy);
      }
    } else {
      if (val && val.length >= 1) {
        this.common.displayLoading();
        this.incidentList = this.FullincidentsList.filter(
          request =>
             (request.id.toString().includes(val) ||
            (request.requestKey && request.requestKey.toString().toLowerCase().includes(val.toString().toLowerCase())) ||
            (request.assetSerialNo &&
              request.assetSerialNo.toLowerCase().includes(val.toLowerCase()))) && request.stage != 'draft');
        if(this.incidentList.length == 0) {
          this.incidentList = [];
          this.drafts = [];
          this.noRecordFound = true;
        }
        this.common.stopLoading();
      } else {
        this.incidentList = this.common.removeDuplicateArrayobj(this.results);
      }
    }

  }

  doInfinite(infiniteScroll) {
    if (this.lastVisible) {
      this.productsCollectionRef = this.firestore.collection('organization').doc(JSON.stringify(this.profile.tenantId)).collection('user').doc(JSON.stringify(this.profile.id)).collection('myRequest', ref => ref.where('id', '<', this.lastVisible.id).orderBy("id", "desc"));
      let result = this.productsCollectionRef.valueChanges();
      result.subscribe((res) => {
        this.lastVisible = res.length ? res[res.length - 1] : null;
        res.forEach((data) => {
          this.incidentList.push(data);
        })
        infiniteScroll.target.complete();
      });
    } else {
      infiniteScroll.target.complete()
    }
  }
onCancel($event) {
  this.searchKeyword = null;
  this.searchValue = null;
  this.getRequestList(this.tabVal);
}
searchCancel() {
  this.showSearchBar = false;
  this.incidentList = [];
  this.searchKeyword = null;
  this.searchValue = null;
  this.getRequestList(this.tabVal);
}
tabChange(event?, type?) {
  this.searchValue = '';
  this.searchKeyword = null;
  this.showSearchBar = false;
  let currentTab = type ? type : event.target.value;
  this.tabVal = currentTab;
  this.tab = currentTab;
  if((event && event.target.value === 'drafts') || type == 'drafts') {
    this.draftShown = true;
    this.progressShown = false;
    if(this.searchValue != '') {
      this.filterResult('',this.searchValue);
      return;
    }
    this.getRequestList(currentTab);

    this.noRecordFound = this.drafts.length == 0  && this.searchValue != ''? true : false;
  } else if((event && event.target.value === 'progress') || type == 'progress') {
    this.progressShown = true;
    this.draftShown =  false;
    if(this.searchValue != '') {
      this.filterResult('',this.searchValue);
      return;
    }
    this.getRequestList(currentTab);


    this.noRecordFound = this.incidentList.length == 0 && this.searchValue != '' ? true : false;
  }
}
getRequestList(tab?) {
  // this.common.displayLoading();
  let info = window.localStorage.getItem('Profile');
    let profile = JSON.parse(info);
    this.profile = profile;
    try {
      this.incidentList = [];
      if (profile && profile.id) {
        if(tab == 'drafts') {
          let searchParam = this.common.viewType == 'user' ? JSON.stringify(profile.id) : this.common.getLocationId();
          this.productsCollectionRef = this.firestore.collection('organization').doc(profile.tenantId).collection(this.common.viewType).doc(searchParam).collection('myRequest', ref => ref .where("stage", "==","draft").orderBy("id", "desc").limit(10));//.limit(Config.constants.setting.RecordCount)
          this.productsCollectionRef.valueChanges().subscribe((res: any) => {
            let draftRes = res
            for (let i = 0; i < res.length; i++) {
              res[i].creationDate = this.datePipe.transform(res[i].creationDate, 'yyyy-MM-ddTHH:mm:ss');
              res[i].creationDate = this.common.getTimeAgo(res[i].creationDate);
            }
            if(res && res.length != 0) {
              this.draftLastres = res[res.length - 1].id;
            }
            this.incidents = this.incidents.concat(draftRes)
            this.incidents = this.common.removeDuplicateArrayobj(this.incidents);

            this.isFetched = true;
            if (res.length == 0)
              {
                this.hasNoRecord = true;
                this.noRecordFound = true;
              }else {
                this.noRecordFound = false;
              }
        
            this.prepareList();
            
          },async(err)=>{
            this.noRecordFound = true;
          });
        } else {
          this.drafts = [];
          let searchParam = this.common.viewType == 'user' ? JSON.stringify(profile.id) : this.common.getLocationId();
          this.productsCollectionRef = this.firestore.collection('organization').doc(profile.tenantId).collection(this.common.viewType).doc(searchParam).collection('myRequest', ref => ref.orderBy("id", "desc").limit(20));//.limit(Config.constants.setting.RecordCount)
          this.productsCollectionRef.valueChanges().subscribe((res:any) => {
            let draftRes = res;
            for (let i = 0; i < res.length; i++) {
              res[i].creationDate = this.datePipe.transform(res[i].creationDate, 'yyyy-MM-ddTHH:mm:ss');
              res[i].creationDate = this.common.getTimeAgo(res[i].creationDate);
            }
            if(res && res.length != 0) {
              this.progressLastres = res[res.length - 1].id;
            }
            // this.incidents = res;
            this.incidents = this.incidents.concat(draftRes)
            this.incidents = this.common.removeDuplicateArrayobj(this.incidents);
            this.incidents =  this.common.removeDuplicateArrayobj(res);
            this.isFetched = true;
            if (res.length == 0)
              {
                this.hasNoRecord = true;
                this.noRecordFound = true;
              }
            this.prepareList();
            
          },async(err)=>{
            this.noRecordFound = true;
          });
        }

      }
    } catch (error) {
      // this.common.stopLoading();
      console.log("Error in My RequestList==>" + JSON.stringify(error));
    }

}
onIonInfinite(ev) {
  this.lastResMethod();
  setTimeout(() => {
    ev.target.complete();
  }, 500);
}
  lastResMethod() {
    let tab = this.tab;
    let info = window.localStorage.getItem('Profile');
    let profile = JSON.parse(info);
    this.profile = profile;
    try {
      if (profile && profile.id) {
        if(tab == 'drafts') {
          let searchParam = this.common.viewType == 'user' ? JSON.stringify(profile.id) : this.common.getLocationId();
          this.productsCollectionRef = this.firestore.collection('organization').doc(profile.tenantId).collection(this.common.viewType).doc(searchParam).collection('myRequest', ref => ref .where("stage", "==","draft").orderBy("id", "desc").limit(20).startAfter(this.draftLastres));//.limit(Config.constants.setting.RecordCount)
          this.productsCollectionRef.valueChanges().subscribe((res: any) => {
            let response = res;
            this.incidents = this.incidents.concat(response);
            this.incidents = this.incidents && this.incidents?.length >= 1 ? this.incidents.concat(res) : res;
            for (let i = 0; i < res.length; i++) {
              res[i].creationDate = this.datePipe.transform(res[i].creationDate, 'yyyy-MM-ddTHH:mm:ss');
              res[i].creationDate = this.common.getTimeAgo(res[i].creationDate);
            }
            if(res && res.length != 0) {
              this.draftLastres = res[res.length - 1].id;
            }
            this.isFetched = true;
            if (res.length == 0)
              {
                this.hasNoRecord = true;
                this.noRecordFound = true;
              }else {
                this.noRecordFound = false;
              }
            this.prepareList();
            
          },async(err)=>{
            this.noRecordFound = true;
          });
        } else {
          this.drafts = [];
          let searchParam = this.common.viewType == 'user' ? JSON.stringify(profile.id) : this.common.getLocationId();
          this.productsCollectionRef = this.firestore.collection('organization').doc(profile.tenantId).collection(this.common.viewType).doc(searchParam).collection('myRequest', ref => ref.orderBy("id", "desc").limit(20).startAfter(this.progressLastres));//.limit(Config.constants.setting.RecordCount)
          this.productsCollectionRef.valueChanges().subscribe((res:any) => {
            let response = res;
            this.incidents = this.incidents.concat(response);
            this.incidents = this.incidents && this.incidents.length >= 1 ?this.incidents.concat(res) : res;
            for (let i = 0; i < res.length; i++) {
              res[i].creationDate = this.datePipe.transform(res[i].creationDate, 'yyyy-MM-ddTHH:mm:ss');
              res[i].creationDate = this.common.getTimeAgo(res[i].creationDate);
            }
            if(res && res.length != 0) {
              this.progressLastres = res[res.length - 1].id;
            }
            this.isFetched = true;
            if (res.length == 0)
              {
                this.hasNoRecord = true;
                this.noRecordFound = true;
              }
            this.prepareList();
            
          },async(err)=>{
            this.noRecordFound = true;
          });
        }

      }
    } catch (error) {
      // this.common.stopLoading();
      console.log("Error in My RequestList==>" + JSON.stringify(error));
    }
  }
  ionViewDidEnter() {
    setTimeout(() => {
      let profile = JSON.parse(window.localStorage.getItem('Profile'));
      let searchParam = this.common.viewType == 'user' ? JSON.stringify(profile.id) : this.common.getLocationId();
      this.productsCollectionRef = this.firestore.collection('organization').doc(profile.tenantId).collection(this.common.viewType).doc(searchParam).collection('myRequest', ref => ref.orderBy("id", "desc"));//.limit(Config.constants.setting.RecordCount)
      this.productsCollectionRef.valueChanges().subscribe((res: any) => {
        for (let i = 0; i < res.length; i++) {
          res[i].creationDate = this.datePipe.transform(res[i].creationDate, 'yyyy-MM-ddTHH:mm:ss');
          res[i].creationDate = this.common.getTimeAgo(res[i].creationDate);
        }
        this.FullincidentsList = res;
      });
    },2500)

  }
  
}
