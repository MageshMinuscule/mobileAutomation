import { LoginPage } from './login/login';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, NavigationExtras, Router, RouterModule } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { AlertController, IonRouterOutlet, NavController, Platform ,} from '@ionic/angular';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from './common/common';
import { Config } from './config';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Globalization } from '@ionic-native/globalization/ngx';
import { TranslateService } from '@ngx-translate/core';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import {Token} from './data.model'
import { FCM } from "cordova-plugin-fcm-with-dependecy-updated/ionic/ngx";
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { Market } from '@ionic-native/market/ngx';
import { AngularFireDatabase } from '@angular/fire/database';
import { Events } from 'src/providers/events/events';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Device } from '@ionic-native/device/ngx';
import { PendingListPage } from './pending-list/pending-list.page';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  @ViewChild(IonRouterOutlet) routerOutlet: IonRouterOutlet;
  latitude: any = 0; //latitude
  longitude: any = 0; //longitude
  ionAppName: string;
  ionPackageName: string;
  ionVersionNumber: string;
  ionVersionCode: string|number;
  rootPage: any;
  isBrowser: boolean = false;
  logged: boolean = false;
  user: any = {};
  profile: any;
  backgroundFetchStart: boolean = false;
  currentlocation: any = {
    lat: '',
    lng: '',
  };
  languageCodes: any = [
    'en',
    'es',
    'pl',
    'id',
    'de',
    'fr',
    'ja',
    'la',
    'ru',
    'hi',
    'nl',
  ];
  systemLanguage: any;
  isLanguagesetItem: boolean = false;
  position: any = [];
  isExitAlertOpen: boolean;
  isLanguageSet: boolean;
  token: string;
  positionSubscription: Subscription;
  trackedRoute = [];
  retry: any;
  task: string;
  routeUrl: string;
  constructor(
    private common: CommonProvider,
    public local: NativeStorage,
    public platform: Platform,
    public reqService : ServiceProvider,
    public alertCtrl: AlertController,
    public router : Router,
    public statusBar : StatusBar,
    public globalization : Globalization,
    public translateService : TranslateService,
    public splashScreen : SplashScreen,
    private fcm: FCM,
    private diagnostic : Diagnostic,
    public appVersion: AppVersion,
    public geolocation : Geolocation,
    public firestore: AngularFirestore,
    public afAuth: AngularFireAuth,
    public afDB : AngularFireDatabase,
    public market : Market,
    public events :Events,
    private deeplinks: Deeplinks,
    private nav : NavController,
    public _location: Location,
    private device: Device,
    // private login:LoginPage
  ) {
    this.hideSplashScreen();
    this.appVersion.getVersionNumber().then(versionNumber =>console.log("versionNumber"+versionNumber))
    this.isBrowser = !this.platform.is('cordova') ? true : false;
    this.PeriodicallySendData();
    let info = localStorage.getItem("Profile")
    console.log(JSON.parse(info))
    let profile = JSON.parse(info);
    this.profile = profile;



    try {
      afDB.object('config').valueChanges().subscribe(config => {
        Config.constants.setting = config;
        console.log("firebaseconfig"+JSON.stringify(config));

        if (this.profile && this.profile.tenantId) {
          if (Config.constants.setting.FAQ[this.profile.tenantId] != undefined) {
            this.common.faqList = Config.constants.setting.FAQ[this.profile.tenantId];
          } else {
            this.common.faqList = Config.constants.setting.FAQ["default"];
          }
        }
        let languageSelection = Config.constants.setting.languageSelection;
        if (languageSelection == 'default') {
          this.translateService.setDefaultLang(Config.constants.setting.Language);
        } else if (languageSelection == 'system') {
          this.languageCodes = Config.constants.setting.languageCodes;
          this.languageCodes.forEach(key => {
            if (this.systemLanguage && this.systemLanguage.includes(key)) {
              this.translateService.setDefaultLang(key);
              this.isLanguagesetItem = true;
            }
          });
          if (!this.isLanguagesetItem) {
            this.translateService.setDefaultLang('en');
          }
        } else {
          this.translateService.setDefaultLang('en');
        }
        if (this.profile && this.profile.langKey)
          this.translateService.setDefaultLang(this.profile.langKey);
        Config.constants.isAsset = Config.constants.setting.isAsset;
        Config.constants.isWorkflow = Config.constants.setting.isWorkflow;
        Config.catQuestions = Config.constants.setting.WorkflowTitle;
        Config.locQuestions = Config.constants.setting.LocationTitle;
        Config.name = Config.constants.setting.name;
        Config.constants.timeout = Config.constants.setting.timeout;
        Config.constants.setting.ForceUpdate = true;
        setTimeout(() => {
          localStorage.setItem(Config.constants.locationRadius, JSON.stringify(Config.constants.setting.LocationRadius));
        }, 1000);
        if (Config.constants.setting.ForceLogout) {
          this.clearStroage();
        }
        if (this.platform.is('cordova')) {
          this.platform.ready().then(() => {
          if (this.platform.is('android')) {
            this.appVersion.getVersionNumber().then((version) => {
              console.log("application version : "+version);
              console.log("firebase application version : ", Config.constants.setting.AndroidVersion);
              if (Config.constants.setting.AndroidVersion != version && Config.constants.setting.AppForceUpdate) {
                this.showUpdateAlert();
              }
            });
          } else if (this.platform.is('ios')) {
            this.appVersion.getVersionNumber().then((version) => {
              if (Config.constants.setting.IOSVersion != version && Config.constants.setting.AppForceUpdate) {
                this.showUpdateAlert();
              }
            });
          }
        });
        }
      });
    } catch (error) {
      console.error(error);
    }
    this.backButtonEvent();
    this.initializeApp();
    this.events.subscribe('user:created', (data: any) => {
      this.profile = data.user;
        let userProfile = JSON.parse(localStorage.getItem(Config.constants.username));
        if (userProfile && userProfile != null) {
          if (data.user.username != userProfile) {
            let tokenDetails = '';
            let organization;
            let domain = window.localStorage.getItem('domain-url') && window.localStorage.getItem('domain-changed') ? window.localStorage.getItem('domain-url') : Config.backend.host;
            let data = JSON.parse(window.localStorage.getItem(Config.constants.token));
            if (null != data) {
              tokenDetails = data;
            }
            var org = JSON.parse(localStorage.getItem('logi-img'));
            if (org) {
              organization = org;
              console.log('organization details' + org.organization)
            } else {
              let val;
              val = localStorage.getItem('logo-home');
              if (val) {
                organization = JSON.parse(val);
                console.log('organization details1' + organization.organization)
              } else {
                organization = '';
              }
            }
            this.local.clear().then(() => {
              localStorage.setItem('userProfile', JSON.stringify(data.user));
              localStorage.setItem(Config.constants.username, JSON.stringify(data.user.username));
              localStorage.setItem('logo-img', JSON.stringify(organization));
              localStorage.setItem('logo-home', JSON.stringify(organization));
              if (domain) {
                window.localStorage.setItem('domain-url', domain);
                window.localStorage.setItem('domain-changed', domain);
              }
              window.localStorage.setItem(Config.constants.token, JSON.stringify(tokenDetails));
            });
          }
        }

      this.user = data.user;
      this.logged = true;
    });

    //If user inactive after login
    this.events.subscribe('user:inactive', (data : any) => {
      console.log('Welcome', data.err, 'at', data.time);
      this.common.alertToast(this.reqService.translatedata("sessionExpired"));
      this.clearStroage();
      console.log("User Unauthorized");
    });

    //NAVIGATE TO HOME AFTER SUCCESS
    this.events.subscribe('goto:Home', (time) => {
      console.log(time);
      this.router.navigate(['/tab']);
    });

    this.events.subscribe('domain:changed', (data : any) => {
      let token;
      let tokenValue = JSON.parse(window.localStorage.getItem(Config.constants.token));
        token = tokenValue;

      this.local.clear().then(() => {
        if (data) {
          window.localStorage.setItem('domain-url', data);
          window.localStorage.setItem('domain-changed', data);
        }
        window.localStorage.setItem(Config.constants.token, JSON.stringify(token));
      });
    });

    this.events.subscribe('user-logout', (data : any) => {
      // this.common.stopLoading();
      console.log('Welcome', data.user, 'at', data.time);
      this.logOut();
    });

    this.events.subscribe('user:started', (data: any) => {
      try {
        this.geolocation.getCurrentPosition({ timeout: 15000, enableHighAccuracy: true }).then((resp) => {
          this.currentlocation = { lat: resp.coords.latitude, lng: resp.coords.longitude };
          this.updateUserLocation();
        }).catch((error) => {
          console.error(error);
          this.common.alertToast("Can't detect your location. Check your setting");
        });
      } catch (error) {
        console.log(error);
      }
    });
  }
  ionViewWillEnter() {
    console.log("ionviewwillEnter")
  }
  backButtonEvent() {
    this.platform.backButton.subscribeWithPriority(10, async () => {
      const _currentUrl = this.router.url;
      console.log(_currentUrl)
      console.log('Back press handler!');
      if(_currentUrl === '/work-update') {
        this.isExitAlertOpen = true;
        (await this.alertCtrl.create({
          header: this.reqService.translatedata('unsave'),
          message: this.reqService.translatedata('withoutChange'),
          backdropDismiss: false,
          buttons: [
            {
              text: this.reqService.translatedata('yes'),
              handler: () => {
                this.nav.pop();

                this.isExitAlertOpen = false;
              }
            }, {
              text: this.reqService.translatedata('cancel'),
              role: 'cancel',
              handler: () => {
                this.isExitAlertOpen = false;
              }
            }
          ]
        }).then(alert =>{
          alert.present();
        }))
      }
      else if(_currentUrl === '/home') {
        navigator['app'].exitApp();
      }  else if(!this.routerOutlet.canGoBack() || this._location.isCurrentPathEqualTo('/login')) {
        this.backButtonAlert();
      }else if(_currentUrl === '/home') {
        navigator['app'].exitApp();
      }  else if(!this.routerOutlet.canGoBack() || this._location.isCurrentPathEqualTo('/login')) {
        this.backButtonAlert();
      } else {
        this.nav.pop();

      }
    });
  }
  async backButtonAlert() {
    this.alertCtrl.create({
      header: this.reqService.translatedata('exit'),
      message: this.reqService.translatedata('confirmExit'),
      backdropDismiss: false,
      buttons: [{
        text: this.reqService.translatedata('cancel'),
        role: 'cancel',
        handler: () => {
          console.log('Application exit prevented!');
          this.isExitAlertOpen = false;
        }
      }, {
        text: this.reqService.translatedata('yes'),
        handler: () => {
          navigator['app'].exitApp();
          this.isExitAlertOpen = false;
        }
      }]
    })
      .then(alert => {
        alert.present();
      });
  }
  async initializeApp() {
    this.hideSplashScreen();
    this.platform.ready().then(async () => {
      if (this.platform.is('cordova')) {
        this.statusBar.overlaysWebView(false);
        this.statusBar.backgroundColorByHexString('#445498');
        // this.background.setDefaults({ silent: true });
        // this.background.enable();
        // this.platform.pause.subscribe(() => { this.startLocationTracking(); });
        // this.background.on('activate').subscribe(() => {
        //   console.log("Background Activated");
        // });
        // this.startLocationTracking();
        // let config = {
        //   desiredAccuracy: 0,
        //   stationaryRadius: 20,
        //   distanceFilter: 10,
        //   debug: false,
        //   interval: 5000,
        //   startForeground: true,
        //   startOnBoot: true,
        //   stopOnTerminate: false
        // };

        // this.backgroundGeolocation.configure(config).then((location) => {

        //   console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);

        //   // Run update inside of Angular's zone
        //   this.zone.run(() => {
        //     const lat = location.latitude;
        //     const lng = location.longitude;
        //     this.locationTracker.updateUserLocation(lat, lng);
        //   });

        // }, (err) => {

        //   console.log(err);

        // });

        // this.backgroundGeolocation.on(BackgroundGeolocationEvents.location).subscribe((location) => {
        //   console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);

        //   // Run update inside of Angular's zone
        //   this.zone.run(() => {
        //     const lat = location.latitude;
        //     const lng = location.longitude;
        //     this.locationTracker.updateUserLocation(lat, lng);
        //   });
        // })

        // // Turn ON the background-geolocation system.
        // this.backgroundGeolocation.start();
      }

      this.deeplinks.routeWithNavController(this.nav, {
        '': 'home',
        '/pending-list': PendingListPage
      }).subscribe((match) => {
        console.log(this.routerOutlet.canGoBack().valueOf())
           console.log('success' + JSON.stringify(match));

      }, (noMatch) => {
           console.log('error' + JSON.stringify(noMatch));
      });
      // this.translateService.setDefaultLang('en');
      // this.Keyboard.onKeyboardShow().subscribe(() => {
      //   document.body.classList.add('keyboard-is-open');
      // });
      // this.keyboard.disableScroll(false);
      // this.Keyboard.onKeyboardHide().subscribe(() => {
      //   document.body.classList.remove('keyboard-is-open');
      // });
      if (this.platform.is('cordova')) {
        this.deeplinks.routeWithNavController(this.nav, {
          '': 'home',
          '/pending-list': PendingListPage
        }).subscribe((match) => {
             console.log('success' + JSON.stringify(match));
        }, (noMatch) => {
             console.log('error' + JSON.stringify(noMatch));
        });
        this.globalization.getPreferredLanguage()
          .then(res => {
            this.systemLanguage = res.value;
            this.languageCodes.forEach(key => {
              if (this.systemLanguage && this.systemLanguage.includes(key)) {
                this.translateService.setDefaultLang(key);
                this.isLanguageSet = true;
              }
            });
          })
          .catch(e => console.log("Error==>" + e));
        try {
          const wasPermissionGiven: boolean = await this.fcm.requestPushPermission({
            ios9Support: {
              timeout: 10,  // How long it will wait for a decision from the user before returning `false`
              interval: 0.3 // How long between each permission verification
            }
          });
          console.log("fcm get token entered")
            this.token = await this.fcm.getToken();
            const apnsToken: string = await this.fcm.getAPNSToken();
            console.log("APNs token"+ apnsToken);
            let token = new Token();
            token.token = this.token;
            console.log("Device token: "+token);
            // alert(token);
            window.localStorage.setItem('device-token', JSON.stringify(this.token));
            // localStorage.setItem(config.constants.deviceToken, this.token)
            this.local.setItem(Config.constants.deviceToken, this.token);
            let date = new Date();
            token.creationDate = date.toISOString();
            token.updatedDate = date.toISOString();
            window.localStorage.setItem(Config.constants.token, JSON.stringify(token));
          this.fcm.subscribeToTopic('marketing');
        }catch (error) {
          console.log(error);
        }

        try {
          console.log('Subscribing to new notifications');
          this.fcm.onNotification().subscribe((data)=> {
            let notify: any = JSON.stringify(data);
            console.log('notify' + JSON.stringify(data));
            notify = JSON.parse(notify);
            let message = notify.message;
            let regex = /\d+/g;
            let matches = message.match(regex);
            let requestId = parseInt(matches);
            if (requestId && requestId != undefined && requestId == parseInt(matches)) {
              // if (Config.constants.setting.pushPopup)
              // setTimeout(() => {
              //   this.notifyAlert(Config.name, notify.message, requestId);
              // }, 3000);

            }
          },async (err)=>{
            console.log("error in on notification:-"+err);
          });
        } catch (error) {
          console.error('onnotification'+error);
        }

        this.hideSplashScreen();
      }
    }).catch(e => console.log(e));
  }
  startLocationTracking() {
    let instance = this;
    this.diagnostic.isLocationEnabled().then((state) => {
      if (state) {
        instance.startLocationTracking();
      } else {
        instance.common.alertToast(instance.reqService.translatedata("enableLocation"));
        instance.diagnostic.switchToLocationSettings();
      }
    });
    let successCallback = (state) => {
      if (state) {
        instance.startLocationTracking();
      }
    };
    this.diagnostic.registerLocationStateChangeHandler(successCallback);
  }

  hideSplashScreen() {
    if (this.splashScreen) {
      setTimeout(() => {
        this.splashScreen.hide();
      }, 500);
    }
  }
  async ngOnInit() {
    console.log('ngoninit called' + Config.backend.host);
    // this.task = 'BIOMETRIC';
    window.localStorage.setItem('domain-url', Config.backend.host);
    let domain = window.localStorage.getItem('domain-url') && window.localStorage.getItem('domain-changed') ? window.localStorage.getItem('domain-url') : Config.backend.host;
    let locationId = window.localStorage.getItem('location');
    let workRequest = JSON.parse(localStorage.getItem('workRequestBasedLogin'));
    let viewType = this.common.getViewType();
    domain = domain.includes('/api/') ? domain : domain + '/api/';
    if (domain) {
      Config.backend.host = domain;
    }
    let pro = localStorage.getItem("Profile")
      let userProf = JSON.parse(pro);
      if (userProf && userProf != null) {
        if (navigator.onLine) {
          await this.reqService.refreshJWTToken()
          .then(
            res => {
              if (res && (res.id_token != null && res.id_token != '' && res.id_token != undefined)) {
                console.log('RefreshToken :' ,res)
                localStorage.setItem('auth-token', 'Bearer ' + res.id_token);
                console.log('res FingerPrint', res);
                // this.task = 'BIOMETRIC';
              }
              else {
                this.task = 'BIOMETRIC';
              }
            }
          ).catch(err => {
              if(err && err.status){
              }
              this.task = 'BIOMETRIC';
          })
        }
        this.platform.ready().then(() => {
          try {
            const authObserver = this.afAuth.authState.subscribe(user => {
              if (user) {
                authObserver.unsubscribe();
              } else {
                this.reqService.authenticateFirebase().then((user) => {
                })
                authObserver.unsubscribe();
              }
            });
          } catch (error) {
            console.log("Error in authentication==>" + error);
          }
          this.logged = true;
          this.user = userProf;
          let navigationExtras: NavigationExtras = {
            queryParams: {
              task: this.task
            },replaceUrl:true
          }
          this.routeUrl = this.task == 'BIOMETRIC' ? 'login' : 'home';
          this.rootPage =  workRequest == 'workRequestBasedLogin' ? this.router.navigate(['/work-request-list']) :  this.router.navigate([this.routeUrl],navigationExtras);
          this.common.viewType = userProf.uicustomized ? 'location' : 'user';
          this.common.setViewType(this.common.viewType ? this.common.viewType : 'user');
        });
      } else {
        this.logged = false;
        this.rootPage = (domain || this.isBrowser) ? this.router.navigate(['/login']) : this.router.navigate(['/login']);
      }
  }


  updateUserLocation() {
    let location = {
      organization: this.profile.tenantId,
      userId: this.profile.id,
      env: Config.constants.env,
      latitude: this.currentlocation.lat,
      longitude: this.currentlocation.lng
    };
    this.reqService.addUserLocation(location).then((result) => {
      console.log(result);
    }).catch(console.error);
  }

  pushNavigation(requestId) {
    this.reqService.getRequestDetail(requestId)
    .subscribe(incidents => {
      if (null != incidents && incidents.detail != null) {
        let type = 'pending';
        if (incidents.type == "jobs") {
          type = 'job';
        }
        this.goDetailPage(incidents.detail, type);
      }
    });
  }

  goDetailPage(incident, type) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        selectedRequest: JSON.stringify(incident),
        type: type,
        isDraft: false,
        isAlert: true
      }
    };
    this.router.navigate(['/request-detail'],navigationExtras );
  }

  async  notifyAlert(msgTitle, message, requestId) {
    let alert = await this.alertCtrl.create({
      header: Config.name,
      subHeader: message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Ok',
          handler: () => {
            if (requestId) {
              this.pushNavigation(requestId);
            }
          }
        }
      ]
    });
     await alert.present();
  }

  async logOut() {
    this.common.displayLoading();
    let profile = JSON.parse(window.localStorage.getItem('Profile'));
    this.reqService.getUser(profile.id).subscribe(async (res)=>{
      profile.companyId = res.companyId;
      profile.uuid = null;
      profile.deviceName = null;
      this.reqService.updateUser(profile).subscribe
      (
        async(res)=>(res),
        async(err)=>(err)
      )
    })
    if (navigator.onLine) {
      if (this.platform.is('cordova')) {
        this.updateUser(profile);
        let token = (window.localStorage.getItem('device-token'));
        window.localStorage.removeItem("tenantId");
        window.localStorage.removeItem("workflowType");
        window.localStorage.removeItem("assetList");
        // window.localStorage.setItem(Config.constants.routeDraftRequest,JSON.stringify([]));
        await this.common.setStorageValue(Config.constants.routeDraftRequest,[]);
        this.reqService.userLogout(profile.email, token)
        .subscribe(
          response => {
            this.common.stopLoading();
            if (response) {
              this.common.isHomeLoaded = false;
              this.common.isWorkLoaded = false;
              this.clearStroage();
            } else {
              console.error(response);
              setTimeout(() => {
                this.offlineLogoutAlert();
              }, 100);
              
            }
          },async (err) => {
            this.common.stopLoading();
            this.router.navigate(['/login'],{replaceUrl:true});
            console.log(err);
          }
        )
      } else {
        this.clearStroage();
      }
    } else {
      this.common.stopLoading();
      this.offlineLogoutAlert();
    }

    window.localStorage.setItem('UniqueId', JSON.stringify(''));

  }

  updateUser(response) {
    this.reqService.getUserInfo().subscribe(
      async (res) => {
        response.langKey = res.langKey == response.langKey ? response.langKey : res.langKey;
        response.resetPublicKey = true;
        response.uuid = null;
        response.deviceName = null;
    this.reqService.updateUser(response).subscribe((res)=>{
      console.log('userProfile', res);
    },async(err)=>{      
      // this.common.alertToast('Disabled Biometric')
      console.log(err);
    });
      });
  }

   async offlineLogoutAlert() {
    let alert = await this.alertCtrl.create({
      header: this.reqService.translatedata('logout'),
      subHeader: this.reqService.translatedata("Thank you for working with us. Do you wish to logout?"),
      buttons: [
        {
          text: this.reqService.translatedata('cancel'),
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: this.reqService.translatedata('logout'),
          handler: () => {
            this.clearStroage();
          }
        }
      ]
    });
     await alert.present();
  }

 async clearStroage() {
   console.log('------------------clearStroage enter------------');
    let domain = window.localStorage.getItem('domain-url') && window.localStorage.getItem('domain-changed') ? window.localStorage.getItem('domain-url') : Config.backend.host;
    this.local.clear().then(
      data => console.log(data),
      error => (error)
    );
    window.localStorage.clear();
    window.localStorage.removeItem('userProfile');
    window.localStorage.setItem('AssetLists',JSON.stringify([]));
    localStorage.setItem('userProfile', JSON.stringify(''));
    localStorage.setItem('logo-img', JSON.stringify(''));
    localStorage.setItem('checkin', JSON.stringify(''));
    localStorage.setItem('started-work', JSON.stringify(''));
    localStorage.setItem('assetItemList', JSON.stringify(''));
    localStorage.setItem('location_state', JSON.stringify(''));
    window.localStorage.removeItem("assetList");
    window.localStorage.removeItem('viewType');
    window.localStorage.removeItem('auth-token');
    window.localStorage.setItem('previousTime', JSON.stringify(''));
    this.local.clear();
    this.common.viewType = '';
    this.user.username = null;
    this.logged = false;
    window.localStorage.setItem('domain-url', domain);
    window.localStorage.setItem('domain-changed', domain);
    this.common.updateOnPullRequest();
    window.localStorage.clear();
    this.router.navigate(['login'],{replaceUrl:true});



  }

  async showUpdateAlert() {
    if (Config.constants.setting.LogoutOnUpdate)
      this.clearStroage();
    let alert = await this.alertCtrl.create({
      header: 'Update required',
      message: '<div><img src="assetItems/imgs/update.png"><span class="alert-text">We\'\ re not  going to bore you with details, but for technical reasons, we need to ask you to update the app to continue using it. Sorry about that.</span></div>',
      cssClass: 'custom-alert',
      backdropDismiss: false,
      buttons: [{
        text: 'To the App Store',
        handler: () => {
          if (this.platform.is("android")) {
            this.market.open(Config.constants.setting.Package);
          } else if (this.platform.is("ios")) {
            this.market.open("id1439308424");
          }
        }
      }]
    });
     await alert.present();
  }
  PeriodicallySendData(): void {
    setInterval(() => {
      // this.startTracking();
    },  60*60*1000);
  }


}
