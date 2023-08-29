import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-asset-inventory',
  templateUrl: './asset-inventory.page.html',
  styleUrls: ['./asset-inventory.page.scss'],
})
export class AssetInventoryPage implements OnInit {
  @ViewChild("searchBar") searchBar: any;
  results: any = [];
  inventoryList = [];
  searchKeyword: any;
  showSearchBar: boolean;
  resultSet: any = [];
  requestId: any;
  assetId: any;
  location: any;
  noRecordFound: boolean;
  partName: any;
  currentPart: any;
  backDropDismiss: boolean = false;
  selectedRequest: any;
  noRecords: boolean = false;
  inventoryListCopy: any[];
  subHeader: any;
  module: any;
  categoryId: any;
  tab: any;
  page: number = 0;
  searchText: any;
  totalCount: any;
  isScroll: boolean = false;
  value: any;
  requestLocationId: any;
  constructor(
    private reqService: ServiceProvider,
    private barcodeScanner: BarcodeScanner,
    private common: CommonProvider,
    public modalCtrl: ModalController,
    public actionSheetCtrl: ActionSheetController,
    public route: ActivatedRoute,
    public router: Router
  ) {
  }
  ionViewWillEnter() {
    this.route.queryParams.subscribe((params: any) => {
      this.requestId = params.requestId ? params.requestId : null;
      this.requestLocationId = params.requestLocationId ? params.requestLocationId : null;
      this.assetId = params.assetId ? params.assetId : null;
      this.selectedRequest = params.selectedRequest ? JSON.parse(params.selectedRequest) : null;
      this.subHeader = params.subHeader;
      this.module = params && params.module ? params.module : null;
      this.categoryId = params && params.categoryId ? params.categoryId : null;
      this.tab = params.tab ? params.tab : null;
      this.value = params && params.value ? JSON.parse(params.value) : null;
    })
    if (this.assetId && this.categoryId) {
      this.getAllParts(this.assetId, this.categoryId);
    } else {
      this.getAllPart();
    }
  }

  ngOnInit() {
  }
  reduceCount(inventory) {
    inventory.consumedQuantity && inventory.consumedQuantity > 1
      ? inventory.consumedQuantity--
      : inventory.consumedQuantity;
  }

  addCount(inventory) {
    inventory.consumedQuantity < inventory.availableQuantity
      ? inventory.consumedQuantity++
      : inventory.consumedQuantity;
  }

  beginSearch() {
    this.showSearchBar = !this.showSearchBar;
  }
  filterResult(keyword?) {
    if (navigator.onLine) {
      let val = keyword ? keyword.target.value : "";
      val = val
        ? val.trim()
          ? val.trim().replace(new RegExp("\\s+", "gm"), " ")
          : ""
        : "";
      let parts = [];
      this.results = [];
      if (this.assetId && this.categoryId) {
        this.searchText = val = val == '' ? ' ' : val;
        this.inventoryList = [];
        this.getAllParts(this.assetId, this.categoryId, val, this.page);
      }
      else if (val) {
        this.reqService.searchByName(val).
          subscribe(resp => {
            if (resp.length) {
              resp.forEach(element => {
                if (element.assetIds && element.assetIds.length > 0) {
                  element.assetIds.forEach((value) => {
                    if (value == this.assetId) {
                      element.actualName = element.name;
                      parts.push(element);
                    }
                  })
                } else if (element.assetIds && element.assetIds.length === 0) {
                  this.results = [];
                  parts.push(element);
                } else {
                  parts.push(element);
                }
              });
              this.results = parts;
            } else {
              this.results = resp;
            }
            this.inventoryList = [...this.results];
            this.noRecords = this.inventoryList && this.inventoryList.length == 0 ? true : false;
          });
      } else {
        this.searchText = ' ';
        this.inventoryList = this.inventoryListCopy;
        this.noRecords = this.inventoryList && this.inventoryList.length == 0 ? true : false;
      }
    } else {
      this.common.alertToast(this.reqService.translatedata('networkConnectivityError'));
    }
  }
  focusButton(): void {
    setTimeout(() => {
      this.searchBar.setFocus();
    }, 500);
  }

  async addPart(part) {
    this.searchKeyword = '';
    this.backDropDismiss = true;
    this.currentPart = part;
    if (!this.resultSet.some(inventory => inventory.id === part.id)) {
      part.consumedQuantity = 1;
      part.request_id = this.requestId;
      part.requestId = this.requestId;
      this.partName = part.name = part.actualName ? part.actualName : part.name;
      part.direction = 'OUTWARD';
      if (part.availableQuantity > 0) {
        this.resultSet.push(part);

      } else {
        this.currentPart = null;
        this.backDropDismiss = false;
        this.common.alertToast(
          part.name + " is out of stock, choose another one."
        );
      }
    }
    this.results = [];


  }

  closeOption() {
    setTimeout(() => {
      this.results = [];
    },);
  }

  removePart(index) {
    if (this.resultSet.length) {
      this.resultSet.splice(index, 1);
    }
  }

  getAllPart() {
    if (navigator.onLine) {
      this.common.displayLoading();
      this.reqService.getAllParts()
        .subscribe(
          resp => {
            let result = resp;
            if (result.length == 0) {
              this.noRecordFound = true;
            }
            let resultSet = [];
            if (this.assetId) {
              result.forEach((part) => {
                if (part.assetIds && part.assetIds.length > 0) {
                  part.assetIds.forEach((assetId) => {
                    if (assetId == this.assetId) {
                      resultSet.push(part);
                      console.log(resultSet);
                    }
                  });
                } else if (part.assetIds && part.assetIds.length === 0) {
                  resultSet.push(part);
                } else {
                  resultSet.push(part);
                }
              });
            } else {
              resultSet = resp;
            }
            resultSet.forEach(element => {
              element.consumedQuantity = 1;
              element.actualName = element.name;
            });
            this.inventoryList = [...this.inventoryList, ...resultSet];
            this.inventoryListCopy = this.inventoryList;
            this.noRecords = this.inventoryList?.length ? false : true;
            this.common.stopLoading();
            setTimeout(() => {
              this.searchBar.setFocus();
            }, 1500);
          },
          error => {
            this.noRecordFound = true;
            this.common.stopLoading();
          }
        )
    } else {
      this.common.alertToast(this.reqService.translatedata('networkConnectivityError'));
    }
  }
  getAllParts(assetId, categoryId, val?, page?) {
    let searchText = val ? val : ' ';
    if (navigator.onLine) {
      this.common.displayLoading();
      this.reqService.getAllPartsByAssetIdAndCategoryId(assetId, searchText, categoryId, true, '', page)
        .subscribe(
          (resp: any) => {
            this.totalCount = resp.headers.get('X-Total-Count');
            console.log(this.totalCount);
            let result = resp.body;
            if (result.length == 0) {
              this.noRecordFound = true;
            }
            let resultSet = [];
            if (this.assetId) {
              result.forEach((part) => {
                if (part.assetIds && part.assetIds.length > 0) {
                  part.assetIds.forEach((assetId) => {
                    if (assetId == this.assetId) {
                      resultSet.push(part);
                      console.log(resultSet);
                    }
                  });
                } else if (part.assetIds && part.assetIds.length === 0) {
                  resultSet.push(part);
                } else {
                  resultSet.push(part);
                }
              });
            } else {
              resultSet = resp;
            }
            resultSet.forEach(element => {
              element.consumedQuantity = 1;
              element.actualName = element.name;
            });
            // resultset concat into inventoryList  and inventoryListCopy
            this.inventoryList = [...this.inventoryList, ...resultSet];
            this.inventoryListCopy = this.inventoryList;
            this.noRecords = this.inventoryList?.length ? false : true;
            this.common.stopLoading();
            setTimeout(() => {
              this.searchBar.setFocus();
            }, 1500);
          },
          error => {
            this.noRecordFound = true;
            this.common.stopLoading();
          }
        )
    } else {
      this.common.stopLoading();
      this.common.alertToast(this.reqService.translatedata('networkConnectivityError'));
    }
  }
  updateParts() {
    if (navigator.onLine) {
      this.common.displayLoading();
      if (this.value?.moduleName == 'new-request') {
        let result = window.localStorage.getItem('partsList');
        result = result ? JSON.parse(result) : [];
        this.resultSet.requestLocationId = this.requestLocationId;
        this.resultSet = [...result, ...this.resultSet];
        window.localStorage.setItem('partsList', JSON.stringify([...this.resultSet]));
        this.common.alertToast("Parts added successfully");
        this.updateInventoryParts();
        this.common.stopLoading();
        return;
      }
      this.resultSet.forEach(element => {
        element.requestLoactionId = this.requestLocationId;
      })
      this.reqService.updateParts(this.resultSet)
        .subscribe(
          resp => {
            this.common.stopLoading();
            if (resp) {
              this.common.alertToast("Parts updated successfully");
              this.updateInventoryParts();
            } else {
              this.common.alertToast(
                "Can't update the parts, please try after sometime."
              );
            }
          }, async (err) => {
            this.common.stopLoading();
          }
        )
    } else {
      this.common.alertToast(
        "Parts update not working in offline mode. Please try it Online."
      );
    }
  }
  async updateInventoryParts() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        requestId: this.requestId,
        partsUpdate: 'Update Parts',
        selectedRequest: JSON.stringify(this.selectedRequest),
        subHeader: this.subHeader,
        module: this.module,
        categoryId: this.categoryId,
        value: JSON.stringify(this.value)
      }, replaceUrl: true
    }
    this.router.navigate(['inventory-list'], navigationExtras);
  }
  back() {
    if (this.tab == 'request-detail') {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          selectedRequest: JSON.stringify(this.selectedRequest),
          tab: 'inventory',
          subHeader: this.subHeader,
          module: this.module
        }, replaceUrl: true
      }
      this.router.navigate(['request-detail'], navigationExtras);
    } else {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          requestId: this.requestId,
          selectedRequest: JSON.stringify(this.selectedRequest),
          partsUpdate: 'Update Parts',
          subHeader: this.subHeader,
          assetId: this.assetId,
          module: this.module,
          categoryId: this.categoryId,
          value: JSON.stringify(this.value)
        }, replaceUrl: true
      }
      this.router.navigate(['inventory-list'], navigationExtras);
    }

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
                this.common.stopLoading();
                if (resp) {
                  let result = resp;
                  if ((this.assetId && result.assetIds?.includes(this.assetId)) || (this.categoryId && result.categoryId == this.categoryId) || (result.categoryId == null && result.assetIds?.length == 0)) {
                    this.addPart(result);
                  } else {
                    this.common.alertToast(this.reqService.translatedata('notFound'));
                  }

                } else {
                  this.common.alertToast(this.reqService.translatedata('notFound'));
                }
              }, error => {
                this.common.alertToast(this.reqService.translatedata('invalidBarcode'));
                this.common.stopLoading();
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
      this.common.alertToast(
        'Inavliad Barcode'
      );
    });
  }
  getInventoryInfo(part) {

  }
  onCancel($event) {
    this.results = [];
    this.inventoryList = this.inventoryListCopy = [];
    this.searchText = '';
    if (this.assetId && this.categoryId) {
      this.getAllParts(this.assetId, this.categoryId);
    } else {
      this.getAllPart();
    }
  }
  onClear($event) {
    this.results = [];
    this.inventoryList = this.inventoryListCopy = [];
    this.searchText = '';
    if (this.assetId && this.categoryId) {
      this.getAllParts(this.assetId, this.categoryId);
    } else {
      this.getAllPart();
    }
  }
  clear() {
    this.currentPart = null;
    this.backDropDismiss = false;
  }
  pageLoad(ev) {
    console.log(ev);
    this.page = this.page + 1;
    this.searchText = this.searchText ? this.searchText : ' ';
    let data = Number(this.totalCount);
    setTimeout(() => {
      if (this.inventoryList.length != data) {
        this.isScroll = false;
        this.getAllParts(this.assetId, this.categoryId, this.searchText, this.page);
        ev.target.complete();
      } else {
        this.isScroll = true;
        this.common.alertToast('No More Data Available');
        return;
      }

    }, 500);
  }
}
