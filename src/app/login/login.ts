import { FaceIdPage } from './../face-id/face-id.page';
import { Component, ContentChild, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { from} from 'rxjs';
import { ServiceProvider, User } from '../../providers/service/service';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Config } from '../config';
import { CommonProvider } from '../common/common';
import { IonInput, ModalController, Platform, ToastController, PopoverController } from '@ionic/angular';
import { Events } from 'src/providers/events/events';
import { FCM } from "cordova-plugin-fcm-with-dependecy-updated/ionic/ngx";
import { Token } from '../data.model';
import { Device } from '@ionic-native/device/ngx';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { StorageImplementation } from 'src/providers/localstorage-indexDb/storage';
@Component({
  selector: 'LoginPage',
  templateUrl: 'login.html',
  styleUrls: ['login.scss'],
})
export class LoginPage {
  // @ViewChild("input") input: any;
  @ViewChild('password') input: IonInput;
  @ViewChild('password',{static:false}) inputFocus:any;
  currentUser: User;
  workrequest: string;
  version: any;
  user: any = {};
  userDetails: any ={};
  isSettingClick: boolean = false;
  loginCredentials: any = { email: '', password: '' };
  data: any = {};
  profile: any;
  pro: any;
  error: string;
  loading: HTMLIonLoadingElement;
  token: any;
  showPassword:boolean = false;
  type: string;
  msg: string;
  errorMsg: boolean;
  passwordinvalid: boolean = false;
  passworderrormsg: string;
  passwordlengtherror: string;
  attempt: number = 1;
  backDropDismiss: boolean = false;
  constructor(
    private reqservice: ServiceProvider,
    public router: Router,
    private local: NativeStorage,
    public translateService: TranslateService,
    public reqService: ServiceProvider,
    public common: CommonProvider,
    public toastController: ToastController,
    private events: Events,
    private platform : Platform, 
    private fcm : FCM,
    private device: Device,
    private faio: FingerprintAIO,
    private popoverController: PopoverController,
    private route : ActivatedRoute,
    private storageService: StorageImplementation
  ) {

  }
  ionViewWillEnter(){
    this.version = Config.constants.version;
    this.route.queryParams.subscribe(res => {
      console.log('res :', res);
      if ( res.task == 'BIOMETRIC') {
        this.log();
      }
    });
  }
  async log() {
    let signedMessage = window.localStorage.getItem('signedMessage');
    console.log('signedMessage :', signedMessage);
    if(signedMessage != '' && signedMessage != null && signedMessage != undefined && signedMessage != 'null') {
      this.openFaceId(signedMessage)
    }else {
      console.log('signedMessage USERLOGIN :', signedMessage);
      this.userLogin();
    }
  }
  userLogin() {
    // remove offlne Data
    this.removeOfflineData();
    window.localStorage.setItem('AssetLists',JSON.stringify([]));
    window.localStorage.setItem('offlinePendingData', JSON.stringify([]));
    this.common.displayLoading();
    if (this.errorMsg) {
      this.common.alertToast(this.msg);
      setTimeout(() => {
        this.common.stopLoading();
      }, 100);
      return;
    } else if (this.loginCredentials?.password == '') {
      this.passwordinvalid = true;
      this.passworderrormsg = 'Please fill passwords...!'; 
      setTimeout(() => {
        this.common.stopLoading();
      }, 100);
      return;
    }
    this.common.logClickEvent('user_login_btn_click', "Login Page");
    if (navigator.onLine) {
      this.loginCredentials.username = this.loginCredentials.email.trim();
      this.loginCredentials.password = this.loginCredentials.password.trim();
      this.loginCredentials.origin = 'mobile';
      if (this.loginCredentials.email == '' || this.loginCredentials.password == '') {
        this.showAlert("Please fill all fields");
        return;
      }
      this.reqservice.userLogin(this.loginCredentials).subscribe((data) => {
        window.localStorage.setItem('loginCredentails', JSON.stringify([]));
        window.localStorage.setItem('loginCredentails', JSON.stringify(this.loginCredentials));
        setTimeout(() => {
          this.common.stopLoading();
        }, 100);
        this.data = data,
        localStorage.setItem('auth-token', 'Bearer ' + this.data['id_token']);
        let profile;
        this.reqService.authenticateFirebase().then(() => { });
        this.reqService.authenticateFirebase().then(() => { });
        this.reqService.getUserInfo()
          .subscribe(
            async (res) => {
              this.currentUser = new User(
                this.loginCredentials.email,
                this.loginCredentials.password
              );
              if (this.platform.is("cordova")) {
                let result = JSON.parse(window.localStorage.getItem(Config.constants.token));
                if (null != result) {
                  let token = new Token();
                  this.fcm.getToken().then((deviceToken) => {
                    token.token = deviceToken;
                    window.localStorage.setItem("device-token", deviceToken);
                    let date = new Date();
                    token.creationDate = date.toISOString();
                    token.updatedDate = date.toISOString();
                    token.userEmail = this.currentUser.username;
                    token.deviceId = this.device.uuid;
                    console.log('token.deviceId' + token.deviceId);
                    console.log('token method call ')
                    this.reqService.addDeviceToken(token).subscribe((token) => {
                      console.log('token' + token)
                    }, async (err) => {
                      console.log('error' + err);
                    })

                  });
                } else {
                  try {
                    console.log("this.fcm.token" + this.fcm.getToken());
                    this.token = await this.fcm.getToken();
                    console.log('getToken result: ', this.token);
                    let token = new Token();
                    console.log('get token called..........');
                    token.token = this.token;
                    window.localStorage.setItem("device-token", this.token);
                    let date = new Date();
                    token.creationDate = date.toISOString();
                    token.updatedDate = date.toISOString();
                    token.userEmail = this.currentUser.username;
                    token.deviceId = this.device.uuid;
                    console.log("device token call by req servive");
                    this.reqService.addDeviceToken(token).subscribe((token) => {
                      console.log('token' + token)
                    }, async (err) => {
                      console.log('error' + err);
                    })
                  } catch (error) {
                    console.log(error);
                  }
                }
              }

              if (res) {
                profile = res;
                localStorage.setItem("Profile", JSON.stringify(profile));
                this.userDetails.username = profile.firstName;
                this.userDetails.email = profile.email;
                this.userDetails.langKey = profile.langKey;
                this.userDetails.id = profile.id;
                this.userDetails.org_id = profile.tenantId;
                this.userDetails.customerIds = profile.customerIds;
                this.userDetails.workflow = profile.workflowType;
                this.userDetails.uicustomized = profile.uicustomized;
                this.userDetails.mobileUITemplateId = profile.mobileUITemplateId;
                this.userDetails.downTimeTracking = profile.downTimeTracking;
                this.userDetails.restrictByLocation = profile.restrictByLocation;
                this.userDetails.locationIds = profile.locationIds;
                this.userDetails.isRowlevel = profile.isRowlevel;
                window.localStorage.setItem('usergroupPermissions', JSON.stringify(profile.userPermissions));
                window.localStorage.setItem('userGroupNames', JSON.stringify(profile.userGroupNames))
                this.common.setTenantId(profile.tenantId);
                this.common.setWorkFlowType(profile.workflowType);
                this.local.setItem('userName', this.userDetails.username);
                this.local.setItem('userProfile', JSON.stringify(null));
                this.local.setItem('userProfile', JSON.stringify(this.userDetails));
                localStorage.setItem("userProfile", JSON.stringify(this.userDetails));
              }
              setTimeout(() => {
                // this.common.stopLoading();
                let org = from(this.local.getItem('logo-img'))
                org.subscribe(
                  (org) => {
                    if (profile && profile.userGroupNames && profile.userGroupNames.length === 1 && profile.userGroupNames[0].toLowerCase() === 'requestuser') {
                      this.local.setItem('workRequestBasedLogin', 'workRequestBasedLogin');
                      this.router.navigate(['/work-request-list']);
                    }
                    else {
                      this.local.setItem('workRequestBasedLogin', 'normalUser');
                      if (org && org.organization == this.userDetails.org_id) {
                        this.router.navigate(['/home']);
                      } else {
                        this.translateService.setDefaultLang(this.userDetails.langKey);
                        let navigationExtras: NavigationExtras = {
                          queryParams: {
                            orgId: this.userDetails.org_id,
                            uicustomized: JSON.stringify(this.userDetails.uicustomized)
                          },replaceUrl:true
                        }
                        this.router.navigate(['/welcome'], navigationExtras);
                      }
                    }
                  }, async (err) => {
                    if (profile && profile.userGroupNames && profile.userGroupNames.length === 1 && profile.userGroupNames[0].toLowerCase() === 'requestuser') {
                      this.local.setItem('workRequestBasedLogin', 'workRequestBasedLogin');
                      this.router.navigate(['/work-request-list']);
                    } else {
                      this.translateService.setDefaultLang(this.userDetails.langKey);
                      let navigationExtras: NavigationExtras = {
                        queryParams: {
                          orgId: this.userDetails.org_id,
                          uicustomized: JSON.stringify(this.userDetails.uicustomized)
                        },replaceUrl:true
                      }
                      this.router.navigate(['/welcome'], navigationExtras);
                    }
                  }
                )
              }, 1000);
            }

          )
      }, async (err) => {
        setTimeout(() => {
          this.common.stopLoading();
        }, 100);
        if (err['error'] && err["status"]) {
          let respBody = err['error'];
          if ('Bad credentials' == respBody.AuthenticationException || err["status"] == 400) {
            this.showAlert(this.reqService.translatedata("invalidCredentials"));
          } else {
            this.showAlert(respBody.AuthenticationException ? respBody.AuthenticationException : this.common.serverDown);
          }
        } else {
          this.showAlert(this.common.serverDown);
        }
      }
      );
    } else {
      setTimeout(() => {
        this.common.stopLoading();
      }, 100);
      this.showAlert(this.common.offlineMsg);
    }
  }
  openFaceId(signedMessage) {
    this.backDropDismiss = true;
    this.faio.isAvailable().then((result: any) => {
      console.log('isBiometric :' ,result);
      // alert(result);
      if (result) {
      this.faio.show({
        cancelButtonTitle: 'Cancel',
        description: "Some biometric description",
        subtitle: 'This SubTitle'
      })
        .then((result: any) => {
          console.log(result);
          // navigator.vibrate(200);
          // alert(result);
          this.faceRecoginationAuth(signedMessage);
        })
        .catch(async (error: any) => {
          // alert(error);
          this.backDropDismiss = false;
          navigator.vibrate(200);
          let popOverPage = await this.popoverController.create({
            component: FaceIdPage,
            backdropDismiss:false,
            event
          })
          popOverPage.onDidDismiss().then((data:any)=>{
            console.log(data);
            if(data != undefined) {
              if(data.data == 'userpass') {
                this.userLogin();
              }else if(data.data == 'try') {
                this.openFaceId(signedMessage);
              }
            }
          })
          await popOverPage.present();
        });
      }

    })
      .catch((error: any) => {
        if (error.message) {
          this.common.alertToast('To use this feature, you`ll need to set up your biometic on your device first.');
          console.log('eroor ',error.message);
          }
      });
  }

  faceRecoginationAuth(signedMessage) {
    this.backDropDismiss = false;
    let uuid = this.device.uuid;
    let randomMessage = window.localStorage.getItem('randomMessage');
    let data = {
      encodedSignature: signedMessage,
      randomMessage: randomMessage,
      uuid: uuid
    }
    this.reqservice.getFaceIdAuthToken(data).subscribe(
      (res: HttpResponse<any>) => this.onSuccess(res),
      (res: HttpErrorResponse) => this.errors(res)
    );
  }
  errors(message: any): void {
    setTimeout(() => {
      this.common.stopLoading();
    }, 100);
    if(message['error'] == 'Signature Is Not Valid' && message["status"] == 400) {
      this.common.alertToast('User Account Conflict: Ensure that the biometric feature is not already enabled for the specified end user. Biometric authentication is often tied to individual user profiles, and enabling it for one user may prevent enabling it again for the same user.');
      window.localStorage.setItem('fingerPrintAIO', 'false');
      window.localStorage.setItem('signedMessage', null);
      return;
    }else if(message['error']?.includes("This User Already Enabled BioMetric In Another Device") && message["status"] == 409) {
      this.common.alertToast(message['error']);
      window.localStorage.setItem('fingerPrintAIO', 'false');
      window.localStorage.setItem('signedMessage', null);
      return;
    }
    if (message['error'] == 'PublicKey Not Found' && message["status"]) {
      console.log("error",message['error']);
      this.common.alertToast('Biometric is already enabled for this account in another device please, login using the user id and password');
      window.localStorage.setItem('fingerPrintAIO', 'false');
      return;
    }
    if (message['error'] && message["status"]) {
      let respBody = message['error'];
      if ('Bad credentials' == respBody.AuthenticationException || message["status"] == 400) {
        this.showAlert(this.reqService.translatedata("invalidCredentials"));
      } else {
        this.showAlert(respBody.AuthenticationException ? respBody.AuthenticationException : this.common.serverDown);
      }
    }else if(message['error'] && (message["status"] == 409 || message["status"] == 404)) {
      this.showAlert(message['error']);
      window.localStorage.setItem('fingerPrintAIO', 'false');
      window.localStorage.setItem('signedMessage', null);
    } else {
      this.showAlert(this.common.serverDown);
      window.localStorage.setItem('fingerPrintAIO', 'false');
      window.localStorage.setItem('signedMessage', null);
    }
  }
  onSuccess(body: any): void {
    this.data = body,
    localStorage.setItem('auth-token', 'Bearer ' + this.data['id_token']);

    if(!this.data?.id_token) {
      this.loginCredentials = JSON.parse(window.localStorage.getItem('loginCredentails'));
      // remove offline Data 
      this.removeOfflineData();
      this.userLogin();
    }
    let profile;
    this.reqService.authenticateFirebase().then(() => { });
    this.reqService.authenticateFirebase().then(() => { });
    this.reqService.getUserInfo()
      .subscribe(
        async (res) => {
          this.currentUser = new User(
            this.loginCredentials.email,
            this.loginCredentials.password
          );
          if (this.platform.is("cordova")) {
            let result = JSON.parse(window.localStorage.getItem(Config.constants.token));
            if (null != result) {
              let token = new Token();
              this.fcm.getToken().then((deviceToken) => {
                token.token = deviceToken;
                window.localStorage.setItem("device-token", deviceToken);
                let date = new Date();
                token.creationDate = date.toISOString();
                token.updatedDate = date.toISOString();
                token.userEmail = this.currentUser.username;
                token.deviceId = this.device.uuid;
                console.log('token.deviceId' + token.deviceId);
                console.log('token method call ')
                this.reqService.addDeviceToken(token).subscribe((token) => {
                  console.log('token' + token);
                }, async (err) => {
                  console.log('error' + err);
                })

              });
            } else {
              try {
                console.log("this.fcm.token" + this.fcm.getToken());
                this.token = await this.fcm.getToken();
                console.log('getToken result: ', this.token);
                let token = new Token();
                console.log('get token called..........');
                token.token = this.token;
                window.localStorage.setItem("device-token", this.token);
                let date = new Date();
                token.creationDate = date.toISOString();
                token.updatedDate = date.toISOString();
                token.userEmail = this.currentUser.username;
                token.deviceId = this.device.uuid;
                console.log("device token call by req servive");
                this.reqService.addDeviceToken(token).subscribe((token) => {
                  console.log('token' + token)
                }, async (err) => {
                  console.log('error' + err);
                })
              } catch (error) {
                console.log(error);
              }
            }
          }

          if (res) {
            profile = res;
            localStorage.setItem("Profile", JSON.stringify(profile));
            this.userDetails.username = profile.firstName;
            this.userDetails.email = profile.email;
            this.userDetails.langKey = profile.langKey;
            this.userDetails.id = profile.id;
            this.userDetails.org_id = profile.tenantId;
            this.userDetails.customerIds = profile.customerIds;
            this.userDetails.workflow = profile.workflowType;
            this.userDetails.uicustomized = profile.uicustomized;
            this.userDetails.mobileUITemplateId = profile.mobileUITemplateId;
            this.userDetails.downTimeTracking = profile.downTimeTracking;
            this.userDetails.restrictByLocation = profile.restrictByLocation;
            this.userDetails.locationIds = profile.locationIds;
            this.userDetails.isRowlevel = profile.isRowlevel;
            window.localStorage.setItem('usergroupPermissions', JSON.stringify(profile.userPermissions));
            window.localStorage.setItem('userGroupNames', JSON.stringify(profile.userGroupNames))
            this.common.setTenantId(profile.tenantId);
            this.common.setWorkFlowType(profile.workflowType);
            this.local.setItem('userName', this.userDetails.username);
            this.local.setItem('userProfile', JSON.stringify(null));
            this.local.setItem('userProfile', JSON.stringify(this.userDetails));
            localStorage.setItem("userProfile", JSON.stringify(this.userDetails));
          }
          setTimeout(() => {
            // this.common.stopLoading();
            let org = from(this.local.getItem('logo-img'))
            org.subscribe(
              (org) => {
                if (profile && profile.userGroupNames && profile.userGroupNames.length === 1 && profile.userGroupNames[0].toLowerCase() === 'requestuser') {
                  this.local.setItem('workRequestBasedLogin', 'workRequestBasedLogin');
                  this.router.navigate(['/work-request-list']);
                }
                else {
                  this.local.setItem('workRequestBasedLogin', 'normalUser');
                  if (org && org.organization == this.userDetails.org_id) {
                    this.router.navigate(['/home']);
                  } else {
                    this.translateService.setDefaultLang(this.userDetails.langKey);
                    let navigationExtras: NavigationExtras = {
                      queryParams: {
                        orgId: this.userDetails.org_id,
                        uicustomized: JSON.stringify(this.userDetails.uicustomized)
                      },replaceUrl:true
                    }
                    this.router.navigate(['/welcome'], navigationExtras);
                  }
                }
              }, async (err) => {
                if (profile && profile.userGroupNames && profile.userGroupNames.length === 1 && profile.userGroupNames[0].toLowerCase() === 'requestuser') {
                  this.local.setItem('workRequestBasedLogin', 'workRequestBasedLogin');
                  this.router.navigate(['/work-request-list']);
                } else {
                  this.translateService.setDefaultLang(this.userDetails.langKey);
                  let navigationExtras: NavigationExtras = {
                    queryParams: {
                      orgId: this.userDetails.org_id,
                      uicustomized: JSON.stringify(this.userDetails.uicustomized)
                    },replaceUrl:true
                  }
                  this.router.navigate(['/home'], navigationExtras);
                }
              }
            )
          }, 1000);
        }, (err) => {
          console.log('error Msg: ', err);
        }

      )
    
  }

  // faceIdLogin() {
  //  let loginCred  = JSON.parse(window.localStorage.getItem('loginCredentails'));
  //  if(loginCred.username != '') {
  //   this.loginCredentials = loginCred;
  //   if (navigator.onLine) {
  //     this.loginCredentials.username = this.loginCredentials.email.trim();
  //     this.loginCredentials.password = this.loginCredentials.password.trim();
  //     this.loginCredentials.origin = 'mobile';
  //     if (this.loginCredentials.email == '' || this.loginCredentials.password == '') {
  //       this.showAlert("Please fill all fields");
  //       return;
  //     }
  //     this.reqservice.userLogin(this.loginCredentials).subscribe((data) => {
  //       window.localStorage.setItem('loginCredentails', JSON.stringify([]));
  //       window.localStorage.setItem('loginCredentails', JSON.stringify(this.loginCredentials));
  //       setTimeout(() => {
  //         this.common.stopLoading();
  //       }, 100);
  //       this.data = data,
  //       localStorage.setItem('auth-token', 'Bearer ' + this.data['id_token']);
  //       let profile;
  //       this.reqService.authenticateFirebase().then(() => { });
  //       this.reqService.authenticateFirebase().then(() => { });
  //       this.reqService.getUserInfo()
  //         .subscribe(
  //           async (res) => {
  //             this.currentUser = new User(
  //               this.loginCredentials.email,
  //               this.loginCredentials.password
  //             );
  //             if (this.platform.is("cordova")) {
  //               let result = JSON.parse(window.localStorage.getItem(Config.constants.token));
  //               if (null != result) {
  //                 let token = new Token();
  //                 this.fcm.getToken().then((deviceToken) => {
  //                   token.token = deviceToken;
  //                   window.localStorage.setItem("device-token", deviceToken);
  //                   let date = new Date();
  //                   token.creationDate = date.toISOString();
  //                   token.updatedDate = date.toISOString();
  //                   token.userEmail = this.currentUser.username;
  //                   token.deviceId = this.device.uuid;
  //                   console.log('token.deviceId' + token.deviceId);
  //                   console.log('token method call ')
  //                   this.reqService.addDeviceToken(token).subscribe((token) => {
  //                     console.log('token' + token)
  //                   }, async (err) => {
  //                     console.log('error' + err);
  //                   })

  //                 });
  //               } else {
  //                 try {
  //                   console.log("this.fcm.token" + this.fcm.getToken());
  //                   this.token = await this.fcm.getToken();
  //                   console.log('getToken result: ', this.token);
  //                   let token = new Token();
  //                   console.log('get token called..........');
  //                   token.token = this.token;
  //                   window.localStorage.setItem("device-token", this.token);
  //                   let date = new Date();
  //                   token.creationDate = date.toISOString();
  //                   token.updatedDate = date.toISOString();
  //                   token.userEmail = this.currentUser.username;
  //                   token.deviceId = this.device.uuid;
  //                   console.log("device token call by req servive");
  //                   this.reqService.addDeviceToken(token).subscribe((token) => {
  //                     console.log('token' + token)
  //                   }, async (err) => {
  //                     console.log('error' + err);
  //                   })
  //                 } catch (error) {
  //                   console.log(error);
  //                 }
  //               }
  //             }

  //             if (res) {
  //               profile = res;
  //               localStorage.setItem("Profile", JSON.stringify(profile));
  //               this.userDetails.username = profile.firstName;
  //               this.userDetails.email = profile.email;
  //               this.userDetails.langKey = profile.langKey;
  //               this.userDetails.id = profile.id;
  //               this.userDetails.org_id = profile.tenantId;
  //               this.userDetails.customerIds = profile.customerIds;
  //               this.userDetails.workflow = profile.workflowType;
  //               this.userDetails.uicustomized = profile.uicustomized;
  //               this.userDetails.mobileUITemplateId = profile.mobileUITemplateId;
  //               this.userDetails.downTimeTracking = profile.downTimeTracking;
  //               this.userDetails.restrictByLocation = profile.restrictByLocation;
  //               this.userDetails.locationIds = profile.locationIds;
  //               this.userDetails.isRowlevel = profile.isRowlevel;
  //               window.localStorage.setItem('usergroupPermissions', JSON.stringify(profile.userPermissions));
  //               window.localStorage.setItem('userGroupNames', JSON.stringify(profile.userGroupNames))
  //               this.common.setTenantId(profile.tenantId);
  //               this.common.setWorkFlowType(profile.workflowType);
  //               this.local.setItem('userName', this.userDetails.username);
  //               this.local.setItem('userProfile', JSON.stringify(null));
  //               this.local.setItem('userProfile', JSON.stringify(this.userDetails));
  //               localStorage.setItem("userProfile", JSON.stringify(this.userDetails));
  //             }
  //             setTimeout(() => {
  //               // this.common.stopLoading();
  //               let org = from(this.local.getItem('logo-img'))
  //               org.subscribe(
  //                 (org) => {
  //                   if (profile && profile.userGroupNames && profile.userGroupNames.length === 1 && profile.userGroupNames[0].toLowerCase() === 'workrequest') {
  //                     this.local.setItem('workRequestBasedLogin', 'workRequestBasedLogin');
  //                     this.router.navigate(['/work-request-list']);
  //                   }
  //                   else {
  //                     this.local.setItem('workRequestBasedLogin', 'normalUser');
  //                     if (org && org.organization == this.userDetails.org_id) {
  //                       this.router.navigate(['/home']);
  //                     } else {
  //                       this.translateService.setDefaultLang(this.userDetails.langKey);
  //                       let navigationExtras: NavigationExtras = {
  //                         queryParams: {
  //                           orgId: this.userDetails.org_id,
  //                           uicustomized: JSON.stringify(this.userDetails.uicustomized)
  //                         },replaceUrl:true
  //                       }
  //                       this.router.navigate(['/welcome'], navigationExtras);
  //                     }
  //                   }
  //                 }, async (err) => {
  //                   if (profile && profile.userGroupNames && profile.userGroupNames.length === 1 && profile.userGroupNames[0].toLowerCase() === 'workrequest') {
  //                     this.local.setItem('workRequestBasedLogin', 'workRequestBasedLogin');
  //                     this.router.navigate(['/work-request-list']);
  //                   } else {
  //                     this.translateService.setDefaultLang(this.userDetails.langKey);
  //                     let navigationExtras: NavigationExtras = {
  //                       queryParams: {
  //                         orgId: this.userDetails.org_id,
  //                         uicustomized: JSON.stringify(this.userDetails.uicustomized)
  //                       },replaceUrl:true
  //                     }
  //                     this.router.navigate(['/welcome'], navigationExtras);
  //                   }
  //                 }
  //               )
  //             }, 1000);
  //           }

  //         )
  //     }, async (err) => {
  //       setTimeout(() => {
  //         this.common.stopLoading();
  //       }, 100);
  //       if (err['error'] && err["status"]) {
  //         let respBody = err['error'];
  //         if ('Bad credentials' == respBody.AuthenticationException || err["status"] == 400) {
  //           this.showAlert(this.reqService.translatedata("invalidCredentials"));
  //         } else {
  //           this.showAlert(respBody.AuthenticationException ? respBody.AuthenticationException : this.common.serverDown);
  //         }
  //       } else {
  //         this.showAlert(this.common.serverDown);
  //       }
  //     }
  //     );
  //   } else {
  //     setTimeout(() => {
  //       this.common.stopLoading();
  //     }, 100);
  //     this.showAlert(this.common.offlineMsg);
  //   }
  //  }else {
  //   this.log();
  //  }

  // }

  showAlert(text) {
    setTimeout(() => {
      this.common.stopLoading();
    },500);
    this.common.alertToast(text);
  }
  checkDomain() {
    this.isSettingClick = true;
    this.router.navigate(['/domain']);
  }

  gotoForgotPwdPage() {
    this.common.displayLoading();
    if (navigator.onLine) {
      this.router.navigate(['/forgot-password']);
      this.common.stopLoading();
    }
    else {
      this.common.stopLoading();
      this.common.alertToast(this.reqService.translatedata('You are offline'));
    }
  }
  gotoScheduleDemoPage() {
    this.common.displayLoading();
    if (navigator.onLine) {
      this.router.navigate(['/schedule-demo']);
      setTimeout(() => {
        this.common.stopLoading();
      }, 100);
    }
    else {
      setTimeout(() => {
        this.common.stopLoading();
      }, 100);
      this.common.alertToast(this.reqService.translatedata('You are offline'));
    }
  }
  gotoSingup(){
    this.common.displayLoading();
    if (navigator.onLine) {
      this.router.navigate(['/signup']);
      setTimeout(() => {
        this.common.stopLoading();
      }, 100);
    }
    else {
      setTimeout(() => {
        this.common.stopLoading();
      }, 100);
      this.common.alertToast(this.reqService.translatedata('You are offline'));
    }
  }
  async setFocus(nextElement) {
    nextElement.focus();
 }
 signupforfree() {
   window.location.href = 'https://app.cryotos.com/#/register'
 }
 toggleShow() {

  this.showPassword = !this.showPassword;
  // this.type = this.showPassword ? 'text' : 'password';
  this.input.type = this.showPassword ? 'text' : 'password';
}
validateEmail(value) {
 


  if(value) {
    
    if(/.*\@.*\.\w{2,3}/g.test(value)) {
    // if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
      this.errorMsg = false;
      return true;
    }else {
      this.msg = 'You have entered an invalid email address';
      this.errorMsg = true;
    }
  }else {
    this.msg = 'Please fill email address';
    this.errorMsg = true;
  }

}
focusPassword() {
  this.inputFocus.setFocus();
}

validPassword(password) {
  this.passwordinvalid = password == '' ? true : false;
  if(this.passwordinvalid) {
    this.passworderrormsg = 'Please Fill passwords...!';
  }


  // const pass = password;
  // var upperCaseCharacters = /[A-Z]+/g;
  // var lowerCaseCharacters = /[a-z]+/g;
  // var numberCharacters = /[0-9]+/g;
  // var specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

  // let hasLower = false;
  // let hasUpper = false;
  // let hasNum = false;
  // let hasSpecial = false;

  // if (
  //   !upperCaseCharacters.test(pass) &&
  //   !lowerCaseCharacters.test(pass) &&
  //   !numberCharacters.test(pass) &&
  //   !specialCharacters.test(pass)
  // ) {
  //   this.passwordinvalid = true;
  //   this.passworderrormsg = ' 8 or more characters with a mix of uppercase, lowercase, & numbers.';
  // } else {
  //   this.passworderrormsg = 'use at least';
  //   this.passwordlengtherror = 'Please use at least 8 character and';
  //   const lowercaseRegex = new RegExp('(?=.*[a-z])'); // has at least one lower case letter
  //   if (!lowercaseRegex.test(pass)) {
  //     hasLower = true;
  //     this.passwordinvalid = true;
  //     this.passworderrormsg = this.passworderrormsg + ' one Lowercase character';
  //   }

  //   const uppercaseRegex = new RegExp('(?=.*[A-Z])'); //has at least one upper case letter
  //   if (!uppercaseRegex.test(pass)) {
  //     hasUpper = true;
  //     this.passwordinvalid = true;
  //     this.passworderrormsg = this.passworderrormsg + ' one uppercase character';
  //   }

  //   const numRegex = new RegExp('(?=.*\\d)'); // has at least one number
  //   if (!numRegex.test(pass)) {
  //     hasNum = true;
  //     this.passwordinvalid = true;
  //     this.passworderrormsg = this.passworderrormsg + ' one Number';
  //   }

  //   const specialcharRegex = new RegExp('[!@#$%^&*(),.?":{}|<>]');
  //   if (!specialcharRegex.test(pass)) {
  //     hasSpecial = true;
  //     this.passwordinvalid = true;
  //     this.passworderrormsg = this.passworderrormsg + ' one special character';
  //   }
  //   if (pass.length < 8) {
  //     this.passwordinvalid = true;
  //     this.passwordlengtherror = 'Please use at least 8 character and';
  //   } else {
  //     this.passwordlengtherror = '';
  //   }
  //   if(specialcharRegex.test(pass) && numRegex.test(pass) && uppercaseRegex.test(pass) && lowercaseRegex.test(pass) && pass.length < 8){
  //     this.passwordinvalid = true;
  //     this.passwordlengtherror = 'Please use at least 8 character ';
  //     this.passworderrormsg = '';
  //   }

  //   if (specialcharRegex.test(pass) && numRegex.test(pass) && uppercaseRegex.test(pass) && lowercaseRegex.test(pass) && pass.length >= 8) {
  //     this.passwordinvalid = false;
  //     return;
  //   }
  // }
}

// create a method for remove Offline Data from storage
removeOfflineData() {
  this.storageService.remove(Config.constants.routeDraftRequest);
  this.storageService.remove(Config.constants.imageUpload);
}

  
}
