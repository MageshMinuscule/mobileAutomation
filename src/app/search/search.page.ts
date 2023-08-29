import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, NavigationExtras, Router, RoutesRecognized } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { AlertController, IonRouterOutlet, LoadingController, ModalController, Platform } from '@ionic/angular';
import { from, Observable } from 'rxjs';
import { ServiceProvider } from 'src/providers/service/service';
import { AssetFilterPage } from '../asset-filter/asset-filter.page';
import { CommonProvider } from '../common/common';
import { Config } from '../config';
import { CustomerPage } from '../customer/customer.page';
import { AssetFilter, NestLocation, NestWorkflow } from '../data.model';
import { MapPage } from '../map/map.page';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import {OverlayEventDetail} from '@ionic/core'
import { Events } from 'src/providers/events/events';
import { filter, pairwise } from 'rxjs/operators';
import { Device } from '@ionic-native/device/ngx';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit, AfterViewInit {
  @ViewChild("searchBar") searchBar: any;
  @ViewChild('fab',{static: false}) fab: any;
  shouldShowCancel: boolean = false;
  backdropDismiss = true;
  showBackdrop = true;
  shouldPropagate = true;
  caOrCoCities$: Observable<any[]>;
  searchKeyword: any = "";
  items: any = [];
  results: any = [];
  tmpResults: any = [];
  tmpType: any = [];
  tmpTitle: any = [];
  tmpIcon: any = [];
  searchList: any = [];
  type: any = "Workflow";
  isNext: any;
  labelTxt: any;
  showSearchBar: boolean = false;
  selectedItem: any;
  selectedWorkflow: any;
  selectedLocation: any;
  loopCount: number = 0;
  isFinished: boolean = false;
  workflowList: NestWorkflow[] = [];
  assetList: any = [];
  locList: NestLocation[] = [];
  childTemplateSchema: any = [];
  isAuthorized: boolean = false;
  isAvailable: boolean = false;
  workflowId: any;
  locationId: any;
  customerId: any;
  isCompleted: boolean = false;
  isAllow: boolean = false;
  catArr: any = [];
  locArr: any = [];
  isMatched: boolean = false;
  showAdd: boolean = false;
  profile: any;
  catArray: any = [];
  locArray: any = [];
  companyArray: any = [];
  initialWorkflow: any = [];
  showAddCustomer: boolean = false;
  customerList: any = [];
  selectedCustomer: any;
  page:number= 0;
  fileterScrollEnabled: boolean;
  isAssetFound: boolean = false;
  isFounded: boolean;
  filteredReqId: any;
  states: any = [];
  isFetched: boolean;
  isWorkflowLoaded: boolean;
  isLocalAsset: boolean;
  selectedAsset: any;
  tenantId: any;
  hasAssetDowntimeTracking: boolean ;
  hasRestrictByLocation: boolean;
  icon = "person";
  item: any;
  filteredCategory: any = {};
  childCategories: any = [];
  parentCategory: any = {};
  selectedCategory: any = {};
  category: any = {};
  childLocations: any = [];
  selectedLocationFilter: any = {};
  locationFilter: any = {};
  result: any = [];
  showAssetList: any;
  showWorkflowList: any;
  workRequest: any;
  isFromWorkRequest: boolean;
  userProfile: any;
  workflowType: any;
  userDetails: any = {};
  userGroupNames: any;
  showCustomerList: any;
  showLocation: any;
  selectedlocation: any;
  locationIds: any;
  showCustomer: any;
  assetTransferLocation: any;
  noLocFound: boolean = false;
  selectedloc: { id: any; companyId: any; locName: any; locationId: any; parentLocationId: any; rootLocationId: any; organizationId: any; qrCode: any; };
  createWorkrequest: any;
  isWorkRequest: boolean = false;
  lastInResponse: any;
  parentLocationIds: any = [];
  parentLocArr: any = [];
  skipChildLoc: boolean;
  assetFilter: AssetFilter;
  isScroll: boolean = false;
  size: number;
  resultCopy: any;
  assetListCopy: any;
  totalCount: any;

  isAssetDisabled: boolean = false;
  isMandatory: boolean = false;

  backDropDismiss: boolean = true;

  noRecordFound: boolean;
  filterCount: number;
  previousUrl: string;
  currentUrl: string;
  allowAssetScan: any;
  allowLocScan: any;
  isSearchFilterAsset: boolean;
  batches: any = [];
  batchesLoc: any = [];
  isLastBatch: boolean = false;
  pageSize: number = 10;
  lastDocumentForAsset: number = 0;
  lastDocumentForLoc: number;
  assetLastDocRowLevel: any;
  constructor(
    private storage : NativeStorage,
    public firestore: AngularFirestore,
    public router: Router,
    private route : ActivatedRoute,
    private reqService: ServiceProvider, 
    public common : CommonProvider, 
    public modalCtrl : ModalController, 
    private alertCtrl : AlertController,
    private barcodeScanner: BarcodeScanner, 
    public loadingCtrl : LoadingController, 
    private events : Events,
    private platform: Platform,
    private routerOutlet: IonRouterOutlet,
    private device: Device,
  ) { 
   
  }
  

  async ngOnInit() {
    this.catArray = await this.getWorkflow();
    this.size = 20;
    this.assetFilter = new AssetFilter();
  }
  async getWorkflow() {
    let profile = JSON.parse(window.localStorage.getItem('Profile'))
    let catgoryCollectionRef = this.firestore
    .collection('organization')
    .doc(profile.tenantId)
    .collection('workflow');
    try {
      return new Promise(async (resolve,reject)=>{
        await catgoryCollectionRef.get()
        .subscribe(async (res:any)=>{
          res = res && res.length != 0 ? await this.common.getDocValue(res) : [];
          resolve(res)
        },async(err)=>{
          console.log(err);
          reject(err);
        })
      })
    }catch(err){
      console.log(err);
    }
  }
  async fetchAssetFromFirestore() {
    console.log("enter into firebase");
    let ids = Array.from(this.profile?.locationIds);
    let locatinIds = [...ids];
    let assetCollectionRef;
    this.searchKeyword="";
    if (
      this.profile.isRowlevel &&
      this.profile.locationIds &&
      this.profile.locationIds.length
    ) {
      await this.getAssetFromFirestore(locatinIds);
  } else {
    let options = {
      page: this.page,
      size: 20
    }
    if(this.selectedLocation && this.selectedLocation.id && this.createWorkrequest == 'createWorkrequest') {
      this.assetFilter.locationId = this.selectedLocation.id;
    }
    this.reqService.getAssetByFilter(options, this.assetFilter).subscribe(res=>{
      this.totalCount = res.headers.get('X-Total-Count');
      this.assetListCopy = res.body;
      this.assetList = this.assetList.concat(this.assetListCopy);
      this.assetList = this.common.removeDuplicateArrayobj(this.assetList);
      this.isFetched = true;
      this.common.assetList = this.assetList;
      this.isLocalAsset = false;
      if (this.type != 'Customer' && this.type != 'Workflow') {
        if ((this.createWorkrequest != 'createWorkrequest' && Config.constants.isAsset) || (this.createWorkrequest && this.createWorkrequest === 'createWorkrequest' && !this.isAssetDisabled)) {
          this.items = [];
          this.isAssetFound = this.assetList.length ? true : false;
          this.loadAsset(this.assetList);
          this.labelTxt = this.reqService.translatedata("chooseAsset");
          this.type = "Asset";
          this.isAllow = true;
        }else{
          let navigationExtras: NavigationExtras = {
            queryParams:{
              workflowId: this.workflowId,
        location: JSON.stringify(this.selectedLocation),
        locationId: this.selectedLocation && this.selectedLocation.id,
        customer: JSON.stringify(this.selectedCustomer ? this.selectedCustomer : this.selectedLocation && this.selectedLocation.companyName ? this.selectedLocation.companyName : null),
        newRequestFromSearch: true,
        workRequest: this.workRequest ? this.workRequest : null,
            }
          }
          this.router.navigate(['/work-request'], navigationExtras);
        }
      }
      if(this.totalCount <= this.assetList.length) {
        this.isScroll = true;
      }
    });
  }
  }

  async waitForAllData() {
    await Promise.all(this.batches);
    this.assetList = this.batches.flat();
    this.isFetched = true;
    this.common.assetList = this.assetList;
    this.isLocalAsset = false;
    if (this.type != 'Customer' && this.type != 'Workflow') {
      if (( this.createWorkrequest !== 'createWorkrequest' && Config.constants.isAsset) || (this.createWorkrequest && this.createWorkrequest === 'createWorkrequest' && !this.isAssetDisabled)) {
        this.items = [];
        this.isAssetFound = this.assetList.length ? true : false;
        this.loadAsset(this.assetList);
        this.labelTxt = this.reqService.translatedata("chooseAsset");
        this.type = "Asset";
        this.isAllow = true;
      }
    }
  }

  async getBatchData(batchPromise:any, batches?: any[]) {
    await batchPromise.then(async (res: any) => {
      res = res.size != 0 ? await this.common.getDocValue(res) : [];
      this.batches.push(res);
    });
  }
  next(last) {
    this.searchKeyword="";
    let assetCollectionRef = this.firestore
      .collection("organization")
      .doc(this.profile.tenantId)
      .collection("asset", (ref)=>
        ref
        .orderBy('id')
        .limit(10)
        .startAfter(last)
      ); // where('active', '==', true)
    if (
      this.profile.isRowlevel &&
      this.profile.locationIds &&
      this.profile.locationIds.length
    ) {
      assetCollectionRef = this.firestore
        .collection<any>("organization")
        .doc<any>(this.profile.tenantId)
        .collection<any>("asset", (ref) =>
          ref
          .orderBy('id')
          .limit(10)
          .startAfter(last)
          .where("path", "array-contains-any", this.profile.locationIds)
        );
    }
    assetCollectionRef.valueChanges().subscribe((res) => {
      this.lastInResponse = res && res.length >= 1  ? res[res.length - 1].id : 1;
      this.assetList = this.assetList.concat(res);
      if (this.assetList.length <= 5000) {
      };
      this.isFetched = true;
      this.common.assetList = this.assetList;
      this.isLocalAsset = false;
      if (this.type != 'Customer' && this.type != 'Workflow') {
        if (Config.constants.isAsset || (this.createWorkrequest && this.createWorkrequest === 'createWorkrequest')) {
          this.items = [];
          this.isAssetFound = this.assetList.length ? true : false;
          this.loadAsset(this.assetList);
          this.labelTxt = this.reqService.translatedata("chooseAsset");
          this.type = "Asset";
          this.isAllow = true;
        }
      }
    });
  }

  refreshAsset() {
    this.common.displayLoading();
    this.fetchAssetFromFirestore();
    this.selectedCategory = {};
    this.category = {};
    this.childCategories = [];
    setTimeout(() => {
      this.common.stopLoading();
    }, 200);
  }

  ngAfterViewInit() {
    this.platform.backButton.subscribeWithPriority(0, async() => {
      if (this.routerOutlet && this.routerOutlet.canGoBack()) {
        this.routerOutlet.pop();
      }
    });
    this.backDrop();
  }

  beginSearch() {
    this.showSearchBar = !this.showSearchBar;
    setTimeout(() => {
      if (this.showSearchBar) this.searchBar.setFocus();
    }, 500);
  }

 async beginFilter() {
    let assetFilterModal =  await  this.modalCtrl.create({
      component: AssetFilterPage,
      componentProps:{ 
        category: this.category,
        childCategories: this.childCategories,
        selectedCategory: this.selectedCategory,
        childLocations: this.childLocations,
        selectedLocation: this.selectedLocationFilter,
        location: this.locationFilter,
      }
    });
    assetFilterModal.onDidDismiss().then((detail: OverlayEventDetail) => {
      let data = detail.data
      if (data) {
        this.selectedCategory = data.selectedCategory;
        this.category = data.category;
        this.childCategories = data.childCategories;
        this.childLocations = data.childLocations;
        this.locationFilter = data.location;
        this.selectedLocationFilter = data.selectedLocation;
        this.assetFilter.categoryId = data && data.category && data.category.id ? data.category.id : null;
        this.assetFilter.categoryName =  data && data.category && data.category.name ? data.category.name  : null;
        this.assetFilter.locationName = data && data.location && data.location.name ? data.location.name : null;
        this.assetFilter.locationId = data && data.location && data.location.id ? data.location.id : null;
        this.filterCount = data.count;
        this.filterAsset(data.selectedCategory, data.selectedLocation);
      } else {
        this.clearFilter();
      }
    });
    (await assetFilterModal).present();
  }
  clearFilter() {
    this.page = 0;
    this.childCategories = [];
    this.childLocations = [];
    this.category = {};
    this.selectedCategory = {};
    this.locationFilter = {};
    this.selectedLocationFilter = {}
    this.assetFilter = new AssetFilter();
    this.isScroll =false;
  }

  filterAsset(category: any, location: any) {
    this.common.displayLoading();
    this.results = [];
    this.result = [];
    this.items = [];
    this.resultCopy = [];
    this.assetList =[];
    if ((category && category.id) || (location && location.id)) {
      let options ={
        page :0,
        size: 20
      }
      this.reqService.getAssetByFilter(options, this.assetFilter).subscribe(res=>{
        this.totalCount = res.headers.get('X-Total-Count');
        this.resultCopy = res.body;
        this.result = this.result.concat(this.resultCopy);
        this.assetList = this.result = Array.from(new Set(this.result.map(a => a.id))).map(id => {
          return this.result.find(a => a.id === id);
        });
        this.common.stopLoading();
        this.type = 'Asset';
        if(this.result && this.result.length == 0) {
          this.noRecordFound =  true;
        } else {
          this.noRecordFound = false;
        }
        this.loadAsset(this.result);
        this.fileterScrollEnabled = true;
      },async(err)=>{
        this.common.stopLoading();
        this.common.alertToast("Not Found");
      })

    } else {
      this.common.stopLoading();
      this.clearFilter();
      this.assetFilter =  new AssetFilter();
      this.fetchAssetFromFirestore();
    }
  }

  gotoAdd() {
    let navigationExtras: NavigationExtras = {
      queryParams:{
        workflowList: JSON.stringify(this.catArray),
        locList: JSON.stringify(this.locArray),
        workflow: JSON.stringify(this.catArr),
        companyList: JSON.stringify(this.companyArray),
        fromSearch: JSON.stringify("SearchPage")
      }
    }
    this.router.navigate(['/asset'], navigationExtras );
  }

  async prepareWorkflow() {
    this.type = "Workflow";
    this.items = [];

    if(this.catArray?.length == 0) {
      this.catArray = await this.getWorkflow();
    }
    for (let cat of this.catArray) {
      if (cat.active) {
        if (!cat.parentWorkflowId) {
          let custom = {
            name: cat.name,
            id: cat.id,
            isAssetTransfer: cat && cat.isAssetTransfer ? cat.isAssetTransfer : false,
            isAssetDownTimeTracking: cat && cat.isAssetDownTimeTracking ? cat.isAssetDownTimeTracking : false,
            hierarchy: name ? name + " / " + cat.name : cat.name,
            templateHistId: cat.templateHistoryId,
            childTemplateSchema: cat.requestSchema,
            templateSchema: cat.requestSchemaAsString,
            categoryId: cat.categoryId,
            categoryName: cat.categoryName

          }
          if (cat.requestSchema)
          if(!this.isFromWorkRequest) {
            this.items.push(custom);
          }else {
            if(!cat.isAssetTransfer) {
              this.items.push(custom);
            }
          }
          else
            this.checkTemplateSchema(cat, cat.requestSchema, custom)
        }
      }
    }
    this.results = this.items;
    if (this.results.length) {
      this.labelTxt = Config.catQuestions.A;
      this.isAllow = true;
    }
    if (this.results.length > 0) {
      let workflows = [];
      this.results.forEach(element => {
        if (this.selectedAsset && element.categoryId === this.selectedAsset.categoryId) {
          workflows.push(element);
        } 
        else if(this.selectedAsset && (this.selectedAsset.id == undefined || this.selectedAsset.id == null || this.selectedAsset.id == '')) {
          workflows = this.results;
        } 
      });
      if (workflows && workflows.length > 0) {
        this.results = workflows;
        this.items = workflows;
      }
    }
    if(this.results.length == 0) {
      this.noRecordFound =  true;
    }
    this.common.stopLoading();
  }

  getAssetWorkflow(workflowId) {
    // console.log("asset-workflow");
    for (let cat of this.catArray) {
      if (workflowId == cat.id) {
        let custom = {
          name: cat.name,
          id: cat.id,
          hierarchy: name ? name + " / " + cat.name : cat.name,
          templateHistId: cat.templateHistoryId,
          childTemplateSchema: cat.requestSchema,
          templateSchema: cat.requestSchemaAsString,
        };
        this.initialWorkflow = custom;
        if (cat.requestSchema) this.selectedWorkflow = custom;
        else this.getParentSchema(cat);
      }
    }
  }

  getParentSchema(selectedWorkflow) {
    for (let workflow of this.catArray) {
      if (workflow.id == selectedWorkflow.parentWorkflowId) {
        if (workflow.requestSchema) {
          let custom = {
            name: workflow.name,
            id: workflow.id,
            hierarchy: name ? name + " / " + workflow.name : workflow.name,
            templateHistId: workflow.templateHistoryId,
            childTemplateSchema: workflow.requestSchema,
            templateSchema: workflow.requestSchemaAsString,
          };
          this.selectedWorkflow = custom;
        } else {
          this.getParentSchema(workflow);
        }
      }
    }
    if (!this.selectedWorkflow) {
      this.checkTemplateSchema(selectedWorkflow, "", "", true);
    }
  }

  checkTemplateSchema(selectedWorkflow, schema?, custom?, isAsset?) {
    this.type = "Workflow";
    // console.log('checkTemplateSchema');
    if(!this.isFromWorkRequest ) {
      for (let workflow of this.catArray) {
        if (workflow.active) {
          if (workflow.parentWorkflowId == selectedWorkflow.id) {
            if (workflow.requestSchema) {
              if (isAsset) {
                let custom = {
                  name: workflow.name,
                  id: workflow.id,
                  hierarchy: name ? name + " / " + workflow.name : workflow.name,
                  templateHistId: workflow.templateHistoryId,
                  childTemplateSchema: workflow.requestSchema,
                  templateSchema: workflow.requestSchemaAsString,
                  categoryId: workflow.categoryId
                }
                this.selectedWorkflow = custom;
              } else {
                schema = workflow.requestSchema ? workflow.requestSchema : schema;
                if (this.items.indexOf(custom) == -1) this.items.push(custom);
              }
            } else {
              this.checkTemplateSchema(workflow, schema, custom);
            }
          }
        }
      }
      if (isAsset && !this.selectedWorkflow) {
        this.selectedWorkflow = this.initialWorkflow;
      }
    } else {
      for (let workflow of this.catArray) {
        if (workflow.active) {
          if (workflow.parentWorkflowId == selectedWorkflow.id) {
            if (workflow.requestSchema && !workflow.isAssetTransfer) {
              if (isAsset) {
                let custom = {
                  name: workflow.name,
                  id: workflow.id,
                  hierarchy: name ? name + " / " + workflow.name : workflow.name,
                  templateHistId: workflow.templateHistoryId,
                  childTemplateSchema: workflow.requestSchema,
                  templateSchema: workflow.requestSchemaAsString,
                  categoryId: workflow.categoryId
                }
                this.selectedWorkflow = custom;
              } else {
                schema = workflow.requestSchema ? workflow.requestSchema : schema;
                if (this.items.indexOf(custom) == -1) this.items.push(custom);
              }
            } else {
              this.checkTemplateSchema(workflow, schema, custom);
            }
          }
        }
      }
      if (isAsset && !this.selectedWorkflow) {
        this.selectedWorkflow = this.initialWorkflow;
      }
    }

  }
  scanAsset() {
    this.common.displayLoading();
     this.common.barcodeScan();
  }
  
  async scanLocation(){
    let customAsset;
    let options: BarcodeScannerOptions = {
      showTorchButton: true,
    };
    this.barcodeScanner.scan(options).then(async scanResult => {
      console.log(scanResult.text);
      if (null != scanResult.text) {
        let encodePath = btoa(scanResult.text);
        let scanType = 'LOCATION';
        let customVarValue = this.selectedCustomer && this.selectedCustomer?.id ? this.selectedCustomer?.id : null;
        var scanData = {
          'qrCodeText':encodePath,
          'type': scanType,
          'customerId': customVarValue,
          'locationId':null
        }
        let res  = await this.reqService.scanWorkOrder(scanData);
        if(res.id && !res.assetSerialNo) {
          let customloc = {
            id: res.id,
            companyId: res.companyId,
            locName: res.name,
            locationId: res.locationId,
            parentLocationId: res.parentLocationId,
            rootLocationId: res.rootLocationId,
            organizationId: res.organizationId,
            qrCode: res.qrcodeText,
          };
          this.selectedLocation = customloc;
          if (
            this.type != "asset" && this.showCustomer && this.showCustomer == "Show customer List"
          ) {
            let navigationExtras: NavigationExtras = {
              queryParams:{
                workflowId: this.workflowId,
              location: this.selectedLocation,
              locationId: this.selectedLocation && this.selectedLocation.id,
              customer: this.selectedCustomer,
              newRequestFromSearch: true,
              workRequest: this.workRequest ? this.workRequest : null,
              },replaceUrl:true
            }
            this.router.navigate(['/work-request'], navigationExtras);
           
          } else {
            let navigationExtras: NavigationExtras = {
              queryParams:{
                workflowId: this.workflowId,
                workflow: JSON.stringify(this.selectedWorkflow),
                locationId: this.selectedLocation && this.selectedLocation.id,
                location: JSON.stringify(this.selectedLocation),
                customer: JSON.stringify(this.selectedCustomer),
                newRequestFromSearch: true,
                workRequest: this.workRequest ? this.workRequest : null,
              },replaceUrl:true
            }
            this.router.navigate(['/new-request'], navigationExtras);
          }
        } else {
          this.common.alertToast('Invaliad Barcode');
        }
       }else {
        this.common.alertToast(
          this.reqService.translatedata("invalidBarcode")
        );
       }
    })
  }

  prepareLocation() {
    this.showAdd = true;
    this.items = [];
      for (let loc of this.locArray) {
        if (!loc.parentLocationId && loc.companyId == this.customerId) {
          let custom = {
            name: loc.name,
            id: loc.id,
            state: loc.state,
            stateId: loc.stateId,
            hierarchy: name ? name + " / " + loc.name : loc.name,
          };
          this.items.push(custom);
        } else {
          if(this.profile.isRowlevel && loc.parentLocationId && loc.companyId == this.customerId) {
            let custom = {
              name: loc.name,
              id: loc.id,
              state: loc.state,
              stateId: loc.stateId,
              hierarchy: name ? name + " / " + loc.name : loc.name,
            };
            this.skipChildLoc = true;
            this.items.push(custom);
          }
        }
      }
    

    this.results = [];
    this.results = this.items;
    if(this.results && this.results.length == 0 ){
       this.noLocFound = true;  
    }
  }

  prepareCustomer() {
    this.showAdd = true;
    this.showAddCustomer = this.customerList.length ? false : true;
    this.items = [];
    if (this.showAddCustomer) {
      this.items = this.companyArray;
      this.results = this.companyArray;
    } else {
      for (let company of this.companyArray) {
        if (company.active && company.companyType == "CUSTOMER") {
          for (let customerId of this.customerList) {
            if (company.id == customerId) {
              let custom = {
                name: company.name,
                id: company.id,
              };
              this.items.push(custom);
            }
          }
        }
      }
      this.results = this.items;
    }
    if(this.results.length == 0) {
      this.noRecordFound = true;
    }
    this.labelTxt = !this.results.length
      ? Config.customerQuestions.B
      : Config.customerQuestions.A;
    this.icon = "person";
    if (this.results.length == 0) {
      this.selectedItem = this.results[0];
      this.selectedCustomer = this.results[0];
      this.customerId = this.selectedItem.id;
      this.type = "Location";
      this.labelTxt = Config.locQuestions.A;
      this.icon = "pin";
      this.tmpTitle[this.loopCount] = this.labelTxt;
      this.tmpIcon[this.loopCount] = this.icon;
      this.prepareLocation();
    }
  }

  loadChidLocation(selectedLocation) {
    this.items = [];
    for (let loc of this.locArray) {
      if (loc.parentLocationId == selectedLocation.id) {
        let custom = {
          name: loc.name,
          id: loc.id,
          state: loc.state,
          stateId: loc.stateId,
          hierarchy: name ? name + " / " + loc.name : loc.name,
        };
        this.items.push(custom);
      }
    }
    this.results = this.items;
    if (!this.results.length) {
      if(this.createWorkrequest == 'createWorkrequest') {
        // this.type = "Asset";
        this.noRecordFound = false;
      }
      this.goNext();
    }
  }

  loadChidWorkflows(selectedWorkflow) {
    this.items = [];
    for (let cat of this.catArray) {
      if (cat.parentWorkflowId == selectedWorkflow.id) {
        let custom = {
          name: cat.name,
          id: cat.id,
          hierarchy: name ? name + " / " + cat.name : cat.name,
          templateHistId: cat.templateHistoryId
            ? cat.templateHistoryId
            : selectedWorkflow.templateHistId,
          childTemplateSchema: cat.requestSchema
            ? cat.requestSchema
            : selectedWorkflow.childTemplateSchema,
          templateSchema: cat.requestSchemaAsString
            ? cat.requestSchemaAsString
            : selectedWorkflow.templateSchema,
        };
        if (cat.requestSchema || selectedWorkflow.childTemplateSchema)
          this.items.push(custom);
        else this.checkTemplateSchema(cat, cat.requestSchema, custom);
      }
    }
    // this.common.stopLoading();
    this.results = this.items;
    if (!this.results.length && !this.selectedAsset) {
      this.type = "Customer";
      this.prepareCustomer();
    } else if (this.selectedAsset) {
      this.type = "selectedAsset";
      this.goNext();
    }
  }

  filterResult(Keyword, value?) {
    let val = value ? value : Keyword.target.value;
    val = val
      ? val.trim()
        ? val.trim().replace(new RegExp("\\s+", "gm"), " ")
        : ""
      : "";
    let keyvalue = val ? val.split(" ") : [];
    if (this.type != "Asset") {
      this.results = this.items;
    } 
    // else if (!val || this.results.length == 0) {
    //   if (this.type == "Asset") {
    //     this.loadAsset(this.assetList);
    //   } else {
    //     this.results = this.items;
    //   }
    // }
    if (val) {
      if (this.type == "Asset") {
        // this.isScroll =  true;
        let count = 1;
        this.fileterScrollEnabled = false;
        this.assetFilter.searchUserText = val.toLowerCase();
        this.page = 0;
        let options = {
          page : this.page,
          size: 20
        }
        this.reqService.getAssetByFilter(options, this.assetFilter).subscribe(async res=>{
          this.totalCount = res.headers.get('X-Total-Count');
          this.isFetched = true;
          this.isLocalAsset = false;
          if (this.type != 'Customer' && this.type != 'Workflow') {
            if (Config.constants.isAsset || (this.createWorkrequest === 'createWorkrequest')) {
              this.items = [];
              this.isAssetFound = this.assetList.length ? true : false;
              this.isSearchFilterAsset = true;
              await this.loadAsset(res.body);
              this.labelTxt = this.reqService.translatedata("chooseAsset");
              this.type = "Asset";
              this.isAllow = true;
            }
          }
          if(this.totalCount <= this.assetList.length) {
            this.isScroll = true;
          }
        });
      } else {
        this.results = this.items.filter((item) => {
          return item.name.toLowerCase().indexOf(val.toLowerCase()) > -1;
        });
        if(this.results.length == 0) {
          this.noRecordFound =  true;
        }
      }
    } else {
      if(this.type == "Asset") {
        this.assetList =[];
        this.assetFilter.searchUserText = '';
        this.fetchAssetFromFirestore();
        this.isAssetFound = this.results.length ? true : false;
      } else {
        this.results = this.items;
      }

    }
    if(this.results.length == 0) {
      this.noRecordFound =  true;
    }
  }

  getWorkflowTitle() {
    switch (this.loopCount) {
      case 1:
        this.labelTxt = Config.catQuestions.B;
        break;

      case 2:
        this.labelTxt = Config.catQuestions.C;
        break;

      case 3:
        this.labelTxt = Config.catQuestions.D;
        break;

      default:
        this.labelTxt = Config.catQuestions.A;
        break;
    }
  }
  selectItem(item) {
    this.results = [];
    console.log('item page enter');
    this.searchKeyword = "";
    setTimeout(() => {
      this.searchKeyword = "";
      this.tmpTitle[this.loopCount] = this.labelTxt;
      this.loopCount++;
      this.tmpResults[this.loopCount] = this.results;
      this.tmpType[this.loopCount] = this.type;
      this.tmpIcon[this.loopCount] = this.icon;
      this.showSearchBar = false;
      if(this.showLocation && this.showLocation === 'Show location List'){
        this.selectedItem = item;
        this.selectedlocation = item;
        this.locationIds = this.selectedItem.id;
        this.prepareAddCustomer();
      }
      if (this.type == "Workflow") {
        // this.common.displayLoading();
        this.selectedItem = item;
        this.selectedWorkflow = item;
        this.workflowId = this.selectedItem.id;
        this.getWorkflowTitle();
        this.loadChidWorkflows(item);
        this.tmpTitle[this.loopCount] = this.labelTxt;
      } else if (this.type == "Customer") {
        this.selectedItem = item;
        this.selectedCustomer = item;
        this.customerId = this.selectedItem.id;
        this.type = "Location";
        this.labelTxt = Config.locQuestions.A;
        this.tmpTitle[this.loopCount] = this.labelTxt;
        this.prepareLocation();
      } else if (this.type == "Location") {
        this.selectedItem = item;
        this.selectedLocation = item;
        this.labelTxt = Config.locQuestions.B;
        this.tmpTitle[this.loopCount] = this.labelTxt;
        this.loadChidLocation(item);
      } else if (
      this.createWorkrequest &&
        this.createWorkrequest === "createWorkrequest" &&
        this.createWorkrequest !=null &&
        this.type === 'Asset'
      ) {
        let navigationExtras: NavigationExtras = {
          queryParams:{
            selectedAsset: JSON.stringify(item),
          }
        }
        this.router.navigate(['/work-request'], navigationExtras);
      } else {
        this.selectedAsset = item;
        if (this.hasAssetDowntimeTracking) {
          this.labelTxt = "Choose Asset Status";
          this.icon = "logo-buffer";
          this.type = "downTimeTracking";
          this.results = [];
          // this.prepareAssetTracking();
        } else {
          this.type = "Workflow";
          // setTimeout(() => {
          this.prepareWorkflow();
          // }, 500);
         
          this.selectedAsset = item;
        }
        // this.updateAssetDowntime(item);
        // this.getAssetWorkflow(item.workflowId);
        // this.navCtrl.push(new-request, { isFromAssetSearch: true, data: item, workflowList: this.catArray, workflow: this.selectedWorkflow });
        // this.modalCtrl.dismiss();
      }
    }, 100);
  }

  updateAssetDowntime(option) {
    if (navigator.onLine) {
      this.reqService
        .updateAssetDowntime(this.selectedAsset.id, option)
        .subscribe((resp) => {
          if (resp && !this.showCustomer) {
            this.type = "Workflow";
            this.prepareWorkflow();
            const state = option ? "down" : "working fine";
            this.common.alertToast(
              this.reqService.translatedata("Your asset marked as ") + state
            );
          } 
        },async (err)=>{
          this.common.alertToast(
            this.reqService.translatedata(
              "Can't update the asset status, please try after sometime."
            )
          );
        })
    } else {
      this.common.alertToast(
        this.reqService.translatedata(
          "Asset downtime tracking not working in offline mode. Please try it Online."
        )
      );
    }
  }

  async goNext() {
    if (this.type == "Workflow") {
      this.showAdd = true;
      this.type = "Location";
      if (this.isAvailable) {
        this.labelTxt = Config.locQuestions.A;
        this.loadLocations(this.locList);
      }
      else {
        let navigationExtras: NavigationExtras = {
          queryParams:{
            workflowId: this.workflowId,
            locationId: this.locationId,
            customer: JSON.stringify(this.selectedCustomer),
            newRequestFromSearch: true,
            workRequest: JSON.stringify(this.workRequest) ? JSON.stringify(this.workRequest)  : null,
          }
        }
        this.router.navigate(['/new-request'], navigationExtras);
      }
    }
    else if(this.createWorkrequest && this.createWorkrequest == "createWorkrequest"){
      this.assetList = [];
      if(this.profile && this.profile?.isRowlevel && !this.isAssetDisabled) {
        let data : any =  await this.common.getAssetForRowLevlUserWorkReqFromFirestore(this.profile, this.selectedLocation?.id)
        this.loadAssetData(data);
      }else {
        this.fetchAssetFromFirestore();
      }
       
    } else if (this.type == "selectedAsset") {
        let navigationExtras: NavigationExtras = {
          queryParams:{
            isFromAssetSearch: true,
            selectedAsset: JSON.stringify(this.selectedAsset),
            workflowList: JSON.stringify(this.catArray),
            workflow: JSON.stringify(this.selectedWorkflow),
            customer: JSON.stringify(this.selectedCustomer),
            workRequest: this.workRequest ? JSON.stringify(this.workRequest) : null,
          }
        }
        this.router.navigate(['/new-request'],navigationExtras);

    } else {
        this.isCompleted = true;
        let navigationExtras : NavigationExtras = {
          queryParams:{
            workflow: JSON.stringify(this.selectedWorkflow),
            location: JSON.stringify(this.selectedLocation),
            customer: JSON.stringify(this.selectedCustomer),
            newRequestFromSearch: true,
            workRequest: this.workRequest ? this.workRequest : null,
          }
        }
        this.router.navigate(['/new-request'], navigationExtras);
      // }
    }
  }
  gotoAddLocation() {
    this.prepareAddLocation();
  }

   async prepareAddLocation() {
    let addLocationModal = await this.modalCtrl.create(
    {
      component : MapPage,
      componentProps: { 
        isFromRequest: true,
        companyId: this.customerId,
        callBack: this.locationAddCallback,
      }
    }
   );
    addLocationModal.onDidDismiss().then(async (detail: OverlayEventDetail) => {
      let data = detail.data
      if (data) {
        const selectedLocation = data;
        let navigationExtras: NavigationExtras = {
          queryParams:{
            workflow: JSON.stringify(this.selectedWorkflow),
            location: JSON.stringify(selectedLocation),
            customer: JSON.stringify(this.selectedCustomer),
            newRequestFromSearch: true,
            workRequest: this.workRequest ? this.workRequest : null,
          }
        }
        this.router.navigate(['/new-request'],navigationExtras);
      }
    });
    await addLocationModal.present();
  }

  gotoAddCustomer() {
    this.prepareAddCustomer();
  }

  async prepareAddCustomer() {
    let addCustomerModal = await this.modalCtrl.create({
      component : CustomerPage,
      componentProps : {
        isFromRequest: true,
        callBack: this.customerAddCallback,
        customerList: this.companyArray,
      }
    });
    addCustomerModal.onDidDismiss().then(async (detail: OverlayEventDetail) => {
      let data = detail.data
      if (data) {
        const selectedLocation = {
          id: data.id,
          name: data.name,
        };
        const selectedCustomer = {
          id: data.companyId,
          name: data.customerName,
          companyType: "CUSTOMER",
        };
        let navigationExtras: NavigationExtras = {
          queryParams:{
            workflow: JSON.stringify(this.selectedWorkflow),
            location: JSON.stringify(selectedLocation),
            customer: JSON.stringify(selectedCustomer),
            newRequestFromSearch: true,
            workRequest: this.workRequest ? this.workRequest : null,
          }
        }
        this.router.navigate(['/new-request'], navigationExtras);
      }
    });
    await addCustomerModal.present();
  }
  locationAddCallback = (data) => {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, 1000, "data"); 
      reject(reject)
    });
  };

  customerAddCallback = (data) => {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, 1000, "data");
      reject(reject)
    });
  };

  loadLocations(locationList, name?) {
    if (!locationList.length) {
      this.goNext();
      this.isFinished = true;
    } else {
      for (let loc of locationList) {
        let custom = {
          name: loc.name,
          hierarchy: name ? loc.name + ", " + name : loc.name,
          id: loc.id,
          childLocationTreeDTOs: loc.child,
        };
        this.items.push(custom);
      }
    }

    this.results = this.items;
  }
  loadAsset(assetList, name?) {
    this.results = [];
    this.items = [];
  
    for (const asset of assetList) {
      if (asset.active) {
        const custom = {
          name: name
            ? name + " / " + asset.name
            : `${asset.workflowName} / ${asset.locationName} / ${asset.locationAddress} / ${asset.name} / ${asset.id} / ${asset.customerName} / ${asset.assetSerialNo}`,
          id: asset.id,
          workflowName: asset.workflowName,
          locationName: asset.locationName,
          categoryId: asset.categoryId,
          categoryName: asset.categoryName,
          assetSerialNo: asset.assetSerialNo,
          modelId: asset.modelCode,
          workflowId: asset.workflowId,
          assetName: asset.name,
          locationId: asset.locationId,
          locationAddress: asset.locationAddress,
          customerName: asset.customerName,
          customerId: asset.customerId,
          qrCode: asset.qrcodeText,
          warrantyExpiredOn: asset.warrantyExpiredOn,
        };
        this.results.push(custom);
        this.items.push(custom);
      }
    }
  
    if (this.createWorkrequest === 'createWorkrequest' && this.selectedLocation && this.selectedLocation.id && !this.isAssetDisabled) {
      this.results = this.items;
      if (this.results && this.results.length === 0 && !this.isSearchFilterAsset) {
        this.skipAsset();
      }
    }
  
    this.noRecordFound = this.isAssetFound = this.results.length > 0 ? true : false;
  }
  

  loadFilterAsset(assetList) {
    let count = 0;
    this.results = [];
    this.items = [];
    for (let loc of assetList) {
      if (count < 10) {
        this.results.push(loc);
      }
      this.items.push(loc);
      count++;
    }
    if(this.results.length == 0) {
      this.noRecordFound = true;
    }
  }

  async doInfinite(infiniteScroll) {
    if(this.profile.isRowlevel) {
      if(this.createWorkrequest == 'createWorkrequest') {
        let data = await this.common.nextAssetForRowLevlUserWorkReqFromFirestore(this.profile, this.assetLastDocRowLevel, this.selectedLocation?.id);
        if(data.length == 0) {
          this.isScroll = true;
        }
        this.loadAssetData(data);
      }else {
        this.getAssetFromFirestore(this.profile?.locationIds)
        this.page = this.page + 1;
      }
      setTimeout(() => {
        infiniteScroll.target.complete();
      }, 300);
    } else {
      this.assetList = await this.common.removeDuplicateArrayobj(this.assetList);
      if(this.assetList.length >= Number(this.totalCount)){
        this.isScroll = true
      }else {
        this.page = this.page + 1;
        this.fetchAssetFromFirestore();
        setTimeout(() => {
          infiniteScroll.target.complete();
        }, 300);
      }

    }
    

  }
  getUserProfile(id) {
    this.reqService.getUser(id)
    .subscribe(
      (res) => {
        if (res) {
          this.userProfile = res;
          this.workflowType = this.userProfile.workflowType;
        }
      },
      (error) => {
        // console.log(error)
        this.common.stopLoading();
      }
    )
  }
  async changeWorkflow() {
    let msg =
      this.userProfile.workflowType === "asset"
        ? "Would you like to change your workflow type to facility?"
        : "Would you like to change your workflow type to asset?";
    let alert =  await this.alertCtrl.create({
      header: 'Confirm WorkflowType',
      message: '<div><span class="alert-text">' + msg + "</span></div>",
      cssClass: "custom-alert",
      backdropDismiss : false,
      buttons: [
        {
          text: this.reqService.translatedata("Cancel"),
          role: "Cancel",
          handler: () => {
            this.backDropDismiss = true;
            // console.log("Cancel clicked");
          },
        },
        {
          text: this.reqService.translatedata("confirm"),
          handler: () => {
            this.changeFlow();     
          },
        },
      ],
    });
    await alert.present();
  }
  changeFlow() {
    this.backDropDismiss = true;
    this.common.displayLoading();
    this.userProfile.workflowType =
      this.userProfile.workflowType === "asset" ? "facility" : "asset";
    this.userProfile.uuid =  this.device.uuid;
    this.userProfile.deviceToken = this.common.getdeviceInfo();
    this.reqService.updateUser(this.userProfile)
    .subscribe(
      async (res) => {
        this.common.stopLoading();
        if (res) {
          this.setUserData(res);
          this.getUserProfile(res.id);
          
          if(this.showCustomer === 'Show customer List'){
            this.showCustomer = null;
            this.showAssetList = 'Show Asset List';
            this.type = 'Asset';
            // console.log('change flow' +this.type);
          }else if ( this.showAssetList == 'Show Asset List')
          {
            this.showCustomer = 'Show customer List';
            this.showAssetList = null;
            this.type = 'Customer';
            this.prepareCustomer();
          } else {
            this.showCustomer = this.showAssetList = null;   
            if(this.userProfile.workflowType =='facility'){ 
              this.selectedAsset = null;
              this.prepareWorkflow()
            } 
            if(this.userProfile.workflowType === "asset") {
              this.type = "Asset";
              this.labelTxt = this.reqService.translatedata("chooseAsset");
              if(this.assetList && this.assetList.length > 0) {
                this.isAssetFound = this.assetList.length ? true : false;
                this.isFetched = true;
                await this.loadAsset(this.assetList);
              } else {
                await this.fetchAssetFromFirestore();
              }
              
            }  
          }      
          this.common.alertToast(
            this.reqService.translatedata("WorkflowType  updated successfully")
          );
        }
      },
      (error) => {
        this.common.stopLoading();
           if (error.status == 401) {
              this.events.publish('user:inactive', {err:error.status, time:Date.now()});
            }
        // console.log(error)
        
      }
    )
  }
  setUserData(profile) {
    this.userDetails.username = profile.firstName;
    this.userDetails.email = profile.email;
    this.userDetails.langKey = profile.langKey;
    this.userDetails.id = profile.id;
    this.userDetails.tenantId = profile.tenantId;
    this.userDetails.customerIds = profile.customerIds;
    this.userDetails.workflow = profile.workflowType;
    this.userDetails.uicustomized = profile.uicustomized;
    this.userDetails.mobileUITemplateId = profile.mobileUITemplateId;
    this.userDetails.downTimeTracking = profile.downTimeTracking;
    this.userDetails.restrictByLocation = profile.restrictByLocation;
    this.userDetails.locationIds = profile.locationIds;
    this.userDetails.isRowlevel = profile.isRowlevel;
    this.workflowType = profile.workflowType;
    this.common.setWorkFlowType(profile.workflowType);
    let userData = JSON.parse(window.localStorage.getItem('Profile'));
    userData.workflowType = profile.workflowType;
    window.localStorage.setItem('Profile', JSON.stringify([]));
    window.localStorage.setItem('Profile', JSON.stringify(userData));
    this.storage.setItem("userProfile", JSON.stringify(this.userDetails));
  }
  skipAsset() {
    let navigationExtras: NavigationExtras = {
      queryParams:{
        workflowId: this.workflowId,
        location: JSON.stringify(this.selectedLocation),
        locationId: this.selectedLocation.id,
        customer: JSON.stringify(this.selectedCustomer ? this.selectedCustomer : this.selectedLocation && this.selectedLocation.companyName ? this.selectedLocation.companyName : null),
        newRequestFromSearch: true,
        workRequest: this.workRequest ? this.workRequest : null,
      }
    }
    this.router.navigate(['/work-request'], navigationExtras);
}
  onCancel($event) {
    
  }
  back() {
    this.backDropDismiss = true;
    let pro = JSON.parse(localStorage.getItem("Profile"));
    if(pro && pro.userGroupNames && pro.userGroupNames.length === 1 && pro.userGroupNames[0].toLowerCase() === 'workrequest') {
      this.router.navigate(['work-request-list']);
    } else {
      this.router.navigate(['/home'],{replaceUrl:true});
    }
    
  }
  getWorkRequestJson()
  {
    this.reqService.getWorkrequestJson().subscribe(res=>{
      console.log(res);
        res.body[0].predefined.forEach(element => {
          if(element.fieldName === 'Asset' && element.enable === false)
          {
            this.isAssetDisabled = true;
          }
          if(element.fieldName === 'Asset' && element.enable === true && element.compulsory == true)
          {
            this.isMandatory = true;
          }
        });; 
      
    },async (err)=>{
      console.log(err);
    })
  }
   ionViewWillEnter() {
    this.assetFilter = new AssetFilter();
    this.backDropDismiss = true;
    this.router.events
    .pipe(filter((event: any) => event instanceof RoutesRecognized), pairwise())
    .subscribe((events: RoutesRecognized[]) => {
        this.previousUrl = events[0].urlAfterRedirects;
        this.currentUrl = events[1].urlAfterRedirects;
        if(this.previousUrl.includes('new-request')) {
          // this.router.navigate(['home']);
        }
    });
    this.route.queryParams.subscribe(params => {
      if(params['isWorkRequest']) {
        this.isWorkRequest = JSON.parse(params['isWorkRequest']);
        this.createWorkrequest = null;
        this.getWorkRequestJson();
      }
    })
    this.route.queryParams.subscribe(params =>{
      if(params && params.chooseAsset){
        this.showAssetList = params.chooseAsset;
      }
        this.createWorkrequest = params["createWorkrequest"]
        ? params["createWorkrequest"]
        : null;
        this.isWorkRequest = params["isWorkRequest"]
        ? JSON.parse(params["isWorkRequest"])
        : false;
    })
    this.route.queryParams.subscribe(params =>{
        this.showCustomer = params.chooseCustomer ? params.chooseCustomer : null;
    })
    this.route.queryParams.subscribe(params =>{
        this.workRequest = params.workRequest ? JSON.parse(params.workRequest) : null;
        this.isFromWorkRequest = params.isFromWorkRequest == 'true'?  true : false;
        this.showWorkflowList = params.chooseWorkflow ? params.chooseWorkflow : null;
        this.type = this.isFromWorkRequest ? 'Workflow' : this.type;
    })
  if(navigator.onLine) {
    let info = window.localStorage.getItem('Profile');
      let profile = JSON.parse(info);
      this.profile = profile;
      this.tenantId = profile.tenantId;
      this.hasAssetDowntimeTracking = false;
      this.hasRestrictByLocation = profile.restrictByLocation;
      this.customerList = profile.customerIds;
      if (this.profile && this.profile.id) {
      this.reqService.getUser(this.profile.id)
        .subscribe(
          async (res) => {
            if (res) {
              this.userProfile = res;
              this.workflowType = this.userProfile.workflowType;
              let user = res;
              this.type = user.workflowType == 'asset' && !this.isFromWorkRequest ? 'Asset' : 'Workflow';
              if (
                this.createWorkrequest &&
                this.createWorkrequest === 'createWorkrequest'
              ) {
                this.type = 'Customer';
                let companyCollectionRef = this.firestore
                .collection('organization')
                .doc(profile.tenantId)
                .collection('company');
              companyCollectionRef.get().subscribe(async (res:any) => {
                res = res && res.length != 0 ? await this.common.getDocValue(res) : [];
                this.companyArray = res;
                this.isAllow = true;
                this.customerList = profile.customerIds;
                if (this.type == 'Customer') this.prepareCustomer();
              });
              } else {
                let companyCollectionRef = this.firestore
                .collection('organization')
                .doc(profile.tenantId)
                .collection('company');
              companyCollectionRef.get().subscribe(async (res:any) => {
                res = res && res.length != 0 ? await this.common.getDocValue(res) : [];
                this.companyArray = res;
                this.isAllow = true;
                this.customerList = profile.customerIds;
                if (this.type == 'Customer') this.prepareCustomer();
              });
              }
              Config.constants.isAsset =
                user.workflowType == 'asset' ? true : false;
              this.profile.locationIds = user.locationIds;
              console.log('call asset from firestore ');
              console.log('profile workflow type', profile.workflowType);
              if(this.profile.workflowType == 'asset') {
                await this.fetchAssetFromFirestore();
              }
              console.log('enter fetch from workflow');
                let catgoryCollectionRef = this.firestore
                .collection('organization')
                .doc(this.profile.tenantId)
                .collection('workflow');
              catgoryCollectionRef.get().subscribe(async (res:any) => {
                res = res && res.length != 0 ? await this.common.getDocValue(res) : [];
                this.catArray = res;
                this.isWorkflowLoaded = true;
                if (
                  (!Config.constants.isAsset || this.isFromWorkRequest) &&
                  this.showCustomer === null &&
                  this.showCustomer != 'Show customer List'
                ) {
                  if (!Config.constants.isAsset && !this.isWorkRequest) {
                    this.isWorkRequest = false;
                    this.isAllow = true;
                    this.isWorkflowLoaded  = true;
                    this.type = 'Workflow';
                    this.prepareWorkflow();
                  }
                  if (this.isFromWorkRequest) {
                    this.type = 'Workflow';
                    let asset = {};
                    asset = {
                      name: this.workRequest &&  this.workRequest.assetName ?this.workRequest.assetName : undefined,
                      id: this.workRequest && this.workRequest.assetId ? this.workRequest.assetId : undefined,
                      locationId: this.workRequest.locationId,
                      locationName: this.workRequest.locationName,
                      customerId: this.workRequest.companyId,
                      customerName: this.workRequest.companyName,
                      categoryId: this.workRequest && this.workRequest.categoryId ? this.workRequest.categoryId : undefined,
                    };
                    this.selectedAsset = asset;
                    this.prepareWorkflow();
                  }
                }
              });



              this.storage.getItem('location_state').then(
                (res) => {
                  if (res && res.length) {
                    this.states = res;
                  }
                },
                (err) => {
                  let stateCollectionRef = this.firestore
                    .collection('organization')
                    .doc(profile.tenantId)
                    .collection('location_state');
                  stateCollectionRef.valueChanges().subscribe((res) => {
                    this.states = res;
                    this.storage.setItem('location_state', res);
                  });
                }
              );
              let locationCollectionRef = this.firestore
                .collection('organization')
                .doc(profile.tenantId)
                .collection('location');
              if (
                this.profile.isRowlevel &&
                this.profile.locationIds &&
                this.profile.locationIds.length
              ) {
                
                let ids = Array.from(this.profile?.locationIds);
                let locatinIds = [...ids];
                while (locatinIds.length) {
                  const batch = locatinIds.splice(0, 10);
                  const batchPromiseLoc = this.firestore
                    .collection<any>("organization")
                    .doc<any>(this.profile.tenantId)
                    .collection<any>("location", (ref) =>
                      ref
                        .where("path", "array-contains-any", [...batch]))
                    .get()
                    .toPromise();
                  await this.getBatchDataLoc(batchPromiseLoc); 
                  
                }
                await this.waitForAllDataLoc(); 
              }else {
                locationCollectionRef.valueChanges().subscribe((res) => {
                this.locArray = res;
                if (this.type == 'Location') this.prepareLocation();
              });
              }
            }
          },
          (error) => {
            this.common.stopLoading();
          }
        )
      }
  
   
  } else {
    this.common.stopLoading();
    this.common.alertToast(this.reqService.translatedata('networkConnectivityError'));
    this.router.navigate(['home']);
  }

  }
  async waitForAllDataLoc() {
    await Promise.all(this.batchesLoc);
    this.locArray = this.batchesLoc.flat();
    this.locArray = this.common.removeDuplicateArrayobj(this.locArray);
    if (this.type == 'Location') this.prepareLocation();
  }
  async getBatchDataLoc(batchPromise: any) {
    await batchPromise.then(async (res: any) => {
      res = res.size != 0 ? await this.common.getDocValue(res) : [];
      this.batchesLoc.push(res);
    });
  }
  ionViewDidEnter() {
    console.log('ionViewDidEnter');
     let barcodeData: any;
     let customAsset: any;
     this.events.subscribe("barcodeScan", async (data:any)=>{
       if(data == 'Not Found') {
         this.common.stopLoading();
       }
       barcodeData = data;
       this.common.stopLoading();
       let isAssetFound = false;
           if (null != barcodeData.data.text) {
             this.backDropDismiss = true;
             let encodePath = btoa(barcodeData.data.text);
             let scanType = 'ASSET';
             let customVarValue = this.selectedLocation && this.selectedLocation?.id ? this.selectedLocation?.id : null;
             var scanData = {
               'qrCodeText':encodePath,
               'type': scanType,
               'customerId': null,
               'locationId':null
             }
             let res  = await this.reqService.scanWorkOrder(scanData)
             console.log(res);
             if(res && res.assetSerialNo) {
               customAsset = {
                 id: res.id,
                 workflowName: res.workflowName,
                 locationName: res.locationName,
                 assetSerialNo: res.assetSerialNo,
                 modelId: res.modelCode,
                 workflowId: res.workflowId,
                 assetName: res.name,
                 locationId: res.locationId,
                 locationAddress: res.locationAddress,
                 customerName: res.customerName,
                 customerId: res.customerId,
                 qrCode: res.qrcodeText,
                 categoryId: res.categoryId,
               };
               isAssetFound = true;
               this.selectedAsset = customAsset;
               if (this.hasAssetDowntimeTracking) {
                 this.labelTxt = "Choose Asset Status";
                 this.icon = "logo-buffer";
                 this.type = "downTimeTracking";
                 this.results = [];
                 this.tmpType[this.loopCount] = this.type;
                 this.tmpResults[this.loopCount] = this.results;
               } 
               else if (
                 this.showAssetList &&
                 this.showAssetList === "Show Asset List" &&
                 this.showAssetList != null &&
                 this.type === 'Asset'
               ) {
                 let navigationExtras: NavigationExtras = {
                   queryParams:{
                     selectedAsset: this.selectedAsset,
                   }
                 }
                 this.router.navigate(['/work-request'], navigationExtras);
             } else {
               this.type = "Workflow";
               this.selectedAsset = customAsset;
               this.prepareWorkflow();
             }
             }else {
               this.backDropDismiss = true;
               this.common.alertToast(res.error);
             }
             if (!isAssetFound) {
               this.backDropDismiss = true;
               this.reqService.translatedata("invalidBarcode")
             }
           } else {
             this.backDropDismiss = true;
             this.common.alertToast(
               this.reqService.translatedata("invalidBarcode")
             );
           }
     })
     this.events.subscribe('barcodeScanLoc', async(data:any)=>{
       barcodeData = data;
       if (null != barcodeData.data.text) {
        let encodePath = btoa(barcodeData.data.text);
        let scanType = 'LOCATION';
        let customVarValue = this.selectedCustomer && this.selectedCustomer?.id ? this.selectedCustomer?.id : null;
        var scanData = {
          'qrCodeText':encodePath,
          'type': scanType,
          'customerId': customVarValue,
          'locationId':null
        }
        let res  = await this.reqService.scanWorkOrder(scanData);
        if(res.id && !res.assetSerialNo) {
          let customloc = {
            id: res.id,
            companyId: res.companyId,
            locName: res.name,
            locationId: res.locationId,
            parentLocationId: res.parentLocationId,
            rootLocationId: res.rootLocationId,
            organizationId: res.organizationId,
            qrCode: res.qrcodeText,
          };
          this.selectedLocation = customloc;
          if (
            this.type != "asset" && this.showCustomer && this.showCustomer == "Show customer List"
          ) {
            let navigationExtras: NavigationExtras = {
              queryParams:{
                workflowId: this.workflowId,
              location: this.selectedLocation,
              locationId: this.selectedLocation && this.selectedLocation.id,
              customer: this.selectedCustomer,
              newRequestFromSearch: true,
              workRequest: this.workRequest ? this.workRequest : null,
              },replaceUrl:true
            }
            this.router.navigate(['/work-request'], navigationExtras);
           
          } else {
            let navigationExtras: NavigationExtras = {
              queryParams:{
                workflowId: this.workflowId,
                workflow: JSON.stringify(this.selectedWorkflow),
                locationId: this.selectedLocation && this.selectedLocation.id,
                location: JSON.stringify(this.selectedLocation),
                customer: JSON.stringify(this.selectedCustomer),
                newRequestFromSearch: true,
                workRequest: this.workRequest ? this.workRequest : null,
              },replaceUrl:true
            }
            this.router.navigate(['/new-request'], navigationExtras);
          }
        } else {
          this.common.alertToast('Invaliad Barcode');
        }
       }else {
        this.common.alertToast(
          this.reqService.translatedata("invalidBarcode")
        );
       }
     })
   }
   scanWorkReq(type){
     let customAsset;
     let options: BarcodeScannerOptions = {
       showTorchButton: true,
     };
     this.barcodeScanner.scan(options).then(scanResult => {
       console.log(scanResult.text);
       let encodePath = btoa(scanResult.text);
       let scanType = type == 'Asset' ? 'ASSET' : 'LOCATION';
       let customVarValue = type == "Asset" ? this.selectedLocation?.id: this.selectedCustomer?.id; 
       if(type == 'Asset') {
         var data = {
           'qrCodeText':encodePath,
           'type': scanType,
           'locationId': customVarValue,
           'customerId': null
         }
       } else {
         var data = {
           'qrCodeText':encodePath,
           'type': scanType,
           'customerId': customVarValue,
           'locationId':null
         }
       }
       this.reqService.scanWorkRequest(data).subscribe(res=>{
         // this.allowAssetScan = type == 'Asset' ? this.results.some(item => item.assetSerialNo === res.assetSerialNo) : false;
         // this.allowLocScan = type == 'Location' ? this.results.some(item => item.id === res.id) : false;
         if(res.assetSerialNo && type == 'Asset' ){
           customAsset = {
             id: res.id,
             workflowName: res.workflowName,
             locationName: res.locationName,
             assetSerialNo: res.assetSerialNo,
             modelId: res.modelCode,
             workflowId: res.workflowId,
             assetName: res.name,
             locationId: res.locationId,
             locationAddress: res.locationAddress,
             customerName: res.customerName,
             customerId: res.customerId,
             qrCode: res.qrcodeText,
             categoryId: res.categoryId,
             categoryName:res.categoryName,
             assetId:res.assetId
           };
           this.selectedAsset = customAsset;
           let navigationExtras: NavigationExtras = {
             queryParams:{
               selectedAsset: JSON.stringify(this.selectedAsset)
             }
           }
           this.router.navigate(['work-request'], navigationExtras);
         }else if(type == 'Location' && !res.assetId ){
           let customloc = {
             id: res.id,
             companyId: res.companyId,
             name: res.name,
             locationId: res.locationId,
             parentLocationId: res.parentLocationId,
             rootLocationId: res.rootLocationId,
             organizationId: res.organizationId,
             qrCode: res.qrcodeText,
           };
           console.log(customloc);
           if(res.id)
           this.selectedLocation = customloc;
           this.type = 'Asset';
           this.goNext();
         }else {
           this.common.alertToast(
             this.reqService.translatedata("invalidBarcode")
           );
         }
       },async(err)=>{
        if(err.error == null) {
          this.common.alertToast(
            this.reqService.translatedata("invalidBarcode")
          );
        } else {
          this.common.alertToast(err.error);
        }
         
       })
     })
   }

  backDrop() {
    this.backDropDismiss = this.fab && this.fab.activated == false ? false : true;
    // this.backDropDismiss = this.fabFacility && this.fabFacility.activated == false ? false : true;
  }

  //get asset from firestore for row level user path contain more than 10 locationIds
  async getAssetFromFirestore(arrayToQuery?: any[]) {
    arrayToQuery = arrayToQuery ? arrayToQuery : this.profile?.locationIds;
    if (this.isLastBatch) {
      console.log('Reached the end of the data.');
      return;
    } 

    const chunkSize = this.pageSize;
    const totalChunks = Math.ceil(arrayToQuery.length / chunkSize);
    this.lastDocumentForAsset = Math.ceil(this.assetList.length / chunkSize);
    const currentChunk = Math.min(totalChunks, this.lastDocumentForAsset ? this.lastDocumentForAsset + 1 : 0);

    if (currentChunk >= totalChunks) {
      console.log('Reached the end of the data.');
      return;
    }

    const start = currentChunk * chunkSize;
    const end = Math.min(start + chunkSize, arrayToQuery.length);
    const chunk = arrayToQuery.slice(start, end);

    const query = this.firestore
      .collection<any>("organization")
      .doc<any>(this.profile.tenantId)
      .collection<any>("asset", (ref) =>
        ref
          .orderBy('id')
          .limit(this.pageSize)
          .where("path", "array-contains-any", chunk))
      .get()
      .toPromise();
    try {
      const finalResults = [];
      await query.then(async (res: any) => {
        res = res.size != 0 ? await this.common.getDocValue(res) : [];
        finalResults.push(res);
        console.log('finalResults', finalResults);
      });
      this.lastDocumentForAsset = currentChunk >= totalChunks - 1 ? null : currentChunk;
      console.log('lastDocumentForAsset', this.lastDocumentForAsset);

      // Check if it's the last batch
      if (currentChunk >= totalChunks - 1) {
        this.isLastBatch = true;
      }
      console.log(finalResults);
      this.assetList = this.assetList.concat(finalResults[0]);
      this.isFetched = true;
      this.common.assetList = this.assetList;
      this.isLocalAsset = false;
      if (this.type != 'Customer' && this.type != 'Workflow') {
        if ((this.createWorkrequest !== 'createWorkrequest' && Config.constants.isAsset) || (this.createWorkrequest && this.createWorkrequest === 'createWorkrequest' && !this.isAssetDisabled)) {
          await this.loadAsset(this.assetList);
          this.isAssetFound = this.assetList.length ? true : false;
          this.labelTxt = this.reqService.translatedata("chooseAsset");
          this.type = "Asset";
          this.isAllow = true;
        }
      }
    } catch (error) {
      console.error('Error executing Firestore query:', error);
    }

  }
  async loadAssetData(data?:any) {
    this.assetList = this.assetList.concat(data);
    this.assetLastDocRowLevel = data && data?.length != 0 ? data[data.length - 1].id : 1;
    this.noRecordFound = this.isAssetFound = this.assetList.length ? true : false;
    await this.loadAsset(this.assetList);
    this.labelTxt = this.reqService.translatedata("chooseAsset");
    this.type = "Asset";
    this.isAllow = true;
  }
}
