import { DatePipe } from '@angular/common';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild} from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { NavigationExtras, Router } from '@angular/router';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';
import { JobsFilter, PendingFilter } from '../data.model';
import { PendingFilterPage } from '../pending-filter/pending-filter.page';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.page.html',
  styleUrls: ['./job-list.page.scss'],
  providers: [
    ServiceProvider
  ]
})
export class JobListPage implements OnInit {

  @ViewChild('searchBar') searchBar : any;
  incidents: any = [];
  requestType: string = '';
  reqType: string;
  wrkReqCount: number = 0;
  scheduleCount: number = 0;
  refresher: any;
  incidentList: any = [];
  incidentListFull: any = [];
  scheduleList: any = [];
  scheduleListFull: any = [];
  scheduleListCount: number = 0;
  workList: any = [];
  workListFull: any = [];
  workListCount: number = 0;
  lastVisible: any;
  page: number = 0;
  paginationStart: boolean = false;
  infiniteScroll: boolean = false;
  hasNoRecord: boolean = false;
  incidentListCount: number = 0;
  selectedFilter: any = [];
  filterButtons: any = [];
  tagId: any;
  showSortBy: boolean;
  sortNew: boolean = true;
  showSearchBar: boolean = false;
  filteredReqId: any;
  filterType: any;
  shouldShowCancel : any;
  totalCount: any;
  isScroll: boolean = false;
  jobsFilter: JobsFilter;
  category: any;
  childCategories: any;
  selectedCategory: any;
  childLocations: any;
  selectedLocation: any;
  location: any;
  workflow: any;
  selectedWorkflow: any;
  asset: any;
  selectedAsset: any;
  pendingFilter: PendingFilter;
  profile: any;
  fullscheduleRes: any;
  fullWorkorderRes: any;
  noRecordFound: boolean;
  filterCount: any;
  placeHolderName: string = 'Search By Id';
  searchKeyword:any;
  datePipe = new DatePipe('en-US');
  selectedCustomer: any;
  customer: any;
  sort: this;
  searchRes: any;
  constructor(
    private common: CommonProvider,
    private reqService: ServiceProvider,
    private actionSheetCtrl: ActionSheetController,
    public router: Router,
    public firestore : AngularFirestore,
    public modalCtrl : ModalController, 
  ) {
  }
  ionViewWillEnter() {
    this.jobsFilter = new JobsFilter();
    let profiles = JSON.parse(localStorage.getItem('Profile'));
    this.jobsFilter.userIds = [profiles.id];
    let options = {
      page: this.page,
      size: 10
    }
      this.jobsFilter.requestType = 'SCHEDULE_REQUEST';
      if (navigator.onLine) {
        this.reqService.jobResource(options, this.jobsFilter).subscribe((res)=>{
          const headers = res.headers;
          this.scheduleCount = headers.get('X-Total-Count')
          this.jobsFilter.requestType = 'WORK_REQUEST'
          this.reqService.jobResource(options, this.jobsFilter).subscribe((res)=>{
            const headers = res.headers;
            this.wrkReqCount = headers.get('X-Total-Count')
          })
        })
        let profile = JSON.parse(localStorage.getItem('Profile'));
        this.profile = profile;
        console.log(profile)
        if(profile) {
          try {
            if (profile && profile.id) {
              let tagsCollectionRef = this.firestore.collection('organization').doc(profile.tenantId).collection('tag', ref => ref.orderBy("id", "asc"));
              tagsCollectionRef.valueChanges().subscribe((res) => {
                this.common.tagList = res;
                this.setFilterButtons();
              });
              let searchParam = this.common.viewType == 'user' ? JSON.stringify(profile.id) : this.common.getLocationId();
            }
            this.jobsFilter.userIds = [profile.id];
            this.showRequest('Schedule');
          } catch (error) {
            console.log("Error==>" + error);
          }
        }
      }else {
        // this.common.stopLoading();
        this.common.alertToast(this.reqService.translatedata('networkConnectivityError'));
        this.router.navigate(['home']);
      }

  }

  getJobResource(filter?) {
    // this.incidents = [];
    this.isScroll = false;
    let options = {
      page: this.page,
      size: 20,
      sort: this.sortNew ? 'desc' :'asc'
    }
    if(this.reqType == 'SCHEDULE_REQUEST') {
      filter.requestType = 'SCHEDULE_REQUEST';
      this.reqService.jobResource(options, filter).subscribe(
        (res: HttpResponse<any>) => this.onSuccess(res.body, res.headers),
        (res: HttpErrorResponse) => this.onError(res.message)
      )
    } else {
      filter.requestType = 'WORK_REQUEST';
      this.reqService.jobResource(options, filter).subscribe(
        (res: HttpResponse<any>) => this.onSuccess(res.body, res.headers),
        (res: HttpErrorResponse) => this.onError(res.message)
      )
    }

  }
  onError(message: string): void {
    this.common.alertToast("Not Found");
  }
  onSuccess(res: any ,headers: any): void {
    this.noRecordFound = false;
    this.totalCount = headers.get('X-Total-Count');
    for (let i = 0; i < res.length; i++) {
      res[i].requestSubmissionDate = this.datePipe.transform(res[i].requestSubmissionDate, 'yyyy-MM-ddTHH:mm:ss');
      res[i].requestSubmissionDate = this.common.getTimeAgo(res[i].requestSubmissionDate);
    }
    this.incidentList = this.incidentList.concat(res);
    this.incidentList = this.common.removeDuplicateArrayobj(this.incidentList);
    if (!res.length) {
      this.noRecordFound = this.hasNoRecord = true;
    } else {
      this.noRecordFound = this.hasNoRecord = false;
    }
    this.prepareData();
    if(this.totalCount <= this.incidentList.length) {
      this.isScroll = true;
    }
  }
  

  ngOnInit() {
    this.requestType = 'showAll';
  }
  prepareData() {
    for (let incident of this.incidentList) {
      this.setInterval(incident);
      incident.tag = this.getTagName(incident.tagId);
    }
    this.incidents = this.incidentList;
    this.reqType = this.reqType
      ? this.reqType
      : this.scheduleCount
      ? 'SCHEDULE_REQUEST'
      : 'WORK_REQUEST';
    this.populateData();
  }
  goDetailPage(incident, reqType) {
    this.common.logClickEvent('request_detail_click_from_jobs', 'Joblist Page');
    console.log(incident);
    let navigationExtras: NavigationExtras = {
      queryParams: { 
        selectedRequest: JSON.stringify(incident), 
        type: 'job' ,
        tab: 'job',
        module:'job-list',
        reqType: reqType
      },replaceUrl:true
    };
    this.router.navigate(['/request-detail'], navigationExtras);
  }

  showRequest(type) {
    this.jobsFilter.searchText = '';
    this.filteredReqId = '';
    this.showSearchBar = false;
    this.noRecordFound = false;
    this.searchKeyword = null;
    this.filterType = type;
    this.reqType = type == 'Schedule' ? 'SCHEDULE_REQUEST' : 'WORK_REQUEST';
    this.placeHolderName = type == 'Schedule' ? 'Search By Id' : 'Search By Id/Description';
    this.page = 0;
    this.incidents =[];
    this.incidentList = [];
    this.getJobResource(this.jobsFilter);
  }

  populateData() {
    this.incidents = [];
    if (this.reqType == 'SCHEDULE_REQUEST') {
      this.incidents = this.common.removeDuplicateArrayobj(this.incidentList);
      this.incidents = this.sortNew ? this.incidents : this.incidents.reverse();
      if (this.filteredReqId) this.filterResult("", this.filteredReqId);
    } else {
      this.incidents = this.common.removeDuplicateArrayobj(this.incidentList);
      this.incidents = this.sortNew ? this.incidents : this.incidents.reverse();
      if (this.filteredReqId) this.filterResult("", this.filteredReqId);
    }
    if (this.tagId) {
      this.doTagFilter(this.tagId, this.reqType);
    }
    if(this.incidents.length == 0) {
      this.noRecordFound = true;
    }
  }

  setInterval(list) {
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

  async doInfinite(infiniteScroll) {
    this.page = this.page + 1;
    this.incidents = await this.common.removeDuplicateArrayobj(this.incidents);
    if(Number(this.totalCount) <=  this.incidents.length ) {
      this.isScroll = true;
    } else {
      if(this.filteredReqId) {
        this.getFilterJobResource(this.jobsFilter);
        setTimeout(() => {
          infiniteScroll.target.complete();
          }, 1000);
      }else {
        this.getJobResource(this.jobsFilter);
        setTimeout(() => {
          infiniteScroll.target.complete();
          }, 1000);
      }
    }
   }

  setFilterButtons() {
    this.filterButtons = [];
    this.filterButtons = [
      {
        text: 'Recent',
        cssClass: 'action-sheet-custom-button sortBy',
        icon: 'arrow-down-circle-outline',
        handler: () => {
          this.tagId = null;
          if (!this.sortNew) {
            this.sortNew = !this.sortNew;
            this.getJobResource(this.jobsFilter);
          }
          this.selectedFilter = [
            { id: 1, name: 'Recent', color: 'rgb(255, 159, 26)' },
          ];
        },
      },
      {
        text: 'Old to Recent',
        cssClass: 'sortBy',
        icon: 'arrow-up-circle-outline',
        handler: () => {
          this.tagId = null;
          if (this.sortNew) {
            this.sortNew = !this.sortNew;
            this.getJobResource(this.jobsFilter);
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
        icon: 'pricetag',
        cssClass: tag.name,
        handler: () => {
          this.tagId = tag.id;
          this.populateData();
          this.selectedFilter = [tag];
        },
      });
    });
  }

  doTagFilter(tagId, reqType) {
    let filteredArray = [];
    this.incidentList.forEach((request) => {
      if (+tagId == request.tagId && request.requestType == reqType) {
        filteredArray.push(request);
      }
    });
    this.incidents = filteredArray;
  }

  async openSortBy() {
    const actionSheetControl = await this.actionSheetCtrl.create({
      header: this.reqService.translatedata('Filter'),
      cssClass: 'action-sort-sheet',
      buttons: this.filterButtons,
    });
    await actionSheetControl.present();
  }

  clearFilter() {
    this.selectedFilter = [];
    if (!this.sortNew) {
      this.incidentList.reverse();
      this.sortNew = !this.sortNew;
      this.prepareData();
    }
    this.tagId = null;
    this.populateData();
    this.selectedFilter = [];
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
  back() 
  {
    this.router.navigate(['/home'],{replaceUrl:true});
  }
  beginSearch() {
    this.showSearchBar = !this.showSearchBar;
  }
  filterResult(event, value?) {
    let val = value ? value : event.target.value;
    val = val
      ? val.trim()
        ? val.trim().replace(new RegExp("\\s+", "gm"), " ")
        : ""
      : "";
    this.filteredReqId = val;
    if(val != '') {
      this.incidentList = [];
      this.incidents = [];
      this.jobsFilter.searchText = val;
      this.getFilterJobResource(this.jobsFilter);
    } else {
      this.incidentList = [];
      this.incidents = [];
      this.jobsFilter.searchText = '';
      this.filteredReqId = '';
      this.page = 0;
      this.getJobResource(this.jobsFilter);
    }
  }
  getFilterJobResource(jobsFilter: JobsFilter) {
    this.incidents= [];
    let options = {
      page: this.page,
      size: 20
    }
    if(this.reqType == 'SCHEDULE_REQUEST') {
      jobsFilter.requestType = 'SCHEDULE_REQUEST';
      this.reqService.jobResource(options, jobsFilter).subscribe(
        (res: HttpResponse<any>) => this.onFilterSuccess(res.body, res.headers),
        (res: HttpErrorResponse) => this.onError(res.message)
      )
    } else {
      jobsFilter.requestType = 'WORK_REQUEST';
      this.reqService.jobResource(options, jobsFilter).subscribe(
        (res: HttpResponse<any>) => this.onFilterSuccess(res.body, res.headers),
        (res: HttpErrorResponse) => this.onError(res.message)
      )
    }
  }
  onFilterSuccess(res: any, headers: HttpHeaders): void {
    this.totalCount = headers.get('X-Total-Count');
    for (let i = 0; i < res.length; i++) {
      res[i].requestSubmissionDate = this.datePipe.transform(res[i].requestSubmissionDate, 'yyyy-MM-ddTHH:mm:ss');
      res[i].requestSubmissionDate = this.common.getTimeAgo(res[i].requestSubmissionDate);
    }
    this.incidentList = this.incidentList?.concat(res);
    this.incidents = this.common.removeDuplicateArrayobj(this.incidentList);
    if (!res.length) {
      this.hasNoRecord = true;
      this.noRecordFound = true;
    } else {
      this.hasNoRecord = false;
      this.noRecordFound = false;
    }
  }
  getIncidentFullList() {
    if (this.reqType == 'SCHEDULE_REQUEST') {
      this.incidents = this.scheduleList;
      return this.incidents
    } else {
      this.incidents = this.workList;
      return this.incidents
    }

  }
  searchCancel() {
    this.showSearchBar = false;
    this.searchKeyword = null;
    this.filteredReqId = null;
    this.incidentList = [];
    this.incidents = [];
    this.jobsFilter.searchText = '';
    this.filteredReqId = '';
    this.page = 0;
    this.getJobResource(this.jobsFilter);

  }
  onCancel(event) {
    this.filteredReqId = null;
    this.incidentList = [];
    this.incidents = [];
    this.jobsFilter.searchText = '';
    this.filteredReqId = '';
    this.page = 0;
    this.getJobResource(this.jobsFilter);
  }
  async beginFilter() {
    // this.isScroll = true;
    this.page = 0;
    this.incidentList = [];
    this.incidents = [];
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
        requestStatus: this.jobsFilter.requestStatus ? this.jobsFilter.requestStatus : null,
        module: 'jobs'
      },
    });
    (await assetFilterModal)
      .onDidDismiss()
      .then((detail: OverlayEventDetail) => {
        let data = detail.data;
        if (data) {
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
          this.jobsFilter.workflowName = data.selectedWorkflow?.name;
          this.jobsFilter.workflowId = data.selectedWorkflow?.id;
          this.jobsFilter.categoryId = data.selectedCategory?.id;
          this.jobsFilter.locationId = data.selectedLocation?.id;
          this.jobsFilter.locationName = data.selectedLocation?.name;
          this.jobsFilter.companyName = data.selectedCustomer?.name;
          this.jobsFilter.companyId = data.selectedCustomer?.id;
          this.jobsFilter.assetId = data.selectedAsset?.id;
          this.jobsFilter.requestStatus = data.requestStatus;
          this.filterCount = data.count;
          this.filterPending(this.jobsFilter);
        } else {
          this.jobsFilter = new JobsFilter();
          this.jobsFilter.requestType = this.reqType;
          this.jobsFilter.userIds = [this.profile.id];
          this.getJobResource(this.jobsFilter); 
        }
      });
    await assetFilterModal.present();
  }
  filterPending(jobsFilter: JobsFilter) {
    if(this.jobsFilter.assetId || this.jobsFilter.requestStatus || this.jobsFilter.categoryId || this.jobsFilter.locationId || this.jobsFilter.workflowId || this.jobsFilter.companyId) {
      this.getJobResource(jobsFilter);
    } else {
      this.jobsFilter = new JobsFilter();
      this.jobsFilter.requestType = this.reqType;
      this.jobsFilter.userIds = [this.profile.id];
      this.getJobResource(this.jobsFilter); 
    }
  }
}
