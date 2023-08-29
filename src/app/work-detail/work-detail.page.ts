import { Component, OnInit,Input } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { ModalController, Platform } from '@ionic/angular';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator/ngx';
import { from } from 'rxjs';
import { ServiceProvider } from 'src/providers/service/service';
import { TemplateProvider } from 'src/providers/template/template';
import { CommonProvider } from '../common/common';
import { Config } from '../config';
import { GetAwsImage } from '../data.model';
import { Events } from 'src/providers/events/events';
import { WorkViewPage } from '../work-view/work-view.page';
import { OverlayEventDetail } from '@ionic/core';
import { AttachmentPage } from '../attachment/attachment.page';
import { AssetPage } from '../asset/asset.page';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { AssetdowntimePage } from '../assetdowntime/assetdowntime.page';
@Component({
  selector: 'app-work-detail',
  templateUrl: './work-detail.page.html',
  styleUrls: ['./work-detail.page.scss'],
})
export class WorkDetailPage implements OnInit {
  @Input('templateSchema') templateSchema: any;
  @Input('type') type: string;
  @Input('subHeader') subHeader: string;
  @Input('count') count: any = {};
  @Input('tab') tab:any;
  @Input('module') module:any;
  @Input('id') id:any;
  @Input('requestTitle') requestTitle:any;

  // templateSchema: any;
  isInitiatedTemplate: boolean = false;
  templateSchemaList: any[] = [];
  imageJsonList: any[] = [];
  templateCat: string = '';
  templateLoc: string = '';
  requestCustomerName: string = '';
  isDraft: boolean = false;
  // type: string;
  templateHistoryId: any;
  incidentRequestHistoryId: any;
  workflowId: any;
  locationId: any;
  reqDetailList: any = [];
  scheduleOn: any;
  duration: any;
  isAcknowledged: boolean = false;
  priority: any;
  creationDate: any;
  startedBy: any;
  modelData: any;
  totalLabourCount: any;
  labourTypeInput: any = 'clear';
  partsTypeInput: any = 'clear';
  attachmentsTypeInput: any = 'clear';
  totalPartsCount: string;
  totalAttachmentsCount: string;
  templateWorkflow: any;
  profile: any;
  onLine: boolean = false;
  isAssetDownTime: boolean = false;
  
  constructor(
    public common: CommonProvider,
    private service: ServiceProvider,
    public storage: NativeStorage,
    private platform: Platform,
    public router: Router,
    public route: ActivatedRoute,
    public templateProvider: TemplateProvider,
    public launchNavigator: LaunchNavigator,
    public events: Events, 
    public modalCtrl: ModalController,
    public reqService: ServiceProvider
  ) {
  
  
  }


  async ngOnInit() {
    this.onLine = navigator.onLine;
    console.log(this.subHeader);
    await this.getWorkFlowTemplateById();
    this.profile = JSON.parse(window.localStorage.getItem('Profile'));
    this.totalLabourCount = this.count.labourTaskCount;
    this.route.queryParams.subscribe((params) => {
      if (params && params.isStatic) {
        this.route.queryParams.subscribe((params) => {
          if (params && params.formValue) {
            this.templateSchemaList = [];
            let data = params.formValue;
            this.getTemplateDetails(data);
          }
        });
      } else {
        let local = from(this.storage.getItem(Config.constants.imgJson));
        local.subscribe(
          (locData) => {
            this.imageJsonList = JSON.parse(locData);
          },
          async (err) => {
            console.log(err);
          }
        );
        let req = from(this.storage.getItem(Config.constants.reqDetailJson));
        req.subscribe(
          (reqData) => {
            this.reqDetailList = JSON.parse(reqData);
          },
          async (err) => {
            console.log(err);
          }
        );
        if(this.templateSchema.requestId) {
          this.reqService.getLabourTasksByrequestId(this.templateSchema.requestId).subscribe(
            (res: HttpResponse<any>) => this.onSuccess(res.body, res.headers,'labour'),
            (res: HttpErrorResponse) => this.onError(res.message)
          )
          this.reqService.getInventoriesByRequestId(this.templateSchema.requestId).subscribe(
            (res: HttpResponse<any>) => this.onSuccess(res.body, res.headers,'parts'),
            (res: HttpErrorResponse) => this.onError(res.message)
          )
        }
        if (null != this.templateSchema) {
          this.isDraft = this.templateSchema.requestId ? false : true;
          this.workflowId = this.templateSchema.workflowId;
          this.locationId = this.templateSchema.locationId;
          this.templateSchema.rejectionComments =
            typeof this.templateSchema.rejectionComments == 'string'
              ? JSON.parse(this.templateSchema.rejectionComments)
              : this.templateSchema.rejectionComments
              ? this.templateSchema.rejectionComments
              : null;
          this.templateWorkflow = this.templateSchema.workflowName;
          this.templateLoc = this.templateSchema.locationName;
          this.templateCat = this.templateSchema.requestType == "WORK_REQUEST" ? this.templateSchema.requestDescription : this.templateSchema.scheduleName;
          this.requestCustomerName = this.templateSchema.companyName;
          // this.scheduleOn = this.templateSchema.scheduleStartDateTime ? this.templateSchema.scheduleStartDateTime : '';
          this.scheduleOn =
            this.templateSchema.requestType == 'SCHEDULE_REQUEST'
              ? this.templateSchema.scheduleStartDateTime
                ? this.templateSchema.scheduleStartDateTime
                : this.templateSchema.requestSubmissionDate
              : '';
          this.duration = this.templateSchema.Duration
            ? this.templateSchema.Duration
            : '';
          this.isAcknowledged = this.templateSchema.ackReq ? false : true;
          this.templateHistoryId = this.templateSchema.templateHistoryId;
          this.priority = this.templateSchema.requestPriority;
          let isDataAvailable = false;
          this.creationDate = this.templateSchema.requestSubmissionDate
            ? this.templateSchema.requestSubmissionDate
            : this.templateSchema.creationDate;
          // if (
          //   this.templateSchema.allForms &&
          //   this.templateSchema.allForms.length &&
          //   this.type != 'job'
          // ) {
          //   this.templateSchemaList = [];
          //   for (let template of this.templateSchema.allForms) {
          //     this.getAllTemplateDetails(template);
          //   }
          // } else if (this.type == 'job') {
            console.log('start from work update ')
            // this.common.displayLoading();
            if (navigator.onLine) {
              this.service
                .genericGet(
                  'request-histories/workRequestForm/byRequestId',
                  this.templateSchema.requestId
                )
                .then(
                  (data) => {
                    // this.common.stopLoading();
                    this.isInitiatedTemplate = true;
                    if (null != data) {
                      this.checkOffline(data, this.templateSchema.requestId);
                      this.templateSchemaList = [];
                      data.forEach((val) => {
                        this.getTemplateDetails(val);
                      });
                    }
                  },
                  (error) => {
                    // this.common.stopLoading();
                  }
                );
            }else if(!navigator.onLine){
              // this.common.stopLoading();
              if (this.templateSchema.allForms && this.templateSchema.allForms.length && this.type != 'job') {
                for (let template of this.templateSchema.allForms) {
                  this.getAllTemplateDetails(template);
                }
              }
            } else {
              this.common.stopLoading();
              if (this.reqDetailList && this.reqDetailList.length > 0) {
                for (let val of this.reqDetailList) {
                  if (this.templateSchema.requestId == val.requestId) {
                    // this.common.stopLoading();
                    if (val.details && val.details.length) {
                      this.templateSchemaList = [];
                      val.details.forEach((value) => {
                        this.getTemplateDetails(value);
                      });
                    }
                    isDataAvailable = true;
                  }
                }
              }
              if (!isDataAvailable) {
                // this.common.stopLoading();
                this.common.alertToast(
                  this.service.translatedata('offlineFetchError')
                );
              }
            }
          // }
        }
      }
    });
  }
  // getAttachments(id: any, arg1: string) {
  //   this.reqService.getAttachments(id, arg1).subscribe(
  //     (res: HttpResponse<any>) => this.onSuccess(res.body, res.headers,'attachments'),
  //     (res: HttpErrorResponse) => this.onError(res.message)
  //   )
  // }
  onError(message: string): void {
    
  }
  ionViewWillEnter() {
    console.log('ion view will enter in work detail page ');
  }
  onSuccess(body: any, headers: HttpHeaders, type): void {
      if(type == 'labour') {
        this.totalLabourCount = headers.get('X-Total-Count');
        if(Number(this.totalLabourCount) == 0 ) {
          this.labourTypeInput = 'solid';
        }
      }else if(type == 'parts') {
        this.totalPartsCount = headers.get('X-Total-Count');
        if(Number(this.totalPartsCount) == 0 ) {
          this.partsTypeInput = 'solid';
        }
      }
      // else if(type == 'attachments') {
      //   this.totalAttachmentsCount = headers.get('X-Total-Count');
      //   if(Number(this.totalAttachmentsCount) == 0 ) {
      //     this.attachmentsTypeInput = 'solid';
      //   }
      // }
  }

  getAllTemplateDetails(formData) {
    
    if (formData.form && formData.form != '{}') {
      formData.form =
        formData.form.constructor() == ''
          ? JSON.parse(formData.form)
          : formData.form;
      //Get Image on demand
      let incident = formData.form.formSection;
      this.prepareFormDetail(incident);
      this.templateSchemaList.push(formData);
      console.log(this.templateSchemaList);
    }
  }

  prepareFormDetail(incident) {
    let imgsrc = '';
    for (let index of this.templateProvider.keys(incident)) {
      for (let key of this.templateProvider.keys(incident[index])) {
        let form = incident[index][key];
        if (
          (form.type == 'signatureOnly' && form.value) ||
          (form.type == 'signaturewithSatisfactory' && form.value)
        ) {
          let imgsrc =
            form.value.length > 60 ? form.value : this.getImage(form.value);
          if (imgsrc == '') {
            let getImage = new GetAwsImage();
            getImage.key = form.value;
            this.service
              .genericAWSImageGetOne(getImage, 'thumbnail')
              .then((imageData) => {
                if (null != imageData) {
                  this.imageJsonList.push(imageData);
                  this.storage.setItem(
                    Config.constants.imgJson,
                    JSON.stringify(this.imageJsonList)
                  );
                  if (imageData.imageBlob != null) {
                    form.value = imageData.imageBlob;
                    form.imgId = imageData.id;
                  }
                }
              });
          } else {
            form.imgId = form.value;
            form.value = imgsrc;
          }
        }
        if ((form.type == 'dateTime') && form.value != null && form.value != "" && form.value != undefined) {
          form.value = form.value?.replace('T', ' ');
          form.value = form.value?.replace('Z', ' ');
        }
        if (
          (form.type == 'imageWithAnnotation' || form.type == 'images') &&
          form.images &&
          form.images.length
        ) {
          for (let index in form.images) {
            imgsrc =
              form.images[index].src.length > 60
                ? form.images[index].src
                : this.getImage(form.images[index].src);
            if (imgsrc == '') {
              let getImage = new GetAwsImage();
              getImage.key = form.images[index].src;
              this.service
                .genericAWSImageGetOne(getImage, 'thumbnail')
                .then((imageData) => {
                  if (null != imageData) {
                    this.imageJsonList.push(imageData);
                    this.storage.setItem(
                      Config.constants.imgJson,
                      JSON.stringify(this.imageJsonList)
                    );
                    if (imageData.imageBlob != null) {
                      form.images[index].src = imageData.imageBlob;
                      form.images[index].imgId = imageData.id;
                    }
                  }
                });
            } else {
              form.images[index].imgId = form.images[index].src;
              form.images[index].src = imgsrc;
            }
          }
        }
      }
    }
  }

  checkOffline(data, requestId) {
    let detail = {
      requestId: requestId,
      details: data,
    };
    this.saveOffline(detail);
  }

  saveOffline(data) {
    let isExist = false;
    if (this.reqDetailList && this.reqDetailList.length > 0) {
      for (let p of this.reqDetailList) {
        if (data.requestId == p.requestId) isExist = true;
      }
      if (!isExist) this.reqDetailList.push(data);
    } else {
      this.reqDetailList.push(data);
    }
    this.storage.setItem(
      Config.constants.reqDetailJson,
      JSON.stringify(this.reqDetailList)
    );
  }

  getTemplateDetails(val) {
    
    if (val.tabName == 'Request') {
      this.templateLoc = this.templateLoc;
      this.templateCat = this.templateCat;
      this.incidentRequestHistoryId = val.id;
    }
    if (val.form && val.form.length > 0 && val.form != '{}') {
      let formVal = JSON.parse(val.form);
      if (val.rejectionComments) {
        formVal.rejectComment = JSON.parse(val.rejectionComments);
      }
      val.form = formVal;
      let incident = val.form.formSection;
      this.prepareFormDetail(incident);
      this.templateSchemaList.push(val);
      console.log(this.templateSchemaList);
    } else if (val.form == '{}') {
      this.templateSchemaList.push(val);
      console.log(this.templateSchemaList);
      this.startedBy = val.startedByID;
    }
  }

  getOnlineImg(incident) {
    if (navigator.onLine) {
      this.service
        .genericImageGetOne('mobileservice/imageuploads', incident.value)
        .subscribe(
          (imageData) => {
            if (null != imageData) {
              let image = null;
              image = imageData;
              this.imageJsonList.push(imageData);
              this.storage.setItem(
                Config.constants.imgJson,
                JSON.stringify(this.imageJsonList)
              );
              if (imageData.imageBlob != null && imageData.imageBlob != '') {
                incident.value = imageData.imageBlob;
              } else {
                incident.imgAnnotation = '';
                incident.value = '';
              }
            }
          },
          async (err) => {
            if (err.status == 401) {
              this.events.publish('user:inactive', {
                err: err.status,
                time: Date.now(),
              });
            }
          }
        );
    } else {
      this.common.alertToast(this.common.offlineMsg);
    }
  }

  getImage(id) {
    if (this.imageJsonList && this.imageJsonList.length > 0) {
      for (let p of this.imageJsonList) {
        if (p.id == id) {
          //JSON.parse(id)
          return p.imageBlob;
        }
      }
    }
    return '';
  }

  async showFormDetails(template, index) {
    const modal = await this.modalCtrl.create({
      component: WorkViewPage,
      componentProps: {
        template: template,
        index: index,
        type: this.type,
        submittedBy: this.templateSchema.requestRaisedBy
          ? this.templateSchema.requestRaisedBy
          : this.templateSchema.raisedByLogin,
        requestType: this.templateSchema ? this.templateSchema : null

      },
    });

    modal.onDidDismiss().then((detail: OverlayEventDetail) => {
      let modelData = detail.data;
      if (modelData !== null) {
        this.modelData = modelData;
        console.log('Modal Data : ' + modelData);
      }
    });

    return await modal.present();
  }

  viewOnMap() {
    // this.navCtrl.push(TrackUserPage, { lat: this.templateSchema.latitude, lng: this.templateSchema.longitude, location: this.templateSchema.locationName });
    if (this.platform.is('cordova')) {
      let options: LaunchNavigatorOptions = {
        app: this.launchNavigator.APP.GOOGLE_MAPS,
      };

      this.launchNavigator
        .isAppAvailable(this.launchNavigator.APP.GOOGLE_MAPS)
        .then((isAvailable) => {
          if (isAvailable) {
            this.launchNavigator
              .navigate(this.templateSchema.locationName, options)
              .then(
                (success) => console.log('Launched navigator'),
                (error) => console.log('Error launching navigator', error)
              );
          } else {
            this.common.alertToast(
              this.service.translatedata('Google Maps not available')
            );
          }
        });
    } else {
      this.common.alertToast(
        this.service.translatedata('Google Maps not available')
      );
    }
  }

  viewUserOnMap() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        isTrack: true,
        startedBy: this.startedBy,
        destination: this.templateLoc,
        destLat: this.templateSchema.locationLatitude,
        destLng: this.templateSchema.locationLongitude,
      },
    };
    this.router.navigate(['/map'], navigationExtras);
  }

  gotoBim(autoDeskImage, location) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        src: autoDeskImage,
        location: location,
      },
    };
    this.router.navigate(['BimViewPage'], navigationExtras);
  }
  async viewAsset(type?) {
    if(!navigator.onLine) {
      this.common.alertToast(this.reqService.translatedata('networkConnectivityError'));
      return;
    }
    const modal = await this.modalCtrl.create({
      component: AssetPage,
      componentProps: {
        isFromPending: true,
        selectedRequest: this.templateSchema,
        assetId:  this.templateSchema.assetId,
        requestId: this.templateSchema.requestId,
        isCost: false,
        isRequired: true
      },
    });
    modal.onDidDismiss().then((detail: OverlayEventDetail) => {
      let data = detail.data;
      this.templateSchema.assetId = data.assetId;
      this.templateSchema.assetName = data.name;
      this.templateSchema.assetQRCode =data.qrcodeText;
      this.templateSchema.assetSerialNo = data.modelCode;


    })
    await modal.present();
  }
  

  async gotoParts() {
    if(!navigator.onLine) {
      this.common.alertToast(this.reqService.translatedata('networkConnectivityError'));
      return;
    }
    this.reqService.getAssetInfo(this.templateSchema.assetId).subscribe((data) => {
      this.templateSchema.categoryId = data.categoryId
      let navigationExtras : NavigationExtras = {
        queryParams: {
            categoryId: this.templateSchema.categoryId,
            requestId: this.templateSchema.requestId,
            requestLocationId:this.templateSchema.locationId,
            assetId: this.templateSchema.assetId,
            partsUpdate: 'Update Parts',
            selectedRequest: JSON.stringify(this.templateSchema),
            subHeader: this.subHeader,
            partsCount: this.totalPartsCount,
            tab:this.tab,
            module:this.module
        },
        replaceUrl:true
      }
      this.router.navigate(['inventory-list'], navigationExtras);
    },async (err) => { 
      let navigationExtras : NavigationExtras = {
        queryParams: {
            categoryId: this.templateSchema.categoryId,
            requestId: this.templateSchema.requestId,
            requestLocationId:this.templateSchema.locationId,
            assetId: this.templateSchema.assetId,
            partsUpdate: 'Update Parts',
            selectedRequest: JSON.stringify(this.templateSchema),
            subHeader: this.subHeader,
            partsCount: this.totalPartsCount,
            tab:this.tab,
            module:this.module
        },
        replaceUrl:true
      }
      this.router.navigate(['inventory-list'], navigationExtras);
    });


  }

  async gotoAttachment() {
    if(!navigator.onLine) {
      this.common.alertToast(this.reqService.translatedata('networkConnectivityError'));
      return;
    }
    const modal = await this.modalCtrl.create({
      component: AttachmentPage,
      componentProps: {
        requestId: this.templateSchema.requestId,
        assetId: this.templateSchema.assetId,
        locationId: this.templateSchema && this.templateSchema.assetId === null ? this.templateSchema.locationId : null
      },
    });
    return await modal.present();
  }
  async getAssetHistory() {
    if(!navigator.onLine) {
      this.common.alertToast(this.reqService.translatedata('networkConnectivityError'));
      return;
    }
    let navigationExtras : NavigationExtras = {
      queryParams: {
        assetId: this.templateSchema.assetId,
        selectedRequest: JSON.stringify(this.templateSchema),
        subHeader: this.subHeader,
        tab:this.tab,
        module:this.module,
        instanceId:this.id,
        requestTitle: this.requestTitle
      },replaceUrl:true
    }
    this.router.navigate(['work-history'], navigationExtras);
  }
  async gotoLabourTasks() {
    if(!navigator.onLine) {
      this.common.alertToast(this.reqService.translatedata('networkConnectivityError'));
      return;
    }
    let navigationExtras: NavigationExtras = {
      queryParams: {
        requestId: this.templateSchema.requestId,
        status: this.templateSchema.status,
        locationId: this.templateSchema.locationId,
        templateSchema:JSON.stringify(this.templateSchema),
        subHeader: this.subHeader,
        tab:this.tab,
        module:this.module
      },replaceUrl:true
    }
    this.router.navigate(['labour-tasks-list'],navigationExtras )
  }

async  addAssetDownTimeTracking(templateSchema) {

    const modal = await this.modalCtrl.create({
      component: AssetdowntimePage,
      componentProps: {
      template: this.templateSchema ? this.templateSchema : this.templateSchema,
      assetDownTimeShowns: true,
      requestIds : this.templateSchema && this.templateSchema.requestId ? this.templateSchema.requestId : null
      },
      
    });

    modal.onDidDismiss().then((detail: OverlayEventDetail) => {
      this.templateSchema = templateSchema;
      this.modelData = this.templateSchema;
    });
    return await modal.present();
  }

  async getWorkFlowTemplateById() {
  await  this.service.getWorkflowByIds(this.templateSchema.workflowId).then(res => {
      console.log('res', res);
      if (res) {
        this.isAssetDownTime = res[0].isAssetDownTimeTracking;
      }
    });
  }

}
