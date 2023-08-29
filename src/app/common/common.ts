import { filter, first } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { Events } from 'src/providers/events/events';
import { AngularFirestore } from '@angular/fire/firestore';
import { ServiceProvider } from 'src/providers/service/service';
import { Router } from '@angular/router';
import { Config } from '../config';
import { deflate } from 'pako';
import { StorageImplementation } from 'src/providers/localstorage-indexDb/storage';
@Injectable()
export class CommonProvider {

  loader: any;
  pendigCount: any = 0;
  pendingList: any = [];
  requestCount: any = 0;
  jobsCount: any = 0;
  userList: any = [];
  faqList: any = [];
  assetList: any = [];
  companyList: any = [];
  workflowList: any = [];
  tagList: any = [];
  locationList: any = [];
  pageConfig: any;
  homeScreen: any;
  viewType: any;
  locationId: any;
  appRights: any = 'write';
  profile: any;
  locationWatch: any;
  dynamicLoadingStop: boolean;
  isSyncStarted: boolean = false;

  logo: any =
    'data:image/png;base64,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';
  public offlineMsg: string = 'Network unavailable, Please check connectivity';
  public serverDown: string = "Server can't be reached";
  public isWorkflowLoaded: boolean;
  public isJobLoaded: boolean;
  public isWorkLoaded: boolean;
  public isRequestLoaded: boolean;
  public isCalendarLoaded: boolean;
  public isHomeLoaded: boolean;
  public expiryTime: number = 30000;
  loadingStarted: boolean = false;
  actionSheetControl: any;
  dynamicLoader: any;
  loading: boolean;
  displayLoadingStart: boolean;
  loadingStart: boolean = false;
  constructor(
    public toastCtrl: ToastController,
    public translate: TranslateService,
    public datepipe: DatePipe,
    public loadingCtrl: LoadingController,
    public fba: FirebaseAnalytics,
    public platform: Platform,
    public storage: NativeStorage,
    private barcodeScanner: BarcodeScanner,
    private events : Events,
    private firestore :AngularFirestore,
    private router: Router,
    private storageService: StorageImplementation
    // private reqService: ServiceProvider
  ) {}

  async alertToast(toastMsg,duration?) {
    let toast = await this.toastCtrl.create({
        message: toastMsg,
        position: 'middle',
        duration:  duration != undefined ? duration : 3000,
    });
    return toast.present();
  }
  ionViewDidEnter() {
    if(this.assetList && this.assetList.length < 1) {
      this.fetchAssetFromFirestore();
    }
  }
  updateOnPullRequest() {
    this.isJobLoaded = false;
    this.isWorkLoaded = false;
    this.isRequestLoaded = false;
    this.isWorkflowLoaded = false;
  }

  getCurrentDate(currentdate?) {
    let date = currentdate ? currentdate : new Date();
    let latest_date = this.datepipe.transform(date, 'YYYY-MM-DD HH:mm:ss');
    // console.log(latest_date);
    return latest_date;
  }

  getUTCTimeString() {
    let date = new Date();
    let startdate = this.datepipe.transform(date, 'YYYY-MM-ddTHH:mm:ss') + 'Z';
    return startdate;
  }
  customLoader(time) {
    var response;
    this.translate.get('Loading...').subscribe((res: string) => {
    response = res;
    });
    this.loadingCtrl.create({
      spinner: 'bubbles',
      message: response,
      duration: time,
      cssClass: 'loading',
      backdropDismiss: false,
    }).then((res) => {
      // console.log('start loading custom loader');
      res.present();
      
    })
  }
  async displayLoading() {
    const loader = this.loadingCtrl.getTop();
    if(!this.displayLoadingStart  && loader != undefined) {
      var response;
      this.translate.get('Loading...').subscribe((res: string) => {
      response = res;
      });
      this.loading = true
      this.loadingCtrl.create({
        spinner: 'bubbles',
        message: response,
        cssClass: 'loading',
        backdropDismiss: false,
      }).then((res) => {
        // console.log('start loading');
        this.displayLoadingStart = true;  
        res.present();
      }).catch((err) => {
        this.displayLoadingStart = false;  
        // console.log('error start loading', err)
      })
    }
  }
  async dynamicLoading() {
  const loader = this.loadingCtrl.getTop();
  if(!this.loadingStarted && loader != undefined) {
    await this.loadingCtrl.create({
      spinner: 'bubbles',
      message: 'Loading...',
      cssClass: 'dynamic',
      duration: 2000,
  }).then((res)=>{
    // console.log('start dynamic loading');
    this.loadingStarted = true;
    res.present();
  }).catch((err)=>this.loadingStarted = false)
  }
  }
  async dismissAllLoaders() {
    let topLoader = await this.loadingCtrl.getTop();
    while (topLoader) {
      if (!(await topLoader.dismiss())) {
        this.loadingCtrl.dismiss();
        throw new Error('Could not dismiss the topmost loader. Aborting...');
      }
      
      topLoader = await this.loadingCtrl.getTop();
    }
  }
  async stopDynamicLoading() {
      setTimeout(() => {
        const loader = this.loadingCtrl.getTop();
        if(this.loadingStarted && loader != undefined) {
        this.loadingCtrl.dismiss()
        .then((res) =>{
          this.loadingStarted = false;
          // console.log('stop dynamic loading',res);
          if(res || !res) {
            // console.log('stop dynamic after true or false');
            this.loadingCtrl.dismiss();
            this.dismissAllLoaders();
          }
        })
        .catch((err) =>{
          this.dismissAllLoaders();
          // console.log('stop dynmaic loading error',err)
        }
)
      }
      },4000)

  }

  async stopLoading() {
    // this.loadingStarted = true;
    setTimeout(() => {
      const loader = this.loadingCtrl.getTop();
      if(this.displayLoadingStart && loader != undefined) {
        this.loadingCtrl.dismiss().then((res) => {
          this.displayLoadingStart = false;
          this.loadingStarted = false;
          // console.log('loading Closed')
        }).catch((err) => {
          this.dismissAllLoaders();
          this.displayLoadingStart = true;
          this.loadingStarted = true;
          // console.log(err, 'loading not closed ');
        })
      }
    },2000)

    


    // this.loading = false;
    // this.loadingCtrl.dismiss().then((res) => {
    //   if(res === false) this.loadingCtrl.dismiss();
    // }).catch((error) => {
     
    //   // console.log('error', error);
    // });
  }
  async startLoading() {
    if (!this.loadingStart)
      await this.loadingCtrl.create({
        spinner: 'bubbles',
        message: 'Loading...',
        cssClass: 'dynamic',
        duration: 2000,
      }).then((res) => {
        // console.log('start dynamic loading');
        this.loadingStart = true;
        res.present();
      }).catch((err) => this.loadingStart = false)
  }
  async endLoading() {
    setTimeout(() => {
      if (this.loadingStart) {
        this.loadingCtrl.dismiss().then((res) => {
          this.loadingStart = false;
        }).catch((err) => {
          this.loadingStart = true;
        })
      }
    }, 2000)
  }

goBack() {
  window.history.back();
}
  updateWorkflowStatus() {
    setTimeout(() => {
      this.isWorkflowLoaded = false;
    }, this.expiryTime);
  }

  updateRequestStatus() {
    setTimeout(() => {
      this.isRequestLoaded = false;
    }, this.expiryTime);
  }

  updateJobStatus() {
    setTimeout(() => {
      this.isJobLoaded = false;
    }, this.expiryTime);
  }

  updateWorkStatus() {
    setTimeout(() => {
      this.isWorkLoaded = false;
    }, this.expiryTime);
  }

  updateCalendarStatus() {
    setTimeout(() => {
      this.isCalendarLoaded = false;
    }, this.expiryTime);
  }

  logClickEvent(event, page) {
    if (this.platform.is('cordova')) {
      try {
        this.fba
          .logEvent(event, { page: page })
          .then((res: any) => {
            // console.log('Response==>' + res);
          })
          .catch((error: any) => {
            // console.log(error);
          });
      } catch (error) {
        // console.log('Error in logevent==>' + error);
      }
    }
  }

  getLocationId() {
    return window.localStorage.getItem('location');
  }

  setViewType(type) {
    window.localStorage.setItem('viewType', type);
  }

  setTenantId(tenantId) {
    window.localStorage.setItem('tenantId', tenantId);
  }

  getWorkFlowType() {
    return window.localStorage.getItem('workflowType');
  }

  setWorkFlowType(workflowType) {
    window.localStorage.setItem('workflowType', workflowType);
  }

  getTenantId() {
    return window.localStorage.getItem('tenantId');
  }

  getViewType() {
    return window.localStorage.getItem('viewType');
  }

  validateAsset(request) {
    let isValid = false;
    if (!isValid && localStorage.getItem('assetDetails')) {
      
      let asset = JSON.parse(localStorage.getItem('assetDetails'));
      // console.log("get asset details "+ asset + "request"+request.id)
      if (
        asset &&
        asset.requestId == request.requestId &&
        asset.assetSerialNo &&
        asset.modelName &&
        asset.modelCode &&
        asset.name
      ) {
        isValid = true;
      }
    }
    return isValid;
  }

  checkMissingField(request) {
    let missingField;
    let isValid = false;
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

  getAssetDetails(assetId) {
    let assetinfo = {};
    return assetinfo;
  }

  getEncodedUserAuth() {
    const token = localStorage.getItem('auth-token');
    const encodedPath = btoa(token);
    return 'localpath03690=' + encodedPath;
  }
  barcodeScan(type?) {
    let barcodeData;
    let options: BarcodeScannerOptions = {
      showTorchButton: true,
    };
    this.barcodeScanner.scan(options)
    .then((barcode)=>{
      barcodeData = barcode;
      setTimeout(() => {
        if(type == 'location') {
          this.events.publish("barcodeScanLoc", {data:barcodeData});
        }else {
          this.events.publish("barcodeScan", {data:barcodeData});
        }
        
      }, 5000);
    }).catch((error)=>{
      setTimeout(() => {
        this.events.publish("barcodeScan", {data:'Not Found'});
      }, 5000);
    })
  }
  private fetchAssetFromFirestore() {
    let assetCollectionRef = this.firestore
        .collection("organization")
        .doc(this.profile.org_id)
        .collection("asset");
    if (
        this.profile.isRowlevel &&
        this.profile.locationIds &&
        this.profile.locationIds.length
    ) {
        assetCollectionRef = this.firestore
            .collection<any>("organization")
            .doc<any>(this.profile.org_id)
            .collection<any>("asset", (ref) =>
                ref.where("path", "array-contains-any", this.profile.locationIds)
            );
    }
    assetCollectionRef.valueChanges().subscribe((res) => {
        this.assetList = res;
        // console.log("get a data from firestore"+this.assetList);
        // localStorage.setItem('assetList', JSON.stringify(this.assetList));
    });
}
async clearStroage() {
  console.log('------------------clearStroage enter------------');
  // window.localStorage.setItem(Config.constants.routeDraftRequest,JSON.stringify([]));
  await this.setStorageValue(Config.constants.routeDraftRequest,[]);
   let domain = window.localStorage.getItem('domain-url') && window.localStorage.getItem('domain-changed') ? window.localStorage.getItem('domain-url') : Config.backend.host;
   this.storage.clear().then(
     data => console.log(data),
     error => console.error(error)
   );
   window.localStorage.clear();
   window.localStorage.removeItem('userProfile');
   this.storage.remove('userProfile');
   this.storage.remove('logo-img');
   this.storage.remove('checkin');
   this.storage.remove('started-work');
   this.storage.remove("assetItemList");
   this.storage.remove('location_state');
   window.localStorage.removeItem("assetList");
   window.localStorage.removeItem('viewType');
   window.localStorage.removeItem('auth-token');
   this.storage.clear();
  //  this.common.viewType = '';
  //  this.user.username = null;
  //  this.logged = false;
   window.localStorage.setItem('domain-url', domain);
   window.localStorage.setItem('domain-changed', domain);
  //  this.common.updateOnPullRequest();
   window.localStorage.clear();
   this.router.navigate(['login'],{replaceUrl:true});

   
  
 }
 removeDuplicateArrayobj(data) {
  if(data && data?.length >= 1) {
    return Array.from(new Set(data.map(a => a?.id))).map(id=> {
      return data.find(a => a?.id === id)
    });
  }else {
    return [];
  }
 }
 getTimeAgo(creationDate) {
  // console.log('Inner Input Creation Date', creationDate);

  let date: any;
  date = new Date(creationDate);

  var currentDate: any = new Date();
  // console.log('Inner Input Current Date', currentDate);
  // console.log('Inner Input Creation Date After Conversion', date);
  // console.log('Difference', currentDate - date);

  var seconds = Math.floor((currentDate - date) / 1000);
  // console.log('seconds', seconds);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + 'Y';
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + 'M';
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + 'D';
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + 'H';
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + 'm';
  }
  return Math.floor(seconds) + 's';
}
getWorkFlow() {
  let profile = JSON.parse(window.localStorage.getItem('Profile'));
  let WorkFlowCollectionRef = this.firestore
      .collection<any>("organization")
      .doc<any>(profile.tenantId)
      .collection<any>('workflow')
      WorkFlowCollectionRef.valueChanges().subscribe((res : any) => {
        if(res) {
          return res;
        } 
      },async(err)=>{
        return false;
        // this.isAssetDownTimeTracking =  false;
      })
}
getOnlyNotOverDueData(data) {
  var value
  let currentDate = this.getUTCTime();
  if(data && data?.length >= 1) {
    value = data.filter(val => val.requestExpectedEndDate > currentDate);
    // console.log(value);
    return value;
  }else {
    return [];
  }
}
getUTCTime() {
  var date = new Date();
  var now_utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(),
  date.getUTCDate(), date.getUTCHours(),
  date.getUTCMinutes(), date.getUTCSeconds());
  return date.toISOString();
}
getOverdueNotPending(data) {
  let currentDate = this.getUTCTime();
  if(data && data.length >= 1) {
    return data.filter(val => (val.requestStatus!= 'Pending' && val.requestExpectedEndDate < currentDate))
  }else {
    return [];
  }

}
  //firebase get a respone using get() value method
  async getDocValue(data) {
  let res =[];
  await data.docs.map((doc :any)=>{
    res.push(doc.data());
  })
  return res;
}
sortData(data,type?,sort?) {
  if(data && data.length != 0 ) {
    if(type == 'SCHEDULE_REQUEST')  {
      if(sort) {
        return data.sort((a,b)=> new Date(b.scheduleStartDateTime).getTime() - new Date(a.scheduleStartDateTime).getTime());
      }else {
        return data.sort((a,b)=> new Date(a.scheduleStartDateTime).getTime() - new Date(b.scheduleStartDateTime).getTime());
      }
      
    } else {
      if(sort) {
        return data.sort((a,b)=> new Date(b.updationDate).getTime() - new Date(a.updationDate).getTime());
      }else {
        return data.sort((a,b)=>  new Date(a.updationDate).getTime() - new Date(b.updationDate).getTime());
      }
      
    }
  }else {
    return [];
  }
}
compressImage(file, compressionQuality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = file as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          resolve(blob as Blob);
        }, file.type, compressionQuality);
      };

  });
} 
 blobToBase64(blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}
compressBase64(base64String) {
  const binaryString = atob(base64String);
  const compressedBuffer = deflate(binaryString);
  const compressedBase64 = btoa(String.fromCharCode.apply(null, compressedBuffer));
  return compressedBase64;
}

 compressImageString(base64String, maxWidth, maxHeight) {
  var portrait = false;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const width = img.width;
      const height = img.height;
      maxWidth = (img.width/100)*50;
      maxHeight = (img.height/100)*50;
      let newWidth = width;
      let newHeight = height;

      // Calculate the new width and height if they exceed the maximum size
      if (width > maxWidth) {
        newWidth = maxWidth;
        newHeight = Math.round((height * maxWidth) / width);
      }
      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = Math.round((newWidth * maxHeight) / newHeight);
        newHeight = maxHeight;
      }

      // Set the canvas size and draw the image on it
      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Get the compressed image data from the canvas and encode it back to Base64
      const compressedData = canvas.toDataURL('image/jpeg', 0.7); // adjust the compression level as needed
      const compressedBase64 = compressedData.replace(/^data:image\/(png|jpeg);base64,/, '');

      resolve(compressedBase64);
    };
    img.onerror = reject;
    img.src =  base64String;
  });
}
  async getdeviceInfo() {
    const userAgent = window.navigator.userAgent;
    if (this.platform.is('android')) {
      const match = userAgent.match(/(?<=Android ).+(?= Build)/);
      if (match) {
        const deviceName = match[0];
        return await deviceName;
      }
    } else if (this.platform.is('ios')) {
      const match = userAgent.match(/(?<=iPhone ).+(?= )/);
      if (match) {
        const deviceName = match[0];
        return await deviceName;
      }
    }
  }
  removeSpecialChar(data) {
    if(data) {
      const str = data;
      const regex = /[@#$%^&*()!?]/g;
      const newStr = str.replace(regex, "");
      console.log(newStr); // This is a string with some special characters
      return newStr;
    }else {
      return '';
    } 
  }

  // get asset list for row level user
    async getAssetForRowLevlUserWorkReqFromFirestore(profile?:any, locId?:any) {
      try {
        const querySnapshot = await this.firestore
          .collection<any>("organization")
          .doc<any>(profile.tenantId)
          .collection<any>("asset", (ref) =>
            ref.orderBy('id').limit(20).where("locationId", "==", locId))
          .get()
          .pipe(first())
          .toPromise();

        if (!querySnapshot?.empty) {
          const data = await this.getDocValue(querySnapshot);
          return data;
        } else {
          return [];
        }
      } catch (error) {
        console.log('Error executing Firestore query:', error);
        return [];
      }
    }

  
    // get asset list for row level user
    async nextAssetForRowLevlUserWorkReqFromFirestore(profile?:any, lastDoc?: any, locId?: any) {
      try {
        const querySnapshot = await this.firestore
          .collection<any>("organization")
          .doc<any>(profile.tenantId)
          .collection<any>("asset", (ref) =>
            ref
              .orderBy('id')
              .limit(20)
              .startAfter(lastDoc)
              .where("locationId", "==", locId))
          .get()
          .pipe(first())
          .toPromise();
    
        if (!querySnapshot?.empty) {
          const data = await this.getDocValue(querySnapshot);
          return data;
        } else {
          return [];
        }
      } catch (error) {
        console.log('Error executing Firestore query:', error);
        return [];
      }
    }
    

  // remove space from end and start
  removeSpace(data) {
    if(data) {
      const str = data;
      const regex = /^\s+|\s+$/g;
      const newStr = str.replace(regex, "");
      console.log(newStr); // This is a string with some special characters
      return newStr;
    }else {
      return '';
    }





    
  }

  //get value from storage file and return value
  async getStorageValue(key: string) {
    try {
      const value = await this.storageService.get(key);
      console.log('getStorageValue:', value);
      return value ? value : [];
    } catch (error) {
      console.log('Error:', error);
      return [];
    }
  }
  async setStorageValue(key: string, value: any) {
    await this.storageService.add(key, value);
  }
  




// import { AngularFirestore } from '@angular/fire/firestore';

// export class MyComponent {
//   constructor(private firestore: AngularFirestore) {}

//   search(searchTerm: string) {
//     const searchTerms = searchTerm.split(' ');
//     const observables = searchTerms.map(term =>
//       this.firestore.collection('myCollection', ref => ref.where('name', '>=', term)
//         .where('name', '<=', term + '\uf8ff')).valueChanges()
//     );
//     return combineLatest(observables).pipe(
//       map(results => results.reduce((acc, cur) => acc.filter(x => cur.includes(x)), results[0]))
//     );
//   }
// }

}
