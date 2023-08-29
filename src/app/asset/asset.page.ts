import { Location } from '@angular/common';
import { Component, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import {  IonRouterOutlet, ModalController, NavController, NavParams, Platform } from '@ionic/angular';
import { Events } from 'src/providers/events/events';
import { ServiceProvider } from 'src/providers/service/service';
import { AssetFilterPage } from '../asset-filter/asset-filter.page';
import { CommonProvider } from '../common/common';
import { Config } from '../config';
import { Asset, AssetFilter } from '../data.model';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.page.html',
  styleUrls: ['./asset.page.scss'],
})
export class AssetPage implements OnInit {
    @Input() isFromPending: any;
    @Input() requestId: number;
    @Input() selectedRequest: any;
    @Input() assetId: number;
    @Input() isCost: any;
    @Input() isRequired: any;
  @ViewChild("model") model;
    asset: any = { slno: "", code: "", model: "", name: "", id: null };
    loc: any = { id: null, name: "" };
    workflowName: any;
    workflowList: any = [];
    childWorkflows: any = [];
    cat: any = { id: null, name: "" };
    showLoc: boolean = false;
    workflow: any;
    locationList: any;
    SelectLocation: string;
    company: any = { id: null, name: "" };
    location: any;
    locArr: any = [];
    catArr: any = [];
    ModelArr: any = [];
    companies: any = [];
    results: any = [];
    assetModel: any = [];
    validCompany: boolean = false;
    validlocation: boolean = false;
    validateWorkflow: boolean = false;
    serialNoValidated: boolean;
    companyKey: boolean;
    warranty: boolean;
    locResults: any = [];
    modelNames: any = [];
    catResults: any = [];
    locationName: any;
    showForm: boolean = false;
    title: any = "Create Request";
    isAssetUpdate: boolean = false;
    assetResultJson: any = {};
    btnTxt: any = "Next";
    items: any = [];
    profile: any;
    initialWorkflow: any;
    selectedWorkflow: any;
    showCostForm: boolean;
    required: boolean;
    GoogleAutocomplete: any;
    autocomplete: any;
    autocompleteItems: any;
    stateNames: any = [];
    states: any = [];
    state: any = { name: "", id: "" };
    isStateDisabled: boolean;
    retry: boolean;
    isReadOnly: boolean;
    isNewAsset:boolean = false;
    isExistingAsset:boolean = false;
    assetList :any = [];
    page = 0;
    searchKeyword = '';
    fileterScrollEnabled: boolean;
    isAssetFound: boolean;
    showSearchBar: boolean;
    shouldShowCancel: any;

   @ViewChild('searchBar') searchBar: any;
    isFetched: boolean;
    assetResults: any[];
    existingAssetId: any;
    childCategories: any = [];
    selectedCategory: any = {};
    category: any = {};
    childLocations: any = [];
    selectedLocation: any = {};
    locationFilter: any = {};
    result: any = [];
    assetCategory: any = {};
    categoryListCopy: any = [];
    categoryList: any = [];
    assetCategoryName: any;
    url: any;
    backButton: boolean;
    totalCount: any;
    assetFilter: AssetFilter = new AssetFilter();
    size: number = 10;
    filterCount: any;
    resultCopy: any;
    departments: Object;
    assetDepartment: any = {};
    departmentList: any = [];
    departmentListCopy: any =[];
    scrollEnable:boolean = false;
    onLine: boolean;
    pageSize: number = 10;
    lastDocumentForAsset: number;
    isLastBatch: boolean;
    lastDoc: any;
    constructor(
        public modalCtrl: ModalController,
        public storage: NativeStorage,
        public zone: NgZone,
        public firestore: AngularFirestore,
        public router: Router,
        private reqService: ServiceProvider,
        private common: CommonProvider,
        private barcodeScanner: BarcodeScanner,
        public route: ActivatedRoute,
        public events : Events,
        private navCtrl: NavController,  
        // private navParams: NavParams,

    ) {
      // this.populateWorkflows(this.workflowList);
      // this.populateWorkflow();
      // this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
      // this.autocomplete = { input: '' };
      // this.autocompleteItems = [];
    }
    ngOnInit() {
    this.onLine = navigator.onLine;
    console.log("##########"+    this.isFromPending,
    this.requestId,
    this.selectedRequest,
    this.assetId,
    this.isCost,
    this.isRequired)
    this.route.queryParams.subscribe(params => {
        if (params) {
          this.workflowList = params["workflowList"]
          ? JSON.parse(params["workflowList"])
          : [];
        if(params && params['fromSearch'] && JSON.parse(params['fromSearch']) == 'SearchPage') {
            localStorage.removeItem('assetDetails');
            let AssetRemove = localStorage.setItem('assetDetails',JSON.stringify(""));
            console.log(""+AssetRemove);
            this.assetId = null;
        }
        this.workflowList = this.getActiveWorkflow();
        this.locationList = params["locList"] ? JSON.parse(params["locList"]) : [];
        this.isAssetUpdate =  this.isFromPending ? this.isFromPending : false;
        if (this.isAssetUpdate) {
          this.requestId = this.requestId ? this.requestId: null;
          this.selectedRequest = this.selectedRequest ? this.selectedRequest: null;
        }
        this.url = params['currentUrl'] ? params['currentUrl'] : null;
        this.isReadOnly = params["isReadOnly"];
        this.companies = params["companyList"]
          ? JSON.parse(params["companyList"])
          : this.common.companyList;
        this.showCostForm = this.isCost ? this.isCost : false;
        this.assetId = this.assetId ? this.assetId  : null;
        this.required = this.isRequired? this.isRequired : false;
        if (this.isAssetUpdate) {
          this.getAssetDetails();
          this.title = this.showCostForm
            ? this.reqService.translatedata("updateAsset") + " Cost"
            : this.reqService.translatedata("updateAsset");
          this.btnTxt = this.reqService.translatedata("update");
          this.showForm = this.showCostForm ? false : true;
        } else if (this.isReadOnly) {
          this.isAssetUpdate = true;
          this.showForm = true;
          this.getAssetDetails();
          this.title = "Asset Details";
        } else {
          this.populateWorkflow();
        }
        }
      });
     
    //   this.storage.getItem("userProfile").then((info) => {
    //     let profile = JSON.parse(info);
    //     this.profile = profile;
    //     if (profile && profile.id) {
    //       try {
    //         let companyCollectionRef = this.firestore
    //           .collection("organization")
    //           .doc(profile.org_id)
    //           .collection("company");
    //         companyCollectionRef.valueChanges().subscribe((res) => {
    //           this.companies = this.getCustomerOnly(res);
    //         });
    //       } catch (error) {
    //         console.log("Company Error==>" + error);
    //       }
    //       try {
    //         let catgoryCollectionRef = this.firestore.collection('organization').doc(profile.org_id).collection('category');
    //         catgoryCollectionRef.valueChanges().subscribe(res => {
    //           this.categoryListCopy = res

    //         });
    //       } catch (error) {
    //         console.log("Category Error==>" + error);
    //       }
    //       this.storage.getItem("location_state").then((res) => {
    //         if (res && res.length) {
    //           this.states = res;
    //         } else {
    //           try {
    //             let stateCollectionRef = this.firestore
    //               .collection("organization")
    //               .doc(profile.org_id)
    //               .collection("location_state");
    //             stateCollectionRef.valueChanges().subscribe((res) => {
    //               this.states = res;
    //               this.storage.setItem("location_state", res);
    //             });
    //           } catch (error) {
    //             console.log("State Error==>" + error);
    //           }
    //         }
    //       }),err => console.log("err" + err);
    //       this.storage.getItem("asset_model").then((res) => {
    //         if (res && res.length) {
    //           this.assetModel = res;
    //         } else {
    //           try {
    //             let assetModelCollectionRef = this.firestore
    //               .collection("organization")
    //               .doc(profile.org_id)
    //               .collection("asset_model");
    //             assetModelCollectionRef.valueChanges().subscribe((res) => {
    //               this.assetModel = res;
    //               this.storage.setItem("asset_model", res);
    //             });
    //           } catch (error) {
    //             console.log("Asset Model Error==>" + error);
    //           }
    //         }
    //       });
    //     }
    //   }, error => {
        let info  = window.localStorage.getItem('Profile');
        let profile = JSON.parse(info);
        this.profile = profile;
        if (profile && profile.id) {
          try {
            let companyCollectionRef = this.firestore
              .collection("organization")
              .doc(profile.tenantId)
              .collection("company");
            companyCollectionRef.valueChanges().subscribe((res) => {
              this.companies = this.getCustomerOnly(res);
            });
          } catch (error) {
            console.log("Company Error==>" + error);
          }
          try {
            let catgoryCollectionRef = this.firestore.collection('organization').doc(profile.tenantId).collection('category');
            catgoryCollectionRef.valueChanges().subscribe(res => {
              this.categoryListCopy = res

            });
          } catch (error) {
            console.log("Category Error==>" + error);
          }
          this.storage.getItem("location_state").then((res) => {
            if (res && res.length) {
              this.states = res;
            } else {
              try {
                let stateCollectionRef = this.firestore
                  .collection("organization")
                  .doc(profile.tenantId)
                  .collection("location_state");
                stateCollectionRef.valueChanges().subscribe((res) => {
                  this.states = res;
                  this.storage.setItem("location_state", res);
                });
              } catch (error) {
                console.log("State Error==>" + error);
              }
            }
          }),err => console.log("err" + err);
          this.storage.getItem("asset_model").then((res) => {
            if (res && res.length) {
              this.assetModel = res;
            } else {
              try {
                let assetModelCollectionRef = this.firestore
                  .collection("organization")
                  .doc(profile.tenantId)
                  .collection("asset_model");
                assetModelCollectionRef.valueChanges().subscribe((res) => {
                  this.assetModel = res;
                  this.storage.setItem("asset_model", res);
                });
              } catch (error) {
                console.log("Asset Model Error==>" + error);
              }
            }
          });
        }
    //   });
      this.reqService.getAllDepartments().subscribe((res) => {
        this.departmentListCopy = res.body;
    })
    }
    back() {
        this.modalCtrl.dismiss().catch(()=>{
            this.navCtrl.pop();
        })
    }
    getCustomerOnly(list) {
        let customerList = [];
        for (const company of list) {
            if (company.active && company.companyType == "CUSTOMER") {
                customerList.push(company);
            }
        }
        return customerList;
    }
    getActiveWorkflow() {
        let activeWorkflow = [];
        for (let cat of this.workflowList) {
            if (cat.active) {
                activeWorkflow.push(cat);
            }
        }
        return activeWorkflow;
    }

    populateWorkflow() {
        for (let cat of this.workflowList) {
            if (!cat.parentWorkflowId) {
                let custom = {
                    name: cat.name,
                    id: cat.id,
                    hierarchy: name ? name + " / " + cat.name : cat.name,
                    templateHistId: cat.templateHistoryId,
                    childTemplateSchema: cat.requestSchema,
                    templateSchema: cat.requestSchemaAsString,
                };
                if (cat.requestSchema) this.items.push(custom);
                else this.checkTemplateSchema(cat, cat.requestSchema, custom);
            } else {
                let custom = {
                    name: cat.name,
                    id: cat.id,
                    hierarchy: name ? name + " / " + cat.name : cat.name,
                    templateHistId: cat.templateHistoryId,
                    childTemplateSchema: cat.requestSchema,
                    templateSchema: cat.requestSchemaAsString,
                };
                if (cat.requestSchema) this.items.push(custom);
                else this.checkTemplateSchema(cat, cat.requestSchema, custom);
            }
            this.catArr = this.items;
            this.childWorkflows = this.catArr;
        }
    }

    checkRequestSchema(selectedWorkflow, schema?, custom?, isAsset?) {
        for (let workflow of this.workflowList) {
            if (workflow.parentWorkflowId == selectedWorkflow.id) {
                if (workflow.requestSchema) {
                    schema = workflow.requestSchema ? workflow.requestSchema : schema;
                    if (this.items.indexOf(custom) == -1) this.items.push(custom);
                } else {
                    this.checkTemplateSchema(workflow, schema, custom);
                }
            } else if (selectedWorkflow.parentWorkflowId == workflow.id) {
                if (workflow.requestSchema) {
                    schema = workflow.requestSchema ? workflow.requestSchema : schema;
                    if (this.items.indexOf(custom) == -1) this.items.push(custom);
                } else {
                    this.checkTemplateSchema(workflow, schema, custom);
                }
            }
        }
    }

    populateWorkflows(workflowList, name?, tempSchema?, templateHistorytId?) {
        let hierarchy;
        let schema;
        let templateHistId;
        for (let loc of workflowList) {
            hierarchy = name ? name + " / " + loc.name : loc.name;
            let custom = {
                name: loc.name,
                id: loc.id,
                hierarchy: hierarchy,
                isAuthorized: loc.isAuthorized,
                templateHistId: templateHistorytId
                    ? templateHistorytId
                    : loc.templateHistoryId,
                childTemplateSchema: loc.templateSchema
                    ? loc.templateSchema
                    : tempSchema,
                child: loc.child,
            };
            templateHistId = templateHistorytId
                ? templateHistorytId
                : loc.templateHistoryId;
            schema = tempSchema ? tempSchema : loc.templateSchema;
            schema = loc.templateSchema ? loc.templateSchema : schema;
            if (loc.child && loc.child.length > 0) {
                schema = loc.templateSchema ? loc.templateSchema : schema;
                templateHistId = loc.templateHistoryId
                    ? loc.templateHistoryId
                    : templateHistorytId;
                this.populateWorkflows(loc.child, hierarchy, schema, templateHistId);
            } else {
                if (schema) this.catArr.push(custom);
            }
        }
        this.childWorkflows = this.catArr;
    }

    getAssetDetails() {
        if (navigator.onLine) {
            if (this.assetId) {
                // this.common.displayLoading();
                this.reqService.getAssetDetails(this.assetId)
                .subscribe((asset) => {
                    // setTimeout(() => {
                    //     this.common.stopLoading();
                    // }, 1000);
                    
                    if (asset) {
                        this.assetResultJson = asset;
                        this.asset.slno = asset.assetSerialNo;
                        this.asset.model = asset.modelName;
                        this.asset.name = asset.name;
                        this.asset.id = asset.id;
                        this.asset.code = asset.modelCode;
                        this.asset.cost = asset.cost;
                        this.asset.customerName = asset.customerName;
                        this.asset.dateOfPurchase = asset.dateOfPurchase;
                        this.asset.warrantyExpiredOn = asset.warrantyExpiredOn;
                        this.asset.categoryName = asset.categoryName;
                        this.asset.categoryId = asset.categoryId;
                        this.assetCategoryName = this.asset.categoryName;
                        this.asset.departmentName = asset.departmentName;
                        this.assetDepartment.name = asset.departmentName;
                        localStorage.setItem(
                            "assetDetails",
                            JSON.stringify(this.assetResultJson)
                        );
                    } else {
                        this.getLocalAssetInfo();
                    }
                },async (err) => {
                    this.common.stopLoading();
                    this.common.alertToast(err.message);
                })
            } else {
                // let asset = localStorage.getItem("assetDetails")
                //     ? JSON.parse(localStorage.getItem("assetDetails"))
                //     : "";
                // if (this.requestId === asset.requestId) {
                //     this.assetResultJson = asset;
                //     this.asset.slno = asset.assetSerialNo;
                //     this.asset.model = asset.modelName;
                //     this.asset.name = asset.name;
                //     this.asset.id = asset.id;
                //     this.asset.code = asset.modelCode;
                //     this.asset.cost = asset.cost;
                //     this.asset.customerName = asset.customerName;
                //     this.asset.dateOfPurchase = asset.dateOfPurchase;
                //     this.asset.warrantyExpiredOn = asset.warrantyExpiredOn;
                // } else {
                //     this.assetResultJson = new Asset();
                // }
            }
        } else if (this.assetId) {
            this.getLocalAssetInfo();
        }
    }

    getLocalAssetInfo() {
        this.assetResultJson = this.common.getAssetDetails(this.assetId);
        if (this.assetResultJson) {
            this.asset.slno = this.assetResultJson.assetSerialNo;
            this.asset.model = this.assetResultJson.modelName;
            this.asset.name = this.assetResultJson.name;
            this.asset.id = this.assetResultJson.id;
            this.asset.code = this.assetResultJson.modelCode;
            this.asset.cost = this.assetResultJson.cost;
            this.asset.customerName = this.assetResultJson.customerName;
        }
    }

    validateSerialNo() {
        if (navigator.onLine) {
            if (
                this.asset.slno &&
                this.asset.slno.length > 3 &&
                this.asset.slno.indexOf(",") == -1
            ) {
                // this.common.displayLoading();
                let params = new URLSearchParams();
                params.set("assetSerialNo", this.asset.slno);
                this.reqService.getAssetDetails(params)
                .subscribe((asset) => {
                    if (asset) this.assetResultJson = asset;
                    if (asset && asset.active) {
                        this.asset.model = asset.modelName;
                        this.asset.name = asset.name;
                        this.asset.id = asset.id;
                        this.asset.code = asset.modelCode;
                    } else if (this.asset.id && !this.isAssetUpdate) {
                        this.asset.model = "";
                        this.asset.name = "";
                        this.asset.id = "";
                        this.asset.code = "";
                    }
                    this.common.stopLoading();
                    this.showModelCode();
                },async (err)=>{
                    this.common.alertToast(err.message)
                })
            } else {
                this.serialNoValidated = true;
            }
        } else {
            this.showModelCode();
            if (!this.isAssetUpdate) this.common.alertToast(this.common.offlineMsg);
        }
    }

    showModelCode() {
        setTimeout(() => {
            this.serialNoValidated = true;
            this.model.setFocus();
        }, 800);
    }

    updateAssetDetails() {
        // let offlineAssetList = [];
        // this.common.displayLoading();
        this.assetResultJson.requestId = this.requestId;
        this.assetResultJson.assetSerialNo = this.asset.slno
            ? this.asset.slno.trimStart()
            : this.assetResultJson.assetSerialNo;
        this.assetResultJson.modelName = this.asset.model
            ? this.asset.model.trimStart()
            : this.asset.model;
        this.assetResultJson.name = this.asset.name
            ? this.asset.name.trimStart()
            : this.asset.name;
        this.assetResultJson.cost = this.asset.cost;
        this.assetResultJson.modelCode = this.asset.code
            ? this.asset.code.trimStart()
            : this.asset.code;
            this.asset.categoryId = this.assetCategory && this.assetCategory.id ? this.assetCategory.id : null;
            this.asset.categoryName = this.assetCategory && this.assetCategory.name ? this.assetCategory.name : "";
        if (!this.asset.id) {
            this.assetResultJson.id = this.existingAssetId ? this.existingAssetId : "";
            this.assetResultJson.locationId = this.selectedRequest.locationId;
            this.assetResultJson.locationName = this.selectedRequest.locationName;
            this.assetResultJson.customerId = this.selectedRequest.companyId;
            this.assetResultJson.customerName = this.selectedRequest.companyName;
            this.assetResultJson.workflowId = this.selectedRequest.workflowId;
            this.assetResultJson.workflowName = this.selectedRequest.workflowName;
            this.saveAsset(this.assetResultJson);
            return;
        }
        this.assetResultJson.id = this.asset.id
            ? this.asset.id
            : this.assetResultJson.id;
        if (navigator.onLine) {
            if (this.validateAssetFileds()) {
                this.common.displayLoading();
                this.reqService.updateAsset(this.assetResultJson)
                .subscribe(
                    (result) => {
                        this.common.stopLoading();
                        if (result.savedFrom || result.id) {
                            this.assetResultJson.id = this.assetResultJson.id
                                ? this.assetResultJson.id
                                : this.assetId;
                            this.assetResultJson.requestId = this.requestId;
                            localStorage.setItem(
                                "assetDetails",
                                JSON.stringify(this.assetResultJson)
                            );
                            this.common.alertToast(
                                this.reqService.translatedata("assetUpdated")
                            );
                            this.modalCtrl.dismiss(result);
                        }
                       
                    },
                    async (error) => {
                        this.common.stopLoading();
                        if (error.status == 409) {
                            this.common.alertToast(
                                this.reqService.translatedata("recordAlreadyExist")
                            );
                        }else if (error.status == 0) {
                            this.common.alertToast(
                                this.reqService.translatedata("serverError")
                            );
                            this.assetResultJson.id = this.assetResultJson.id
                                ? this.assetResultJson.id
                                : this.assetId;
                            this.assetResultJson.requestId = this.requestId;
                            localStorage.setItem(
                                "assetDetails",
                                JSON.stringify(this.assetResultJson)
                            );
                            
                        } else {
                            this.common.alertToast(
                                this.reqService.translatedata("internalServerError")
                            );
                        }
                        this.common.alertToast(error);
                        this.common.stopLoading();
                    }
                )
       
            } else {
                if (!this.showCostForm)
                    this.common.alertToast(
                        this.reqService.translatedata("fieldError") +
                        this.getMissingField(this.asset)
                    );
                else
                    this.common.alertToast(
                        this.reqService.translatedata("costfieldError")
                    );
                return false;
            }
        } else {
            this.assetResultJson.id = this.assetResultJson.id
                ? this.assetResultJson.id
                : this.assetId;
            this.assetResultJson.requestId = this.requestId;
            localStorage.setItem(
                "assetDetails",
                JSON.stringify(this.assetResultJson)
            );
            
            
        }
    }

    addAsset() {
        if (this.isAssetUpdate) {
            this.updateAssetDetails();
            return false;
        }
        if (navigator.onLine) {
            if (!this.company.name) {
                this.common.alertToast(
                    this.reqService.translatedata("customerMandatory")
                );
                return false;
            }
            if (!this.cat.id) {
                this.common.alertToast(this.reqService.translatedata("addAssetError"));
                return false;
            }
            if (!this.location) {
                this.common.alertToast(
                    this.reqService.translatedata("locationMandatory")
                );
                return false;
            }
            if (!this.state.id) {
                let stateName;
                var name: string;
                let state: string
                name  = this.state.name;
                state  = name.trim();
                console.log("trim ====>"+state);
                if(state) {
                    this.states.forEach((item) => {
                        if(item.name.toLowerCase() == state.toLowerCase()) {
                            stateName = item;
                        }
                    });
                    if(stateName && stateName.id) {
                        this.selectState(stateName);
                    } else {
                        this.common.alertToast(this.reqService.translatedata("stateMandatory"));
                        return false;
                    }
                } else {
                    this.common.alertToast(this.reqService.translatedata("stateMandatory"));
                    return false;
                }

            } 
            let data = {
                assetSerialNo: this.asset.slno,
                id: this.asset.id ? this.asset.id : null,
                modelCode: this.asset.code,
                modelName: this.asset.model,
                name: this.asset.name,
                customerId: this.company.id,
                customerName: this.company.name,
                workflowId: this.cat.id,
                workflowName: this.cat.name,
                locationId: this.loc.id,
                locationName: this.location,
                stateId: this.state.id,
                priorityCustomer: this.companyKey,
                savedFrom: "mobile",
            };
            // this.navCtrl.popToRoot();
            
            let navigationExtras: NavigationExtras = {
              queryParams: {
                isFromAssetSearch: true,
                data: JSON.stringify(data),
                workflowList: JSON.stringify(this.workflowList),
                workflow: JSON.stringify(this.selectedWorkflow),
              },replaceUrl:true
            };
            // this.common.stopLoading();
            this.router.navigate(['/new-request'],navigationExtras );
        } else {
            this.common.stopLoading();
            this.common.alertToast(this.common.offlineMsg);
        }
    }
    saveAsset(data) {
        if (navigator.onLine) {
            this.reqService.saveAsset(data)
            .subscribe(
                (result) => {
                    this.common.stopLoading();
                        if (result.id) {
                            result.requestId = this.requestId;
                            localStorage.setItem(
                                "assetDetails",
                                JSON.stringify(result)
                            );
                            this.common.alertToast(
                                this.reqService.translatedata("assetUpdated")
                            );
                            this.modalCtrl.dismiss();
                        } else if (!this.retry) {
                            this.saveAsset(data);
                            this.retry = true;
                        } else {
                            this.common.alertToast(
                                this.reqService.translatedata("doitAfterSometime")
                            );
                        }
                }, async (err) => {
                    if (err.status == 409) {
                        this.common.alertToast(
                            this.reqService.translatedata("recordAlreadyExist")
                        );
                    } else if (err.status == 500 || err.status == 0) {
                        this.common.alertToast(
                            this.reqService.translatedata("internalServerError")
                        );
                    }
                    this.common.stopLoading();
                }
            )
        } else {
            this.assetResultJson.requestId = this.requestId;
            localStorage.setItem(
                "assetDetails",
                JSON.stringify(this.assetResultJson)
            );
            this.common.alertToast(this.reqService.translatedata("assetUpdated"));
            
        }
    }

    updateRequest(data) {
        if (navigator.onLine) {
            this.common.displayLoading();
            this.reqService.updateRequestAsset(data)
            .subscribe(
                (result) => {
                    if (result.id) {
                        this.common.stopLoading();
                        result.requestId = this.requestId;
                        localStorage.setItem(
                            "assetDetails",
                            JSON.stringify(result)
                        );
                        this.common.alertToast(
                            this.reqService.translatedata("assetUpdated")
                        );
                        this.modalCtrl.dismiss(result);                      
                    } else if (!this.retry) {
                        this.saveAsset(data);
                        this.retry = true;
                    } else {
                        this.common.alertToast(
                            this.reqService.translatedata("doitAfterSometime")
                        );
                    }
                },(error) => {
                    this.common.stopLoading();
                    if (error.status == 409) {
                        this.common.alertToast(
                            this.reqService.translatedata("recordAlreadyExist")
                        );
                    } else if (error.status == 500 || error.status == 0) {
                        this.common.alertToast(
                            this.reqService.translatedata("internalServerError")
                        );
                    }else{
                        this.events.publish("user:inactive", {err: error.status, time: Date.now()});
                    }
                }
            )
        } else {
            this.assetResultJson = data;
            this.assetResultJson.requestId = this.requestId;
            localStorage.setItem(
                "assetDetails",
                JSON.stringify(this.assetResultJson)
            );
            this.common.alertToast(this.reqService.translatedata("assetUpdated"));
            this.modalCtrl.dismiss(data);
            
        }
    }

    getAssetWorkflow(workflowId) {
        for (let cat of this.workflowList) {
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
        for (let workflow of this.workflowList) {
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
        for (let workflow of this.workflowList) {
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
                        };
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
        if (isAsset && !this.selectedWorkflow) {
            this.selectedWorkflow = this.initialWorkflow;
        }
    }

    setLocation(location) {
        this.locationList.push(location);
    }

    showFormFields(event?) {
        // console.log(event.target.value);
        if (this.location || this.assetCategory) this.showForm = true;
        else this.showForm = false;
    }

    showLocationTab() {
        if (this.workflow) {
            this.showLoc = true;
            this.locArr = [];
            for (let loc of this.workflowList) {
                if (this.workflow == loc.id) {
                    this.locationList = loc.locationTree;
                    this.populateLocation(this.locationList);
                }
            }
        }
    }

    populateLocation(locationList) {
        for (let loc of locationList) {
            let custom = {
                name: loc.name,
                id: loc.id,
                state: loc.state,
                stateId: loc.stateId,
            };
            if (loc.child && loc.child.length > 0) {
                this.populateLocation(loc.child);
            } else {
                if (this.company.id === loc.companyId) {
                    this.locArr.push(custom);
                }
            }
        }
    }

    filterResult(Keyword) {
        let val = this.validateInput(Keyword);
        this.company.id = "";
        if (val) {
            this.results = this.companies.filter((item) => {
                return (
                    item &&
                    item.name &&
                    item.name.toLowerCase().indexOf(val.toLowerCase()) > -1
                );
            });
        } else {
            this.company.name = "";
            this.results = this.companies;
            this.loc.id = "";
            this.loc.name = "";
            this.location = "";
            this.locArr = [];
        }
    }

    fieldOnFocus(type) {
        switch (type) {
            case "customer":
                if (!this.company.name) this.results = this.companies;
                break;
            case "workflow":
                if (!this.cat.name) this.catResults = this.catArr;
                break;
            case "location":
                if (!this.location) this.locResults = this.locArr;
                break;
            case "state":
                if (!this.state.name) this.stateNames = this.states;
                break;
            case "serialNo":
                this.serialNoValidated = false;
                break;
            case "category":
                if (!this.assetCategory.name) this.categoryList = this.categoryListCopy;
                break;
            case "department":
                if (!this.assetDepartment.name) this.departmentList = this.departmentListCopy;
                break;
            case "model":
                if (!this.asset.name && this.serialNoValidated) {
                    for (let model of this.assetModel) {
                        this.ModelArr.push(model.name);
                    }
                    this.modelNames = this.ModelArr;
                }
                break;
            default:
                break;
        }
    }

    filterLocResult(Keyword) {
        let val = this.validateInput(Keyword);
        this.showForm = this.showForm ? this.showForm : false;
        this.loc.id = "";
        if (val) {
            this.locResults = this.locArr.filter((item) => {
                return item.name.toLowerCase().indexOf(val.toLowerCase()) > -1;
            });
            if (val.length > 3 && this.locResults.length == 0) {
                this.showForm = true;
                this.isStateDisabled = false;
            }
        } else {
            this.location = "";
            // this.states = [];
            this.state = {};
            this.stateNames = [];
            this.isStateDisabled = false;
            this.locResults = this.locArr;
        }
    }

    filterCatResult(Keyword) {
        let val = this.validateInput(Keyword);
        this.cat.id = "";
        if (val) {
            this.catResults = this.catArr.filter((item) => {
                return item.name.toLowerCase().indexOf(val.toLowerCase()) > -1;
            });
            if (this.catResults.length == 0) {
                this.showLoc = false;
            }
        } else {
            this.catResults = this.catArr;
            this.showLoc = false;
            this.showForm = false;
        }
    }
    filterDepartmentResult(keyword) {
        let val = this.validateInput(keyword);
        this.showForm = this.showForm ? this.showForm : false;
        this.assetDepartment.id = null;
        if (val) {
            this.reqService.SearchQueryByDepartments(val).subscribe(res=>{
                this.departmentList = res.body;
            })
            // this.categoryList = this.categoryListCopy.filter((item) => {
            //     return item.name.toLowerCase().indexOf(val.toLowerCase()) > -1;
            // });
            if (this.departmentList.length == 0) {
                this.showForm = true;
            }
        } else {
            this.assetDepartment = {};            
            this.departmentList = this.departmentListCopy;
        }
    }
    filterCategoryResult(keyword) {
        let val = this.validateInput(keyword);
        this.showForm = this.showForm ? this.showForm : false;
        this.assetCategory.id = null;
        if (val) {
            this.categoryList = this.categoryListCopy.filter((item) => {
                return item.name.toLowerCase().indexOf(val.toLowerCase()) > -1;
            });
            if (this.categoryList.length == 0) {
                this.showForm = true;
            }
        } else {
            this.assetCategory = {};            
            this.categoryList = this.categoryListCopy;
        }
    }

    selectCompany(company) {
        this.company.id = company.id;
        this.company.name = company.name;
        this.showFormFields();
        this.results = [];
        this.loc.id = "";
        this.loc.name = "";
        this.location = "";
        this.locArr = [];
        this.populateLocation(this.locationList);
    }

    selectLocation(loc) {
        this.loc.id = loc.id;
        this.loc.name = loc.name;
        this.location = loc.name;
        this.showForm = true;
        this.locResults = [];
        if (loc.stateId) {
            this.setState(loc.stateId);
        }
    }
    selectCategory(category) {
        this.assetCategory.id = category.id;
        this.assetCategory.name = category.name;
        this.assetCategoryName = category.name;
        this.showForm = true;
        this.categoryList = [];
    }
    selectDepartment(department) {
        this.assetDepartment.id = department.id;
        this.assetDepartment.name = department.name;
        this.asset.DepartmentName = department.name;
        this.showForm = true;
        this.departmentList = [];
    }

    setState(stateId) {
        for (let state of this.states) {
            if (state.id === stateId) {
                this.isStateDisabled = true;
                this.state = state;
            }
        }
    }

    selectWorkflow(workflow) {
        this.showLoc = true;
        this.selectedWorkflow = workflow;
        this.locArr = [];
        this.cat.id = workflow.id;
        this.cat.name = workflow.name;
        this.catResults = [];
        this.populateLocation(this.locationList);
    }

    validatecustomer(value, key) {
        if (value != undefined && value != null && value != "") {
            if (!this.validlocation) {
                if (key == "company") {
                    this.validCompany = true;
                } else if (key == "location") {
                    this.validlocation = true;
                }
            } else if (key == "Workflow") {
                this.validateWorkflow = true;
            }
        }
    }

    filterModelNames(Keyword) {
        let val = this.validateInput(Keyword);
        this.asset.name = val;
        this.ModelArr = [];
        this.modelNames = [];
        for (let model of this.assetModel) {
            this.ModelArr.push(model.name);
        }
        if (val && this.serialNoValidated) {
            this.modelNames = this.ModelArr.filter((item) => {
                return item.indexOf(val.toUpperCase()) > -1;
            });
        } else {
            this.modelNames = this.ModelArr;
            // this.asset.name = '';
        }
    }
    selectModelNames(name) {
        this.asset.name = name;
        this.ModelArr = [];
        this.modelNames = [];
        for (let model of this.assetModel) {
            if (model.name == name) this.asset.model = model.code;
        }
    }

    clearResults(type) {
        setTimeout(() => {
            switch (type) {
                case "customer":
                    this.results = [];
                    break;
                case "workflow":
                    this.catResults = [];
                    break;
                case "location":
                    this.locResults = [];
                    break;
                case "machineModel":
                    this.modelNames = [];
                    break;
                case "category":
                    this.categoryList = [];
                    break;
                case "department":
                    this.departmentList = [];
                case "state":
                    this.stateNames = [];
                    break;

                default:
                    break;
            }
        }, 500);
    }

    validateInput(event) {
        event.target.value = event.target.value
            ? event.target.value.trimStart()
            : "";
        if (event.target.name) {
            switch (event.target.name) {
                case "serialNo":
                    this.asset.slno = event.target.value;
                    break;
                case "partNo":
                    this.asset.model = event.target.value;
                    break;
                case "machineCode":
                    this.asset.code = event.target.value;
                    break;
                case "machineModel":
                    this.asset.name = event.target.value;
                    break;
                case "cost":
                    this.asset.cost = event.target.value;
                    break;
                case "category":
                    this.asset.categoryName = event.target.value;
                    this.assetCategoryName = event.target.value
                    break;
                default:
                    break;
            }
        }
        return event.target.value;
    }

    validateAssetFileds() {
        if (
            !this.showCostForm &&
            (!this.asset.slno ||
                !this.asset.code ||
                !this.asset.model ||
                !this.asset.name)
        ) {
            return false;
        } else if (this.showCostForm && !this.asset.cost) {
            return false;
        }
        return true;
    }

    getMissingField(asset) {
        let missingField;
        if (!asset.slno) {
            missingField = "Serial No";
        }
        if (!asset.name) {
            missingField = missingField
                ? missingField + ", Machine Model"
                : "Machine Model";
        }
        if (!asset.model) {
            missingField = missingField ? missingField + ", Part No" : "Part No";
        }
        if (!asset.code) {
            missingField = missingField
                ? missingField + ", Machine Code"
                : "Machine Code";
        }
        return missingField;
    }

    predictLocation() {
        if (this.autocomplete.input == "") {
            this.autocompleteItems = [];
            return;
        }
        this.GoogleAutocomplete.getPlacePredictions(
            { input: this.autocomplete.input },
            (predictions, status) => {
                this.autocompleteItems = [];
                this.zone.run(() => {
                    if (predictions && predictions.length) {
                        predictions.forEach((prediction) => {
                            this.autocompleteItems.push(prediction);
                        });
                    }
                });
            }
        );
    }

    filterStateResult(Keyword) {
        let val = this.validateInput(Keyword);
        this.stateNames = [];
        if(this.states && this.states.length == 0) {
            this.storage.getItem("location_state").then((res) => {
                if (res && res.length) {
                  this.states = res;
                }else {
                    this.getState();
                }
            },err=>{
                this.getState();
            }).catch((e)=>{ 
                this.getState();
            });
        }
        if (val) {
            if(this.states && this.states.length == 0) {
                this.getState();
            }
            setTimeout(() => {
                this.stateNames = this.states.filter((item) => {
                    let value = item.name.toLowerCase().indexOf(val.toLowerCase());
                    console.log(value);
                    return item.name.toLowerCase().indexOf(val.toLowerCase()) > -1;
                });
            }, 1500);

        } else {
            this.state.id = "";
        }
    }
    getState() {
        try {
            let stateCollectionRef = this.firestore
            .collection("organization")
            .doc(this.profile.org_id)
            .collection("location_state");
            stateCollectionRef.valueChanges().subscribe((res) => {
            this.states = res;
            this.storage.setItem("location_state", res);
          });
          } catch (e) {
            console.log("Company Error==>" + e);
          }
    }

    selectState(state) {
        this.state.name = state.name;
        this.state.id = state.id;
        this.stateNames = [];
    }

    gotoNew() {
        this.title = 'Create Asset'
        if(navigator.onLine) {
            this.isNewAsset = true;
        } else {
            this.common.alertToast(this.reqService.translatedata('networkConnectivityError'));
        }
        
    }

    gotoExisting() {
        this.common.displayLoading();
        this.isExistingAsset = true;
        this.getAssetList();
    }

    getAssetList() {
        let profile = JSON.parse(window.localStorage.getItem('Profile'));
        this.profile = profile;
        
        if(navigator.onLine) {
            let userCollectionRef = this.firestore
            .collection<any>("organization")
            .doc<any>(this.profile.tenantId)
            .collection<any>("user_base")
            .doc(this.profile.id + "");
        userCollectionRef.valueChanges().subscribe((res: any) => {
            let user = res;
            this.common.stopLoading();
            Config.constants.isAsset = user.workflowType == "asset" ? true : false;
            this.profile.locationIds = user.locationIds;
            this.fetchAssetFromFirestore();
        },async(err)=>{
            this.common.stopLoading();
        });
        }else {
            this.common.stopLoading();
            this.assetList = JSON.parse(window.localStorage.getItem('AssetLists'));
            this.loadAsset(this.assetList);
        }

    }

    private async fetchAssetFromFirestore() {
        let assetCollectionRef = this.firestore
            .collection("organization")
            .doc(this.profile.tenantId)
            .collection("asset");
        if (
            this.profile.isRowlevel &&
            this.profile.locationIds &&
            this.profile.locationIds.length
        ) {
            let locationId = this.selectedRequest && this.selectedRequest.locationId ? this.selectedRequest.locationId : null;
            let data = await this.common.getAssetForRowLevlUserWorkReqFromFirestore(this.profile,locationId);
            this.assetList = [];
            this.loadAssetData(data);


            // this.getAssetFromFirestore(this.profile.locationIds);
            // assetCollectionRef = this.firestore
            //     .collection<any>("organization")
            //     .doc<any>(this.profile.tenantId)
            //     .collection<any>("asset", (ref) =>
            //         ref
            //         .where("path", "array-contains-any", this.profile.locationIds)
            //     );
            //     assetCollectionRef.get().subscribe(async (res:any)=>{
            //     res = res && res.length != 0 ? await this.common.getDocValue(res) : [];
            //     this.assetList = res;
            //     this.isFetched = true;
            //     this.isAssetFound = this.assetList.length == 0 ? false :true;
            //     if (Config.constants.isAsset) {
            //         this.items = [];
            //         this.loadAsset(this.assetList);
            //         this.title = this.reqService.translatedata("chooseAsset");
            //     }
            //     })
        }else {
            if(navigator.onLine) {
                if (this.assetFilter.searchUserText != '' && this.assetFilter.searchUserText != undefined && this.assetFilter.searchUserText != null) {
                    this.page = 0;
                }
                let options = {
                    page: this.page,
                    size: this.size
                  }
                this.assetFilter.locationId = this.selectedRequest && this.selectedRequest.locationId ? this.selectedRequest.locationId : null;
                
                this.reqService.getAssetByFilter(options, this.assetFilter).subscribe(res=>{
                    this.totalCount = res.headers.get('X-Total-Count');
                    this.assetList = this.assetList.concat(res.body);
                    this.assetList = this.common.removeDuplicateArrayobj(this.assetList)
                    this.isFetched = true;
                    this.isAssetFound = this.assetList.length == 0 ? false :true;
                    // if (this.assetList.length) window.localStorage.setItem("assetList", JSON.stringify(this.assetList));
                    if (Config.constants.isAsset) {
                        this.items = [];
                        this.loadAsset(this.assetList);
                        this.title = this.reqService.translatedata("chooseAsset");
                    }
                });
            }else {
                this.assetList = JSON.parse(window.localStorage.getItem('AssetLists'));
                this.loadAsset(this.assetList);
            }

        }

    }
    loadAssetData(data: any) {
        this.lastDoc = data && data?.length != 0 ? data[data.length - 1].id : 1;
        this.assetList = this.assetList.concat(data);
        this.isFetched = true;
        this.isAssetFound = this.assetList.length == 0 ? false :true;
        if (Config.constants.isAsset) {
            this.items = [];
            this.loadAsset(this.assetList);
            this.title = this.reqService.translatedata("chooseAsset");
        }
    }

    async loadAsset(assetList, name?) {
        let count = 0;
        this.assetResults = [];
        this.items = [];
        for (let asset of assetList) {
            if (asset.active) {
                let custom = {
                    name: name
                        ? name + " / " + asset.name
                        :
                        asset.locationName +
                        " / " +
                        asset.locationAddress +
                        " / " +
                        asset.name +
                        " / " +
                        asset.id +
                        " / " +
                        asset.customerName +
                        " / " +
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
                };
                this.assetResults.push(custom);
                this.items.push(custom);
                // this.assetResults = await this.common.removeDuplicateArrayobj(this.assetResults);
                // this.items = await this.common.removeDuplicateArrayobj(this.items);
                // count++;
            }
        }
    }

    doInfinite(infiniteScroll) {
        setTimeout(async () => {
            this.page = this.page + 1;
            if(this.assetList == this.totalCount) {
                this.scrollEnable = true;
            }else {
                if(this.profile.isRowlevel) {
                    let locationId = this.selectedRequest && this.selectedRequest.locationId ? this.selectedRequest.locationId : null;
                    let data:any = await this.common.nextAssetForRowLevlUserWorkReqFromFirestore(this.profile,this.lastDoc, locationId);
                    this.loadAssetData(data);
                    if(data.length == 0) {
                        this.scrollEnable = true;
                    }
                }else {
                    this.fetchAssetFromFirestore();
                }
                
                infiniteScroll.target.complete();
            }
            
            
        }, 300);
    }

    filterAssetResult(Keyword, value?) {
        let val = value ? value : Keyword.target.value;
        val = val ? (val.trim() ? val.trim().replace(new RegExp("\\s+", "gm"), ' ') : '') : '';
        let keyvalue = val ? val.split(" ") : [];
        if (!val || this.assetResults.length == 0) {
            this.loadAsset(this.assetList);
        }
        if(this.profile.isRowlevel ) {
            if (val && val.length > 2) {
                let count = 1;
                this.fileterScrollEnabled = false;
                for (let key of keyvalue) {
                    if (this.assetResults.length > 0 && key.length > 1) {
                        if (keyvalue.length > 1 && count > 1) {
                            this.assetResults = this.items.filter((item) => {
                                return (item.name.toLowerCase().indexOf(key.toLowerCase()) > -1);
                            });
                            if (this.assetResults.length > 10) {
                                this.loadFilterAsset(this.assetResults);
                                this.fileterScrollEnabled = true;
                            } else {
                                this.items = this.assetResults;
                            }
                        } else {
                            this.loadAsset(this.assetList);
                            this.assetResults = this.items.filter((item) => {
                                return (item.name.toLowerCase().indexOf(key.toLowerCase()) > -1);
                            });
                            if (this.assetResults.length > 10) {
                                this.loadFilterAsset(this.assetResults);
                                this.fileterScrollEnabled = true;
                            } else {
                                this.items = this.assetResults;
                            }
                        }
                        count++;
                    }
                }
                if (!this.assetResults.length) {
                    this.isAssetFound = false;
                } else {
                    this.isAssetFound = true;
                }
            } else {
                this.isAssetFound = this.assetResults.length ? true : false;
            }
        }else {
            this.assetFilter.searchUserText = val.toLowerCase();
            this.assetResults = [];
            this.assetList = [];
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
        let assetFilterModal = await this.modalCtrl.create({component: AssetFilterPage, 
          componentProps: { 
            category: this.category,
            childCategories: this.childCategories,
            selectedCategory: this.selectedCategory,
            childLocations: this.childLocations,
            selectedLocation: this.selectedLocation,
            location: this.locationFilter,
            module:'Asset'
         }
        });
        assetFilterModal.onDidDismiss().then((value : any ) => {
            if (value) {
                let data = value.data
                this.selectedCategory = data.selectedCategory;
                this.category = data.category;
                this.childCategories = data.childCategories;
                this.childLocations = data.childLocations;
                this.locationFilter = data.location;
                this.selectedLocation = data.selectedLocation;
                // this.selectedLocationFilter = data.selectedLocation;
                this.assetFilter.categoryId = data && data.category && data.category.id ? data.category.id : null;
                this.assetFilter.categoryName =  data && data.category && data.category.name ? data.category.name  : null;
                this.assetFilter.locationName = data && data.location && data.location.name ? data.location.name : null;
                // this.assetFilter.locationId = data && data.location && data.location.id ? data.location.id : null;
                this.assetFilter.locationId = (this.selectedRequest && this.selectedRequest.locationId) ? this.selectedRequest.locationId : null;
                this.filterCount = data.count;
                this.filterAsset(data.selectedCategory, data.selectedLocation);
            }
        });
        await  assetFilterModal.present();
    }

    filterAsset(category: any, location: any) {
        console.log("Selected Category#####" + category);
        if ((category && category.id) || (location && location.id)) {
            let options ={
                size: 2000
              }
            this.reqService.getAssetByFilter(options, this.assetFilter).subscribe(res=>{
                this.resultCopy = res.body;
                this.isAssetFound = this.resultCopy.length == 0 ? false : true;
                this.result = this.result.concat(this.resultCopy);
                this.result = Array.from(new Set(this.result.map(a => a.id))).map(id => {
                  return this.result.find(a => a.id === id);
                });
                this.loadFilterAsset(this.result);
            });
        }else {
            this.assetFilter =  new AssetFilter();
            this.assetFilter.locationId = 
            this.fetchAssetFromFirestore();
        }

        // this.loadAsset(this.assetList);
        // if (category && category.id || location && location.id) {
        //     if (location && location.id) {
        //         this.result = this.items.filter((item) => {
        //             return (item.locationId === location.id);
        //         });
        //     }
        //     if (category && category.id) {
        //         if ((location && location.id) && (category && category.id)) {
        //             this.result = this.result.filter((item) => {
        //                 return ((item.locationId === location.id) && (item.categoryId === category.id));
        //             });
        //         } else {
        //             this.result = this.items.filter((item) => {
        //                 return (item.categoryId === category.id);
        //             });
        //         }
        //     }
        //     if (this.result.length > 10) {
        //         this.loadFilterAsset(this.result);
        //         this.fileterScrollEnabled = true;
        //     } else {
        //         this.items = this.result;
        //         this.assetResults = this.items;
        //     }
        // }
    }

    async loadFilterAsset(assetList) {
        this.assetResults = [];
        this.items = [];
        for (let loc of assetList) {
            this.assetResults.push(loc);
            this.items.push(loc);
            this.assetResults = await this.common.removeDuplicateArrayobj(this.assetResults);
        }

    }

    updateAssetWithExisting(asset) {
        this.asset.name = asset.assetName;
        this.asset.code = asset.modelId;
        this.asset.slno = asset.assetSerialNo;
        this.asset.model = asset.partNo;
        this.asset.id = asset.id;
        this.existingAssetId = asset.id;
        this.asset.requestId = this.requestId;
        this.updateRequest(this.asset);
    }

    scanAsset() {
        let options: BarcodeScannerOptions = {
            showTorchButton: true
        }
        this.barcodeScanner.scan(options).then(async (barcodeData) => {
            let isAssetFound = false;
            if (null != barcodeData.text) {
                let encodePath = btoa(barcodeData.text);
                let scanType = 'ASSET';
                let customVarValue = this.selectedRequest && this.selectedRequest?.locationId  ? this.selectedRequest?.locationId  : null;
                var scanData = {
                  'qrCodeText':encodePath,
                  'type': scanType,
                  'customerId': null,
                  'locationId':customVarValue
                }
                await this.reqService.scanWorkOrder(scanData).then((res)=>{
                  if(res.status && res.error) {
                    this.common.alertToast(res.error);
                  }else{
                    let asset = res;
                        if (asset.qrcodeText == barcodeData.text && asset.assetSerialNo) {
                            let customAsset = {
                                id: asset.id,
                                workflowName: asset.workflowName,
                                locationName: asset.locationName,
                                assetSerialNo: asset.assetSerialNo,
                                modelId: asset.modelCode,
                                workflowId: asset.workflowId,
                                assetName: asset.name,
                                locationId: asset.locationId,
                                locationAddress: asset.locationAddress,
                                customerName: asset.customerName,
                                customerId: asset.customerId,
                                qrCode: asset.qrcodeText
                            }
                            isAssetFound = true;
                            this.updateAssetWithExisting(customAsset);
                        }
                    
                    if (!isAssetFound) {
                        this.common.alertToast(this.reqService.translatedata('notFound'));
                    }
                  }}).catch((error)=>{
                    this.common.alertToast(error)
                  })
               
            } else {
                this.common.alertToast(this.reqService.translatedata('invalidBarcode'));
            }
        }, (err) => {
        });


}
onCancel($event) {
    
}
searchClear(ev) {
    this.assetFilter.searchUserText = '';
    this.searchKeyword = '';
    this.assetList = [];
    this.fetchAssetFromFirestore();
} 

async getAssetFromFirestore(arrayToQuery?: any[]) {
  try {
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
    const querySnapshot = await this.firestore
      .collection<any>("organization")
      .doc<any>(this.profile.tenantId)
      .collection<any>("asset", (ref) =>
        ref
          .orderBy('id')
          .limit(this.pageSize)
          .where("path", "array-contains-any", chunk))
      .get()
      .pipe(first())
      .toPromise();

    const finalResults = [];
    if (!querySnapshot.empty) {
      const data = await this.common.getDocValue(querySnapshot);
      finalResults.push(data);
    }
    this.lastDocumentForAsset = currentChunk >= totalChunks - 1 ? null : currentChunk;
    console.log('lastDocumentForAsset', this.lastDocumentForAsset);
    if (currentChunk >= totalChunks - 1) {
      this.isLastBatch = true;
    }
    console.log(finalResults);
    this.assetList = this.assetList.concat(finalResults[0]);
    this.isFetched = true;
    this.common.assetList = this.assetList;
    if ( Config.constants.isAsset) {
        await this.loadAsset(this.assetList);
        this.isAssetFound = this.assetList.length ? true : false;
        this.title = this.reqService.translatedata("chooseAsset");
      }
  } catch (error) {
    console.error('Error executing Firestore query:', error);
  }
}



}
