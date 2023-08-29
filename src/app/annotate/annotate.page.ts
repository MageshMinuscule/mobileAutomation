import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, IonRouterOutlet, ModalController, NavController, NavParams, Platform } from '@ionic/angular';
import { Camera ,CameraOptions } from '@ionic-native/camera/ngx';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';
import { Annotate, Attendance, AWSImageUpload, Incident, S3ImageFormat } from '../data.model';
import { Config } from '../config';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import SignaturePad from 'signature_pad';
import { Location } from '@angular/common';
import { ButtonActionProvider } from 'src/providers/button-action/button-action';
import { CaptureImageOptions, MediaCapture,CaptureError } from '@ionic-native/media-capture/ngx';
import{ File } from '@ionic-native/file/ngx';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
@Component({
  selector: 'app-annotate',
  templateUrl: './annotate.page.html',
  styleUrls: ['./annotate.page.scss'],
})
export class AnnotatePage implements OnInit, AfterViewInit {
  @ViewChild('fab',{static: false}) fab: any;
  @ViewChild('canvas', { static: false }) canvas: any;
  // @ViewChild(IonRouterOutlet) routerOutlet: any;

  signaturePad: any;
  canvasWidth: number;
  canvasHeight: number;
  selectedRequest: Incident;
  public annotations: Annotate[];
  toggleAnnotate: boolean = false;
  type: string = "";
  countNum: number;
  loader: any;
  public imageSrc: string = "";
  image_type: string = "images/jpeg";
  modalPop: boolean = false;
  id: any;
  size: any = 100;
  mode: any = "";
  isSelected: boolean = false;
  isBrowser: boolean = false;
  isFromIncident: boolean = false;
  isRequestWithoutWorkflow: boolean = false;
  isAttendance: boolean = false;
  stage: number = 2;
  isTracked: boolean = false;
  profile: any = {};
  isAssetImageUpload: boolean;
  s3ImageId: any;
  existingImage: any;
  latlng: any;
  image:S3ImageFormat;
  canvasElement: any;
   cameraOpt: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true,
    allowEdit: false,
  };

  constructor(
    public actionSheetCtrl : ActionSheetController,
    public btnActionProvider: ButtonActionProvider,
    public modalCtrl : ModalController,
    public common : CommonProvider,
    public reqService : ServiceProvider,
    public navCtrl : NavController,
    public camera : Camera,
    public route : ActivatedRoute,
    private navparams : NavParams,
    public platform: Platform,
    public router : Router,
    private _location : Location,
    private mediaCapture : MediaCapture,
    private file : File
    ) {
    this.image = new S3ImageFormat();
    this.isSelected = false;
    this.profile = JSON.parse(localStorage.getItem('Profile'));
    this.stage = this.navparams.data.stage ? 3 :2 ;
    this.mode = this.navparams.data.mode ? this.navparams.data.mode : null;
    this.selectedRequest = this.navparams.data.selectedRequest ? this.navparams.data.selectedRequest : null;
    this.type = this.navparams.data.type ? this.navparams.data.type : null;


if(this.navparams.data.requestType){
  this.existingImage = this.navparams.data.existingImg ? this.navparams.data.existingImg : null;
  this.isAssetImageUpload = navparams.data.requestType == "asset-detail" ? true : false;
  if (this.navparams.data.requestType == "newRequest") this.modalPop = true;
  this.isFromIncident = navparams.data.isFromIncident;
}
this.route.queryParams.subscribe(params => {
  this.isRequestWithoutWorkflow = params.isRequestWithoutWorkflow ? params.isRequestWithoutWorkflow : false;
})
if(this.navparams.data.id && this.navparams.data.id) this.id = this.navparams.data.id;
if(this.navparams.data.size && this.navparams.data.size) this.id = this.navparams.data.size

    this.countNum = 0;
    this.annotations = [];
    if (!this.platform.is("cordova")) {
      this.isBrowser = true;
    }
    if(this.navparams.data.isNewImg && this.navparams.data.isNewImg){
      this.imageSrc = this.navparams.data.isNewImg
    }else if(this.navparams.data.value && this.navparams.data.value){
     this.imageSrc = this.navparams.data.value;
      this.isSelected = true;
    }


    if (!this.isBrowser && this.mode == "Checkin") {
      setTimeout(() => {
        this.takePicture();
      }, 200);
    }
    if (!this.isBrowser && this.mode == "Attendance") {
      this.isAttendance = true;
      setTimeout(() => {
        this.takePicture();
      }, 200);
    }
    if (this.navparams.data.requestType != "newRequest" && this.selectedRequest) {
      this.isTracked = this.selectedRequest.startedBy;
    }
   }

   ngOnInit(): void {
  }

  ngAfterViewInit() {
    // Set the Canvas Element and its size
    this.canvasElement = new SignaturePad(this.canvas.nativeElement);
    this.canvasElement.clear();
    this.canvasElement.off();
    this.canvasElement.penColor = '#FF0000';
    this.canvasElement = this.canvas.nativeElement;
    console.log("ngafterview" + this.canvasElement);
    console.log(this.canvasElement);
    this.canvasElement.width = 600 + '';
    this.canvasElement.height = 600 + '';
    this.setBackground();
    //     if (this.imageSrc) {
    //   this.openFab();
    // }

  }
  setBackground() {
    var background = new Image();
    background.src = "data:image/jpeg;base64," + this.imageSrc;
    let ctx = this.canvasElement.getContext('2d');
    console.log(ctx);
    background.onload = () => {
      ctx.drawImage(background,0,0, this.canvasElement.width, this.canvasElement.height);
    }
    this.openFab();
  }
  // // For browser image annotation
  selectImage(event: any) {
    this.imageSrc = "";
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (event: any) => {
        let base64String = event.target.result.split(",")[1];
        let imgFileSize = Math.round((base64String.length * 3) / 4) / 1048576;
        if (imgFileSize <= this.size) {
          this.imageSrc = event.target.result;
          this.signaturePad.clear();
          this.signaturePad.off();
          this.signaturePad.fromDataURL(event.target.result);
          this.toggleAnnotate = false;
          this.openFab();
        } else {
          this.common.alertToast(
            this.reqService.translatedata("imageSizeAlert") + this.size + " MB"
          );
        }
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  openFab() {
    setTimeout(() => {
      console.log(this.fab);
      this.fab.activated = true;
    }, 2000);
  }

  openGallery() {
    let cameraOptions: CameraOptions = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
      quality: 20,
      encodingType: this.camera.EncodingType.JPEG,
      allowEdit: false,
      correctOrientation: true
    };

    this.camera.getPicture(cameraOptions).then(
      (imageData) => {
        let imgFileSize = Math.round((imageData.length * 3) / 4) / 1048576;
        if (imgFileSize <= this.size) {
          this.imageSrc = imageData;
          this.signaturePad.clear;
          this.signaturePad.resizeCanvas();
          this.signaturePad.fromDataURL(
            "data:image/jpeg;base64," + this.imageSrc
          );
          console.log(this.imageSrc.length)
          this.signaturePad.resizeCanvas();
          this.openFab();
        } else {
          this.common.alertToast(
            this.reqService.translatedata("imageSizeAlert") + this.size + " MB"
          );
        }
      },
      err => { }
    );
  }

  async getImageActionSheet() {
    if (this.mode != "Checkin") {
      let buttons = [];
      let capture = {
        text: this.reqService.translatedata("capture"),
        icon: "ios-redo-outline",
        cssClass: "primary",
        handler: () => {
          setTimeout(() => {
            this.takePicture();
          }, 1000);
        }
      };
      buttons.push(capture);
      let gallery = {
        text: this.reqService.translatedata("gallery"),
        icon: "ios-redo-outline",
        cssClass: "primary",
        handler: () => {
          this.openGallery();
        }
      };
      buttons.push(gallery);
      let cancel = {
        text: this.reqService.translatedata("cancel"),
        icon: "ios-close-outline",
        role: "cancel",
        handler: () => { }
      };
      buttons.push(cancel);
      let actionSheet = await this.actionSheetCtrl.create({
        header: this.reqService.translatedata("pickOption"),
        buttons: buttons
      });
      actionSheet.present();
    } else {
      setTimeout(() => {
        this.takePicture();
      }, 200);
    }
  }
  takePicture() {
    console.log("----take picture called by check in------")
    try {
      if(this.platform.is('ios')) {
        this.camera.getPicture(this.cameraOpt).then(
        (imageData) => {
          let imgFileSize = Math.round((imageData.length * 3) / 4) / 1048576;
          if (imgFileSize <= this.size) {
            this.imageSrc = imageData;
            var background = new Image();
            background.src = "data:image/jpeg;base64," + this.imageSrc;
            let ctx = this.canvasElement.getContext('2d');
            console.log(ctx);
            background.onload = () => {
              ctx.drawImage(background,0,0, this.canvasElement.width, this.canvasElement.height);
            }
            this.openFab();
          } else {
            this.common.alertToast(
              this.reqService.translatedata("imageSizeAlert") +
              this.size +
              " MB"
            );
          }
        },
        err => {
          console.log("----error enter------")
          console.error(err);
        }
      );
      } else {
      let options: CaptureImageOptions = { limit: 1 };
      this.mediaCapture.captureImage(options).then(
        (data: any[]) => {
          let file = data[0].fullPath;
          const name = file.substr(file.lastIndexOf('/') + 1);
          const copyFrom = file.substr(0, file.lastIndexOf('/') + 1);
          this.file.readAsDataURL(copyFrom, name).then(imageData =>{
            let imgFileSize = Math.round((imageData.length * 3) / 4) / 1048576;
            if (imgFileSize <= this.size) {
              this.imageSrc = imageData.split('data:image/jpeg;base64,')[1];
              var background = new Image();
              background.src = "data:image/jpeg;base64," + this.imageSrc;
              let ctx = this.canvasElement.getContext('2d');
              console.log(ctx);
              background.onload = () => {
                ctx.drawImage(background,0,0, this.canvasElement.width, this.canvasElement.height);
              ctx.drawImage(background,0,0, this.canvasElement.width, this.canvasElement.height);
                ctx.drawImage(background,0,0, this.canvasElement.width, this.canvasElement.height);
              }
              this.openFab();
            } else {
              this.common.alertToast(
                this.reqService.translatedata("imageSizeAlert") +
                this.size +
                " MB"
              );
            }
          },error=>{
            console.log(error);
          })
        },(err: CaptureError) => console.error(err)
      );
      }

    } catch (error) {
      console.log(error);
    }
  }

  goBack() {
    let navigationExtras: NavigationExtras = {
      queryParams :{
        selectedRequest: JSON.stringify(this.selectedRequest),
        type: "myRequest",
        annotations: this.annotations
      }
    }
    this.router.navigate(['request-detail'],navigationExtras)

  }

  getAnnotatedURL() {
    this.canvasElement = this.canvas.nativeElement;
    let data = this.canvasElement.toDataURL();
    let ctx = this.canvasElement.getContext('2d');
    console.log("ctx"+ JSON.stringify(ctx));
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    console.log(data.length)
    return data.replace(data.substring(0, data.indexOf("64,") + 3), "");
  }

  uploadAssetImage() {
    this.common.displayLoading();
    this.reqService.uploadAssetImage(this.getAnnotatedURL(), this.existingImage)
    .subscribe(
      data => {
      if (data) {
        const result = data;
        this.s3ImageId = result.key;
        this.onAssetImageUpdateClose();
      }
      this.common.stopLoading()
    },async(err)=>{
      this.common.stopLoading()
    }
    )
  }

  async upload() {
    if(this.mode == 'Checkin') {
      this.uploadCheckInImage();
      return
    }
    if (this.isAssetImageUpload ) {
      this.uploadAssetImage();
      return;
    }
    if (this.imageSrc.length > 0 && !this.isAttendance) {
      const index = this._location.getState();
      console.log(index)
      // this.navCtrl.pop(index - 1);
      // if (index >= 4) this.navCtrl.remove(index - 2);
      let imageUploadList = [];
      // this.common.displayLoading();
      let uploadJson = new AWSImageUpload();
      uploadJson.baseImage = this.getAnnotatedURL();
      uploadJson.requestId = JSON.stringify(
        this.selectedRequest.requestHistoryId
      );
      if (navigator.onLine) {
        this.reqService.genericAwsPost(uploadJson)
        .subscribe(data =>{
          this.common.stopLoading();
          let message;
          let uploadId;
          if (data) {
            message = "success";
            uploadId = data;
          } else {
            message = "failure";
          }
          
          if (!this.isRequestWithoutWorkflow) {
            let navigationExtras: NavigationExtras = {
              queryParams:{
                selectedRequest: JSON.stringify(this.selectedRequest),
                type: this.type,
                mode: this.mode,
                upload: message,
                isFromIncident: this.isFromIncident,
                status: data,
                uploadId: uploadId,
                activeTab: "follow_up"
              },replaceUrl:true
            }
            this.router.navigate(['request-detail'], navigationExtras)
            .then(() => {
                if (this.mode == "Checkin") {
                  this.doCheckin(uploadId);
                }
              });
          }
        },async (err) => {
          // this.common.stopLoading();
          this.common.alertToast("Error"+err.status)
        })
      } else {
        imageUploadList.push(uploadJson);
        // var imageData = JSON.parse(localStorage.getItem(Config.constants.imageUpload));
        let imageData:any = await this.common.getStorageValue(Config.constants.imageUpload);
        if (null != imageData) {
          for (let image of imageData) {
            imageUploadList.push(image);
          }
        }
        // localStorage.setItem(Config.constants.imageUpload, JSON.stringify(imageUploadList));
        await this.common.setStorageValue(Config.constants.imageUpload, imageUploadList);
        // this.common.stopLoading();
        if (!this.isRequestWithoutWorkflow) {
          let navigationExtras: NavigationExtras = {
            queryParams:{
              selectedRequest: JSON.stringify(this.selectedRequest),
              type: this.type,
              mode: this.mode,
              upload: "offline",
              isFromIncident: this.isFromIncident,
              uploadId: "",
              activeTab: "follow_up"
            }
          }
          this.router.navigate(['request-detail'],navigationExtras )
              if (this.mode == "Checkin") {
                this.doCheckin();
              }
        }
      }
    } else {
      this.putAttendance();
    }
  }
  uploadCheckInImage() {
    this.image.baseImage = this.getAnnotatedURL();
    console.log(this.image);
    this.reqService.uploadImage(this.image).subscribe(
      (res: HttpResponse<any>) => this.onSuccess(res.body, res.headers),
      (res: HttpErrorResponse) => this.onError(res.message)
    )
  }
  onSuccess(body: any, headers: HttpHeaders): void {
    if (navigator.onLine) {
        let message;
        let uploadId;
        let data;
        data = body['key'];
        if (data) {
          message = "success";
          uploadId = data;
        } else {
          message = "failure";
        }
        // this.common.stopLoading();
        if (!this.isRequestWithoutWorkflow) {
          let navigationExtras: NavigationExtras = {
            queryParams:{
              selectedRequest: JSON.stringify(this.selectedRequest),
              type: this.type,
              mode: this.mode,
              upload: message,
              isFromIncident: this.isFromIncident,
              status: data,
              uploadId: uploadId,
              activeTab: "follow_up"
            }
          }
          this.router.navigate(['request-detail'], navigationExtras)
          .then(() => {
              if (this.mode == "Checkin") {
                this.doCheckin(uploadId);
              }
            });
        }
      }
  }
  onError(message: string): void {
    this.modalCtrl.dismiss();
  }

  doCheckin(uploadId?) {
    console.log("check in enterd in do check in ")
    const activeView  = document.activeElement.childElementCount;
    console.log(activeView)
    // if (index >= 3)
    //   this.navCtrl.remove(index - 1);
    const navOption = {
      state: this.stage,
      index: activeView-1
    };
    this.selectedRequest.checkInType = "Image Upload";
    this.btnActionProvider.checkIn(
      this.selectedRequest,
      "view",
      uploadId,
      navOption
    );
    this.modalCtrl.dismiss();
  }

  putAttendance() {
    this.common.displayLoading();
    let uploadJson = new AWSImageUpload();
    this.route.queryParams.subscribe(params =>{
    this.latlng = params.location ? params.location : null
    })
    uploadJson.baseImage = this.getAnnotatedURL();
    if (navigator.onLine) {
      this.reqService.genericAwsPost(uploadJson)
      .subscribe(data =>{
        let uploadId;
        if (data) {
          uploadId = data;
        }
        this.common.stopLoading();
        let attendanceData = new Attendance();
        let alertMsg = "";
        if (this.navparams.data.type == "checkin") {
          attendanceData.active = true;
          attendanceData.creationDate = new Date();
          attendanceData.organizationId = this.profile.tenantId;
          attendanceData.punchedInById = this.profile.id;
          attendanceData.punchedInByLogin = this.profile.username;
          attendanceData.punched_in_lat = this.latlng.lat;
          attendanceData.punched_in_lon = this.latlng.lon;
          attendanceData.punched_in_photo = uploadId;
          attendanceData.updationDate = new Date();
          alertMsg = "Checkin Successfully";
          this.reqService.saveAttendance(attendanceData)
          .subscribe(
            data => {
              this.common.alertToast(this.reqService.translatedata(alertMsg));
              data.organizationId = this.profile.tenantId;
              localStorage.setItem('checkin', JSON.stringify(data));
              this.navCtrl.navigateRoot(['home']);
            }
          )
        } else {
          var attendance =  JSON.parse(localStorage.getItem('checkin'));
          if (attendance) {
            attendance.punchedOutById = this.profile.id;
            attendance.punchedOutByLogin = this.profile.username;
            attendance.punched_out_lat = this.latlng.lat;
            attendance.punched_out_lon = this.latlng.lon;
            attendance.punched_out_photo = uploadId;
            attendance.updationDate = new Date();
            attendanceData = attendance;
            alertMsg = "Checkout Successfully";
            this.reqService.updateAttendance(attendanceData)
            .subscribe(
              data => {
                this.common.alertToast(this.reqService.translatedata(alertMsg));
                localStorage.setItem('checkin', JSON.stringify(''));
                this.navCtrl.navigateRoot(['/home']);
              }
            )
          }
        }
      },async(err)=>{
        this.common.stopLoading();
      })
    }else {
      this.common.stopLoading();
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
  update() {
    let data = {
      imageSrc: this.getAnnotatedURL(),
      id: this.id,
      imgId: ""
    };
    this.modalCtrl.dismiss(data);
    this.toggleAnnotate = false;
  }
  onAssetImageUpdateClose() {
    let data = {
      imgId: this.s3ImageId
    };
    this.modalCtrl.dismiss(data);
  }
  imgUpdate() {
    if (this.imageSrc.length > 0 && navigator.onLine) {
      this.common.displayLoading();
      let uploadJson = new AWSImageUpload();
      uploadJson.baseImage = this.getAnnotatedURL();
      this.reqService.genericAwsPost(uploadJson)
      .subscribe(data=>{
        this.common.stopLoading();
        let message;
        let uploadId;
        if (data) {
          message = "success";
          uploadId = data;
        } else {
          message = "failure";
        }
       
        let info = {
          imageSrc: uploadJson.baseImage,
          id: this.id,
          imgId: uploadId,
          status: message
        };
        this.modalCtrl.dismiss(info);
        this.toggleAnnotate = false;
      },async(err)=>{
        this.common.stopLoading()
      })
    } else {
      this.update();
    }
  }

  startAnnotate(fab) {
    setTimeout(() => {
      fab.close();
      let signature = new SignaturePad(this.canvas.nativeElement);
      signature.penColor = '#FF0000';
      signature.on();
      this.setBackground()
      // this.canvasElement.on();
      this.toggleAnnotate = true;
      this.openFab();
    }, 100);
  }

  clearAnnotate() {
    this.isSelected = false;
    // this.toggleAnnotate = false;
      let signature = new SignaturePad(this.canvas.nativeElement);
      signature.penColor = '#FF0000';
      const data = signature.toData();
      if (data) {
        data.pop(); // remove the last dot or line
        signature.fromData(data);
      }
      this.setBackground()
  }

  uploadAgain(fab) {
    fab.close();
    this.toggleAnnotate = false;
    this.imageSrc = "";
    this.signaturePad.clear();
    this.signaturePad.off();
    this.isSelected = false;
  }
}
