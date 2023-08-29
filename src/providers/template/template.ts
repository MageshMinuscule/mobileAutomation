import { HttpClient } from "@angular/common/http";
import { Injectable, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { Camera } from "@ionic-native/camera/ngx";
import { IonRouterOutlet, ModalController, NavController, Platform } from "@ionic/angular";
import { OverlayEventDetail } from "@ionic/core";
import { Subscription } from "rxjs";
import { CommonProvider } from "src/app/common/common";
import { SignaturepadPage } from "src/app/signaturepad/signaturepad.page";
import { Config } from "../../app/config";
import { GetAwsImage } from "../../app/data.model";
import { Events } from "../events/events";
import { ServiceProvider } from "../service/service";

@Injectable()
export class TemplateProvider {
  @ViewChild(IonRouterOutlet) routerOutlet: IonRouterOutlet;
  selectedCheckList: any = [];
  datePicker: any[any];
  imageSrc: any;
  imageJsonList: any = [];
  isFormValid: any;
  subscription: Subscription;
  constructor(
    public http: HttpClient,
    private common: CommonProvider,
    public events: Events,
    public reqService: ServiceProvider,
    public platform: Platform,
    public modalCtrl: ModalController,
    public camera: Camera,
    public router: Router,
    private navCtrl: NavController
  ) {
    let locData = JSON.parse(localStorage.getItem(Config.constants.imgJson));
    if (locData != null) {
      this.imageJsonList = locData;
    }
  }

  validateCheckBox(source: string, key: string) {
    if (null != source && undefined != source) {
      return source.indexOf(key) > -1;
    }
    return false;
  }

  validateInput(event, incident) {
    event.target.value = event.target.value
      ? event.target.value.trimStart()
      : event.target.value;
    incident.value = event.target.value;
  }

  keys(obj) {
    return Object.keys(obj);
  }

  selectEmoji(emoji, incident) {
    incident.value = emoji;
  }

  async presentSignModal(incident) {
    let annotateModal = await this.modalCtrl.create({
      component: SignaturepadPage,
      componentProps: {
        requestType: 'newRequest',
        value: incident.value,
      },
    });
    (await annotateModal).onDidDismiss().then((detail: OverlayEventDetail) => {
      let data = detail.data;
      if (data) {
        incident.value = data.imageSrc;
        incident.imgId = data.imgId;
      }
    });
    annotateModal.present();
  }

  getOnlineSignImg(incident) {
    if (navigator.onLine) {
      let getImage = new GetAwsImage();
      getImage.key = incident.value;
      this.reqService
        .genericAWSImageGetOne(getImage, 'thumbnail')
        .then((imageData) => {
          if (null != imageData) {
            this.imageJsonList.push(imageData);
            localStorage.setItem(Config.constants.imgJson, JSON.stringify(this.imageJsonList))
            if (imageData.imageBlob != null && imageData.imageBlob != '') {
              incident.value = imageData.imageBlob;
            }
          }
        });
    } else {
      this.common.alertToast(
        this.reqService.translatedata('networkConnectivityError')
      );
    }
  }

  async createRequest(newRequest) {
    this.common.displayLoading();
    const draftId = newRequest.id;
    newRequest.id = null;
    await this.common.setStorageValue(Config.constants.routeDraftRequest, newRequest);
    let data = await this.common.getStorageValue(Config.constants.routeDraftRequest);
    console.log('offline', data);

    this.reqService.createRequest(newRequest).subscribe(
      (reqResp) => {
        setTimeout(() => {
          this.common.stopLoading();
        }, 0);
        if (reqResp) {
          let alertMsg =
            newRequest.action == 'closeIncident'
              ? this.reqService.translatedata('requestClosedSuccessfully')
              : this.reqService.translatedata('requestsubmitSuccessfully');
          let asset = localStorage.getItem('assetDetails')
            ? JSON.parse(localStorage.getItem('assetDetails'))
            : '';
          localStorage.removeItem('assetDetails');
          this.updateLabourAndParts(reqResp);
          this.common.alertToast(alertMsg);
          if (draftId) {
            this.deleteDraftRequest(draftId);
          } else {
            this.events.publish('goto:Home', { time: Date.now() });
          }
          this.router.navigate(['/home']);
        } else {
          this.common.alertToast('requestNOtSubmitted');
        }

        this.router.navigate(['/home']);
      },
      async (err) => {
        window.localStorage.setItem('partsList',JSON.stringify([]));
        window.localStorage.setItem('labourTaskList',JSON.stringify([]));
        setTimeout(() => {
          this.common.stopLoading();
        }, 0);
        let respBody = err.error ? err.error : err;
          if (respBody.detail == 'Already closed.') {
            this.common.alertToast(respBody.detail);
          }
          else if(respBody.detail == 'I/O exception.') {
            this.common.alertToast("Problem for converting a data to this request, please contact your administrator");
          }else if(respBody.detail == 'No user found to assign the request') {
            this.common.alertToast(respBody.detail + ", please contact your administrator");
          }
          else {
            let msg = respBody.detail
            ? respBody.detail
            : this.reqService.translatedata('requestNOtSubmitted');
            this.common.alertToast(msg+" plaese contact your administrator");
          }

        this.events.publish('goto:Home', { time: Date.now() });
        this.router.navigate(['/home']);
      }
    );
  }
  updateLabourAndParts(resp: any) {
    if (resp) {
      let parts = JSON.parse(localStorage.getItem('partsList'));
      let labour = JSON.parse(localStorage.getItem('labourTaskList'));
      if (parts && parts.length > 0) {
        for (let i = 0; i < parts.length; i++) {
          parts[i].request_id = resp.id;
          parts[i].requestId = resp.id;
          parts[i].requestLocationId = resp.locationId;

          this.reqService.updateParts([parts[i]]).subscribe(
            (resp) => {
              if (resp) {
                localStorage.setItem('partsList', JSON.stringify([]));
              }
            },
            (err) => {
              localStorage.setItem('partsList', JSON.stringify([]));
              console.log('error while creating parts');
            }
          );
        }
      }
      if (labour && labour.length > 0) {
        for (let i = 0; i < labour.length; i++) {
          labour[i].requestId = resp.id;
          labour[i].requestLocationId = resp.locationId;
          labour[i].locationId = resp.locationId;
          this.reqService.createLabourTask(labour[i]).subscribe(
            (resp) => {
              if (resp) {
                localStorage.setItem('labourTaskList', JSON.stringify([]));
              }
            },
            (err) => {
              localStorage.setItem('labourTaskList', JSON.stringify([]));
              console.log('error while creating labour');
            }
          );
        }
      }
    }
  }

  draftSubmit(request) {
    request.active = true;
    this.common.displayLoading();
    this.reqService
      .genericPost('mobileservice/draftRequest', request)
      .subscribe(
        (resp) => {
          setTimeout(() => {
            this.common.stopLoading();
          }, 0);
          if (resp) {
            this.deleteOfflineDraft(request);
            this.common.alertToast(
              this.reqService.translatedata('requestSavedDraft')
            );
            this.router.navigate(['/home'], {replaceUrl:true});
            this.events.publish('goto:Home', { time: Date.now() });
          }
        },
        async (err) => {
          setTimeout(() => {
            this.common.stopLoading();
          }, 0);
          if (err.error && null != err.error) {
            let respBody = err.error;
            if(err.status == 409) {
              this.common.alertToast(err.message);
            }else {
              this.common.alertToast(respBody.detail);
            }
            
            this.router.navigate(['/home']);
          } else {
            this.common.alertToast(
              this.reqService.translatedata('internalServerError')
            );
            this.router.navigate(['/home']);
          }
        }
      );
  }

  // ROUTE DRAFT DELETE ON ONLINE DRAFT SAVE
  async deleteOfflineDraft(request) {
    let refreshedDraftList = [];
    // let data = JSON.parse(
    //   localStorage.getItem(Config.constants.routeDraftRequest)
    // );
    let data:any = await this.common.getStorageValue(Config.constants.routeDraftRequest);
    if (null != data) {
      for (let inc of data) {
        if (inc.id != request.id) {
          refreshedDraftList.push(inc);
        }
      }
    }
    // this.common.alertToast('please switch ON mobile data :)');
    // refreshedDraftList
    // localStorage.setItem(
    //   Config.constants.routeDraftRequest,
    //   JSON.stringify(refreshedDraftList)
    // );
    await this.common.setStorageValue(Config.constants.routeDraftRequest,refreshedDraftList);
  }

  routeDraftSubmit(request,requestTimer?,msg?) {
    let account = JSON.parse(localStorage.getItem('account'));
    request.allForms = [];
    this.common.displayLoading();
    this.reqService
      .genericPut('mobileservice/route/draftRequest', request)
      .subscribe(
        (resp) => {
          this.common.stopLoading();
          if(account.pauseAndPlayTimer == true){
            requestTimer.status = 'Paused';
            requestTimer.isPauseExistingRequests = false;
            requestTimer.requestKey = null;
            requestTimer.creationDate = null;
            requestTimer.updationDate = null;
            this.reqService.updateRequestTimer(requestTimer).subscribe(res=>{},error=>{})
          }
          if (resp) {
            this.deleteOfflineDraft(request);
            if(requestTimer?.requestId){
              this.common.alertToast(`Request Paused Successfully`);
            }else {
              this.common.alertToast(
                this.reqService.translatedata('requestSavedDraft')
              );
            }

            localStorage.setItem('assetDetails', JSON.stringify(''));
            this.router.navigate(['/home'],{replaceUrl:true});
            this.events.publish('goto:Home', { time: Date.now() });
          } else if (resp.error && null != resp.error) {
            let respBody = JSON.parse(resp.error);
            this.common.alertToast(respBody.detail);
          }
        },
        async (err) => {
          this.common.stopLoading();
          if (err.status == 401) {
            this.common.alertToast(
              this.reqService.translatedata('internalServerError')
            );
            this.events.publish('user:inactive', {
              err: err.status,
              time: Date.now(),
            });
          }else if(err.error.detail == 'Current History Form is Duplicate') {
            let msg = 'Current form already routed by another user'
            this.common.alertToast(msg);
          }
          this.router.navigate(['/home'],{replaceUrl:true});
        }
      );
  }
  async isValidAsset(request, button?) {
    if(request.requestType === 'SCHEDULE_REQUEST') {
      return true;
    }
    let data = JSON.parse(localStorage.getItem('assetDetails'));
    if (!navigator.onLine && (data != " " && data != null && data != undefined)) {
      let asset = JSON.parse(localStorage.getItem('assetDetails'));
      console.log('first fail sec valid enter' + asset);
      if (
        asset &&
        asset.requestId == request.requestId &&
        asset.id == request.assetId &&
        asset.slno &&
        asset.model &&
        asset.code &&
        asset.name
      ) {
        console.log('sec valid success' + asset);
        return true;
      }else if(request.assetId){
        let val;
        val = await this.validateAsset(request);
        if (val) {
          return true;
        }else {
          return false;
        }
      }else {
        return false;
      }
    }
    if (request.assetId) {
      let val;
      val = await this.validateAsset(request);
      if (val) {
        console.log('First validation successFull');
        return true;
      } else {
        if (!navigator.onLine && localStorage.getItem('assetDetails')) {
          let asset = JSON.parse(localStorage.getItem('assetDetails'));
          console.log('first fail sec valid enter' + asset);
          if (
            asset &&
            asset.id == request.assetId &&
            asset.assetSerialNo &&
            asset.modelName &&
            asset.modelCode &&
            asset.name
          ) {
            console.log('sec valid success' + asset);
            return true;
          }
        } else {
          console.log('all valid fails in first codition');
          return false;
        }
      }
    } else {
      console.log('all valid fails in first codition enter into sec condition');
      if (this.common.getWorkFlowType() == 'asset') {
        if (button && button.action == 'pending') {
          return true;
        }
        if (localStorage.getItem('assetDetails')) {
          let asset = JSON.parse(localStorage.getItem('assetDetails'));
          if (
            asset &&
            asset.requestId == request.requestId &&
            asset.assetSerialNo &&
            asset.modelName &&
            asset.modelCode &&
            asset.name
          ) {
            console.log('first valid success' + asset);
            return true;
          }
        } else {
          return false;
        }
      } else {
        return true;
      }
    }
  }

  //validate asset
  async validateAsset(request) {
    let isValid = false;
    let serviceCalled = false;
    if(navigator.onLine) {
      if (request) {
        const res = await this.reqService.getassetId(request.assetId);
        if (res && res.id) {
          return true;
        } else {
          return false;
        }
      }
    }else {
      let AssetLists = JSON.parse(window.localStorage.getItem('AssetLists'));
      let val = AssetLists.some(item => item.id == request.assetId);
      console.log("val :",val)
      return val
    }

  }
  // async validateAsset(request) {
  //   let isValid = false;
  //   // console.log("enter into common page validate")
  //   let serviceCalled = false;
  //   if(request) {
  //   await this.reqService.getassetId(request.assetId).subscribe( (res)=> {
  //     if(res) {
  //       console.log('called once ' + res);
  //       isValid = true;
  //       serviceCalled = true;
  //        return isValid;
  //     }
  //   },async(error)=>{
  //     isValid = false;
  //     if (!isValid && localStorage.getItem('assetDetails')) {

  //       let asset = JSON.parse(localStorage.getItem('assetDetails'));
  //       // console.log("get asset details "+ asset + "request"+request.id)
  //       if (
  //         asset &&
  //         asset.requestId == request.requestId &&
  //         asset.assetSerialNo &&
  //         asset.modelName &&
  //         asset.modelCode &&
  //         asset.name
  //       ) {
  //         isValid = true;
  //         serviceCalled = true;
  //       }
  //       return isValid;
  //     }
  //   })
  //  }
  //   else {
  //    setTimeout(() => {
  //     return isValid;
  //    }, 1000);

  //   }

  // }

  // async isValidAsset(request, button?) {
  //   if (request.assetId) {
  //     let val;
  //     val=  await this.validateAsset(request);
  //     if (val == true) {
  //       console.log("First validation successFull");
  //       return true;
  //     } else {
  //       if (!navigator.onLine && localStorage.getItem('assetDetails')) {
  //         let asset = JSON.parse(localStorage.getItem('assetDetails'));
  //         console.log("first fail sec valid enter" + asset)
  //         if (
  //           asset &&
  //           asset.id == request.assetId &&
  //           asset.assetSerialNo &&
  //           asset.modelName &&
  //           asset.modelCode &&
  //           asset.name
  //         ) {
  //           console.log("sec valid success" + asset);
  //           return true;
  //         }
  //       } else {
  //         console.log("all valid fails in first codition" );
  //         return false;
  //       }
  //     }
  //   } else {
  //     console.log("all valid fails in first codition enter into sec condition" );
  //     if (this.common.getWorkFlowType() == 'asset') {
  //       if(button && button.action == 'pending') {
  //         return true;
  //       }
  //       if (localStorage.getItem('assetDetails')) {
  //         let asset = JSON.parse(localStorage.getItem('assetDetails'));
  //         if (
  //           asset &&
  //           asset.requestId == request.requestId &&
  //           asset.assetSerialNo &&
  //           asset.modelName &&
  //           asset.modelCode &&
  //           asset.name
  //         ) {
  //           console.log("first valid success" + asset);
  //           return true;
  //         }
  //       } else {
  //         return false;
  //       }
  //     } else {
  //       return true;
  //     }
  //    }
  // }

  getToastMsg(action) {
    let toastMsg = '';
    if (action == 'submit') {
      toastMsg = this.reqService.translatedata('routeSuccess');
    } else if (action == 'reject') {
      toastMsg = this.reqService.translatedata('requestRejectSucess');
    } else if (action == 'closeIncident') {
      toastMsg = this.reqService.translatedata('requestClosedSuccessfully');
    } else {
      toastMsg = this.reqService.translatedata('routeSuccess');
    }
    return toastMsg;
  }

  saveRequest(selectedRequest, requestTimer?) {
    let account = JSON.parse(localStorage.getItem('account'));
    this.common.displayLoading();
    this.subscription = this.reqService
      .genericPut('mobileservice/routeRequest', selectedRequest)
      .subscribe(
        async (resp) => {
          setTimeout(() => {
            this.common.stopLoading();
          }, 0);
          if(account.pauseAndPlayTimer == true){
            requestTimer.status = 'Closed';
            requestTimer.creationDate = null;
            requestTimer.updationDate = null;
            requestTimer.isPauseExistingRequests = false;
            requestTimer.requestKey = null;
            this.reqService.updateRequestTimer(requestTimer).subscribe(res=>{},error=>{})
          }
          let asset = localStorage.getItem('assetDetails')
            ? JSON.parse(localStorage.getItem('assetDetails'))
            : '';
          if (asset && selectedRequest.assetId == asset.id) {
            localStorage.removeItem('assetDetails');
            let AssetRemove = localStorage.setItem(
              'assetDetails',
              JSON.stringify('')
            );
            console.log('' + AssetRemove);
          }
          let toastMessage = this.getToastMsg(selectedRequest.action);
          if (resp) {
            // let drafts = JSON.parse(localStorage.getItem(Config.constants.routeDraftRequest));
            let drafts:any = await this.common.getStorageValue(Config.constants.routeDraftRequest);
            if (drafts && drafts.length) {
              let newDrafts: any = [];
              for (let draft of drafts) {
                if (draft.id != selectedRequest.id) {
                  newDrafts.push(draft);
                }
              }
              // newDrafts
              // localStorage.setItem(
              //   Config.constants.routeDraftRequest,
              //   JSON.stringify(newDrafts)
              // );
              await this.common.setStorageValue(Config.constants.routeDraftRequest, newDrafts);
            }
            this.common.alertToast(toastMessage);

            this.router.navigate(['/home']);
          }
        },
        async (err) => {
          setTimeout(() => {
            this.common.stopLoading();
          }, 0);
          
          if (err.error && null != err.error) {
            let error =
              typeof err.message == 'string'
                ? err.error.detail
                : {
                  detail: err && err.error && err.error.detail,
                  type: 'error',
                };
            if (
              error == 'Already closed.' ||
              error?.detail == 'Already closed.'
            ) {
              this.common.alertToast(error);
            } else if (
              error == 'I/O exception.' ||
              error?.detail == 'I/O exception.'
            ) {
              this.common.alertToast(
                'Problem for converting a data to this request, please contact your administrator'
              );
            } else if (
              error?.detail == 'No user found to assign the request' ||
              error == 'No user found to assign the request'
            ) {
              this.common.alertToast(
                error + ', please contact your administrator'
              );
            } else if (
              error?.detail == 'Current History Form is Duplicate' ||
              error == 'Current History Form is Duplicate'
            ) {
              let msg = 'Current form already routed by another user'
              this.common.alertToast(msg);
            }else if(err.status == 400) {
              this.common.alertToast(error);
            } else {
              this.common.alertToast(error);
              if (err.status == 500) {
                this.common.alertToast(
                  error + ' please try again after some time...'
                );
              } else if (err?.detail == "Server can't be reached") {
                selectedRequest.action = 'saveAsDraft';
                this.routeSaveAsDraft(selectedRequest);
                return;
              }
            }
          } else {
            this.common.alertToast(
              err.message + ' please contact your administrator'
            );
          }
          this.subscription.unsubscribe();
   
          this.router.navigate(['/home'],{replaceUrl:true});
        }
      );
  }

  async routeSaveAsDraft(selectedRequest) {
    let ids = [];
    let draftList = [];
    // window.localStorage.setItem('draftRequest',JSON.stringify(selectedRequest));
    selectedRequest.routeFormString = JSON.stringify(selectedRequest.routeForm);
    selectedRequest.active = true;
    draftList.push(selectedRequest);
    // let data = JSON.parse(
    //   localStorage.getItem(Config.constants.routeDraftRequest)
    // );
    let data:any = await this.common.getStorageValue(Config.constants.routeDraftRequest);
    if (null != data && data.length) {
      for (let inc of data) {
        if (inc.id == selectedRequest.id) {
        } else {
          draftList.push(inc);
        }
      }
    }
    // window.localStorage.setItem(
    //   Config.constants.routeDraftRequest,
    //   JSON.stringify(draftList)
    // );
    await this.common.setStorageValue(Config.constants.routeDraftRequest, draftList);
    let id = [JSON.parse(window.localStorage.getItem('offlineRequetsIds'))];
    if(id  != null && id?.length != 0) {
      ids = [...id, ...[selectedRequest.requestId]];
    }else {
      ids = [...[selectedRequest.requestId]];
    }
    window.localStorage.setItem('offlineRequetsIds',JSON.stringify([...ids]));
    window.localStorage.setItem('assetDetails',JSON.stringify(''));
    let msg =
      selectedRequest.action != 'saveAsDraft'
        ? this.reqService.translatedata('requestSync')
        : this.reqService.translatedata('savedDraft');
    this.common.alertToast(msg);
    alert(msg);
    this.removeLastStack();
    this.router.navigate(['home'],{replaceUrl:true});
    
  }
  removeLastStack() {
    // Get the current URL
    const currentUrl = this.router.url;
  
    // Split the URL into segments
    const urlSegments = currentUrl.split('/');
    console.log('urlSegments',urlSegments)
    // Remove the last segment (view) from the URL
    urlSegments.pop();
  
    // Join the URL segments back into a new URL
    const newUrl = urlSegments.join('/');
    console.log('newUrl',newUrl)
  
    // Navigate to the new URL, effectively removing the last navigation stack
    // this.router.navigateByUrl(newUrl);
  }

  validateForm(form) {
    console.log('iam',form)
    for (let incident of this.keys(form)) {
      for (let key of this.keys(form[incident])) {
        if (
          form[incident][key].type == 'textInput' &&
          form[incident][key].compulsory
        ) {
          if (form[incident][key].value.trim() == '')
            return this.isValidField(form[incident][key]);
        }
        if (
          form[incident][key].type == 'audit' &&
          form[incident][key].compulsory 
        ) {
          let type = typeof form[incident][key].value;
          console.log('audit',type)
          if (form[incident][key].value.trim() == '')
            return this.isValidField(form[incident][key]);
        }
        if (
          form[incident][key].type == 'link' &&
          form[incident][key].compulsory
        ) {
          if (form[incident][key].value.trim() == '')
            return this.isValidField(form[incident][key]);
        }
        if (
          form[incident][key].type == 'auditPF' &&
          form[incident][key].compulsory
        ) {
          if (form[incident][key].value.trim() == '')
            return this.isValidField(form[incident][key]);
        }
        if (
          form[incident][key].type == 'textArea' &&
          form[incident][key].compulsory
        ) {
          if (form[incident][key].value.trim() == '')
            return this.isValidField(form[incident][key]);
        }
        if (
          form[incident][key].type == 'radioButton' &&
          form[incident][key].compulsory
        ) {
          if (form[incident][key].value.trim() == '')
            return this.isValidField(form[incident][key]);
        }
        if (
          form[incident][key].type == 'dropDown' &&
          form[incident][key].compulsory
        ) {
          if (form[incident][key].value.trim() == '')
            return this.isValidField(form[incident][key]);
        }
        if (
          form[incident][key].type == 'numeric' &&
          form[incident][key].compulsory
        ) {
          if (typeof form[incident][key].value !== 'number')
            return this.isValidField(form[incident][key]);
        }
        if (
          (form[incident][key].type == 'dateTime' || form[incident][key].type == 'date') &&
          form[incident][key].compulsory
        ) {
          if (form[incident][key].value.trim() == '')
            return this.isValidField(form[incident][key]);
        }
        if (
          form[incident][key].type == 'table' &&
          form[incident][key].compulsory
        ) {
          if (
            !form[incident][key].options ||
            (form[incident][key].options && !form[incident][key].options.length)
          ) {
            this.common.alertToast(
              this.reqService.translatedata('pleaseFill') +
                ' ' +
                form[incident][key].label
            );
            return false;
          } else {
            for (let option of form[incident][key].options) {
              for (let index of this.keys(option)) {
                if (!option[index]) {
                  this.common.alertToast(
                    this.reqService.translatedata('pleaseFill') +
                      ' ' +
                      index +
                      ' in ' +
                      form[incident][key].label
                  );
                  return false;
                }
              }
            }
          }
        }
        if (
          (form[incident][key].type == 'imageWithAnnotation' || form[incident][key].type == 'images') &&
          form[incident][key].compulsory
        ) {
          if (
            form[incident][key].images &&
            !form[incident][key].images.length
          ) {
            this.common.alertToast(
              this.reqService.translatedata('pleaseFill') +
                ' ' +
                form[incident][key].label
            );
            return false;
          }
        }
        if (
          form[incident][key].type == 'checkBox' ||
          form[incident][key].type == 'video' ||
          form[incident][key].type == 'satisfactoryOnly' ||
          form[incident][key].type == 'signatureOnly' ||
          form[incident][key].type == 'signaturewithSatisfactory'
        ) {
          if (form[incident][key].compulsory) {
            if (
              !(
                form[incident][key].value &&
                form[incident][key].value.length > 0
              ) ||
              form[incident][key].value == ','
            ) {
              this.common.alertToast(
                this.reqService.translatedata('pleaseFill') +
                  ' ' +
                  form[incident][key].label
              );
              return false;
            }
          }
        }
        if (
          form[incident][key].type == 'satisfactoryOnly' &&
          form[incident][key].value
        ) {
          if (
            (form[incident][key].value == 'Very Unsatisfied' ||
              form[incident][key].value == 'Unsatisfied') &&
            (!form[incident][key].reason ||
              form[incident][key].reason.trim() === '')
          ) {
            this.common.alertToast(
              this.reqService.translatedata('pleaseFill') +
                ' ' +
                form[incident][key].label +
                ' reason'
            );
            return false;
          }
        }
        if (form[incident][key].type == 'toggleWithReason') {
          if (
            form[incident][key].isToggled &&
            (!form[incident][key].reason ||
              form[incident][key].reason.trim() == '')
          ) {
            this.common.alertToast(
              this.reqService.translatedata('pleaseFill') +
                ' ' +
                form[incident][key].label +
                ' reason'
            );
            return false;
          }
        }
        if (form[incident][key].type == 'signaturewithSatisfactory') {
          if (form[incident][key].compulsory) {
            if (
              !(
                form[incident][key].value &&
                form[incident][key].value.length > 0
              ) ||
              form[incident][key].value == ','
            ) {
              this.common.alertToast(
                this.reqService.translatedata('pleaseFill') +
                  ' ' +
                  form[incident][key].label
              );
              return false;
            }
            if (
              !form[incident][key].feedback ||
              form[incident][key].feedback.trim() == ''
            ) {
              this.common.alertToast(
                this.reqService.translatedata('pleaseFill') +
                  ' Satisfactory in ' +
                  form[incident][key].label
              );
              return false;
            }
            if (
              (form[incident][key].feedback == 'Very Unsatisfied' ||
                form[incident][key].feedback == 'Unsatisfied') &&
              (!form[incident][key].reason ||
                form[incident][key].reason.trim() == '')
            ) {
              this.common.alertToast(
                this.reqService.translatedata('pleaseFill') +
                  ' ' +
                  form[incident][key].label +
                  ' reason'
              );
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  isValidField(incident) {
    this.common.alertToast(
      this.reqService.translatedata('pleaseFill') + ' ' + incident.label
    );
    return false;
  }

  async deleteRouteDraft(request) {
    this.common.displayLoading();
    /*
      TODO: Logic for delete route draft
    */
    // if (request.id) {
    //   this.reqService
    //     .genericDelete("mobileservice/draftRequest", request.id)
    //     .then(reqResp => {
    //       let respBody = reqResp.error ? JSON.parse(reqResp.error) : reqResp;
    //       if (reqResp && reqResp.status == 500) {
    //         this.common.alertToast(
    //           this.reqService.translatedata(respBody.detail)
    //         );
    //       }
    //     });
    // }

    let refreshedDraftList = [];
    // let data = JSON.parse(localStorage.getItem(Config.constants.routeDraftRequest));
    let data:any = await this.common.getStorageValue(Config.constants.routeDraftRequest);
    if (null != data) {
      for (let inc of data) {
        if (inc.id != request.id) {
          refreshedDraftList.push(inc);
        }
      }
    }
    // localStorage.setItem(Config.constants.routeDraftRequest, JSON.stringify(refreshedDraftList));
    await this.common.setStorageValue(Config.constants.routeDraftRequest, refreshedDraftList);
    this.common.stopLoading();
    this.events.publish('goto:Home', { time: Date.now() });
    this.common.alertToast(this.reqService.translatedata('draftDelSuccess'));
  }

  deleteDraftRequest(requestId) {
    this.reqService
      .genericDelete('mobileservice/draftRequest', requestId)
      .subscribe(
        (reqResp) => {
          this.common.stopLoading();
          if (reqResp === null || reqResp) {
            this.common.alertToast(
              this.reqService.translatedata('requestDeleted')
            );
            this.router.navigate(['/home']);
            this.events.publish('goto:Home', { time: Date.now() });
          }
        },
        async (err) => {
          this.common.stopLoading();
          let respBody = err.error ? err.error : err;
          if (err && err.status == 500) {
            this.common.alertToast(
              this.reqService.translatedata(respBody.detail)
            );
            this.router.navigate(['/home']);
          }

        }
      );
  }
}
