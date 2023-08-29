import { Component, OnInit } from '@angular/core';
import { ServiceProvider } from 'src/providers/service/service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { CommonProvider } from '../common/common';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.page.html',
  styleUrls: ['./inventory-list.page.scss'],
})
export class InventoryListPage implements OnInit {
  inventories: any = [];
  action: any ;
  locationName: any;
  inventorySerialNo: any;
  s3_Url: any;
  assetId: any;
  requestId: any;
  filteredReqId: any;
  showSearchBar: boolean;
  results: any = [];
  noRecordFound: boolean;
  resultsCopy: any;
  shouldShowCancel:any;
  searchKeyword:any;
  selectedRequest: any;
  tab: any;
  subHeader: any;
  module: any;
  categoryId: any;
  routeTo: any;
  value: any = {};
  requestLocationId: any;

  
  constructor(
    public barcodeScanner: BarcodeScanner,
    private reqService: ServiceProvider,
    private route :ActivatedRoute,
    private common: CommonProvider,
    private router: Router
    ) {

  
  }

  ngOnInit() {

  }
  ionViewDidEnter() {
    this.route.queryParams.subscribe((params)=>{
      this.tab = params.tab ? params.tab : null;
      this.subHeader = params && params.subHeader ? params.subHeader : null;
      this.action = params && params.partsUpdate ? params.partsUpdate : null;
      this.assetId = params && params.assetId ? params.assetId : null;
      this.requestId = params && params.requestId ? params.requestId : null;
      this.requestLocationId = params && params.requestLocationId ? params.requestLocationId : null;
      this.selectedRequest = params && params.selectedRequest ? JSON.parse(params.selectedRequest) : null;
      this.module = params && params.module ? params.module : null;
      this.categoryId = params && params.categoryId ? params.categoryId : null;
      this.routeTo = params && params.partsCount == 0 ? 'route to add inventory' : null;
      this.value = params && params.value ? JSON.parse(params.value) : null;
      if (this.value?.moduleName == 'new-request') {
        let result = JSON.parse(localStorage.getItem('partsList'));
        result = result ? result : [];
        if (result.length > 0) {
          this.inventories = result;
          this.results = result;
        } else {
          this.noRecordFound = true;
          this.addInventory();
        }
      }
      
      if (this.action === null && this.assetId) {
       if(this.module == 'asset-detail') {
        this.reqService.getAssetInfo(this.assetId).subscribe((res)=>{
          let categoryId = res.categoryId;
          let searchText = ' ';
          this.reqService.getAllPartsByAssetIdAndCategoryId(this.assetId,searchText,categoryId,false).subscribe((res)=>{
            setTimeout(() => {
              this.common.stopLoading();
            },100);
            this.inventories = res.body;
            this.results =  res.body;
            if(this.inventories.length ==0 ) {
              this.noRecordFound = true;
            }
          })
        })

       } else {
        this.getInventories();
       }
      }
      else if (this.action === 'Show Parts List') {
        this.getAllInventories();
      } else if (this.requestId) {
        if(this.routeTo == 'route to add inventory') {
          this.addInventory('request-detail');
        }else {
          this.getInventoriesBasedOnReq();
        }
        
      }
})
  }
  ionViewWillEnter() {

  }
  getAllInventories() {
    this.common.displayLoading();
    this.reqService.getAllParts()
    .subscribe(
      (res) => {
        setTimeout(() => {
          this.common.stopLoading();
        },100);
        this.inventories = res;
        this.results =  res;
        if(this.inventories.length == 0) {
          this.noRecordFound = true;
        }
      },
      (error) => {
        console.log(error);
        setTimeout(() => {
          this.common.stopLoading();
        },100);
      }
    )
  }
  back() {
    if(this.tab == 'settings') {
      this.router.navigate(['settings'],{replaceUrl:true})
    }else if(this.module == 'asset-detail') {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          assetId:this.assetId,
        },replaceUrl:true
      }
      this.router.navigate(['asset-detail'], navigationExtras)
    } else if(this.value?.moduleName == 'new-request') {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          value:JSON.stringify(this.value),
        },replaceUrl:true
      }
      this.router.navigate(['new-request'], navigationExtras)
    } else {
      let navigationExtras: NavigationExtras ={
        queryParams: {
          selectedRequest:JSON.stringify(this.selectedRequest),
          tab: 'inventory',
          subHeader: this.subHeader,
          module:this.module
        },replaceUrl:true
      }
      this.router.navigate(['request-detail'], navigationExtras);
    }

  
  }
  async updateInventories(inventory) {
    if (this.action === 'Show Parts List') {
      let navigationExtras : NavigationExtras = {
        queryParams: {
          id: inventory.id,
          tab: this.tab
        },
        replaceUrl: true
      } 
      this.router.navigate(['inventory-detail'], navigationExtras);
    }
  }
  getInventories() {
    this.common.displayLoading();
    this.reqService.getInventoryByAsset(this.assetId)
    .subscribe(
      (res) => {
        setTimeout(() => {
          this.common.stopLoading();
        },100);
        this.inventories = res;
        this.results = res;
        console.log("inv:" + this.inventories[0]);
        if(this.inventories.length ==0 ) {
          this.noRecordFound = true;
        }
      },
      (error) => {
        console.log(error);
        this.noRecordFound = true;
        setTimeout(() => {
          this.common.stopLoading();
        },100);
      }
    )
  }
  getInventoriesBasedOnReq() {
    this.common.displayLoading();
    this.reqService.getInventoriesByRequestId(this.requestId)
    .subscribe(
      (res) => {
        setTimeout(() => {
          this.common.stopLoading();
        },100);
        this.inventories = res.body;
        this.results = res.body;
        if(this.inventories.length == 0) {
          this.noRecordFound = true;
        }
      },
      (error) => {
        this.noRecordFound = true;
        console.log(error);
        setTimeout(() => {
          this.common.stopLoading();
        },100);
      }
    )
  }

  async addInventory(tab?) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
         requestId: this.requestId,
         requestLocationId: this.requestLocationId,
         assetId: this.assetId != null  ? this.assetId : this.selectedRequest?.assetId,
         selectedRequest: JSON.stringify(this.selectedRequest),
         subHeader:this.subHeader,
         module:this.module,
         categoryId: this.categoryId ? this.categoryId : null,
         value: this.value ? JSON.stringify(this.value) : null,
        //  tab: tab ? tab : this.tab
      },
      replaceUrl:true
    }
    this.router.navigate(['asset-inventory'], navigationExtras);
  }

  scanInventory() {
    let options: BarcodeScannerOptions = {
      showTorchButton: true
    }
    this.barcodeScanner.scan(options).then((barcodeData) => {
      if (null != barcodeData.text) {
        if (navigator.onLine) {
          this.common.displayLoading();
          this.reqService.getPartByQRCode(barcodeData.text)
          .subscribe(
            resp => {
              setTimeout(() => {
                this.common.stopLoading();
              },100);
              if (resp) {
                let result = resp;
                this.updateInventories(result);
              } else {
                this.common.alertToast(this.reqService.translatedata('notFound'));
              }
            }, error => {
              setTimeout(() => {
                this.common.alertToast(this.reqService.translatedata('notFound'));
                this.common.stopLoading();
              },100);
            }
          )
        } else {
          this.common.alertToast(
            "Parts Scan not working in offline mode. Please try it Online."
          );
        }
      } else {
        this.common.alertToast(this.reqService.translatedata('invalidBarcode'));
      }
    }, (err) => {
      console.log(err);
    });
  
}
filterResult(event, value?) {
  let val = value ? value : event.target.value;
  val = val
    ? val.trim()
      ? val.trim().replace(new RegExp("\\s+", "gm"), " ")
      : ""
    : "";
  if (val) {
    this.resultsCopy = this.results;
    this.inventories = this.results.filter(
      request => 
         request.id.toString().includes(val) ||
        (request.inventoryName &&
          request.inventoryName.toLowerCase().includes(val.toLowerCase()) ||
          request.name?.toLowerCase().includes(val.toLowerCase()) )
    );
    if(this.inventories && this.inventories.length == 0) {
      this.noRecordFound = true;
    }
  } else {
    this.inventories = [...this.results];
  }
}
  beginSearch() {
    this.showSearchBar = !this.showSearchBar;
  }
  onCancel($event) {
    this.inventories = [...this.results];
  }
}


