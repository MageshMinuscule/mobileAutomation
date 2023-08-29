import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { NavigationExtras, Router } from '@angular/router';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { ModalController, NavController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';
import { ServiceProvider } from 'src/providers/service/service';
import { AssetDetailPage } from '../asset-detail/asset-detail.page';
import { AssetFilterPage } from '../asset-filter/asset-filter.page';
import { CommonProvider } from '../common/common';
import { Config } from '../config';
import { AssetFilter } from '../data.model';


@Component({
  selector: 'app-asset-list',
  templateUrl: './asset-list.page.html',
  styleUrls: ['./asset-list.page.scss'],
})
export class AssetListPage implements OnInit {
  @ViewChild("searchBar") searchBar: any;
  assets: any = [];
  s3_Url = 'https://s3.ap-south-1.amazonaws.com/cmms-admin-image/';
  profile: any;
  assetList:any = [];
  isFetched: boolean;
  isAssetFound: boolean;
  items: any[];
  page :number = 0;
  fileterScrollEnabled: boolean;
  searchKeyword = '';
  showSearchBar: boolean;
  childCategories: any = [];
  selectedCategory: any = {};
  category: any = {};
  childLocations: any = [];
  selectedLocation: any = {};
  location: any = {};
  results: any = [];
  shouldShowCancel: any;
  lastInResponse: any;
  assetFilter :AssetFilter;
  isScroll: boolean;
  assetListCopy: any;
  totalCount: any;
  filterCount: number;
  noRecordfound: boolean = false;
  constructor(
    public modalCtrl: ModalController,
    public firestore: AngularFirestore,
    public reqService: ServiceProvider,
    private common : CommonProvider,
    public router : Router,
    public _location : Location,
    public navCtrl: NavController,
    public barcodeScanner: BarcodeScanner
  ) {

  }

  ngOnInit() {
    let profile = JSON.parse(window.localStorage.getItem('Profile'));
    this.profile = profile;
    if(this.profile) {
      this.getAssetList();
    }
    this.assetFilter = new AssetFilter();
  }
  ionViewDidEnter() {
    console.log('ionViewDidLoad AssetListPage');

  }

  getAssets() {
    this.common.displayLoading();
    this.reqService.getAssets({ searchUserText: null })
    .subscribe(
      (res) => {
        this.assets = res;
        setTimeout(() => {
          this.common.stopLoading();
        }, 200);
        
      },
      (error) => {
        setTimeout(() => {
          this.common.stopLoading();
        }, 200);
      }
    )
  }

  async gotoAssetDetail(assetId) {
    let navigationExtras :NavigationExtras = {
      queryParams: {
        assetId: assetId,
      },replaceUrl:true
    }
    this.router.navigate(['asset-detail'], navigationExtras);
  }
  back() {
    this.router.navigate(['/settings']);
  }

  getAssetList() {
    let userCollectionRef = this.firestore
      .collection<any>('organization')
      .doc<any>(this.profile.tenantId)
      .collection<any>('user_base')
      .doc(this.profile.id + '');
    userCollectionRef.valueChanges().subscribe((res: any) => {
      let user = res;
      Config.constants.isAsset = user.workflowType == 'asset' ? true : false;
      this.profile.locationIds = user.locationIds;
      this.fetchAssetFromFirestore();
    });
  }

  async fetchAssetFromFirestore() {
    try {
      let options = {
        page: this.page,
        size: 10
      };
      
      const res = await this.reqService.getAssetByFilter(options, this.assetFilter).toPromise();
      this.assetListCopy = res?.body;
      this.noRecordfound = this.assetListCopy.length === 0;
      // If totalCount is not set, get it from the response headers
      if (!this.totalCount) {
        this.totalCount = res.headers.get('X-Total-Count');
      }
  
      this.assetList = this.assetList.concat(this.assetListCopy);
      this.assetList = this.common.removeDuplicateArrayobj(this.assetList);
      this.isFetched = true;
      this.isAssetFound = this.assetList.length > 0;
  
      if (this.assetList.length > 0) {
        this.items = [];
        await this.loadAsset(this.assetList);
      }
  
      this.isScroll = this.totalCount === this.assetList.length;
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  }

  next(last) {
    let assetCollectionRef = this.firestore
    .collection('organization')
    .doc(this.profile.tenantId)
    .collection('asset',(ref)=>ref
    .limit(100)
    .orderBy('name')
    .startAfter(last)
    );
  if (
    this.profile.isRowlevel &&
    this.profile.locationIds &&
    this.profile.locationIds.length
  ) {
    assetCollectionRef = this.firestore
      .collection<any>('organization')
      .doc<any>(this.profile.tenantId)
      .collection<any>('asset', (ref) =>
        ref
        .limit(100)
        .startAfter(last)
        .orderBy('name')
        .where('path', 'array-contains-any', this.profile.locationIds)
      );
  }
  assetCollectionRef.valueChanges().subscribe((res) => {
    this.lastInResponse = res[res.length - 1].name;
    console.log(res.length);
    this.assetList = res;
    this.isFetched = true;
    this.isAssetFound = this.assetList.length ? true : false;
    if (this.assetList.length)
      this.items = [];
      this.loadAsset(this.assetList);
  });
  }

  loadAsset(assetList, name?) {
    let count = 0;
    // this.assets = [];
    this.items = [];
    for (let asset of assetList) {
      if (asset.active) {
        let custom = {
          name: name
            ? name + ' / ' + asset.name
            : asset.locationName +
              ' / ' +
              asset.locationAddress +
              ' / ' +
              asset.name +
              ' / ' +
              asset.id +
              ' / ' +
              asset.customerName +
              ' / ' +
              asset.assetSerialNo,
          id: asset.id,
          locationName: asset.locationName,
          categoryId: asset.categoryId,
          categoryName: asset.categoryName,
          assetSerialNo: asset.assetSerialNo,
          modelId: asset.modelCode,
          partNo: asset.modelName,
          workflowId: asset.workflowId,
          assetName: asset.name,
          locationId: asset.locationId,
          locationAddress: asset.locationAddress,
          customerName: asset.customerName,
          customerId: asset.customerId,
          qrCode: asset.qrcodeText,
          s3ImageId: asset.s3ImageId,
        };
        // if (count < 10) {
          this.assets.push(custom);
        // }
        this.items.push(custom);
        count++;
      }
    }
    this.assets = this.common.removeDuplicateArrayobj(this.assets);
    console.log(this.assets.length);
  }

  async doInfinite(infiniteScroll) {
    try {
      this.page++;
      await this.fetchAssetFromFirestore();
      // Complete the infinite scroll after processing the data
      infiniteScroll.target.complete();
      // Check if all data has been loaded, and disable infinite scroll
      if (this.totalCount <= this.assetList.length) {
        infiniteScroll.target.disabled = true;
        this.isScroll = true;
      }
    } catch (error) {
      console.error('Error in infinite scroll:', error);
      // Handle the error if needed
      infiniteScroll.target.complete();
    }
  }
  

  filterAssetResult(Keyword, value?) {
    let val = value ? value : Keyword.target.value;
    val = val
      ? val.trim()
        ? val.trim().replace(new RegExp('\\s+', 'gm'), ' ')
        : ''
      : '';
    let keyvalue = val ? val.split(' ') : [];
    if (!val || this.assets.length == 0) {
      this.loadAsset(this.assetList);
    }
    if (val != undefined || val != null || val != '') {
      this.page = 0;
      let options = {
        page : this.page,
        size : 10
      }
      this.assets = [];
      this.assetFilter.searchUserText = val.toLowerCase();
      this.reqService.getAssetByFilter(options, this.assetFilter).subscribe((res)=>{
        this.assetList =  res.body;
        this.noRecordfound = this.assetList.length == 0 ? true :false;
        this.loadFilterAsset(this.assetList);
      },async(err)=>{
        this.isAssetFound = false;
      })
    } else {
      this.assets = [];
      this.assetList =[];
      this.assetFilter.searchUserText = '';
      this.fetchAssetFromFirestore();
    }
  }

  beginSearch() {
    this.showSearchBar = !this.showSearchBar;
    setTimeout(() => {
      if (this.showSearchBar)
        this.searchBar.setFocus();
    }, 500);
  }

  async beginFilter() {
    let assetFilterModal = await this.modalCtrl.create({
      component : AssetFilterPage,
      componentProps:{
      category: this.category,
      childCategories: this.childCategories,
      selectedCategory: this.selectedCategory,
      childLocations: this.childLocations,
      selectedLocation:  this.selectedLocation,
      location: this.location
      }
    });
    (await assetFilterModal).onDidDismiss().then((detail: OverlayEventDetail) => {
      let data = detail.data
      if (data) {
        this.selectedCategory = data.selectedCategory;
        this.category = data.category;
        this.childCategories = data.childCategories;
        this.childLocations = data.childLocations;
        this.location = data.location;
        this.selectedLocation = data.selectedLocation;
        this.assetFilter.categoryId = data && data.category && data.category.id ? data.category.id : null;
        this.assetFilter.categoryName =  data && data.category && data.category.name ? data.category.name  : null;
        this.assetFilter.locationName = data && data.location && data.location.name ? data.location.name : null;
        this.assetFilter.locationId = data && data.location && data.location.id ? data.location.id : null;
        this.filterCount = data.count;
        this.filterAsset(data.selectedCategory, data.selectedLocation);
      }
    });
    await assetFilterModal.present();
  }

  filterAsset(category: any, location: any) {
    console.log('Selected Category#####' + category.id);
    this.page = 0;
    if ((category && category.id) || (location && location.id)) {
      let options = {
        page:this.page,
        size:20
      }
      this.reqService.getAssetByFilter(options, this.assetFilter).subscribe(res=>{
        this.results = res.body;
        this.noRecordfound = this.results.length == 0 ? true :false;
        this.isScroll = true;
        if (this.results.length > 10) {
          this.loadFilterAsset(this.results);
          this.fileterScrollEnabled = true;
        } else {
          this.items = this.results;
          this.assets = this.items;
        }
      },async(err)=>{
        this.common.alertToast("Not Found");
      })

    }else {
      this.assets = [];
      this.assetList =[];
      this.page =0;
      this.assetFilter = new AssetFilter();
      this.fetchAssetFromFirestore();

    }
  }

  loadFilterAsset(assetList) {
    this.assets = [];
    this.items = [];
    for (let loc of assetList) {
      this.assets.push(loc);
      this.items.push(loc);
    }
  }
  onCancel($event) {

  }
  scanAsset() {
    let options: BarcodeScannerOptions = {
      showTorchButton: true,
    };
    this.barcodeScanner.scan(options).then(
      async (barcodeData) => {
        console.log(barcodeData)
        if (null != barcodeData.text) {
         let encodePath = btoa(barcodeData.text);
         var data = {
          'qrCodeText':encodePath,
          'type': 'ASSET',
          'customerId': null,
          'locationId':null
        }
          this.reqService.scanWorkOrder(data).then((res)=>{

            if(res && res.assetSerialNo) {
              this.gotoAssetDetail(res.id);
            }else {
              this.common.alertToast(res.error);
            }
          },async (err) => {
            this.common.alertToast("QR Code Not Matching");
          });
        }else {
          this.common.alertToast("Not Found");
        }
      }).catch((err)=>this.common.alertToast("Not Found"));
  }
}
