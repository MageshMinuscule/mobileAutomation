
import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import {
  AlertController,
  ModalController,
  NavController,
  PopoverController,
} from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';
import { Events } from 'src/providers/events/events';
import { ServiceProvider } from 'src/providers/service/service';
import { TemplateProvider } from 'src/providers/template/template';
import { AssetPage } from '../asset/asset.page';
import { AssetdowntimePage } from '../assetdowntime/assetdowntime.page';
import { CommonProvider } from '../common/common';
import { Config } from '../config';
import { AWSImageUpload, Incident, RequestData } from '../data.model';
import { PopoverPage } from '../popover/popover.page';
import { ReportEmailPage } from '../report-email/report-email.page';
import { UserListPage } from '../user-list/user-list.page';
export const TemplateCategory: any = {
  1: "Pending With Technician",
  2: "Pending with TO or Engineers",
  3: "Pending with Managers",
  4: "OCIF",
  5: "Yet To Start",
};

@Component({
  selector: 'app-button',
  templateUrl: './button.page.html',
  styleUrls: ['./button.page.scss'],
  providers: [ServiceProvider],
})
export class ButtonPage implements OnInit {
  @Input() requestData: RequestData;
  @Input('buttons') buttons: any;
  @Input('templatedata') templatedata: any;
  @Input('type') type: any;
  @Input('form') form: any;
  @Input('draftRequest') draftRequest: any;
  @Input('isDraft') isDraft: any;
  @Input('workRequest') workRequest: any;
  @Input('templateForm') templateForm: any;
  @Input() requestTimer: any;
  selectedRequest: any;
  usergroupList: any = [];
  userList: any = [];
  scheduleTime: any;
  user: any;
  reportEmail: any;
  userName: any;
  hasAssetDowntimeTracking: boolean;
  hasRestrictByLocation: boolean;
  profile: any;
  reject = false;
  rejectionComments: string;
  value: any;
  assetValue: any = {};
  rejectionCommentsCopy: any;
  modelData: any;
  userResponse: any;
  AssetDowTime: boolean = false;
  rejectionReason: string;
  isAssetDownTimeTracking: any;
  assetDownTimeTrackingDTO: any = {};
  isAssetTransfer: any;
  shown :  boolean =  false;
  slaTimeBreachInHours: any;
  ids: any = [];
  shownMsg: any;
  constructor(
    private reqService: ServiceProvider,
    private firestore: AngularFirestore,
    public templateProvider: TemplateProvider,
    public navCtrl: NavController,
    public events: Events,
    public storage: NativeStorage,
    public common: CommonProvider,
    public alertCtrl: AlertController,
    public popoverCtrl: PopoverController,
    public modalCtrl: ModalController,
    public alertController: AlertController,
    public router: Router,
    public route : ActivatedRoute,
  ) {
    // console.log(0)
    // GET USERLIST FROM FIRESTORE
    if(navigator.onLine) {
      this.reqService.getAuthHeaders();
      let profile = JSON.parse(window.localStorage.getItem('Profile'));
          this.profile = profile;
          this.userName = profile.firstName.toLowerCase();
          this.hasAssetDowntimeTracking = profile.downTimeTracking;
          this.hasRestrictByLocation = profile.restrictByLocation;
          let userCollectionRef = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection('userGroup', (ref) => ref.where('active', '==', true));
          userCollectionRef.valueChanges().subscribe((res) => {
            this.usergroupList = res;
          });
          let userListCollectionRef = this.firestore
            .collection('organization')
            .doc(profile.tenantId)
            .collection('user_base', (ref) => ref.where('active', '==', true));
          userListCollectionRef.valueChanges().subscribe((res) => {
            this.userList = res;
          });
    } else {
      this.usergroupList = JSON.parse(window.localStorage.getItem('usergroupList'));
      this.userList = JSON.parse(window.localStorage.getItem('userList'));
    }
  }

  ngOnInit() {
    if(this.requestData && this.requestData.workflowId) {
      this.getAssetDownTimeFromWorkFlowId(this.requestData.workflowId);
    }
    this.reqService.getUserInfo().subscribe((res)=>{
      this.userResponse = res;
    })
    this.route.queryParams.subscribe(params => {
      if(params.isFromPaused == "true") {
        this.buttons = JSON.parse(params.buttons);
        this.templatedata = JSON.parse(params.templatedata);
        this.isDraft = JSON.parse(params.isDraft);
        this.shownMsg = params.shownMsg;
        let btn = {
            "id": 0,
            "label": "Save As Draft",
            "color": "#f44336",
            "action": "saveAsDraft",
            "tab": "",
            "status": "Draft",
            "primaryEmail": "",
            "canReschedule": false,
            "canAddEmail": false,
            "hasRevert": false,
            "emailTemplateList": [],
            "userGroupList": [],
            "userList": [],
            "conditionalBased": null,
            "canRestorePreviousForm": false,
            "templateCategory": null,
            "templateCategoryName": null
        }
        this.validateAssetFields(btn);
      }
    })
  }

  // ROUTE REQUEST BUTTON ACTION
  async validateAssetFields(btn) {
    this.shown =  true;
    console.log('button ',this.requestTimer);
    this.getAssetDownTimeFromWorkFlowId(this.templatedata.workflowId);
    // if(navigator.onLine) {
      this.selectedRequest = this.templatedata;
      if (btn.action == 'saveAsDraft') {
        this.prepareIncident(this.selectedRequest, btn);
        
      } else if(btn.action == 'reject'){
        this.presentPopover(btn);
      } else if (
        this.templateProvider.validateForm(
          this.selectedRequest.routeForm.formSection
        )
      ) {
        console.log("button Action "+btn.action+"enter into isValidAsset");
        console.log(this.templateProvider.isValidAsset(this.selectedRequest, btn));
        if(!navigator.onLine) {
          let asset = JSON.parse(window.localStorage.getItem('assetDetails'));
          if(asset && asset?.id) {
            this.selectedRequest.assetId =  asset.id;
            this.selectedRequest.assetSerialNumber =  asset.slno;
            this.selectedRequest.assetName = asset.name;
          }

        }
        if (await this.templateProvider.isValidAsset(this.selectedRequest, btn)) {
          if (
            btn.action != 'saveAsDraft' &&
            btn.action != 'closeIncident' &&
            btn.action != 'reject'
          ) {
            if (btn.action === 'submit') {
              this.doCloseIncidentAction(btn);
            } else {
              this.getUsertoAssign(this.selectedRequest.routeForm, btn);
            }
          } else if (btn.action == 'closeIncident') {
            if (this.hasAssetDowntimeTracking && this.selectedRequest.assetId) {
              if (navigator.onLine) {
                this.common.displayLoading();
                let params = new URLSearchParams();
                params.set('assetId', this.selectedRequest.assetId);
                this.reqService.getAssetDetails(this.selectedRequest.assetId).subscribe(
                  (asset) => {
                    this.common.stopLoading();
                    if (
                      asset &&
                      asset.id == this.selectedRequest.assetId &&
                      asset.assetDownTimeTrackingId &&
                      asset.down
                    ) {
                      let navigationExtras: NavigationExtras = {
                        queryParams: {
                          asset: asset,
                          selectedRequest: this.selectedRequest,
                          btn: btn,
                          callback: this.assetDowntimeCallback,
                        },
                      };
                      this.router.navigate(['/asset-downtime'], navigationExtras);
                    } else {
                      this.doCloseIncidentAction(btn);
                    }
                  },
                  async (err) => {
                    this.common.stopLoading();
                    this.common.alertToast(
                      err.staus + 'error to get the assetdetails.....'
                    );
                  }
                );
              } else {
                this.doCloseIncidentAction(btn);
                this.common.stopLoading();
                this.common.alertToast(
                  'Asset downtime tracking not working in offline mode. Please try it Online.'
                );
              }
            } else {
              this.doCloseIncidentAction(btn);
            }
          } else if (btn.action == 'pending') {
            // this.presentPrompt(btn);
            this.presentPopover(btn);
          } else if (btn.action == 'saveAsDraft') {
            this.prepareIncident(this.selectedRequest, btn);
          } else if (btn.action == 'reject') {
            this.presentPopover(btn);
            // this.presentPrompt(btn);
          }
        } else {
          this.showAssetError();
        }
      } else {
        this.shown = false;
      }
    // } else {
    //   alert("Network unavailable, Please check connectivity.");
    //   this.common.alertToast(
    //     "Network unavailable, Please check connectivity."
    //     // this.reqService.translatedata('networkConnectivityError')
    //   );
    //   return;
    // }

  }

  doCloseIncidentAction(btn) {
    if (
      (btn.action == 'closeIncident' || btn.action == 'reject') &&
      !btn.canAddEmail
    ) {
      this.prepareIncident(this.selectedRequest, btn);
    } else if (
      (btn.action == 'closeIncident' || btn.action == 'reject') &&
      btn.canAddEmail
    ) {
      this.setReportEmail(this.selectedRequest, btn);
    } else if (btn.action == 'submit' && btn.canAddEmail) {
      this.setReportEmail(this.selectedRequest, btn);
    } else if (btn.action == 'submit' && !btn.canAddEmail) {
      this.getUsertoAssign(this.selectedRequest.routeForm, btn);
    }
  }

  // CREATE REQUEST BUTTON ACTION
  doButtonAction(btn) {
    this.shown =  true;
    if(navigator.onLine) {
      if (
        this.type == 'createRequest' &&
        (!this.workRequest.priority || !this.workRequest.description)
      ) {
        let msg = !this.workRequest.priority
          ? 'Please fill the priority field'
          : !this.workRequest.description
          ? 'Please fill the description field'
          : '';
        this.common.alertToast(msg);
        this.shown =  false;
        return;
      }
      if (btn.action != 'saveAsDraft' && this.templateProvider.validateForm(this.templatedata.formSection)) {
        if ((btn.action == 'submit' || btn.action == 'pending') && !btn.canAddEmail) {
          this.getUsertoAssign(this.templatedata, btn);
        } else if ((btn.action == 'submit' || btn.action == 'pending') && btn.canAddEmail) {
          this.setReportEmail(this.templatedata, btn, 'Create Request');
        } else if (btn.action == 'closeIncident' && !btn.canAddEmail) {
          this.prepareIncident(this.templatedata, btn);
        } else if (btn.action == 'closeIncident' && btn.canAddEmail) {
          this.setReportEmail(this.templatedata, btn);
        } else if (btn.action == 'reject') {
          this.reject = true;
          this.presentPopover(btn);
          // this.presentPrompt(btn);
        } else if (
          btn.action != 'saveAsDraft' &&
          btn.action != 'submit' &&
          btn.action != 'closeIncident' &&
          btn.action != 'reject'
        ) {
          this.prepareIncident(this.templatedata, btn);
        } else if (btn.action == 'saveAsDraft') {
          this.templatedata.slaTimeBreachInHours = this.slaTimeBreachInHours;
          this.doCloseIncidentAction(btn);
          this.prepareIncident(this.templatedata, btn);
        }
      } else if (btn.action == 'saveAsDraft') {
        this.shown = false;
        this.templatedata.slaTimeBreachInHours = this.slaTimeBreachInHours;
        this.prepareIncident(this.templatedata, btn);
      } else {
        this.shown = false;
      }
    } else {
      this.common.alertToast(
        this.reqService.translatedata('networkConnectivityError')
      );
      return;
    }

  }
  // REJECT COMMENT PROMPT
  async presentPrompt(btn) {
    let alert = await this.alertCtrl.create({
      header: this.reqService.translatedata('rejectComments'),
      inputs: [
        {
          name: 'comments',
          placeholder: this.reqService.translatedata('enterComments'),
        },
      ],
      buttons: [
        {
          text: this.reqService.translatedata('cancel'),
          role: 'cancel',
          handler: (data) => {},
        },
        {
          text: this.reqService.translatedata('submit'),
          handler: (data) => {
            if (data.comments && data.comments.trim() != '') {
              if (data.comments.length > Config.constants.rejectCommentLength) {
                data.comments = data.comments.substring(
                  0,
                  Config.constants.rejectCommentLength
                );
              }
              let rejectObj = { user: this.userName, comment: data.comments };
              if (this.reject === true) {
                this.rejectionComments = JSON.stringify(rejectObj);
                this.rejectionCommentsCopy = data.comments;
              } else {
                this.selectedRequest.rejectionComments =
                  JSON.stringify(rejectObj);
                this.selectedRequest.routeForm.rejectComment = data.comments;
              }
              if (btn.action === 'reject') {
                if (this.reject === true) {
                  if (!btn.canAddEmail) {
                    this.prepareIncident(this.templatedata, btn);
                  } else if (btn.canAddEmail) {
                    this.setReportEmail(this.templatedata, btn);
                  }
                } else {
                  this.doCloseIncidentAction(btn);
                }
              } else {
                this.prepareIncident(this.selectedRequest, btn);
              }
            } else {
              this.common.alertToast(
                this.reqService.translatedata('rejectCommentsValidation')
              );
              return false;
            }
          },
        },
      ],
    });
    await alert.present();
  }
  // PREPARE USERLIST FROM FIRESTORE DATA
  getUsertoAssign(templatedata, btn) {
    let form =
      this.type == 'routeRequest'
        ? this.selectedRequest.routeForm.formSection
        : templatedata.formSection;
    if (this.templateProvider.validateForm(form)) {
      if (this.common.getViewType() == 'location') {
        this.prepareIncident(templatedata, btn);
      } else {
        let users = [];
        for (let user of this.usergroupList) {
          if (btn.userGroupList.length) {
            for (let groupId of btn.userGroupList) {
              if (user.usergroupId == groupId) {
                let isExist = false;
                users.forEach((ele) => {
                  if (ele.userId == user.userId) {
                    isExist = true;
                  }
                });
                if (!isExist) {
                  users.push(user);
                }
              }
            }
          }
        }
        for (let user of this.userList) {
          if (btn.userList && btn.userList.length) {
            for (let userId of btn.userList) {
              if (user.id == userId) {
                let obj = {
                  userName: user.firstName,
                  userId: user.id,
                  locationIds: user.locationIds,
                };
                let isExist = false;
                users.forEach((ele) => {
                  if (ele.userId == userId) {
                    isExist = true;
                  }
                });
                if (!isExist) {
                  users.push(obj);
                }
              }
            }
          }
        }
        if (users.length > 1) {
          if (this.hasRestrictByLocation) {
            if (this.profile.locationIds) {
              users = [].concat(
                users.filter((obj2) =>
                  this.profile.locationIds.some(
                    (obj1) =>
                      obj2.locationIds && obj2.locationIds.includes(obj1)
                  )
                )
              );
              if (!users.length) {
                this.common.alertToast(
                  "User's not available for " +
                    (this.type == 'routeRequest'
                      ? this.selectedRequest.locationName
                      : this.requestData.locationName) +
                    ' location'
                );
                return;
              }
            } else {
              this.common.alertToast(
                "User's not available for " +
                  (this.type == 'routeRequest'
                    ? this.selectedRequest.locationName
                    : this.requestData.locationName) +
                  ' location'
              );
              return;
            }
          }
          this.showUsers(users, btn, templatedata);
        } else if (users.length) {
          if (this.hasRestrictByLocation) {
            if (this.profile.locationIds) {
              users = [].concat(
                users.filter((obj2) =>
                  this.profile.locationIds.some(
                    (obj1) =>
                      obj2.locationIds && obj2.locationIds.includes(obj1)
                  )
                )
              );
              if (!users.length) {
                this.common.alertToast(
                  "User's not available for " +
                    (this.type == 'routeRequest'
                      ? this.selectedRequest.locationName
                      : this.requestData.locationName) +
                    ' location'
                );
                return;
              }
            } else {
              this.common.alertToast(
                "User's not available for " +
                  (this.type == 'routeRequest'
                    ? this.selectedRequest.locationName
                    : this.requestData.locationName) +
                  ' location'
              );
              return;
            }
          }
          this.user = [];
          users.forEach((ele) => {
            this.user.push(ele.userId);
          });
          this.proceedSubmission(btn, templatedata);
        } else {
          this.common.alertToast("User's not available.");
        }
      }
    }
  }
  // SHOW THE USERLIST TO SELECT
  showUsers(userList, btn, template) {
    this.presentUserListView(userList, btn, template);
    return;
  }

  async proceedSubmission(btn, template) {
    this.submitToUser(template, btn);
    // if (btn.canReschedule) {
    //   let popover = await this.modalCtrl.create({
    //     component: PopoverPage,
    //   });
    //   popover.onDidDismiss().then((detail: OverlayEventDetail) => {
    //     let data = detail.data;
    //     this.scheduleTime = data;
    //     if (!this.scheduleTime) {
    //       this.common.alertToast(
    //         this.reqService.translatedata(
    //           'Please select schedule date and time'
    //         )
    //       );
    //     } else {
    //       this.submitToUser(template, btn);
    //     }
    //   });
    //   await popover.present();
    // } else {
    //   this.submitToUser(template, btn);
    // }
  }

  async presentUserListView(userList, btn, template) {
    let userModal = await this.modalCtrl.create({
      component: UserListPage,
      componentProps: {
        requestType: this.type,
        userList: userList,
        selectedUser: this.user,
      },
    });
    userModal.onDidDismiss().then((detail: OverlayEventDetail) => {
      let data = detail.data;
      if (data) {
        this.user = data.userList;
        this.proceedSubmission(btn, template);
      } else {
        this.shown = false;
      }
    });
    await userModal.present();
  }

  // Add Additional Report Email
  async prepareReportEmail(template, btn, create?) {
    let reportEmailModal = await this.modalCtrl.create({
      component: ReportEmailPage,
      componentProps: {
        primaryEmail: btn.primaryEmail,
        selectedUser: this.user,
      },
    });
    reportEmailModal.onDidDismiss().then((detail: OverlayEventDetail) => {
      let data = detail.data;
      this.shown = data == undefined ? false :true;
      if (data) {
        this.reportEmail = data.emailList;
        if (btn.action === 'submit') {
          if (create === 'Create Request') {
            this.getUsertoAssign(template, btn);
          } else {
            this.getUsertoAssign(this.selectedRequest.routeForm, btn);
          }
        } else {
          this.prepareIncident(template, btn);
        }
      }
    });
    await reportEmailModal.present();
  }
  // SUBMIT TO THE SELECTED USER
  submitToUser(template, btn) {
    if (this.user.length) {
      if (btn.action == 'pending' && this.type == 'routeRequest') {
        this.presentPopover(btn);
      }else if (btn.action == 'pending' && this.type != 'routeRequest') {
        this.presentPopover(btn);
      } else {
        this.prepareIncident(template, btn);
      }
    } else {
      this.common.alertToast(this.reqService.translatedata('selectUser'));
    }
  }
  getTemplateCategoryId(catName) {
    let category = TemplateCategory;
    for (const property in category) {
      if(category[property] == catName) {
        console.log(`${property}: ${category[property]}`);
        return Number(property);
      } 
    }
    return 0;
  }
  checkNumber(inputtxt) {
    const specialChars =  /^[0-9]+$/;
    return specialChars.test(inputtxt);
  }
  // SET REQUEST FIELDS FOR SUBMISSION
  async prepareIncident(template, btn) {
    let form;
    let newRequest = new Incident();
    if (this.type == 'routeRequest') {
      form = this.selectedRequest.routeForm.formSection;
      this.selectedRequest.action = btn.action;
      if(btn.action == 'submit' && btn.templateCategory != null) {
        if(this.checkNumber(btn.templateCategory)) {
          this.selectedRequest.templateCategoryId = btn.templateCategory ? Number(btn.templateCategory) : null;
        }else {
          btn.templateCategory = typeof btn.templateCategory == 'string' ? this.getTemplateCategoryId(btn.templateCategory) :  btn.templateCategory;
          this.selectedRequest.templateCategoryId = btn.templateCategory ? Number(btn.templateCategory) : null;
        } 
      }
      // this.selectedRequest.scheduleStartDateTime = template.scheduleTime;
      this.selectedRequest.scheduleTime = null;
      this.selectedRequest.requestSubmissionDate = template.updationDate;
      this.selectedRequest.emailTemplateList = btn.emailTemplateList;
      this.selectedRequest.requestStatus = btn.status;
      this.selectedRequest.actionTabName = btn.tab;
      this.selectedRequest.assetSerialNumber =
        this.selectedRequest.assetSerialNo;
      this.selectedRequest.reportEmail = this.reportEmail
        ? this.reportEmail
        : btn.primaryEmail
        ? btn.primaryEmail
        : null;
      this.selectedRequest.nextScheduleTime = this.scheduleTime
        ? this.scheduleTime
        : '';
      this.selectedRequest.rejectionComments =
        typeof this.selectedRequest.rejectionComments == 'string'
          ? this.selectedRequest.rejectionComments
          : JSON.stringify(this.selectedRequest.rejectionComments);
      this.selectedRequest.rejectionReason =
        typeof this.selectedRequest.rejectionReason == 'string'
          ? this.selectedRequest.rejectionReason
          : JSON.stringify(this.selectedRequest.rejectionReason);
      let asset = localStorage.getItem('assetDetails')
        ? JSON.parse(localStorage.getItem('assetDetails'))
        : '';
      if (asset && this.selectedRequest.requestId == asset.requestId) {
        this.selectedRequest.assetId = this.selectedRequest.assetId
          ? this.selectedRequest.assetId
          : asset.id;
        this.selectedRequest.assetSerialNumber = asset.assetSerialNo
          ? asset.assetSerialNo
          : this.selectedRequest.assetSerialNo;
        this.selectedRequest.assetPartNumber = asset.modelName;
        this.selectedRequest.assetName = asset.name;
        this.selectedRequest.assetMachineCode = asset.modelCode;
      }
      if(btn.action === 'closeIncident' && this.isAssetDownTimeTracking == true && (this.selectedRequest.assetId || asset.id) && !this.AssetDowTime ) {
        this.AssetDowTime = true;
        if( navigator.onLine) {
          this.showDownTime(template, newRequest)
        }else {
          this.shown = false;
          this.common.alertToast('AssetDownTime Is Not Working In Offline');
        }
        
        return;
      }
    } else {
      form = template.formSection;
      let date = new Date();
      newRequest.action = btn.action;
      newRequest.emailTemplateList = btn.emailTemplateList;
      newRequest.actionTabName = btn.tab;
      newRequest.status = btn.status;
      newRequest.priority = this.workRequest.priority;
      newRequest.description = this.workRequest.description;
      newRequest.active = true;
      newRequest.clientPortalRequestId = this.workRequest.id;
      newRequest.workflowId = this.requestData.workflowId;
      newRequest.userList = this.user;
      if(btn.action == 'submit' && btn.templateCategory != null) {
        if(this.checkNumber(btn.templateCategory)) {
          newRequest.templateCategoryId = btn.templateCategory ? Number(btn.templateCategory)  : null ;
        }else {
          btn.templateCategory = typeof btn.templateCategory == 'string' ? this.getTemplateCategoryId(btn.templateCategory) :  btn.templateCategory;
          newRequest.templateCategoryId =  btn.templateCategory ? btn.templateCategory : null;
        }
      }
      
      newRequest.workflowName = this.draftRequest
        ? this.draftRequest.workflowName
        : this.requestData.workflowName;
      newRequest.reportEmail = this.reportEmail
        ? this.reportEmail
        : btn.primaryEmail
        ? btn.primaryEmail
        : null;
      newRequest.slaTimeBreachInHours = this.slaTimeBreachInHours ? this.slaTimeBreachInHours : 0;
      newRequest.locationId = this.requestData.locationId;
      newRequest.companyId = this.draftRequest
        ? this.draftRequest.companyId
        : this.requestData.customerId;
      newRequest.companyName = this.draftRequest
        ? this.draftRequest.companyName
        : this.requestData.customerName;
      newRequest.nextScheduleTime = this.scheduleTime
        ? this.scheduleTime
        : null;
      newRequest.locationName = this.draftRequest
        ? this.draftRequest.locationName
        : this.requestData.locationName;
      template.rejectComment = newRequest.rejectionComments = this.rejectionCommentsCopy
        ? this.rejectionCommentsCopy
        : '';
      template.rejectReason = newRequest.rejectionReason = this.rejectionReason
        ? this.rejectionReason
        : '';
      // template.rejectComment = this.rejectionCommentsCopy
      //   ? this.rejectionCommentsCopy
      //   : '';
      newRequest.lastUpdated = date.toISOString();
      newRequest.creationDate = date.toISOString();
      newRequest.templateHistoryId = this.requestData.templateHistId;
      let asset = localStorage.getItem('assetDetails')
        ? JSON.parse(localStorage.getItem('assetDetails'))
        : '';
      newRequest.assetId = this.requestData.assetId
        ? this.requestData.assetId
        : asset.id;
        // newRequest.stateId = this.requestData && this.requestData.stateId
        // ? this.requestData.stateId
        // : null;
      if (newRequest && newRequest.isAssetTransfer) {
        newRequest.assetCurrentLocationId = this.draftRequest
          ? this.draftRequest.assetCurrentLocationId
          : newRequest.locationId;
        newRequest.assetTransferLocationId = this.draftRequest
          ? this.draftRequest.assetTransferLocationId
          : this.requestData.assetTransferLocation;
      }
      if (btn.action === 'closeIncident') {
        if(this.isAssetDownTimeTracking  && this.isAssetDownTimeTracking == true && (this.requestData.assetId || asset.id) && !this.AssetDowTime ) {
          this.AssetDowTime = true;
          this.showDownTime(template, newRequest)
          return;
        }else if (await this.templateProvider.isValidAsset(newRequest)) {
          console.log('validation success');
        } else {
          this.showAssetError(newRequest);
          return;
        }
      }
    }
    if (btn.action != 'saveAsDraft') {
      if (btn.action === "reject") {
        this.prepareSubmit(template, newRequest);
      }
      else if(this.templateProvider.validateForm(form)) {
        this.prepareSubmit(template, newRequest);
      }
    } else {
      this.prepareSubmit(template, newRequest);
    }
  }
  async showDownTime(template?, newRequest? ) {
    const modal = await this.modalCtrl.create({
      component: AssetdowntimePage,
      componentProps: {
                requestData: this.requestData ? this.requestData : this.selectedRequest,
                assetDownTimeShown: this.AssetDowTime,
                requestId : this.templatedata && this.templatedata.requestId ? this.templatedata.requestId : null
      },
      
    });

    modal.onDidDismiss().then((detail: OverlayEventDetail) => {
      let modelData = detail.data;
      if (modelData !== null) {
        this.assetDownTimeTrackingDTO = modelData;
        this.prepareSubmit(template, newRequest);
        this.modelData = modelData;
        console.log('Modal Data : ' + modelData);
      }
    });

    return await modal.present();
  }

  assetDowntimeCallback = (btn) => {
    return new Promise((resolve, reject) => {
      this.doCloseIncidentAction(btn);
      resolve(true);
    });
  };

  // SET ADDITIONAL REPORT EMAIL
  setReportEmail(template, btn, create?) {
    // let alert = this.alertCtrl.create({
    //   title: this.reqService.translatedata("Add Email"),
    //   inputs: [
    //     {
    //       name: "email",
    //       placeholder: "Client Email",
    //       type: "email"
    //     }
    //   ],
    //   buttons: [
    //     {
    //       text: this.reqService.translatedata("skip"),
    //       handler: data => {
    //         this.reportEmail = btn.primaryEmail ? btn.primaryEmail : null;
    //         this.prepareIncident(template, btn);
    //       }
    //     },
    //     {
    //       text: this.reqService.translatedata("submit"),
    //       handler: data => {
    //         if (
    //           data.email &&
    //           data.email.trim() &&
    //           data.email.includes("@") &&
    //           data.email.includes(".")
    //         ) {
    //           this.reportEmail = btn.primaryEmail
    //             ? btn.primaryEmail + ";" + data.email
    //             : data.email;
    //           this.prepareIncident(template, btn);
    //         } else {
    //           this.common.alertToast(
    //             this.reqService.translatedata(
    //               "Please enter a valid email to continue."
    //             )
    //           );
    //           return false;
    //         }
    //       }
    //     }
    //   ]
    // });
    // alert.present();
    this.prepareReportEmail(template, btn, create);
  }
  // PREPARE TEMPLATE VALUE FOR SUBMISSION
  prepareSubmit(template, newRequest?) {
    let imgCount = 0;
    let form =
      this.type == 'routeRequest'
        ? this.selectedRequest.routeForm.formSection
        : template.formSection;
    // this.common.displayLoading();
    for (let incident of this.templateProvider.keys(form)) {
      for (let key of this.templateProvider.keys(form[incident])) {
        if (
          form[incident][key].label == 'Priority' &&
          this.type === 'createRequest'
        ) {
          newRequest.priority = this.workRequest.priority;
        }
        if (
          (form[incident][key].type == 'signatureOnly' ||
            form[incident][key].type == 'signaturewithSatisfactory') &&
          form[incident][key].imgId
        ) {
          form[incident][key].value = form[incident][key].imgId;
        }
        if (form[incident][key].type == 'imageWithAnnotation' || form[incident][key].type == 'images') {
          for (let index in form[incident][key].images) {
            if (form[incident][key].images[index].imgId)
              form[incident][key].images[index].src =
                form[incident][key].images[index].imgId;
          }
        }
        if (navigator.onLine) {
          if (
            (form[incident][key].type == 'signatureOnly' &&
              form[incident][key].value) ||
            (form[incident][key].type == 'signaturewithSatisfactory' &&
              form[incident][key].value)
          ) {
            if (
              form[incident][key].value.length > 100 &&
              !form[incident][key].imgId
            ) {
              imgCount++;
              let uploadJson = new AWSImageUpload();
              uploadJson.baseImage = form[incident][key].value;
              this.reqService.genericAwsPost(uploadJson).subscribe(
                (status) => {
                  console.log("image upload in sws");
                  let uploadId;
                  imgCount--;
                  if (status) {
                    uploadId = status;
                    form[incident][key].value = uploadId;
                    form[incident][key].imgId = uploadId;
                    if (imgCount == 0) {
                      this.initiateSubmit(template, newRequest);
                    }
                  }
                },
                async (err) => {
                  // this.common.stopLoading();
                  this.common.alertToast(
                    err.status + 'error in genericAwsPost.......'
                  );
                }
              );
            }
          }
          if (form[incident][key].type == 'imageWithAnnotation' || form[incident][key].type == 'images') {
            for (let index in form[incident][key].images) {
              if (
                form[incident][key].images[index].src.length > 100 &&
                !form[incident][key].images[index].imgId
              ) {
                imgCount++;
                let uploadJson = new AWSImageUpload();
                uploadJson.baseImage = form[incident][key].images[index].src;
                this.reqService.genericAwsPost(uploadJson).subscribe(
                  (result) => {
                    let uploadId;
                    console.log("image upload in iwa");
                    if (result) {
                      uploadId = result;
                      form[incident][key].images[index].src = uploadId;
                      form[incident][key].images[index].imgId = uploadId;
                      imgCount--;
                    }
                    if (imgCount == 0) {
                      this.initiateSubmit(template, newRequest);
                    }
                  },
                  async (err) => {
                    // this.common.stopLoading();
                    this.common.alertToast(
                      err.status + 'error in genericAwsPost.......'
                    );
                  }
                );
              }
            }
          }
        }
      }
    }
    if (imgCount == 0) {
      this.initiateSubmit(template, newRequest);
    }
  }
  // REQUEST SUBMISSION FOR BOTH CREATE REQUEST & ROUTE REQUEST
  initiateSubmit(template, newRequest) {
    if (this.type == 'createRequest') {
      let temStr = JSON.stringify(template);
      temStr.replace('"', '"');
      newRequest.templateValue = temStr;
      newRequest.assetDownTimeTrackingDTO = this.assetDownTimeTrackingDTO;
      if(navigator.onLine) {
        this.newRequsetSubmit(newRequest);
      }else {
        this.reqService.translatedata('networkConnectivityError');
        this.router.navigate(['/home'],{replaceUrl:true});
      }
      
    } else if (this.type == 'routeRequest') {
      this.selectedRequest.userList = this.user;
      if (navigator.onLine) {
        if (template.action == 'saveAsDraft') {
          this.selectedRequest.active = true;
          this.templateProvider.routeDraftSubmit(this.selectedRequest,this.requestTimer,this.shownMsg);
        } else {
          this.selectedRequest.allForms = [];
          this.templateProvider.saveRequest(this.selectedRequest,this.requestTimer);
        }
      } else {
        this.templateProvider.routeSaveAsDraft(this.selectedRequest);
        let navigationExtras: NavigationExtras = {
          queryParams: {
            type:'offline',
          },replaceUrl:true
        };
        this.router.navigate(['/home'],navigationExtras);
      }
    }
  }
  // CREATE REQUEST SUBMIT
  newRequsetSubmit(newRequest) {
    if (this.draftRequest) {
      newRequest.id = this.draftRequest.id;
      newRequest.version = this.draftRequest.version;
      newRequest.active = true;
    } else {
      newRequest.id = null;
    }
    if (navigator.onLine) {
      if (newRequest.action == 'saveAsDraft') {
        this.templateProvider.draftSubmit(newRequest);
      } else {
        this.templateProvider.createRequest(newRequest);
      }
    } else {
      this.saveAsDraft(newRequest);
    }
  }
  // CREATE REQUEST DRAFT
  saveAsDraft(newRequest) {
    this.common.stopLoading();
    if (!navigator.onLine) {
      console.log("**************" + "enter in offline mode")
      console.log(JSON.stringify(newRequest));
      let draftList = [];
      newRequest.id = this.draftRequest ? this.draftRequest.id : null;
      newRequest.version = this.draftRequest ? this.draftRequest.version : '';
      draftList.push(newRequest);
      console.log(JSON.stringify(draftList)+'----------draft list-----------');
      let locData = JSON.parse(window.localStorage.getItem(Config.constants.draftNewReqs));
        let count = 1;
        if (null != locData) {
          for (let inc of locData) {
            if (this.draftRequest) {
              if (this.draftRequest.id != inc.id) {
                inc.id = count + '';
                draftList.push(inc);
                count++;
              }
            } else {
              inc.id = count + '';
              draftList.push(inc);
              count++;
            }
          }
        }
        // window.localStorage.setItem(Config.constants.draftNewReqs, JSON.stringify(draftList));
        if (newRequest.action != 'saveAsDraft') {
          console.log('offline mode to set a data');
          this.events.publish('offlineSubmit', { user: 'offlineSubmit' });
          this.common.stopLoading();
          this.common.alertToast(
            this.reqService.translatedata('requestOfflineMode')
          );
        } else {
          this.common.stopLoading();
          this.common.alertToast(
            this.reqService.translatedata('requestSavedDraft')
          );
        }

      this.common.stopLoading();
      this.router.navigate(['home'],{replaceUrl:true});
    }
  }
  // CREATE REQUEST DRAFT DELETE
  deleteDraft() {
    // ONLINE DRAFT
    if (this.draftRequest.stage == 'draft' && this.draftRequest.id) {
      if (navigator.onLine) {
        this.templateProvider.deleteDraftRequest(this.draftRequest.id);
      } else {
        this.common.alertToast(
          this.reqService.translatedata('networkConnectivityError')
        );
      }
    } else {
      // OFFLINE DRAFT
      console.log('enter in offlie draft');
      let locData = JSON.parse(localStorage.getItem(Config.constants.draftNewReqs))
      console.log(locData  + 'offline');
        // this.common.displayLoading();
        let refreshedDraftList = [];
        if (null != locData) {
          for (let inc of locData) {
            if (this.draftRequest) {
              if (this.draftRequest.id != inc.id) {
                refreshedDraftList.push(inc);
                console.log('draftrequest' + JSON.stringify(refreshedDraftList));
              }
            }
          }
          window.localStorage.setItem(
            Config.constants.draftNewReqs,
            JSON.stringify(refreshedDraftList)
          );
          this.common.stopLoading();
          this.common.alertToast(
            this.reqService.translatedata('requestDeleted')
          );
          this.router.navigate(['/home'],{replaceUrl:true})
        }
        this.common.stopLoading();
        this.router.navigate(['/home'],{replaceUrl:true});
    }
  }

  checkOfflineUpdate() {
    this.common.displayLoading();
    this.shown = true;
    this.templateProvider.deleteDraftRequest(this.draftRequest.id);
  }
  // ROUTE FORM DRAFT DELETE
  deleteRouteDraft() {
    // this.shown = true;
    this.templateProvider.deleteRouteDraft(this.templatedata);
  }

  // SHOW ASSET ERROR IF FIELD IS EMPTY
  showAssetError(newRequest?) {
    let missingField = this.common.checkMissingField(
      newRequest ? newRequest : this.selectedRequest
    );
    let errorMsg = this.reqService.translatedata('fieldError');
    errorMsg =
      (missingField
        ? errorMsg +
        '' +missingField
        : 'Please choose asset or create asset');
    this.common.alertToast(errorMsg);
    this.gotoAsset(newRequest);
  }


  async checkMissingField(request) {
    let missingField;
    let isValid = false;
    const res = await this.reqService.getassetId(request.assetId);
    if (res && res.id) {
      isValid =  true;
    } else {
      isValid = false;
    }
    // this.reqService.getassetId(request.assetId).subscribe(res=>{
    //   if(res.id) {
    //     isValid = true;
    //   }
    // },async(error)=>{
    //   isValid = false;
    // })



    // for (let asset of this.assetList) {
    //   if (asset.id == request.assetId) {
    //     missingField = this.getMissingField(asset);
    //     if (
    //       asset.assetSerialNo &&
    //       asset.modelName &&
    //       asset.modelCode &&
    //       asset.name
    //     ) {
    //       isValid = true;
    //     }
    //   }
    // }
    if (!isValid && localStorage.getItem('assetDetails')) {
      let asset = localStorage.getItem('assetDetails')
        ? JSON.parse(localStorage.getItem('assetDetails'))
        : '';
      if (asset && asset.requestId == request.requestId) {
        missingField = this.getMissingField(asset);
      }
    }
    return missingField;
  }


  getMissingField(asset) {
    let missingField;
    if (!asset.assetSerialNo) {
      missingField = 'Serial No';
    }
    if (!asset.name) {
      missingField = missingField
        ? missingField + ', Machine Model'
        : 'Machine Model';
    }
    if (!asset.modelName) {
      missingField = missingField ? missingField + ', Part No' : 'Part No';
    }
    if (!asset.modelCode) {
      missingField = missingField
        ? missingField + ', Machine Code'
        : 'Machine Code';
    }
    return missingField;
  }
  // GOTO ASSET PAGE FOR UPDATE
  async gotoAsset(newRequest?) {
    const modal = await this.modalCtrl.create({
      component: AssetPage,
      componentProps: {
        isFromPending: true,
        requestId:
          this.selectedRequest && this.selectedRequest.requestId
            ? this.selectedRequest.requestId
            : null,
        selectedRequest: newRequest ? newRequest : this.selectedRequest,
        assetId:
          this.selectedRequest && this.selectedRequest.assetId
            ? this.selectedRequest.assetId
            : null,
        isCost: false,
        isRequired: true,
      },
    });

    modal.onDidDismiss().then((detail: OverlayEventDetail) => {
      let modelData = detail.data;
      if (modelData !== null) {
        this.modelData = modelData;
        this.shown = false;
        console.log('Modal Data : ' + modelData);
      }
    });

    return await modal.present();
  }
  // GOTO HOMEPAGE
  gotoHome() {
    // this.navCtrl = this.app.getActiveNav();
    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 200);
  }
  async presentPopover(btn: any) {
    const popover = await this.popoverCtrl.create({
      component: UserListPage,
      cssClass: 'popover',
      componentProps: {event: btn},
      translucent: true,
    });
    popover.onDidDismiss().then((detail : any) => {
     console.log(detail);
     if(detail.data == undefined) {
      this.shown = false;
     } 
     detail = detail.data[0];

     this.rejectionReason =  detail.reason;
     this.rejectionCommentsCopy = detail.comments
     
     if ((detail.comments && detail.comments.trim() != '') && (detail.reason && detail.reason.trim() != '')) {
      if (detail.comments.length > Config.constants.rejectCommentLength) {
        detail.comments = detail.comments.substring(
          0,
          Config.constants.rejectCommentLength
        );
      }
      let rejectObj = { comment: detail.comments };
      let rejectReason ={ comment: detail.reason}
      if (this.reject === true) {
        this.rejectionComments = JSON.stringify(rejectReason);
        this.rejectionReason = JSON.stringify(rejectObj);
        this.rejectionCommentsCopy = detail.comments;
      } else {
        if(this.type == 'routeRequest') {
            this.selectedRequest.rejectionComments =
            JSON.stringify(rejectObj);
            this.selectedRequest.rejectionReason =
            JSON.stringify(rejectReason);  
          this.selectedRequest.routeForm.rejectComment = detail.comments;
          this.selectedRequest.routeForm.rejectReason = detail.reason;
        } 
      }
      if (btn.action === 'reject') {
        if (this.reject === true) {
          if (!btn.canAddEmail) {
            this.prepareIncident(this.templatedata, btn);
          } else if (btn.canAddEmail) {
            this.setReportEmail(this.templatedata, btn);
          }
        } else {
          this.doCloseIncidentAction(btn);
        }
      } else {
        if(this.type == 'routeRequest') {
          this.prepareIncident(this.selectedRequest, btn);
        } else {
          this.prepareIncident(this.templatedata, btn);
        }
        
      }
    } else {
      this.shown = false;
      this.common.alertToast(
        this.reqService.translatedata('rejectCommentsValidation')
      );
      return false;
    }    
    });
    await popover.present();
    // console.log('onDidDismiss resolved with role', role);
  }
  getAssetDownTimeFromWorkFlowId(id) {
    let profile = JSON.parse(window.localStorage.getItem('Profile'));
    let WorkFlowCollectionRef = this.firestore
        .collection<any>("organization")
        .doc<any>(profile.tenantId)
        .collection<any>('workflow', (ref) => 
        ref.where('id', '==', parseInt(id))
        )
        WorkFlowCollectionRef.valueChanges().subscribe((res : any) => {
          if(res) {
           this.isAssetDownTimeTracking =  res[0]  && res[0]?.isAssetDownTimeTracking ? res[0]?.isAssetDownTimeTracking : false;
           this.isAssetTransfer =  res[0] && res[0]?.isAssetTransfer ? res[0]?.isAssetTransfer : false;
           this.slaTimeBreachInHours = res[0]?.templates[0]?.slaTimeBreachInHours;
          } 
        },async(err)=>{
          // this.isAssetDownTimeTracking =  false;
        })
  }

}
