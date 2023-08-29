
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { Events } from 'src/providers/events/events';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-inventory-detail',
  templateUrl: './inventory-detail.page.html',
  styleUrls: ['./inventory-detail.page.scss'],
})
export class InventoryDetailPage implements OnInit {
  inventoryName: any;
  inventoryId: any;
  required = true;
  inventory: any = { name: '' };
  directions = ['INWARD', 'OUTWARD'];
  supplier: any;
  supplierList: any =[];
  locResults: any;
  results: any = [];
  cat: any = { id: null, name: "" };
    tab: any;
  constructor(
    private reqService : ServiceProvider,
    private route : ActivatedRoute,
    private router : Router,
    private common : CommonProvider, 
    private events : Events,
    public barcodeScanner : BarcodeScanner
  ){
  }


  ngOnInit() {
    
  }
  ionViewWillEnter() {
    this.route.queryParams.subscribe((params: any) => {
        this.inventoryId = params && params.id ? params.id : null;
        this.tab = params.tab ? params.tab :null;
        if(this.inventoryId != null) {
            this.getInventoryDetails();
            this.suppliers();
        }
    })
  }
  async back() {
    let navigationExtras : NavigationExtras = {
        queryParams: {
            partsUpdate: 'Show Parts List',
            tab : this.tab
        }
    }
    this.router.navigate(['inventory-list'], navigationExtras);
  }
  getInventoryDetails() {
    // this.common.displayLoading();
    this.reqService.getPartsInfo(this.inventoryId)
    .subscribe(
        (res) => {
            // setTimeout(() => {
            //     this.common.stopLoading();
            //   },100);
            this.inventory = res;
            this.inventory.direction = "";
            this.inventory.consumedQuantity = "";
        },
        (error) => {
            console.log(error);
            // setTimeout(() => {
            //     this.common.stopLoading();
            //   },100);
        }
    )
}
validateInput(event) {
    event.target.value = event.target.value
        ? event.target.value.trimStart()
        : "";
    if (event.target.name) {
        switch (event.target.name) {
            case "inventoryName":
                this.inventory.name = event.target.value;
                break;
            case "quantity":
                this.inventory.consumedQuantity = event.target.value;
                break;
            case "availableQuantity":
                this.inventory.availableQuantity = event.target.value;
                break;
            case "remarks":
                this.inventory.remarks = event.target.value;
                break;
            case "supplier":
                this.inventory.supplier = event.target.value;
            case "deliveryPersonDetail":
                this.inventory.deliveryPersonDetail = event.target.value;
            default:
                break;
        }
    }
    return event.target.value;
}
selectDirection(name) {
    this.inventory.direction = name;
}

addParts() {
    if (this.inventory.name === null || this.inventory.name === '') {
        this.common.alertToast(
            this.reqService.translatedata("Inventory Name is required")
        );       
        return;  
      } else if (this.inventory.id && this.inventory.consumedQuantity > 0 && this.inventory.direction === 'INSERTED') {
        this.common.alertToast(
            this.reqService.translatedata("choose appropriate direction")
        );
        return;
      } else if (
        this.inventory.id && (this.inventory.direction == '' || this.inventory.direction == null || this.inventory.direction == undefined)
      ) {
        this.common.alertToast(
            this.reqService.translatedata("Please choose direction")
        );
        return;
      }
       else if (
        this.inventory.id &&
        parseInt(this.inventory.consumedQuantity) > this.inventory.availableQuantity &&
        this.inventory.direction === 'OUTWARD'
      ) {           
        this.common.alertToast(
            this.reqService.translatedata("Quantity value must not be exceeded than the available quantity.")
        );
        return;
    }else if((parseInt(this.inventory.consumedQuantity) === 0) ) {
        this.common.alertToast(
            this.reqService.translatedata("Quantity value must be not zero.")
        );
        return;
    } else {
        this.saveInventory();
    }
}
    saveInventory() {
        this.common.displayLoading();
        this.inventory.id = null;
        this.inventory.inventoryId = this.inventoryId;
        this.reqService.inventory(this.inventory)
            .subscribe(
                (result) => {
                    setTimeout(() => {
                        this.common.stopLoading();
                    }, 100);
                    if (result) {
                        this.common.alertToast(
                            this.reqService.translatedata("inventoryUpdated")
                        );
                        this.updateInventoryCall();
                    }
                }, async (error) => {
                    console.log(error);
                    setTimeout(() => {
                        this.common.stopLoading();
                    }, 100);
                    if (error.status == 409) {
                        this.common.alertToast(
                            this.reqService.translatedata("recordAlreadyExist")
                        );
                    } else if (error.status == 500 || error.status == 0) {
                        this.common.alertToast(
                            this.reqService.translatedata("internalServerError")
                        );
                    } else {
                        if (error.status == 401) {
                            this.events.publish("user:inactive", { err: error.status, time: Date.now() });
                        }
                    }
                }
            )
    }
    async updateInventoryCall() {
        let navigationExtras: NavigationExtras = {
            queryParams: {
                partsUpdate: 'Show Parts List',
                tab: this.tab
            }
        }
        this.router.navigate(['inventory-list'], navigationExtras);

    }
    fieldOnFocus(val) {
        switch (val) {
            case "supplier":
                if (!this.supplier) this.results = this.supplierList;
                break;
            default:
                    break;
        }
    }
    suppliers() {
        this.reqService.getsupliers().subscribe(
            (response: any) => {
                console.log(response);
                this.supplierList =  response.content;
            }
        ) 
      }
    filterSupplierResult(Keyword) {
        let val = this.validateInput(Keyword);
        if(val) {
            this.results = this.supplierList.filter((item) => {
                return (
                    item &&
                    item.name &&
                    item.name.toLowerCase().indexOf(val.toLowerCase()) > -1
                );
            });
        } else {
            this.results = this.supplierList;
        }
    }
    clearResults(val){
        if(val == 'supplier') {
            // this.results = [];
        }
    }
    selectSupplier(val) {
        console.log(val)
        this.inventory.supplierId =  val.id;
        this.inventory.supplierName = val.name;
        this.results = [];

    }
    ScanUser() {
        let data;
        let options: BarcodeScannerOptions = {
            showTorchButton: true,
          };
          let profile = JSON.parse(localStorage.getItem("Profile"));
          this.barcodeScanner.scan(options).then(
            (barcodeData) => {
                console.log(barcodeData.text);
                data = JSON.parse(barcodeData.text);
                if(data.organaztionId == profile.tenantId)
                this.inventory.deliveryPersonDetail = data;
                this.inventory.id = data;
            },
            (err) => { 
                console.log(err);
            }
          );
    }
}
