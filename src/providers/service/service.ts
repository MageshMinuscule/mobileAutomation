import { BackEnd } from './../../app/config';
import { config } from 'process';
import { Inject, Injectable, NgModule } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Config, firebaseAuth } from '../../app/config';
import { AngularFireAuth } from '@angular/fire/auth';

import { observable, Observable, pipe, Subject } from 'rxjs';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Asset, AWSImageData, RequestTimer } from 'src/app/data.model';
import { Platform } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { retry, debounceTime, map, timeout  } from 'rxjs/operators';

import { CommonProvider } from 'src/app/common/common';
import { Events } from '../events/events';
export type EntityResponseType = HttpResponse<any>;
@NgModule({
  imports :[TranslateModule]
})
export class User {
  username: string;
  password: string;
  origin: string;

  constructor(@Inject(String) username: string, @Inject(String) password: string) {
    this.username = username;
    this.password = password;
    this.origin = 'mobile';
  }
}

@Injectable({
  providedIn: 'root',
})
export class ServiceProvider {
  currentUser: User;
  headers: HttpHeaders;
  locationArr: any = [];
  navList: any = [];
  tmpNav: any = [];
  syncStarted: boolean = false;
  serverTimeout: number = 1500;
  option: any = {};
  private sub = new Subject();
  private requestTimerUrl = Config.backend.host + '/request_user_timers';
  constructor(
    public http: HttpClient,
    public afAuth: AngularFireAuth,
    public storage: NativeStorage,
    public platform: Platform,
    public translate: TranslateService,
    private common: CommonProvider,
    private events: Events
  ) {}

  translatedata(key) {
    var response;
    this.translate.get(key).subscribe((res: string) => {
      response = res;
    });
    return response;
  }

  setLanguage(lng) {
    this.translate.setDefaultLang(lng);
  }

  userLogin(credentials): Observable<any> {
    return this.http
      .post(Config.backend.host + 'authenticate', {
        username: credentials.email,
        password: credentials.password,
        rememberMe: true,
        origin: credentials.origin
      })
      .pipe(retry(2))
  }

  //user log out
  userLogout(username, token): Observable<any> {
    this.getAuthHeaders();
    token = (window.localStorage.getItem('device-token'));
    console.log(token);
    return this.http
      .delete(
        Config.backend.host +
          'mobileservice/device-tokens/' +
          username +
          '/' +
          token,
        this.getAuthHeaders()
      )
      .pipe(retry(1), debounceTime(this.serverTimeout));
  }
  authenticateFirebase() {
    let credentials = firebaseAuth;
    return new Promise((resolve, reject) => {
      this.afAuth
        .signInWithEmailAndPassword(credentials.username, credentials.password)
        .then((returnedUser) => {
          console.log('uid', returnedUser.user.uid);
          resolve(returnedUser);
        })
        .catch((err) => {
          console.log('Error', err);
          reject(err);
        });
    });
  }

  // Get User Profile
  getUserProfile(): Promise<any> {
    let profile = {};
    return new Promise((resolve) => {
      this.storage.getItem('userProfile').then(
        (info) => {
          if (info) {
            profile = JSON.parse(info);
          }
          resolve(profile);
        },
        (error) => console.log(error)
      );
    });
  }
  getUser(userId): Observable<any> {
    return this.http
      .get(Config.backend.host + 'users/' + userId, this.getAuthHeaders())
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }
  addDeviceToken(token): Observable<any> {
    return this.http
      .post(
        Config.backend.host + 'mobileservice/device-tokens',
        JSON.stringify(token),
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }
  // Update Parts quantity
  updateParts(parts): Observable<any> {
    return this.http
      .put(
        Config.backend.host + 'inventories/bulkUpdate',
        parts,
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }
  createComment(postData): Observable<any> {
    return this.http
      .post(
        Config.backend.host + 'mobileservice/request-comments',
        JSON.stringify(postData),
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }
  saveAsset(postData): Observable<any> {
    return this.http
      .put(
        Config.backend.host + 'mobileservice/assets-request',
        JSON.stringify(postData),
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }

  genericGet(uri: string, param: any): Promise<any[]> {
    let workflowJson = null;
    return new Promise((resolve) => {
      this.http
        .get(Config.backend.host + uri + '/' + param, this.getAuthHeaders())
        // .timeout(this.serverTimeout)
        // .pipe(map((response) => response.json()))
        .subscribe(
          (workflowList) => {
            if (null != workflowList) {
              workflowJson = workflowList;
            }
            resolve(workflowJson);
          },
          (error) => {
            if (error.status == 401) {
              this.events.publish('user:inactive', error.status);
            }
            resolve(workflowJson);
          }
        );
    });
  }
  genericAWSImageGetOne(data: any, type: any): Promise<any> {
    let image = new AWSImageData();
    image.id = data.key;
    return new Promise((resolve) => {
      let url =
        'https://5wn6nc1nk7.execute-api.ap-south-1.amazonaws.com/production/image/' +
        data.key;
      if (type == 'thumbnail') {
        url =
          'https://5wn6nc1nk7.execute-api.ap-south-1.amazonaws.com/production/image/thumbnail/' +
          data.key;
      }
      this.http
        .get(url)
        // .timeout(this.serverTimeout)
        // .pipe(map((response) => response.json()))
        .subscribe(
          (imageData: any) => {
            // workflowList = null;
            if (null != imageData) {
              image.imageBlob = imageData;
            }
            resolve(image);
          },
          (error) => {
            if (error.status === 0 && type == 'full') {
              this.genericAwsImageFetch(data).then((base64image) => {
                if (base64image && base64image.status == 200) {
                  let obj = JSON.parse(base64image._body);
                  let imagedata = {
                    id: data.key,
                    imageBlob: obj['key'],
                  };
                  resolve(imagedata);
                } else {
                  resolve(image);
                }
              });
            } else resolve(image);
          }
        );
    });
  }
  genericImageGetOne(uri: string, param: any): Observable<any> {
    return this.http
      .get(Config.backend.host + uri + '/' + param, this.getAuthHeaders())
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }

  createCustomerLocation(postData): Observable<any> {
    delete postData.temp;
    return this.http
      .post(
        Config.backend.host + 'mobileservice/createCustomerLocation',
        JSON.stringify(postData),
        this.getAuthHeaders()
      )
      .pipe(debounceTime(this.serverTimeout), retry(2));
  }

  //upload-image
  uploadAssetImage(data: any, existingName): Observable<any> {
    this.getAuthHeaders();
    return this.http
      .post(
        Config.backend.host + 'users/imageToUpload/' + existingName + '/png',
        data,
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }

  updateUser(postData): Observable<any> {
    return this.http
      .put(
        Config.backend.host + 'users',
        JSON.stringify(postData),
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }

  getFaceIdAuthToken(postData) : Observable<any> {
    return this.http
      .post(
        Config.backend.host + 'generateUserBarrierToken',
        JSON.stringify(postData), this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout))
  }

  createworkRequest(postData): Observable<any> {
    return this.http
      .post(
        Config.backend.host + 'workRequests',
        JSON.stringify(postData),
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }
  // Update asset downtime tracking
  updateAssetDowntime(assetId, assetDown): Observable<any> {
    return this.http
      .post(
        Config.backend.host +
          'assetDownTimeTrackings/updateAssetDownStatus/' +
          assetId +
          '/' +
          assetDown,
        {},
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }
  getAssetDetails(assetId): Observable<any> {

    // let par = this.getHeaders(option);
    return this.http
      .get(Config.backend.host + 'assets/' + assetId, this.getAuthHeaders())
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }

  updateWorkRequest(putData): Observable<any> {
    return this.http
      .put(
        Config.backend.host + 'workRequests',
        JSON.stringify(putData),
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }
  genericAwsPost(data: any): Observable<any> {
    this.getAuthHeaders();
    return this.http
      .post(
        ' https://5wn6nc1nk7.execute-api.ap-south-1.amazonaws.com/production/image/upload',
        JSON.stringify(data)
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }

  getThumbnailImage(image: any): Observable<any> {
    return this.http
      .post<any>('https://5g6na07x2a.execute-api.ap-south-1.amazonaws.com/ImageFetchFromThumbnail', image, { observe: 'response' })
      .pipe(map((res: any) => res));
  }

  getRequests(type, params?, isFirst?): Promise<any> {
    let respJson = null;
    let url = null;
    let storageParam = null;
    let reqType;
    let isContinue: boolean = false;
    let option;
    if (type == 'MyRequest') {
      option = this.getHeaders(params);
      url = 'mobileservice/myrequests';
      storageParam = Config.constants.myRequestJson;
      isContinue = this.common.isRequestLoaded;
      reqType = 'myRequests';
    } else if (type == 'Pending') {
      option = this.getHeaders(params);
      url = 'mobileservice/pendingactionList';
      storageParam = Config.constants.pendingJson;
      isContinue = this.common.isWorkLoaded;
      reqType = 'pendings';
    } else {
      option = this.getHeaders(params);
      url = 'mobileservice/getJobs';
      storageParam = Config.constants.jobJson;
      isContinue = this.common.isJobLoaded;
      reqType = 'jobs';
    }
    isContinue = false;
    return new Promise((resolve) => {
      if (!isContinue) {
        this.http
          .get(Config.backend.host + url, option)
          // .setTimeout(this.serverTimeout)
          // .map((response) => {
          //   if (isFirst) {
          //     window.localStorage.setItem(
          //       reqType,
          //       response.headers.get("x-total-count")
          //     );
          //     this.events.publish("reqCount", reqType);
          //   }
          //   return response.json();
          // })
          .subscribe(
            (incidents) => {
              if (null != incidents) {
                respJson = incidents;
                if (isFirst) window.localStorage.setItem("storageParam", JSON.stringify(incidents));
              }
              if (type == 'MyRequest') {
                this.common.isRequestLoaded = true;
                this.common.updateRequestStatus();
              } else if (type == 'Pending') {
                this.common.isWorkLoaded = true;
                this.common.updateWorkStatus();
              } else {
                this.common.isJobLoaded = true;
                this.common.updateJobStatus();
              }
              resolve(respJson);
            },
            (error) => {
              if (error.status == 401) {
                this.events.publish('user:inactive', error.status);
              }
              respJson = isFirst
                ? JSON.parse(window.localStorage.getItem("storageParam"))
                : respJson;
              resolve(respJson);
            }
          );
      } else {
        respJson = isFirst ? JSON.parse(window.localStorage.getItem("storageParam")) : respJson;
        resolve(respJson);
      }
    });
  }

  // Get Organization Logo
  getOrganizationLogo(): Promise<any> {
    let logoSrc;
    return new Promise((resolve) => {
      this.storage.getItem('logo-img').then((org) => {
        logoSrc = org ? org.logo : this.common.logo;
        resolve(logoSrc);
      });
    });
  }

  refreshJWTToken(): Promise<any> {
    return new Promise((resolve) => { this.http
      .post(Config.backend.host + 'refreshToken', {}, this.getAuthHeaders())
      .pipe(retry(2), debounceTime(this.serverTimeout)).subscribe( res => {
        resolve(res);
      }, err => {
        resolve(err);
      });
    });
  }

  getAuthHeaders() {
    let auth = localStorage.getItem('auth-token');
    // console.log('auth-token : ', auth);
    this.option = {
      headers: new HttpHeaders({
        Authorization: auth,
        'Content-Type': 'application/json',
        Device: 'mobile'
      }),
    };
    return this.option;
  }
  getHeader() {
    let auth = localStorage.getItem('auth-token');
    this.headers = new HttpHeaders();
    this.headers = new HttpHeaders({
      Authorization: auth,
      'Content-Type': 'application/json',
      Device: 'mobile'
    })
    return this.headers
  }
  getHeaders(params) {
    let auth = localStorage.getItem('auth-token');
    return {
      headers: new HttpHeaders({
        Authorization: auth,
        'Content-Type': 'application/json',
      }),
      search: params,
    };
  }
  getUserInfo(): Observable<any> {
    return this.http
      .get(Config.backend.host + 'mobileservice/user/', this.getAuthHeaders())
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }

  getAccount(): Observable<any> {
    return this.http.get(Config.backend.host + 'account', this.getAuthHeaders());
  }

  updateRequestAsset(postData): Observable<any> {
    return this.http
      .put(
        Config.backend.host + 'mobileservice/update-request-asset',
        JSON.stringify(postData),
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }
  inventoryUpdate(postData): Observable<any> {
    return this.http.put(
      Config.backend.host + 'inventories',
      JSON.stringify(postData),
      this.getAuthHeaders()
    );
  }
  
  // create account
  CreateAccount(account): Observable<any> {
    return this.http
      .post(
        Config.backend.host + 'organizations',
        account, { responseType: 'text' }
      );
  }

  createUser(account): Observable<any> {
    this.getAuthHeaders();
    return this.http
      .post(
        Config.backend.host + 'users/onboarding',
        account,this.getAuthHeaders()
      )
      .pipe(debounceTime(this.serverTimeout), retry(1));
  }

  //Reset Password Link to mail
  ResetPassword(email): Observable<any> {
    return this.http
      .post(
        Config.backend.host + 'account/reset_password/init',
        email, { responseType: 'text' }
      )
      .pipe(debounceTime(this.serverTimeout), retry(1));
  }
  getRequestDetail(requestId): Observable<any> {
    this.getAuthHeaders();
    return this.http
      .get(
        Config.backend.host + 'mobileservice/requestdetail/' + requestId,
        this.getAuthHeaders()
      )
      .pipe(debounceTime(this.serverTimeout), retry(2));
  }

  getJobInstance(instanceId): Observable<any> {
    return this.http
      .get(
        Config.backend.host + 'schedule-job-instances/' + instanceId,
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }

  addUserLocation(location): Promise<any> {
    return new Promise((resolve) => {
      this.http
        .post(
          'https://j6f2fwzbl8.execute-api.us-east-1.amazonaws.com/Location',
          JSON.stringify(location),
          this.getAuthHeaders()
        )
        .subscribe(
          (data) => {
            resolve(data);
          },
          (error) => {
            resolve(error);
          }
        );
    });
  }
  getScheduleJobInstances(postData): Observable<any> {
    return this.http.post(
      Config.backend.host +
        'schedule-job-instances/calendarFilter?page=0&size=100',
      JSON.stringify(postData),
      this.getAuthHeaders()
    );
  }

  //search parts
  searchByName(name): Observable<any> {
    return this.http
      .get(
        Config.backend.host + 'inventories/_search/' + name,
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }

  getWorkorders(postData): Observable<any> {
    return this.http
      .post(
        Config.backend.host + 'requests/calendarFilter?page=0&size=100',
        JSON.stringify(postData),
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }
  getAllParts(): Observable<any> {
    return this.http
      .get(Config.backend.host + 'inventories'+'?size=1000', this.getAuthHeaders())
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }

  getAllPartsByAssetIdAndCategoryId(assetId, searchName, categoryId,bool,size?,page?): Observable<any> {
    size = searchName == " " ? 20 : 20;
    page = page ? page : 0;
    console.log('searchName : ', searchName);
    return this.http
        .get(
          Config.backend.host +
            `inventories/_search/getByCategory/${assetId}/${searchName}/${categoryId}/${bool}` +
             `?page=${page}&size=${size}`,{headers: this.getHeader(),observe: 'response'}
        ).pipe(retry(2), debounceTime(this.serverTimeout));
  }

  getInventoryByAsset(assetId): Observable<any> {
    this.getAuthHeaders();
    return this.http
      .get(
        Config.backend.host +
          'inventories/findByAssetId/' +
          assetId +
          '?page=0&size=200',
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }

  getInventoriesByRequestId(requestId): Observable<any> {
    return this.http
      .get(
        Config.backend.host +
          'inventory-histories/findByRequestId/' +
          requestId,{headers: this.getHeader(),observe: 'response'}
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }

  //search parts
  getAssetInfo(assetId): Observable<any> {
    let asset = {};
    return this.http
      .get(Config.backend.host + 'assets/' + assetId, this.getAuthHeaders())
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }

  //update asset
  updateAsset(postData): Observable<any> {
    return this.http
      .put(
        Config.backend.host + 'mobileservice/updateAssets',
        JSON.stringify(postData),
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }

  getAssets(filter): Observable<any> {
    return this.http
      .post(
        Config.backend.host + 'assets/filterBy',
        filter,
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }

  updateInventory(data: any): Promise<any> {
    return new Promise((resolve) => {
      this.http
        .put(
          Config.backend.host + 'inventories/bulkUpdate',
          JSON.stringify(data),
          this.getAuthHeaders()
        )
        // .timeout(this.serverTimeout)
        // .map((response) => response.json())
        .subscribe(
          (data) => {
            resolve(data);
          },
          (error) => {
            resolve(error);
          }
        );
    });
  }
  //get parts by Id
  getPartsInfo(inventoryId): Observable<any> {
    return this.http
      .get(
        Config.backend.host + 'inventories/' + inventoryId,
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }
  getInventoryByLocation(locationId): Promise<any> {
    this.getAuthHeaders();
    let inventoryList = [];
    return new Promise((resolve) => {
      this.http
        .get(
          Config.backend.host + 'inventories/findAllByLocationId/' + locationId,
          this.getAuthHeaders()
        )
        // .timeout(this.serverTimeout)
        // .map((response) => response.json())
        .subscribe(
          (inventoryList) => {
            resolve(inventoryList);
          },
          (error) => {
            resolve(inventoryList);
          }
        );
    });
  }
  //getallorkrequest
  getAllWorkRequests(): Observable<any> {
    return this.http
      .get(Config.backend.host + 'workRequests', this.getAuthHeaders())
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }
  getAssetHistory(assetId): Observable<any> {
    return this.http
      .get(
        Config.backend.host + 'mobileservice/getAssetHistory/' + assetId,
        this.getAuthHeaders()
      )
      .pipe(debounceTime(this.serverTimeout), retry(2));
  }
  // getAssetHistory(assetId): Promise<any> {
  //   return new Promise((resolve) => {
  //     this.http
  //       .get(
  //         Config.backend.host +
  //           'mobileservice/getAssetHistory/' +
  //           assetId,
  //         this.getAuthHeaders()
  //       )
  //       // .timeout(this.serverTimeout)
  //       // .map((response) => {
  //       //   return {
  //       //     status: response.status,
  //       //     requests: response.json(),
  //       //   };
  //       // })
  //       .subscribe(
  //         (res) => {
  //           resolve(res);
  //         },
  //         (error) => {
  //           if (error.status == 401) {
  //             this.events.publish('user:inactive', error.status, Date.now());
  //           }
  //           resolve(error);
  //         }
  //       );
  //   });
  // }
  getAttachments(id, model): Observable<any> {
    return this.http
      .get(
        Config.backend.host + 'files/' + id + '/' + model,
        {headers: this.getHeader(),observe: 'response'}
      )
      .pipe(debounceTime(this.serverTimeout), retry(2));
  }
  // labour tasks
  getLabourTasksByrequestId(requestId): Observable<any> {
    return this.http
      .get(
        Config.backend.host + 'labourTasks/findByRequestId/' + requestId,
       {headers: this.getHeader(),observe: 'response'}
      )
      .pipe(retry(2));
  }
  createLabourTask(postData): Observable<any> {
    return this.http
      .post(
        Config.backend.host + 'labourTasks',
        JSON.stringify(postData),
        this.getAuthHeaders()
      )
      .pipe(retry(2));
  }
  updateLabourTask(postData): Observable<any> {
    return this.http
      .put(
        Config.backend.host + 'labourTasks',
        JSON.stringify(postData),
        this.getAuthHeaders()
      )
      .pipe(retry(2));
  }
  deleteLabourTask(labourTaskId): Observable<any> {
    return this.http
      .delete(
        Config.backend.host + 'labourTasks/' + labourTaskId,
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }

  getCustomer(customerId): Observable<any> {
    return this.http
      .get(
        Config.backend.host + 'companies/' + customerId,
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }

  //createreqest
  createRequest(postData): Observable<any> {
    delete postData.temp;
    return this.http
      .post(
        Config.backend.host + 'mobileservice/createRequest',
        JSON.stringify(postData),
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }

  //generic post
  genericPost(uri: string, data: any): Observable<any> {
    this.getAuthHeaders();
    return this.http
      .post(
        Config.backend.host + uri,
        JSON.stringify(data),
        this.getAuthHeaders()
      )
      .pipe(debounceTime(this.serverTimeout));
  }
  //delete draftNewReqs
  genericDelete(uri: string, param: any): Observable<any> {
    return this.http
      .delete(Config.backend.host + uri + '/' + param, this.getAuthHeaders())
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }
  saveAttendance(data: any): Observable<any> {
    return this.http
      .post(
        Config.backend.host + 'attendances',
        JSON.stringify(data),
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }

  updateAttendance(data: any): Observable<any> {
    return this.http
      .put(
        Config.backend.host + 'attendances',
        JSON.stringify(data),
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }
  syncSubmittedReq(): Promise<any> {
    return new Promise((resolve) => {
      let newDraftArr = [];
      let locData = JSON.parse(
        JSON.parse(window.localStorage.getItem(Config.constants.draftNewReqs))
      );
      window.localStorage.setItem(Config.constants.draftNewReqs, JSON.stringify([]));
      if (locData) {
        let count = 0;
        for (let draft of locData) {
          count++;
          if (draft.action == 'submit' || draft.action == 'closeIncident') {
            this.createRequest(draft).subscribe(
              (resp) => {
                if (resp) {
                  this.genericDelete(
                    'mobileservice/draftRequest',
                    draft.id
                  ).subscribe((resp) => {
                    if (resp) {
                    }
                  });
                } else {
                  newDraftArr.push(draft);
                }
              },
              async (err) => {
                if (err.status == 401) {
                  this.events.publish('user:inactive', {
                    err: err.status,
                    time: Date.now(),
                  });
                }
                this.common.alertToast(err.status + 'createRequest');
              }
            );
          } else if (draft.action == 'saveAsDraft') {
            this.genericPost('mobileservice/draftRequest', draft).subscribe(
              (resp) => {
                if (resp) {
                } else {
                  newDraftArr.push(draft);
                }
              },
              async (err) => {
                this.common.alertToast(err.status + 'no value present');
              }
            );
          } else {
            newDraftArr.push(draft);
          }
        }
        if (count >= locData.length && newDraftArr.length > 0) {
          window.localStorage.setItem(
            Config.constants.draftNewReqs,
            JSON.stringify(newDraftArr)
          );
          resolve(true);
        } else {
          resolve(true);
        }
      }
    });
  }
  //genericPut
  genericPut(uri: string, data: any): Observable<any> {
    this.getAuthHeaders();
    return this.http
      .put(
        Config.backend.host + uri,
        JSON.stringify(data),
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }
  updateCustomer(postData): Observable<any> {
    return this.http
      .put(
        Config.backend.host + 'companies',
        JSON.stringify(postData),
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }
  getworkRequestByUser(userId): Observable<any> {
    this.getAuthHeaders();
    return this.http
      .get(
        Config.backend.host +
          'workRequests/byUserId/' +
          userId +
          '?page=0&size=200',
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }
  // Parts
  getPartByQRCode(QRString): Observable<any> {
    return this.http
      .get(
        Config.backend.host + 'inventories/findByQRCodeString/' + QRString,
        this.getAuthHeaders()
      )
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }
  genericAwsImageFetch(data: any): Promise<any> {
    this.getAuthHeaders();
    return new Promise((resolve) => {
      this.http
        .post(
          Config.backend.host + 'mobileservice/imageFetchHandler',
          data,
          this.getAuthHeaders()
        )
        .subscribe(
          (data) => {
            resolve(data);
          },
          (error) => {
            resolve(error);
          }
        );
    });
  }
  getUserAttendanceByLocation(locationId): Observable<any> {
    this.getAuthHeaders();

    return this.http.get(
      Config.backend.host + 'attendances/today/location/' + locationId,
      this.getAuthHeaders()
    ).pipe(retry(2), debounceTime(this.serverTimeout));
  }
  
  updateTodayAttendance(employeeUserId, data: any): Observable<any> {
    return this.http
        .post(
          Config.backend.host + "attendances/qrcode/" + employeeUserId,
          JSON.stringify(data),
          this.getAuthHeaders()
        ).pipe(retry(2), debounceTime(this.serverTimeout));

  }

  getUsersByRowLevel(locationId): Observable<any> {
    return this.http
        .get(
          Config.backend.host + "users/getRowLevelUsers/" + locationId,
          this.getAuthHeaders()
        ).pipe(retry(2), debounceTime(this.serverTimeout));
  }

  getRowLevelUsersAutocomplete(locationId, searchName): Observable<any> {
    return this.http
        .get(
          Config.backend.host +
            "users/getRowLevelUsers/autoComplete" +
            locationId,
          searchName
        ).pipe(retry(2), debounceTime(this.serverTimeout));
  }

  getMsgNotification(): Observable<any> {
    let url = "mobileservice/comments";
    return this.http
        .get(Config.backend.host + url, this.getAuthHeaders())
        .pipe(retry(2), debounceTime(this.serverTimeout));
  }

  getScheduleJobInstance(): Observable<any> { 
    return new (()=>{
      if (!this.common.isCalendarLoaded){
        this.http
        .get(
          Config.backend.host + "mobileservice/job-instances",
          this.getAuthHeaders()
        ).pipe(retry(2), debounceTime(this.serverTimeout))
      }
    })
  }
  assetDownTime(postdata): Observable<any>{
    let url = "assetDownTimeTrackings";
    return this.http
      .post(Config.backend.host + url, postdata,this.getAuthHeaders())
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }

  updateAssetDownTimeTracking(postdata): Observable<any> {
    let url = "assetDownTimeTrackings";
    return this.http
      .put(Config.backend.host + url, postdata, this.getAuthHeaders())
      .pipe(retry(2), debounceTime(this.serverTimeout));
  }

  getAllmeterReading(): Observable<any>{
    let url = 'meters';
    return this.http.get(
      Config.backend.host + url, this.getAuthHeaders()
    ).pipe(retry(2), debounceTime(this.serverTimeout))
  }
  getMeterReading(id): Observable<any> {
    let url = 'meters/';
    return this.http.get(
      Config.backend.host + url + id, this.getAuthHeaders()
    ).pipe(retry(2), debounceTime(this.serverTimeout));
  }
  getmeterReadingHistories(id): Observable<any>{
    let url = 'meter-histories/findByMeterId/' + id +"?page=0&size=10&sort=id,desc";
    return this.http.get(
      Config.backend.host + url, this.getAuthHeaders()
    ).pipe(retry(2), debounceTime(this.serverTimeout))
  }
  createMeterHistory(postData): Observable<any> {
    return this.http
      .post(
        Config.backend.host + 'meter-histories',
        JSON.stringify(postData),
        this.getAuthHeaders()
      )
      .pipe(retry(2));
  }
  getMeterDetailByQrcode(qrCodeText): Observable<any>{
    let url = 'meters/getMeter/qrcodeText/' + qrCodeText ;
    return this.http.get(
      Config.backend.host + url, this.getAuthHeaders()
    ).pipe(retry(2), debounceTime(this.serverTimeout))
  }
  downloadExcel(url): Observable<any> {
    let auth = localStorage.getItem('auth-token');
    const headers = new HttpHeaders({
      Authorization: auth
    });
    const options = { headers, responseType: 'blob' as 'blob' };
    return this.http.get( url, options);
  }
  getsupliers() {
    let url = 'suppliers';
    return this.http.get(
      Config.backend.host + url, this.getAuthHeaders()
    ).pipe(retry(2), debounceTime(this.serverTimeout))
  }
  inventory(inventory): Observable<any> {
    let url = 'inventory-histories';
    return this.http.post(
      Config.backend.host + url, inventory, this.getAuthHeaders()
    ).pipe(retry(2), debounceTime(this.serverTimeout))
  }
  locationsummary(filter): Observable<any> {
    let url = 'dashboard/locationsummary/'+filter;
    return this.http.get(Config.backend.host + url,this.getAuthHeaders())
    .pipe(retry(2), debounceTime(this.serverTimeout))
  }
  workFlowSummary(filter): Observable<any> {
    let url = 'dashboard/workflowsummary/'+filter;
    return this.http.get(Config.backend.host + url,this.getAuthHeaders())
    .pipe(retry(2), debounceTime(this.serverTimeout))
  }
  assetSummary(filter): Observable<any> {
    let url = 'dashboard/assetsummary/'+filter;
    return this.http.get(Config.backend.host + url,this.getAuthHeaders())
    .pipe(retry(2), debounceTime(this.serverTimeout))
  }
  getRequestCount(options): Observable<any> {
    let url = 'dashboard/requestCountSummaryByRequestType';
    return this.http.post(Config.backend.host + url,options,this.getAuthHeaders())
    .pipe(retry(2), debounceTime(this.serverTimeout))
  }
  scanWorkRequest(data): Observable<any> {
    let url = Config.backend.host + 'qrcodes/findByQrCodeText/';
    return this.http.post(url,JSON.stringify(data),this.getAuthHeaders())
    .pipe(retry(2), debounceTime(this.serverTimeout))
  }
  scanWorkOrder(data): Promise<any> {
    this.getAuthHeaders();
    let url = Config.backend.host + 'qrcodes/findByQrCodeText/';
    return new Promise<any>((resolve, reject) => {
      this.http.post(url, data,  this.getAuthHeaders())
      .subscribe(
        (data) =>{
          resolve(data);
        }, (error) => {
          resolve(error);
        }
      )
    })
  }

  // getassetId(id): Observable<any> {
  //   let url = Config.backend.host + 'assets/'+id;
  //   return this.http.get(url, this.getAuthHeaders())
  //   .pipe(retry(2), debounceTime(this.serverTimeout))
  // }

  getassetId(id: any): Promise<any> {
    this.getAuthHeaders();
    return new Promise((resolve) => {
      this.http
        .get(
          Config.backend.host + 'assets/'+id,
          
          this.getAuthHeaders()
        )
        .subscribe(
          (data) => {
            resolve(data);
          },
          (error) => {
            resolve(error);
          }
        );
    });
  }
  locationTracking(track): Observable<any> {
    let url = 'mobileservice/userLocationTracking';
    return this.http.post(Config.backend.host + url,track,this.getAuthHeaders())
    .pipe(retry(2), debounceTime(this.serverTimeout))
  }
  getAssetByFilter(options?, filter?): Observable<any> {
    let url =`${Config.backend.host}assets/filterBy?page=${options && options.page ? options.page : 0}&size=${options && options.size ? options.size : 10}`;
    let headers = this.getAuthHeaders();
    return this.http.post(url, filter , {headers: this.getHeader(),observe: 'response',})
    .pipe(retry(2), debounceTime(this.serverTimeout))
  }
  jobResource(options?, filter?): Observable<any> {
    let url =`${Config.backend.host}jobs/findJobsByFilter?page=${options && options.page ? options.page : 0}&size=${options && options.size ? options.size : 10}`;
    return this.http.post(url, filter, {headers: this.getHeader(),observe: 'response',})
    .pipe(
      retry(2), 
      debounceTime(this.serverTimeout),
      map((res)=>{
      return res;
    }))
  }
  getWorkrequestJson(): Observable<any> {
    let url = `${Config.backend.host}organizations/getCustomJson`;
    return this.http
      .get(url, {headers: this.getHeader(),observe: 'response',})
      .pipe(map((res)=> {
        return res;
      }));
  }
  uploadImage(base64): Observable<any> {
    let url = `${Config.backend.host}mobileservice/imageToUpload`;
    return this.http
      .post(url,base64, {headers: this.getHeader(),observe: 'response'})
      .pipe(map((res)=>{
        return res;
      }));
  }
  getWorkflowById(id:any) {
    let url = `${Config.backend.host}workflow/templates/${id}`;
    return this.http
      .get(url, {headers: this.getHeader(),observe: 'response'})
      .pipe(map((res)=>{
        return res;
      }))
  }

  getWorkflowByIds(id: any): Promise<any> {
    this.getAuthHeaders();
    return new Promise((resolve) => {
      this.http
        .get(
          Config.backend.host + 'workflow/templates/'+id,
          
          this.getAuthHeaders()
        )
        .subscribe(
          (data) => {
            resolve(data);
          },
          (error) => {
            resolve(error);
          }
        );
    });
  }

  getAllDepartments() {
    let url = `${Config.backend.host}departments`;
    return this.http
      .get(url, {headers: this.getHeader(),observe: 'response'})
      .pipe(map((res)=>{
        return res;
      }))
  }
  SearchQueryByDepartments(query) {
    let url = `${Config.backend.host}departments/_search/${query}`;
    return this.http
      .get(url, {headers: this.getHeader(),observe: 'response'})
      .pipe(map((res)=>{
        return res;
      }))
  }
  onBoarding() {
    let url = `${Config.backend.host}onboarding`;
    return this.http.post(url, {headers: this.getHeader(),observe: 'response'})
    
  }
  getPendingCount(data){
    let url = `${Config.backend.host}dashboard/requestCountSummaryByRequestType/mobileDashBoard`;
    return this.http
      .post(url,data,{headers: this.getHeader(),observe: 'response'})
      .pipe(map((res)=>{
        return res;
      }));
  }

  saveAssettrasfer(data){
    let url = `${Config.backend.host}asset_transfers`;
    return this.http
      .post(url,data,{headers: this.getHeader(),observe: 'response'})
      .pipe(map((res)=>{
        return res;
      }));
  }

  saveAssettrasferFilter(data){
    let url = `${Config.backend.host}asset_transfers/filterBy`;
    return this.http
      .post(url,data,{headers: this.getHeader(),observe: 'response'})
      .pipe(map((res)=>{
        return res;
      }));
  }
  getAssetTransferByFilters(options?, filter?): Observable<any> {
    let url =`${Config.backend.host}asset_transfers/filterBy?page=${options && options.page ? options.page : 0}&size=${options && options.size ? options.size : 10}`;
    let headers = this.getAuthHeaders();
    return this.http.post(url, filter , {headers: this.getHeader(),observe: 'response',})
    .pipe(retry(2), debounceTime(this.serverTimeout))
  }

  queryAllUserByCompany(options?, customerId?, filterBy?): Observable<any> {
    let url =`${Config.backend.host}users/findAllByCompanyId/${customerId}/${filterBy}?page=${options && options.page ? options.page : 0}&size=${options && options.size ? options.size : 10}`;
    let headers = this.getAuthHeaders();
    return this.http.get(url, {headers: headers.headers,observe: 'response',})
    .pipe(retry(2), debounceTime(this.serverTimeout))
  }

  queryAllLoctionByCompanys(options?, filter?): Observable<any> {
    let url =`${Config.backend.host}locations/findAllByCompany?page=${options && options.page ? options.page : 0}&size=${options && options.size ? options.size : 10}`;
    let headers = this.getAuthHeaders();
    return this.http.post(url, filter , {headers: this.getHeader(),observe: 'response',})
    .pipe(retry(2), debounceTime(this.serverTimeout))
  }

  getAsserDownTimeTrackingById(id:any): Observable<any> {
    let url = `${Config.backend.host}assetDownTimeTrackings/findAllAssetDownTimeTrackingByRequestId/${id}`;
    return this.http
      .get(url, {headers: this.getHeader(),observe: 'response'})
      .pipe(map((res)=>{
        return res;
      }))
  }
    // Crud for requesttimer
    createRequestTimer(requestTimer): Observable<any> {
      return this.http
        .post(`${Config.backend.host}request_user_timers`, requestTimer, {headers: this.getHeader(), observe: 'response' })
        .pipe(map((res: any) => res));
    }
    updateRequestTimer(requestTimer): Observable<any> {  
      return this.http
        .put(`${Config.backend.host}request_user_timers`, requestTimer, {headers: this.getHeader(), observe: 'response' })
        .pipe(map((res: any) => res));
    }
    getUserStatus(userList: any): Observable<any> {
      return this.http
        .get(`${Config.backend.host}request_user_timers/getUserStatus`, {headers: this.getHeader(), observe: 'response', params:{user:userList} })
    }
    //get request worked duration
  getRequestTimeDuration(requestId: any, userId: any, requestHistoryId: any): Promise<any> {
    this.getAuthHeaders();
    return new Promise((resolve) => {
      this.http
        .get(
          `${Config.backend.host}request_user_timers/getRequestTime/${requestId}/${userId}/${requestHistoryId}`, { headers: this.getHeader(), observe: 'response' }
        )
        .subscribe(
          (data) => {
            resolve(data);
          },
          (error) => {
            resolve(error);
          }
        );
    });
  }
  getUserInvolvedRequestTimerList(requestId: any, userId: any, requestHistoryId: any): Promise<any> {
    this.getAuthHeaders();
    return new Promise((resolve) => {
      this.http
        .get(
          `${Config.backend.host}request_user_timers/${requestId}/${userId}/${requestHistoryId}`, { headers: this.getHeader(), observe: 'response' }
        )
        .subscribe(
          (data) => {
            resolve(data);
          },
          (error) => {
            resolve(error);
          }
        );
    });
  }
  //get user current status 
  getUserCurrentStatus(status:any, userId: any): Promise<any> {
    this.getAuthHeaders();
    let url = `${Config.backend.host}request_user_timers/getAllRequestTimer/${status}/${userId}`;
    return new Promise((resolve) => {
      this.http
        .get(url, { headers: this.getHeader(), observe: 'response' })
        .subscribe((data) => {resolve(data);},(error) => {resolve(error);});
    });
  }


  //workGuide google search
  getGoogleSearch(query: any): Observable<any> {
    let url = Config.backend.host + 'requests/googleSearch';
    return this.http.get<any>(`${url}/${query}`, {headers:this.getHeader(), observe: 'response' });
  }
  //workGuide releated request result
  getRequestAssetHistory(obj): Observable<any> {
    let url = Config.backend.host + 'assetDownTimeTrackings/findAllAssetDownTimeTrackingByAssetDetails';
    return this.http.post<any>(`${url}`, obj, {headers:this.getHeader(), observe: 'response' });
  }
}
