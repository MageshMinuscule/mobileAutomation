import { IonContent, PopoverController } from '@ionic/angular';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Params, Router } from '@angular/router';
import { Asset, Incident, RequestData } from '../data.model';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';
import { AssetPopoverComponent } from '../asset-popover/asset-popover.component';
import { Events } from 'src/providers/events/events';

@Component({
  selector: 'app-new-request',
  templateUrl: './new-request.page.html',
  styleUrls: ['./new-request.page.scss']
})
export class NewRequestPage implements OnInit {
  @ViewChild(IonContent, { static: false }) content: IonContent;
  tempDraft: any = [];
  imageJsonList: any = [];
  selectedCatId: any;
  selectedLocId: any;
  showTemplate: boolean = false;
  isAvailable: boolean = false;
  childTemplateSchema: string = '';
  priorities = ['NORMAL', 'URGENT', 'CRITICAL'];
  templateSchema: any;
  templateSchemaList: any[] = [];
  draftRequest: Incident = null;
  isAuthorized: any;
  selectedAssetList: Asset[] = [];
  selectedAssetId: any;
  reqType: any = 'createRequest';
  requestData: RequestData;
  workRequest: any = {};
  isWorkRequest: boolean = false;
  required = true;
  destination: any;
  selectedWorkflow: any;
  selectedLocation: any;
  selectedCustomer: any;
  asset: any;
  dataFromAssetPage: any;
  showLocation: any;
  multiMatch: any;
  module: any;
  isChange: boolean = false;

  constructor(
    public route: ActivatedRoute,
    private elementRef: ElementRef,
    private common: CommonProvider,
    private router: Router,
    public popOver: PopoverController,
    public reqService: ServiceProvider,
    public event: Events
  ) {
    this.route.queryParams.subscribe((params) => {
      if (params && params.destination) {
        this.destination = params.destination;
      }
      if (params && params.value?.moduleName == 'new-request') {
        this.templateSchema = null;
        this.assignValues(params);
      }
    });
    this.route.queryParams.subscribe((params) => {
      this.workRequest = params && params.workRequest ? JSON.parse(params.workRequest) : {};
      this.isWorkRequest = this.workRequest &&
        this.workRequest.priority &&
        this.workRequest.description
        ? true
        : false;
      this.draftRequest = params && params.draftRequest ? JSON.parse(params.draftRequest) : null;
      this.module = params && params.module ? params.module : null;
      if (this.draftRequest != null) {
        this.loadDraftDetails(this.draftRequest);
        this.workRequest.description = this.draftRequest.description;
        this.workRequest.priority = this.draftRequest.priority
      }

    });
    this.route.queryParams.subscribe((params) => {
      if (params && params.newRequestFromSearch) {
        this.selectedWorkflow = params.workflow
          ? JSON.parse(params.workflow)
          : null;
        this.selectedLocation = params.location
          ? JSON.parse(params.location)
          : null;
        this.selectedCustomer = params.customer
          ? JSON.parse(params.customer)
          : null;
        this.childTemplateSchema =
          this.selectedWorkflow.templateSchema &&
            typeof this.selectedWorkflow.templateSchema == 'string'
            ? JSON.parse(this.selectedWorkflow.templateSchema)
            : this.selectedWorkflow.childTemplateSchema;
        this.requestData = new RequestData();
        this.requestData.templateHistId = this.selectedWorkflow.templateHistId;
        this.requestData.locationName = this.selectedLocation.name;
        this.requestData.customerName = this.selectedCustomer.name;
        this.requestData.workflowName = this.selectedWorkflow.name;
        this.requestData.isAssetTransfer =
          this.selectedWorkflow.isAssetTransfer;
        this.requestData.workflowId = this.selectedWorkflow.id;
        this.requestData.locationId = this.selectedLocation.id;
        this.requestData.customerId = this.selectedCustomer.id;
        this.requestData.templateCategory = this.selectedWorkflow && this.selectedWorkflow.categoryName ? this.selectedWorkflow.categoryName : null;

        if (!this.childTemplateSchema) this.isAvailable = true;
        this.loadTemplateValues();
        this.showTemplate = true;
        this.isAuthorized = true;
      }
    });
    this.route.queryParams.subscribe((params) => {
      if (params && params.isFromAssetSearch) {
        this.route.queryParams.subscribe((params) => {
          this.asset = params.selectedAsset
            ? JSON.parse(params.selectedAsset)
            : null;
          this.selectedWorkflow = params.workflow
            ? JSON.parse(params.workflow)
            : null;
          this.selectedLocation = params.location
            ? JSON.parse(params.location)
            : null;
          this.dataFromAssetPage = params.data ? JSON.parse(params.data) : null;
        });
        this.childTemplateSchema =
          this.selectedWorkflow.templateSchema &&
            typeof this.selectedWorkflow.templateSchema == 'string'
            ? JSON.parse(this.selectedWorkflow.templateSchema)
            : this.selectedWorkflow.childTemplateSchema;
        this.requestData = new RequestData();
        this.requestData.templateHistId = this.selectedWorkflow.templateHistId;
        this.requestData.templateCategory = this.selectedWorkflow && this.selectedWorkflow.categoryName ? this.selectedWorkflow.categoryName : null;
        this.requestData.locationName =
          this.asset && this.asset.locationName
            ? this.asset.locationName
            : this.dataFromAssetPage.locationName;
        this.requestData.customerName =
          this.asset && this.asset.customerName
            ? this.asset.customerName
            : this.dataFromAssetPage.customerName;
        this.requestData.workflowName = this.selectedWorkflow.name;
        this.requestData.workflowId = this.selectedWorkflow.id;
        this.requestData.locationId =
          this.asset && this.asset.locationId
            ? this.asset.locationId
            : this.dataFromAssetPage && this.dataFromAssetPage
              ? this.dataFromAssetPage.locationId
              : null;
        this.requestData.assetId =
          this.asset && this.asset.id ? this.asset.id : null;
        this.requestData.assetTransferLocation =
          this.selectedLocation && this.selectedLocation.id
            ? this.selectedLocation.id
            : null;
        this.requestData.customerId =
          this.asset && this.asset.customerId
            ? this.asset.customerId
            : this.dataFromAssetPage && this.dataFromAssetPage.customerId
              ? this.dataFromAssetPage.customerId
              : null;
        if (!this.childTemplateSchema) this.isAvailable = true;
        this.loadTemplateValues();
        this.showTemplate = true;
        this.isAuthorized = true;
      }
    });
  }

  // create method name call ionviewwillenter get params and assgin all values into assginvalues method
  ionViewWillEnter() {
    this.route.queryParams.subscribe((params) => {
      if (params && params.value)
        this.assignValues(params);
    });
  }

  assignValues(params: Params) {
    let data = JSON.parse(params.value);
    console.log(data);
    this.templateSchema = data.templateSchema ? data.templateSchema : null;
    this.workRequest = data.workRequest ? data.workRequest : {};
    this.requestData = data.requestData ? data.requestData : new RequestData();
    this.draftRequest = data.draftRequest ? data.draftRequest : null;
    this.templateSchemaList = data.templateSchemaList ? data.templateSchemaList : [];
    this.isChange = true;

    data.reqType = this.reqType;

    this.event.publish('template:render', { data: data });
  }

  ngOnInit() { }
  backButtonClick($event) {
    console.log($event);
    this.router.navigate(['home'], { replaceUrl: true });
  }
  loadTemplateValues() {
    this.templateSchemaList = [];
    if (null != this.childTemplateSchema) {
      this.templateSchema =
        typeof this.childTemplateSchema == 'string'
          ? JSON.parse(this.childTemplateSchema)
          : this.childTemplateSchema;
      this.templateSchema.isAssetDownTimeTracking =
        this.selectedWorkflow && this.selectedWorkflow.isAssetDownTimeTracking
          ? this.selectedWorkflow.isAssetDownTimeTracking
          : false;
      this.templateSchemaList.push(this.templateSchema);
    }
  }

  loadDraftDetails(draft) {
    if (draft.templateValue) {
      this.childTemplateSchema = draft.templateValue;
    } else if (draft.allForms && draft.allForms[0]) {
      this.childTemplateSchema = draft.allForms[0].form;
    }
    this.showTemplate = true;

    this.requestData = new RequestData();
    this.requestData.templateHistId = draft.templateHistoryId;
    this.requestData.templateCategory = draft.templateCategory;
    this.requestData.locationName = draft.locationName;
    this.requestData.customerName = draft.customerName;
    this.requestData.workflowName = draft.workflowName;
    this.requestData.workflowId = draft.workflowId;
    this.requestData.locationId = draft.locationId;
    this.requestData.assetId = draft.assetId;
    this.requestData.customerId = draft.customerId;
    this.workRequest.priority = draft.priority;
    this.workRequest.description = draft.description;
    this.workRequest.id = draft && draft.clientPortalRequestId ? draft.clientPortalRequestId : null;
    this.loadTemplateValues();
  }
  scrolltoElemet() {
    setTimeout(() => {
      let element: any =
        this.elementRef.nativeElement.querySelector('.template-outer');
      let pos: any = element.getBoundingClientRect();
      this.content.scrollByPoint(0, pos.top - 115, 200);
    }, 100);
  }

  back() {
    window.localStorage.setItem('labourTaskList', JSON.stringify([]));
    window.localStorage.setItem('partsList', JSON.stringify([]));
    if (this.module != 'request-list') {
      this.router.navigate(['/home'], { replaceUrl: true });
    } else {
      this.router.navigate(['request-list'], { replaceUrl: true })
    }

  }
  async presentPopover(event: Event) {
    const modal = await this.popOver.create({
      component: AssetPopoverComponent,
      componentProps: {moduleName:'newRequest'},
      event: event
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      console.log('Selected option:', data);
      if (data == 'labourTasks') {
        this.goToLabourTasks();
      } else if (data == 'addParts') {
        this.gotoParts();
      }
    }
  }
  goToLabourTasks() {
    if (!navigator.onLine) {
      this.common.alertToast(this.reqService.translatedata('networkConnectivityError'));
      return;
    }
    let navigationExtras: NavigationExtras = {
      queryParams: {
        requestId: this.templateSchema.requestId,
        templateSchema: JSON.stringify(this.templateSchema),
        draftRequest: JSON.stringify(this.draftRequest),
        requestData: JSON.stringify(this.requestData),
        workRequest: JSON.stringify(this.workRequest),
        templateSchemaList: JSON.stringify(this.templateSchemaList),
        module: 'new-request'
      }, replaceUrl: true
    }
    this.router.navigate(['labour-tasks-list'], navigationExtras)
  }
  gotoParts() {
    if (!navigator.onLine) {
      this.common.alertToast(this.reqService.translatedata('networkConnectivityError'));
      return;
    }
    this.reqService.getAssetInfo(this.templateSchema.assetId).subscribe((data) => {
      this.templateSchema.categoryId = data.categoryId
      let value = {
        templateSchema: this.templateSchema,
        draftRequest: this.draftRequest,
        requestData: this.requestData,
        workRequest: this.workRequest,
        templateSchemaList: this.templateSchemaList,
        moduleName: 'new-request'
      }
      let navigationExtras: NavigationExtras = {
        queryParams: {
          categoryId: this.templateSchema.categoryId,
          requestId: this.templateSchema.requestId,
          assetId: this.templateSchema.assetId,
          partsUpdate: 'Update Parts',
          value: JSON.stringify(value),
        },
        replaceUrl: true
      }
      this.router.navigate(['inventory-list'], navigationExtras);
    }, async (err) => {
      let value = {
        templateSchema: this.templateSchema,
        draftRequest: this.draftRequest,
        requestData: this.requestData,
        workRequest: this.workRequest,
        templateSchemaList: this.templateSchemaList,
        moduleName: 'new-request'
      }
      let navigationExtras: NavigationExtras = {
        queryParams: {
          categoryId: this.templateSchema.categoryId,
          assetId: this.templateSchema.assetId,
          partsUpdate: 'Update Parts',
          module: 'new-request',
          value: JSON.stringify(value),
        },
        replaceUrl: true
      }
      this.router.navigate(['inventory-list'], navigationExtras);
    });
  }
}
