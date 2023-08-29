import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network/ngx';
import { ToastController } from '@ionic/angular';
import { fromEvent } from 'rxjs';
// import 'rxjs/add/observable/fromEvent';
import { CommonProvider } from 'src/app/common/common';
import { Config } from '../../app/config';
import { Annotate, AWSImageUpload } from '../../app/data.model';
import { FirebaseProvider } from '../firebase/firebase';
import { ServiceProvider } from '../service/service';
import { TemplateProvider } from '../template/template';

@Injectable()
export class OfflineProvider {
  headers: HttpHeaders;
  opt: any = {};
  image_type: string = 'images/jpeg';
  annotations: Annotate[] = [];
  newRouteArr: any = [];
  draftRouteArr: any = [];
  draftAcknowledge: any = [];
  draftAckChk: any = [];
  draftCheckin: any = [];
  offlineRouteArr: any = [];
  newDraftArr: any = [];
  checkinFormIds: any = [];
  checkoutFormIds: any = [];
  failedDraftCheckin: any = [];
  failedAcknowledge: any = [];
  isValidContract: boolean = true;
  constructor(
    public toastCtrl: ToastController,
    public templateProvider: TemplateProvider,
    public network: Network,
    public reqService: ServiceProvider,
    public fbProvider: FirebaseProvider,
    public common: CommonProvider,
  ) {
    let online = fromEvent(document, 'online');
    online.subscribe(() => {
      this.prepareOfflineSubmission();
    });
  }

  async prepareOfflineSubmission() {
    this.common.isSyncStarted = true;
    this.headers = new HttpHeaders();
    let auth = localStorage.getItem('auth-token');
    this.headers.append('Authorization', auth);
    this.headers.append('Content-Type', 'application/json');
    this.opt = { headers: this.headers }
    this.fbProvider.getCount();
    this.draftCheckin = [];
    this.failedDraftCheckin = [];
    this.failedAcknowledge = [];
    this.draftAcknowledge = [];
    this.draftRouteArr = [];
    this.offlineRouteArr = [];
    // let locValue = JSON.parse(localStorage.getItem(Config.constants.routeDraftRequest));
      let locValue :any = await this.common.getStorageValue(Config.constants.routeDraftRequest);
      if (locValue && locValue.length) {
        this.draftRouteArr = locValue;
        this.offlineRouteArr = locValue;
      }
    let ackData = JSON.parse(localStorage.getItem(Config.constants.ackDraft));
      if (ackData) {
        this.draftAcknowledge = ackData;
        localStorage.setItem(Config.constants.ackDraft, JSON.stringify([]));
      }
      let checkInData = JSON.parse(localStorage.getItem(Config.constants.checkIn));
        if (checkInData && checkInData.length > 0) {
          this.draftCheckin = checkInData;
        }
        localStorage.setItem(Config.constants.checkIn, JSON.stringify([]));
        // let loc = JSON.parse(localStorage.getItem(Config.constants.routeDraftRequest));
          let loc:any = await this.common.getStorageValue(Config.constants.routeDraftRequest);
          if (loc && loc.length > 0) {
            this.draftRouteArr = loc;
            this.offlineRouteArr = loc;
          }
          this.startSubmission();



    // CREATE NEW REQUEST OFFLINE SYNC
    let locData = JSON.parse(window.localStorage.getItem(Config.constants.draftNewReqs));
    window.localStorage.setItem(Config.constants.draftNewReqs, JSON.stringify([]));
      if (locData && locData.length > 0) {
        let count = 0;
        let imgCount = 0;
        for (let draft of locData) {
          count++;
          if (draft.action == 'submit' || draft.action == 'closeIncident') {
            let isSubmit = true;
            draft.templateValue =
              draft.templateValue && typeof draft.templateValue === 'string'
                ? JSON.parse(draft.templateValue)
                : '';
            if (draft.templateValue) {
              let form = draft.templateValue.formSection;
              for (let incident of this.templateProvider.keys(form)) {
                for (let key of this.templateProvider.keys(form[incident])) {
                  if (
                    (form[incident][key].type == 'signatureOnly' &&
                      form[incident][key].value) ||
                    (form[incident][key].type == 'signaturewithSatisfactory' &&
                      form[incident][key].value)
                  ) {
                    if (form[incident][key].value.length > 100) {
                      imgCount++;
                      let uploadJson = new AWSImageUpload();
                      uploadJson.baseImage = form[incident][key].value;
                      this.reqService
                        .genericAwsPost(uploadJson)
                        .subscribe((status) => {
                          let uploadId;
                          imgCount--;
                          if (status) {
                            uploadId = status;
                            form[incident][key].value = uploadId;
                            form[incident][key].imgId = uploadId;
                            if (imgCount == 0) {
                              this.draftSubmit(draft);
                            }
                          }
                        },async (err)=>{
                          this.common.alertToast(err.status+"error in genericAwsPost.......")
                        })
                    }
                  }
                  if (form[incident][key].type == 'imageWithAnnotation' ||form[incident][key].type == 'images') {
                    for (let index in form[incident][key].images) {
                      if (form[incident][key].images[index].src.length > 100) {
                        imgCount++;
                        let uploadJson = new AWSImageUpload();
                        uploadJson.baseImage =
                          form[incident][key].images[index].src;
                        this.reqService
                          .genericAwsPost(uploadJson)
                          .subscribe((result) => {
                            let uploadId;
                            if (result.status) {
                              uploadId = result;
                              form[incident][key].images[index].src = uploadId;
                              form[incident][key].images[index].imgId =
                                uploadId;
                              imgCount--;
                            }
                            if (imgCount == 0) {
                              this.draftSubmit(draft);
                            }
                          },async (err)=>{
                            this.common.alertToast(err.status+"error in genericAwsPost.......")
                          })
                      }
                    }
                  }
                }
              }
            }
            if (imgCount == 0 && isSubmit) {
              this.draftSubmit(draft);
            }
          } else if (draft.action == 'saveAsDraft') {
            this.reqService
              .genericPost('mobileservice/draftRequest', draft)
              .subscribe(
                (resp) => {
                  if (resp) {
                  } else {
                    this.newDraftArr.push(draft);
                  }
                }
              )
          } else {
            this.newDraftArr.push(draft);
          }
          if (count >= locData.length && this.newDraftArr.length > 0) {
            window.localStorage.setItem(Config.constants.draftNewReqs, JSON.stringify(this.newDraftArr));
          }
        }
      }
  }

  async startSubmission() {
    let checkInCount = 0;
    if (this.draftAcknowledge && this.draftAcknowledge.length > 0) {
      for (let ack of this.draftAcknowledge) {
        this.reqService
          .genericPost('mobileservice/acknowledge', ack)
          .subscribe(
            (response) => {
              if (response) {
                if (this.draftCheckin && this.draftCheckin.length > 0) {
                  for (let checkInOfflineSync of this.draftCheckin) {
                    checkInCount++;
                    if (
                      checkInOfflineSync.requestHistoryId == ack.requestHistoryId
                    ) {
                      if (checkInOfflineSync.checkInType == 'GPS') {
                        this.checkInOfflineSync(
                          checkInOfflineSync,
                          checkInCount,
                          this.draftCheckin
                        );
                      } else if (checkInOfflineSync.checkInType == 'QRCode') {
                        this.checkInOfflineSync(
                          checkInOfflineSync,
                          checkInCount,
                          this.draftCheckin
                        );
                      } else if (
                        checkInOfflineSync.checkInType == 'Image Upload'
                      ) {
                        this.imageUploadOfflineSync(
                          checkInOfflineSync,
                          checkInCount,
                          this.draftCheckin
                        );
                      } else if (checkInOfflineSync.checkInType == 'bypass') {
                        this.checkInOfflineSync(
                          checkInOfflineSync,
                          checkInCount,
                          this.draftCheckin
                        );
                      }
                    }
                  }
                }
                for (let checkInOfflineSync of this.draftCheckin) {
                  let isExist = false;
                  for (let ack of this.draftAcknowledge) {
                    if (
                      checkInOfflineSync.requestHistoryId == ack.requestHistoryId
                    ) {
                      isExist = true;
                    }
                  }
                  if (!isExist) {
                    checkInCount++;
                    if (checkInOfflineSync.checkInType == 'GPS') {
                      this.checkInOfflineSync(
                        checkInOfflineSync,
                        checkInCount,
                        this.draftCheckin
                      );
                    } else if (checkInOfflineSync.checkInType == 'QRCode') {
                      this.checkInOfflineSync(
                        checkInOfflineSync,
                        checkInCount,
                        this.draftCheckin
                      );
                    } else if (checkInOfflineSync.checkInType == 'Image Upload') {
                      this.imageUploadOfflineSync(
                        checkInOfflineSync,
                        checkInCount,
                        this.draftCheckin
                      );
                    } else if (checkInOfflineSync.checkInType == 'bypass') {
                      this.checkInOfflineSync(
                        checkInOfflineSync,
                        checkInCount,
                        this.draftCheckin
                      );
                    }
                  }
                }

                if (this.draftRouteArr.length > 0) {
                  for (let formOfflineSync of this.draftRouteArr) {
                    let isPendingOnly = true;
                    for (let checkInOfflineSync of this.draftCheckin) {
                      if (
                        checkInOfflineSync.requestHistoryId ==
                        formOfflineSync.requestHistoryId
                      ) {
                        isPendingOnly = false;
                      }
                    }
                    if (
                      formOfflineSync.requestHistoryId == ack.requestHistoryId &&
                      isPendingOnly
                    ) {
                      this.formOfflineSyn(formOfflineSync.requestHistoryId);
                    }
                  }
                }
              } else {

              }
            },async (err) => {
              // this.common.stopLoading();
              if (err.error && err.error.length> 0) {
                let errResp = JSON.parse(err.error);
                this.common.alertToast(errResp.detail);
              } else {
                if (this.failedAcknowledge.indexOf(ack) == -1) {
                  this.failedAcknowledge.push(ack);
                  localStorage.setItem(Config.constants.ackDraft, JSON.stringify(this.failedAcknowledge));
                }
                this.common.alertToast(
                  this.reqService.translatedata('serverError')
                );
              }
            }
          )

      }
    } else if (this.draftCheckin && this.draftCheckin.length > 0) {
      for (let checkInOfflineSync of this.draftCheckin) {
        checkInCount++;
        if (checkInOfflineSync.checkInType == 'GPS') {
          this.checkInOfflineSync(
            checkInOfflineSync,
            checkInCount,
            this.draftCheckin
          );
        } else if (checkInOfflineSync.checkInType == 'QRCode') {
          this.checkInOfflineSync(
            checkInOfflineSync,
            checkInCount,
            this.draftCheckin
          );
        } else if (checkInOfflineSync.checkInType == 'Image Upload') {
          this.imageUploadOfflineSync(
            checkInOfflineSync,
            checkInCount,
            this.draftCheckin
          );
        } else if (checkInOfflineSync.checkInType == 'bypass') {
          this.checkInOfflineSync(
            checkInOfflineSync,
            checkInCount,
            this.draftCheckin
          );
        }
      }
      if (this.draftRouteArr.length > 0) {
        for (let formOfflineSync of this.draftRouteArr) {
          let isExist = false;
          for (let ack of this.draftAcknowledge) {
            if (formOfflineSync.requestHistoryId == ack.requestHistoryId) {
              isExist = true;
            }
          }
          for (let checkInOfflineSync of this.draftCheckin) {
            if (
              formOfflineSync.requestHistoryId ==
              checkInOfflineSync.requestHistoryId
            ) {
              isExist = true;
            }
          }
          if (!isExist) this.formOfflineSyn(formOfflineSync.requestHistoryId);
        }
      }
    } else {
      let saveAsDraftRecord = [];
      if (this.draftRouteArr.length > 0) {
        for (let formOfflineSync of this.draftRouteArr) {
          if (formOfflineSync.action != 'saveAsDraft') {
            let isExist = false;
            for (let ack of this.draftAcknowledge) {
              if (formOfflineSync.requestHistoryId == ack.requestHistoryId) {
                isExist = true;
              }
            }
            for (let checkInOfflineSync of this.draftCheckin) {
              if (
                formOfflineSync.requestHistoryId ==
                checkInOfflineSync.requestHistoryId
              ) {
                isExist = true;
              }
            }
            if (!isExist) this.formOfflineSyn(formOfflineSync.requestHistoryId);
          } else if (formOfflineSync.action == 'saveAsDraft') {
            saveAsDraftRecord.push(formOfflineSync);
          }
        }
      }
      window.localStorage.setItem('offlineRequetsIds',JSON.stringify([]));
      await this.common.setStorageValue(Config.constants.routeDraftRequest,[]);
      await this.common.setStorageValue(Config.constants.routeDraftRequest,saveAsDraftRecord);
      // localStorage.setItem(Config.constants.routeDraftRequest, JSON.stringify([]));
      // localStorage.setItem(Config.constants.routeDraftRequest, JSON.stringify(saveAsDraftRecord));
    }
  }

  draftSubmit(draft) {
    try {
      draft.templateValue =
        typeof draft.templateValue != 'string'
          ? JSON.stringify(draft.templateValue)
          : draft.templateValue;
      this.reqService
        .createRequest(draft)
        .subscribe(
          (resp) => {
            // this.common.stopLoading();
            if (resp) {
              this.common.alertToast('Offline Sync Completed');
              if (draft.id) {
                this.reqService
                  .genericDelete('mobileservice/draftRequest', draft.id)
                  .subscribe((resp) => {
                    console.log(resp);
                  },async (err)=>{
                    console.log(err)
                  })
              }
            } else {
              this.newDraftArr.push(draft);
            }
          },async (err)=>{
            // this.common.stopLoading();
            this.common.alertToast(err.status+"error please try again.......")
          }
        )
    } catch (error) {
      console.error(error);
    }
  }

  async imageUploadOfflineSync(checkInParams, imageCount, checkInData) {
    let newImageArr = [];
    let isCheckout = checkInParams.checkInDetail ? false : true;
    // var imageData = JSON.parse(localStorage.getItem('Config.constants.imageUpload'));
    let imageData:any = this.common.getStorageValue(Config.constants.imageUpload);
      if (imageData && imageData.length > 0) {
        let imageUploadCount = 0;
        for (let imageUploadOfflineSync of imageData) {
          imageUploadCount++;
          if (
            imageUploadOfflineSync.requestId == checkInParams.requestHistoryId
          ) {
            this.reqService
              .genericAwsPost(imageUploadOfflineSync)
              .subscribe((status) => {
                let uploadId;
                if (status) {
                  uploadId = status;
                  if (isCheckout) {
                    checkInParams.checkOutDetail = JSON.stringify({
                      value: uploadId,
                    });
                  } else {
                    checkInParams.checkInDetail = JSON.stringify({
                      value: uploadId,
                    });
                  }
                  this.checkInOfflineSync(
                    checkInParams,
                    imageCount,
                    checkInData
                  );
                } else {
                  newImageArr.push(imageUploadOfflineSync);
                }
              },async (err)=>{
                this.common.alertToast(err.status+"error in genericAwsPost.......")
              })
          }
        }
        if (imageUploadCount >= imageData.length && newImageArr.length > 0) {
          // localStorage.setItem(Config.constants.imageUpload, JSON.stringify(newImageArr));
          await this.common.setStorageValue(Config.constants.imageUpload,newImageArr);
        }
        // this.spliceDraft(Config.constants.imageUpload, checkInParams);
        this.spliceDraftIndex(Config.constants.imageUpload, checkInParams);
      }
  }

  checkInOfflineSync(checkInParams, checkInCount, checkInData) {
    let restUrl = 'mobileservice/checkin';
    if (checkInParams) {
      let isCheckout = false;
      for (let index of checkInData) {
        if (
          index.requestHistoryId == checkInParams.requestHistoryId &&
          index.checkOutDetail
        ) {
          isCheckout = true;
        }
      }
      if (
        checkInParams.checkInDetail ||
        checkInParams.checkInType == 'bypass'
      ) {
        this.checkinFormIds.push(checkInParams.requestHistoryId);
      } else if (checkInParams.checkOutDetail) {
        this.checkoutFormIds.push(checkInParams.requestHistoryId);
        restUrl = 'mobileservice/checkout';
      }
      this.reqService
        .genericPost(restUrl, checkInParams)
        .subscribe(
          (checkInResponse) => {
            if (checkInResponse) {
              if (!isCheckout || checkInParams.checkOutDetail)
                this.formOfflineSyn(checkInParams.requestHistoryId);
            }
            if (
              checkInCount >= checkInData.length &&
              this.draftRouteArr.length > 0
            ) {
              for (let form of this.draftRouteArr) {
                if (
                  this.checkinFormIds.indexOf(form.requestHistoryId) == -1 &&
                  this.checkoutFormIds.indexOf(form.requestHistoryId) == -1
                ) {
                  this.formOfflineSyn(form.requestHistoryId);
                }
                //  else if (this.checkoutFormIds.indexOf(form.requestHistoryId) == -1 && checkInParams.checkOutDetail) {
                // 	this.formOfflineSync(form.requestHistoryId);
                // }
              }
            }
          },async (err)=>{
            // this.common.stopLoading();
            if (err._body && err._body.length > 0) {
              let errResp = JSON.parse(err._body || '{}');
              this.common.alertToast(
                errResp.detail +
                  ' for request id:' +
                  checkInParams.requestHistoryId
              );
              if (!isCheckout || checkInParams.checkOutDetail)
                this.formOfflineSyn(checkInParams.requestHistoryId);
            } else {
              if (this.failedDraftCheckin.indexOf(checkInParams) == -1) {
                this.failedDraftCheckin.push(checkInParams);
                localStorage.setItem(Config.constants.checkIn, JSON.stringify(this.failedDraftCheckin));
              }
              this.common.alertToast(
                this.reqService.translatedata('serverError')
              );
            }
          }
        )
      // if(checkInCount >= checkInData.length && newCheckInArr.length > 0){
      // 	this.storage.set(Config.constants.checkIn, newCheckInArr);
      // }
      this.spliceDraft(Config.constants.checkIn, checkInParams);
    }
  }

  async formOfflineSyn(requestHistoryId) {
    let locData = [...this.draftRouteArr];
    let offlineRouteArr = [];
    if (locData && locData.length > 0) {
      let imgCount = 0;
      for (let formOfflineSync of locData) {
        formOfflineSync.allForms = [];
        if (
          formOfflineSync.action != 'saveAsDraft' &&
          formOfflineSync.requestHistoryId == requestHistoryId
        ) {
          let form = formOfflineSync.routeForm.formSection;
          for (let incident of this.templateProvider.keys(form)) {
            for (let key of this.templateProvider.keys(form[incident])) {
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
                  this.reqService.genericAwsPost(uploadJson)
                  .subscribe((status) => {
                    let uploadId;
                    imgCount--;
                    if (status) {
                      uploadId = status;
                      form[incident][key].value = uploadId;
                      form[incident][key].imgId = uploadId;
                      if (imgCount == 0) {
                        this.formSubmit(formOfflineSync);
                      }
                    } else {
                      this.newRouteArr.push(formOfflineSync);
                    }
                  },async (err)=>{
                    this.common.alertToast(err.status+"error in genericAwsPost.......")
                  })
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
                    uploadJson.baseImage =
                      form[incident][key].images[index].src;
                    this.reqService
                      .genericAwsPost(uploadJson)
                      .subscribe((result) => {
                        let uploadId;
                        if (result) {
                          uploadId = result;
                          form[incident][key].images[index].src = uploadId;
                          form[incident][key].images[index].imgId = uploadId;
                          imgCount--;
                        } else {
                          this.newRouteArr.push(formOfflineSync);
                        }
                        if (imgCount == 0) {
                          this.formSubmit(formOfflineSync);
                        }
                      },async (err)=>{
                        this.common.alertToast(err.status+"error in genericAwsPost.......")
                      })
                  }
                }
              }
            }
          }
          if (imgCount == 0) {
            this.formSubmit(formOfflineSync);
          }
        } else if (formOfflineSync.action == 'saveAsDraft') {
          offlineRouteArr.push(formOfflineSync);
          // localStorage.setItem(Config.constants.routeDraftRequest, JSON.stringify(this.offlineRouteArr));
          await this.common.setStorageValue(Config.constants.routeDraftRequest,this.offlineRouteArr);
          
        }
      }
    }
  }

  formSubmit(formOfflineSync) {
    let routeUrl = 'mobileservice/routeRequest';
    // this.common.displayLoading();
    this.reqService.genericPut(routeUrl, formOfflineSync)
    .subscribe(async (resp) => {
      let respBody = resp._body ? JSON.parse(resp._body) : resp;
      let alertMsg =
        formOfflineSync.action == 'closeIncident'
          ? 'Request closed successfully.'
          : formOfflineSync.action == 'reject'
          ? 'Request Rejected Successfully.'
          : 'Offline Sync Completed.';
      if (resp) {
        this.common.alertToast(alertMsg);
        this.offlineRouteArr.splice(
          this.offlineRouteArr.indexOf(formOfflineSync),
          1
        );
        this.draftRouteArr.splice(
          this.draftRouteArr.indexOf(formOfflineSync),
          1
        );
        // localStorage.setItem(Config.constants.routeDraftRequest, JSON.stringify(this.offlineRouteArr));
        await this.common.setStorageValue(Config.constants.routeDraftRequest,this.offlineRouteArr);
        return;
      }
    },async (err) => {
      this.offlineRouteArr.push(formOfflineSync);
      // window.localStorage.setItem(Config.constants.routeDraftRequest, JSON.stringify(this.offlineRouteArr));
      await this.common.setStorageValue(Config.constants.routeDraftRequest,this.offlineRouteArr);
      // this.common.alertToast(err.detail);
      if (
        err.message == 'No valid contract found.' ||
        err.status == 400
      ) {
        formOfflineSync.action = 'saveAsDraft';
        this.isValidContract = false;
        this.common.alertToast(
          err.message + ' for request id ' + formOfflineSync.requestHistoryId
        );
        this.offlineRouteArr.push(formOfflineSync);
        // localStorage.setItem(Config.constants.routeDraftRequest, JSON.stringify(this.offlineRouteArr));
        await this.common.setStorageValue(Config.constants.routeDraftRequest,this.offlineRouteArr);
      } else if (err.status == 409) {
        this.common.alertToast(
          err.message + 'for request id ' + formOfflineSync.requestHistoryId
        );
      }else if(err.status == 500) {
        this.common.alertToast(err.message);
      }
      return;
    })
  }

  spliceDraft(draftName, draftData) {
    let spliceDraft = JSON.parse(localStorage.getItem(draftName));
      if (spliceDraft && spliceDraft.length > 0) {
        spliceDraft.splice(spliceDraft.indexOf(draftData), 1);
        localStorage.setItem(draftName, JSON.stringify(spliceDraft))
      } else {
        localStorage.setItem(draftName, JSON.stringify([]));
      }
  }
  async spliceDraftIndex(draftName, draftData) {
    let spliceDraft:any = await this.common.getStorageValue(draftName);
      if (spliceDraft && spliceDraft.length > 0) {
        spliceDraft.splice(spliceDraft.indexOf(draftData), 1);
        await this.common.setStorageValue(draftName,spliceDraft);
      } else {
        await this.common.setStorageValue(draftName,[]);
      }
  }
}
