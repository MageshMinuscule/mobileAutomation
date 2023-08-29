import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { ModalController, NavParams } from '@ionic/angular';
import { ServiceProvider } from 'src/providers/service/service';
import { Config } from '../config';
import { AssetFilter, PendingFilter } from '../data.model';

@Component({
  selector: 'app-pending-filter',
  templateUrl: './pending-filter.page.html',
  styleUrls: ['./pending-filter.page.scss'],
})
export class PendingFilterPage implements OnInit {
  categoryArray: any[];
  locationArray: any[];
  btnTxt = 'Apply';
  category: any = {};
  location: any = {};
  parentCategory: any[] = [];
  parentLocation: any[] = [];
  categoryResults: any[];
  results: any[];
  selectedItem: any;
  selectedParentItem: any;
  subCategory: any = {};
  selectedCategory: any = {};
  selectedLocation: any = {};
  parentCategoryResults: any = new Array();
  parentLocationResults: any = [];
  subCategoryResults: any = [];
  childCategories: any[] = [];
  childLocations: any[] = [];
  categoryTitles: any[] = [];
  parentCategoryTitle: any = 'Category';
  assetArray: any = [];
  parentAsset: any = [];
  asset: any = {};
  parentAssetResults: any = [];
  childAssets: any;
  selectedAsset: any;
  assets: any = [];
  assetsResults: any[];
  workflow: any = {};
  selectedWorkflow: any = {};
  workflowResults: any[];
  workflowArray: any = [];
  workflows: any;
  reqType: any;
  pendingFilter: PendingFilter;
  value: {
    selectedCategory: any;
    category: any;
    childCategories: any[];
    selectedLocation: any;
    location: any;
    asset: any;
    selectedAsset: any;
    childLocations: any[];
    workflow: any;
    selectedWorkflow: any;
    selectedCustomer:any;
    count:any;
  };
  module: any;
  workOrderWorkflows: any[];
  preventiveWorkflows: any[];
  filterCount: number = 0;
  page: number = 0;
  assetFilter: AssetFilter;
  loaded: boolean;
  companyArray: any= [];
  companys: any[];
  companyResults: any[];
  customer: any = {};
  selectedCustomer: any = {};
  pendingStatus: any;
  selectedStatus: any;
  allStatus = ['Yet to Ack', 'Check In', 'Progress']
  allStatusResults: string[];
  statusResults: any[];
  statusAll = ['WIP', 'Closed', 'Pending', 'New', 'Reject'];
  statusName: any;
  statusSelected: any;

  constructor(
    public firestore: AngularFirestore,
    public storage: NativeStorage,
    public route: ActivatedRoute,
    public modalCtrl: ModalController,
    private navparams: NavParams,
    private reqService: ServiceProvider
  ) {
    this.parentCategoryResults = [];
    this.assetFilter = new AssetFilter();
    this.pendingFilter = new PendingFilter();
    let info = window.localStorage.getItem('Profile');
    let profile = JSON.parse(info);
  setTimeout(() => {
    this.category = this.navparams.data['category']
    ? this.navparams.data['category']
    : {};
  this.childCategories = this.navparams.data['childCategories']
    ? this.navparams.data['childCategories']
    : [];
  this.customer = this.navparams.data['customer']
    ? this.navparams.data['customer']
    : {};
  this.selectedCustomer = this.navparams.data['selectedCustomer']
    ? this.navparams.data['selectedCustomer']
    : [];
  this.selectedCategory = this.navparams.data['selectedCategory']
    ? this.navparams.data['selectedCategory']
    : [];
  this.location = this.navparams.data['location']
    ? this.navparams.data['location']
    : {};
  this.selectedLocation = this.navparams.data['selectedLocation']
    ? this.navparams.data['selectedLocation']
    : [];
  this.asset = this.navparams.data['asset']
    ? this.navparams.data['asset']
    : {};
  this.selectedAsset = this.navparams.data['selectedAsset']
    ? this.navparams.data['selectedAsset']
    : [];
  this.workflow = this.navparams.data['workflow']
    ? this.navparams.data['workflow']
    : {};
  this.selectedWorkflow = this.navparams.data['selectedWorkflow']
    ? this.navparams.data['selectedWorkflow']
    : [];
  this.childLocations = this.navparams.data['childLocations']
    ? this.navparams.data['childLocations']
    : {};
  this.childLocations = this.location.id ? this.childLocations : [];
  this.reqType = this.navparams.data['reqType']
    ? this.navparams.data['reqType']
    : null;
  this.module = this.navparams.data['module']
    ? this.navparams.data['module']
    : null;
  this.customer.name = this.selectedCustomer && this.selectedCustomer.name
      ? this.selectedCustomer.name
      : '';
  this.category.name =
    this.selectedCategory && this.selectedCategory.name
      ? this.selectedCategory.name
      : '';
  this.pendingStatus = this.selectedStatus = this.navparams.data['selectedStatus']
    ? this.navparams.data['selectedStatus']
    : '';
    this.statusName = this.statusSelected = this.navparams.data['requestStatus'] ? this.navparams.data['requestStatus'] : '';

  if(this.childLocations && this.childLocations?.length >= 0)  {
    this.location = this.location
  } else {
    this.location.name =
    this.selectedLocation && this.selectedLocation.name
      ? this.selectedLocation.name
      : '';
  }

  this.workflow.name =
    this.selectedWorkflow && this.selectedWorkflow.name
      ? this.selectedWorkflow.name
      : '';
  this.asset.name =
    this.selectedAsset && this.selectedAsset.name
      ? this.selectedAsset.name
      : '';
      let data = {
        selectedCustomer:this.selectedCustomer,
        customer:this.customer,
        selectedCategory: this.selectedCategory,
        category: this.category,
        childCategories: this.childCategories,
        selectedLocation: this.selectedLocation,
        location: this.location,
        asset: this.asset,
        selectedAsset: this.selectedAsset,
        childLocations: this.childLocations,
        workflow: this.workflow,
        selectedWorkflow: this.selectedWorkflow,
        selectedStatus:this.selectedStatus,
        count: this.filterCount,
      };
      this.value = data;
  this.loaded = true;
  }, 5000);

  Config.constants.isAsset = profile.workflowType == 'asset' ? true : false;
  let catgoryCollectionRef = this.firestore
    .collection('organization')
    .doc(profile.tenantId)
    .collection('category');
  catgoryCollectionRef.valueChanges().subscribe((res) => {
    this.categoryArray = res;
    if (this.categoryTitles && this.categoryTitles.length) {
      this.parentCategoryTitle = this.categoryTitles[0];
    }
    this.prepareParentCategory();
  });
  let companyCollectionRef = this.firestore
  .collection('organization')
  .doc(profile.tenantId)
  .collection('company');
  companyCollectionRef.valueChanges().subscribe((res) => {
  this.companyArray = res;
  this.prepareCompany();
});
  let locationCollectionRef = this.firestore
    .collection('organization')
    .doc(profile.tenantId)
    .collection('location');
  locationCollectionRef.valueChanges().subscribe((res) => {
    this.locationArray = res;
    this.prepareParentLocation();
  });
  let workflowcollectionRef = this.firestore
    .collection('organization')
    .doc(profile.tenantId)
    .collection('workflow');
  workflowcollectionRef.valueChanges().subscribe((res) => {
    this.workflowArray = res;
    this.prepareworkflow();
  });

    this.getAssetList();
  }
  prepareCompany() {
    this.companys = [];
    for (let cmp of this.companyArray) {
        if (cmp.active) {
            var custom = {
              name: cmp.name,
              id: cmp.id,
            };
        
          this.companys.push(custom);
        }
    }
  }
  getAssetList() {
    let options = {
      page: this.page,
      size: 4,
    };
    this.reqService
      .getAssetByFilter(options, this.assetFilter)
      .subscribe((res) => {
        this.assetArray = res.body;
        this.prepareAsset();
      });
  }
  prepareworkflow() {
    this.workflows = [];
    this.workflowResults = [];
    if (this.reqType == 'SCHEDULE_REQUEST') {
      this.prepareScheduleWorkFLow();
    } else {
      this.prepareWorkOrderWorkflow();
    }
  }
  prepareWorkOrderWorkflow() {
    this.workflows = [];
    for (let cat of this.workflowArray) {
      if (cat.requestSchema) {
        if (cat.active) {
          if (!cat.parentWorkflowId) {
            var custom = {
              name: cat.name,
              id: cat.id,
            };
          }
          this.workflows.push(custom);
          // console.log('WorkOrder====>', this.workflows.length);
        }
      }
    }
    this.workOrderWorkflows = this.workflows;
  }
  prepareScheduleWorkFLow() {
    this.workflows = [];
    for (let cat of this.workflowArray) {
      if (!cat.requestSchema) {
        if (cat.active) {
          if (!cat.parentWorkflowId) {
            var custom = {
              name: cat.name,
              id: cat.id,
            };
          }
          this.workflows.push(custom);
        }
      }
    }
    this.preventiveWorkflows = this.workflows;
  }
  prepareAsset() {
    for (let asset of this.assetArray) {
      if (asset.active) {
        let custom = {
          name: asset.name,
          id: asset.id,
        };
        this.assets.push(custom);
      }
    }
  }
ionviewwillEnter() {
  let profile = JSON.parse(window.localStorage.getItem('Profile'));

}
  ngOnInit() {}
  ionViewDidLoad() {
    console.log('ionViewDidLoad AssetFilterPage');
  }
  fieldOnFocus(type, category?, location?) {
    switch (type) {
      case 'category':
        if (this.category == undefined || !this.category.name)
          this.parentCategoryResults = this.parentCategory;
        break;
      case 'subCategory':
        category.childs = category.childCategory;
        break;
      case 'location':
        if (!this.location.name)
          this.parentLocationResults = this.parentLocation;
        break;
      case 'subLocation':
        location.childs = location.childLocation;
        break;
      case 'asset':
        this.assetsResults = this.assets;
        break;
      case 'workflow':
        this.workflowResults = this.workflows;
        break;
      case 'customer':
        this.companyResults = this.companys;
        break;
      case 'status':
        this.allStatusResults = this.allStatus;
        break;
      case 'statusInvolved':
        this.statusResults = this.statusAll;
        break;
      default:
        break;
    }
  }
  filterParentCategoryResult(event, type) {
    event.target.value = event.target.value
      ? event.target.value.trimStart()
      : '';
    let name = event.target.value;
    // this.category = {};
    this.parentCategoryResults = this.parentCategory;
    if (name) {
      this.parentCategoryResults = this.parentCategory.filter((item) => {
        return item.name.toLowerCase().indexOf(name.toLowerCase()) > -1;
      });
    } else {
      this.selectedCategory = {};
      this.category = {
        name: '',
      };
    }
  }
  filterAssetsResult(event, type) {
    event.target.value = event.target.value
      ? event.target.value.trimStart()
      : '';
    let name = event.target.value;
    this.assetsResults = this.assetArray;
    if (name) {
      this.assetFilter.searchUserText = name.toLowerCase();
      this.getAssetList();
    } else {
      this.selectedAsset = {};
      this.asset = {
        name: '',
      };
    }
  }
  filterCatResult(event, type?) {
    event.target.value = event.target.value
      ? event.target.value.trimStart()
      : '';
    let name = event.target.value;
    // this.workflow = {};
    this.workflowResults = this.workflowArray;
    if (name) {
      this.workflowResults = this.workflowArray.filter((item) => {
        if (item.requestSchema && this.reqType != 'SCHEDULE_REQUEST') {
          return item.name.toLowerCase().indexOf(name.toLowerCase()) > -1;
        } else if (!item.requestSchema) {
          return item.name.toLowerCase().indexOf(name.toLowerCase()) > -1;
        }
      });
    } else {
      this.selectedWorkflow = {};
      this.workflow = {
        name: '',
      };
    }
  }

  filterCustomerResult(event) {
    event.target.value = event.target.value
    ? event.target.value.trimStart()
    : '';
  let name = event.target.value;
  if (name) {
    this.companyResults = this.companys.filter((item) => {
      return item.name.toLowerCase().indexOf(name.toLowerCase()) > -1;
    });
  } else {
    this.selectedCustomer = {};
    this.customer = {
      name: '',
    };
  }
  }
  filterStatus(ev) {
    let name = ev.target.value;
    if(name) {
      this.allStatusResults = this.allStatus.filter((item)=> item.toLowerCase().includes(name.toLowerCase()));
    }else {
      this.pendingStatus = '';
      this.selectedStatus = '';
    }
  }

  filterStatusInvolved(ev) {
    let name = ev.target.value;
    if(name) {
      this.statusResults = this.statusAll.filter((item)=> item.toLowerCase().includes(name.toLowerCase()));
    }else {
      this.statusName = '';
      this.statusSelected = '';
    }
  }

  filterSubCategoryResult(event, category?) {
    event.target.value = event.target.value
      ? event.target.value.trimStart()
      : '';
    let name = event.target.value;
    category.childs = category.childCategory;
    if (name) {
      category.childs = category.childCategory.filter((item) => {
        return item.name.toLowerCase().indexOf(name.toLowerCase()) > -1;
      });
    } else {
      this.selectedCategory = {};
      this.category = {
        name: '',
      };
    }
  }

  clearResults(type, category?, location?) {
    setTimeout(() => {
      switch (type) {
        case 'category':
          this.parentCategoryResults = [];
          break;
        case 'subCategory':
          category.childs = [];
          break;
        case 'location':
          this.parentLocationResults = [];
          break;
        case 'subLocation':
          location.childs = [];
          break;
        case 'asset':
          this.assetsResults = [];
          break;
        case 'workflow':
          this.workflowResults = [];
          break;
        case 'customer':
          this.companyResults = [];
          break;
        case 'status':
          this.allStatusResults = [];
          break;
        case 'statusInvolved':
          this.statusResults = [];
        break;
        default:
          break;
      }
    }, 100);
  }

  prepareParentCategory() {
    this.parentCategory = [];
    for (let category of this.categoryArray) {
      if (category.active) {
        if (!category.parentCategoryId) {
          let custom = {
            name: category.name,
            id: category.id,
          };
          this.parentCategory.push(custom);
        }
      }
    }
  }
  selectAssets(asset, type) {
    this.asset = { ...asset };
    this.selectedAsset = asset;
  }
  selectWorkflow(cat, type) {
    this.workflow = { ...cat };
    this.selectedWorkflow = cat;
  }
  selectCustomer(cus) {
    this.customer = {...cus};
    this.selectedCustomer = cus;
  }
  selectStatus(status) {
    this.pendingStatus = this.selectedStatus = status;
  }

  selectStatusInvolved(status) {
    this.statusName = this.statusSelected = status;
  }

  selectCategory(category, type, childCategory?, categoryIndex?) {
    this.loadChidCategories(category);
    if (type === 'parent') {
      this.category = { ...category };
    } else {
      childCategory.name = category.name;
      childCategory.id = category.id;
    }
    if (
      category.results.length > 0 &&
      this.selectedCategory.id != category.id
    ) {
      if (categoryIndex < this.childCategories.length) {
        let tempChilds = [];
        for (let index = 0; index <= categoryIndex; index++) {
          tempChilds.push(this.childCategories[index]);
        }
        this.childCategories = tempChilds;
      }
      this.childCategories.push({
        childCategory: category.results,
        title: this.getCategoryTitle(),
        childs: [],
        name: '',
        id: null,
      });
    }
    this.selectedCategory = category;
  }

  getCategoryTitle() {
    return this.categoryTitles.length &&
      this.categoryTitles.length >= this.childCategories.length
      ? this.categoryTitles[this.childCategories.length + 1]
      : 'Sub Category';
  }

  loadChidCategories(selectedCategory) {
    selectedCategory.results = [];
    for (let category of this.categoryArray) {
      if (category.parentCategoryId == selectedCategory.id) {
        selectedCategory.hasChild = true;
        let custom = {
          name: category.name,
          id: category.id,
        };
        selectedCategory.results.push(custom);
      }
    }
  }

  // Location
  prepareParentLocation() {
    this.parentLocation = [];
    for (let location of this.locationArray) {
      if (location.active) {
        if (!location.parentLocationId) {
          let custom = {
            name: location.name,
            id: location.id,
          };
          this.parentLocation.push(custom);
        }
      }
    }
  }

  filterParentLocationResult(event, type) {
    var name;
    name = event.target.value ? event.target.value.trimStart() : '';
    // this.location = {};
    if (name == '') {
      this.childLocations = [];
    }
    this.parentLocationResults = this.parentLocation;
    if (name) {
      this.parentLocationResults = this.parentLocation.filter((item) => {
        return item.name.toLowerCase().indexOf(name.toLowerCase()) > -1;
      });
    } else {
      this.selectedLocation = {};
      // this.childLocations = [];
    }
  }

  selectLocation(location, type, sublocation?, locationIndex?) {
    this.loadChildLocations(location);
    if (type === 'parent') {
      this.location = { ...location };
    } else {
      sublocation.name = location.name;
      sublocation.id = location.id;
    }
    if (
      location.results.length > 0 &&
      this.selectedLocation.id != location.id
    ) {
      if (locationIndex < this.childLocations.length) {
        let tempChilds = [];
        for (let index = 0; index <= locationIndex; index++) {
          tempChilds.push(this.childLocations[index]);
        }
        this.childLocations = tempChilds;
      }
      this.childLocations.push({
        childLocation: location.results,
        title: this.getCategoryTitle(),
        childs: [],
        name: '',
        id: null,
      });
    }
    this.selectedLocation = location;
  }

  loadChildLocations(selectedLocation) {
    selectedLocation.results = [];
    for (let location of this.locationArray) {
      if (location.parentLocationId == selectedLocation.id) {
        selectedLocation.hasChild = true;
        let custom = {
          name: location.name,
          id: location.id,
        };
        selectedLocation.results.push(custom);
      }
    }
  }
  filterSubLocationResult(event, location) {
    event.target.value = event.target.value
      ? event.target.value.trimStart()
      : '';
    let name = event.target.value;
    location.childs = location.childLocation;
    if (name) {
      location.childs = location.childLocation.filter((item) => {
        return item.name.toLowerCase().indexOf(name.toLowerCase()) > -1;
      });
     } else {
      // this.selectedLocation = {};
      this.childLocations = [];
    }
  }

  applyFilter() {
    if (this.selectedLocation && this.selectedLocation.name) {
      this.filterCount = this.countCal(this.selectedLocation);
    }
    if (this.selectedCategory && this.selectedCategory.name) {
      this.filterCount = this.countCal(this.selectedCategory);
    }
    if (this.selectedWorkflow && this.selectedWorkflow.name) {
      this.filterCount = this.countCal(this.selectedWorkflow);
    }
    if (this.selectedAsset && this.selectedAsset.name) {
      this.filterCount = this.countCal(this.selectedAsset);
    }
    if (this.selectedCustomer && this.selectedCustomer.name) {
      this.filterCount = this.countCal(this.selectedCustomer);
    }
    if(this.selectedStatus != '' && this.selectedStatus != null && this.selectedStatus != undefined) {
      this.filterCount++;
    }
    if (this.statusSelected != '' && this.statusSelected != null && this.statusSelected != undefined) {
      this.filterCount++;
    }
    this.selectedLocation = this.childLocations && this.childLocations.length == 0 ? this.location : this.selectedLocation;
    let data = {
      selectedCustomer:this.selectedCustomer,
      customer:this.customer,
      selectedCategory: this.selectedCategory,
      category: this.category,
      childCategories: this.childCategories,
      selectedLocation: this.selectedLocation,
      location: this.location,
      asset: this.asset,
      selectedAsset: this.selectedAsset,
      childLocations: this.childLocations,
      workflow: this.workflow,
      selectedWorkflow: this.selectedWorkflow,
      count: this.filterCount,
      selectedStatus:this.selectedStatus ? this.selectedStatus : null,
      requestStatus:this.statusSelected ? this.statusSelected : null,
    };
    this.value = data;
    this.modalCtrl.dismiss(data);
  }
  countCal(val: any) {
    if (val.name && val.id) {
      this.filterCount++;
    }
    return this.filterCount;
  }

  resetFilter() {
    // this.pendingFilter = new PendingFilter();
    this.selectedCategory = {};
    this.category = {
      name: '',
    };
    this.childCategories = [];
    this.location = {
      name: '',
    };
    this.selectedLocation = {};
    this.childLocations = [];
    this.selectedAsset = {};
    this.asset = {
      name: '',
    };
    this.selectedWorkflow = {};
    this.workflow = {
      name: '',
    };
    this.selectedCustomer = {};
    this.customer = {
      name: '',
    };
    this.pendingStatus = '';
    this.selectedStatus = '';
    this.statusSelected = '';
    this.statusName = '';
    // let data = {
    //   selectedCategory: this.selectedCategory,
    //   category: this.category,
    //   childCategories: this.childCategories
    // }
    // this.viewCtrl.dismiss(data);
  }


  dismiss() {
    var data  = this.value
    this.childCategories = [];
    if (data.selectedLocation && data.selectedLocation.name) {
      this.filterCount = this.countCal(data.selectedLocation);
    }
    if (data.selectedCategory && data.selectedCategory.name) {
      this.filterCount = this.countCal(data.selectedCategory);
    }
    if (data.selectedWorkflow && data.selectedWorkflow.name) {
      this.filterCount = this.countCal(data.selectedWorkflow);
    }
    if (data.selectedAsset && data.selectedAsset.name) {
      this.filterCount = this.countCal(data.selectedAsset);
    }
    if (data.selectedCustomer && data.selectedCustomer.name) {
      this.filterCount = this.countCal(data.selectedCustomer);
    }
    if(this.selectedStatus != '') {
      this.filterCount++;
    }
    if(this.statusSelected != '') {
      this.filterCount++;
    }
    data.count = this.filterCount;
    this.modalCtrl.dismiss(data);
  }
  handleChange(ev) {
    this.pendingStatus = ev.target.value;
    this.selectedStatus = ev.target.value;
  }
  addAsset() {}
}
