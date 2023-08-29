import { Component, Input, OnInit } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';
import { Config } from '../config';
import { GetAwsImage } from '../data.model';
import {OverlayEventDetail} from '@ionic/core'
import { AnnotatePage } from '../annotate/annotate.page';
import { Camera ,CameraOptions } from '@ionic-native/camera/ngx';
import { CaptureImageOptions, MediaCapture,CaptureError } from '@ionic-native/media-capture/ngx';
import{ File } from '@ionic-native/file/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
@Component({
  selector: 'app-image-annotation',
  templateUrl: './image-annotation.page.html',
  styleUrls: ['./image-annotation.page.scss'],
  providers: [ServiceProvider]
})
export class ImageAnnotationPage implements OnInit {

  @Input('incident') incident : any = {}
  @Input('name') name : any
  isBrowser: boolean = true;
  imageSrc: any;
  imageJsonList: any = [];
  openBrowser: boolean;
  msg = "Maximum Image Size is 5MB";
  image: string;
  base64Str: string[];
  kbytes: number;
  Mbytes: number;
  @Input() workRequest: boolean;
  constructor(
    public modalCtrl : ModalController,
    public common: CommonProvider,
    public reqService: ServiceProvider,
    public camera : Camera,
    private platform : Platform,
    public mediaCapture: MediaCapture,
    private file: File,
    private diagnostic: Diagnostic
    ) {
      // this.isBrowser = this.platform.is('cordova') ? false : true;
      this.isBrowser = true;
     }

  ngOnInit() {
  }
   // For browser image annotation
   selectBrowserImage(event: any, incident) {
    if (event.target.files && event.target.files[0]) {
      const fileSize = event.target.files && event.target.files[0].size ? event.target.files[0].size : null;
      const megabytes = fileSize / (1024 * 1024);
      if (megabytes <= 5) {
      var reader = new FileReader();
      reader.onload = (event: any) => {
        let base64String = event.target.result.split(",")[1];
        this.imageSrc = base64String;
        this.presentImgModal(incident);
      }
      reader.readAsDataURL(event.target.files[0]);
    } else {
      alert('File size should not exceed 5mb');
        return;
    }
    }
  }

async openGallery(incident) {
    let cameraOptions: CameraOptions = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
      quality: 100,
      encodingType: this.camera.EncodingType.JPEG,
      allowEdit: false,
      correctOrientation: true
    }
    this.camera.getPicture(cameraOptions).then((imageData) => {
      this.imageSrc = imageData;
      console.log(this.imageSrc.length);
      this.image = 'data:image/jpeg;base64,' + imageData;
      this.base64Str = this.image.split(',');
      const byteCharacters = atob(imageData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
         byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      const fileSize = blob.size;
      const megabytes = fileSize / (1024 * 1024);
      console.log('fileSize :', megabytes, 'MB');
      // Check if the image size is less than or equal to 5MB
      if (imageData.length <= 5 * 1024 * 1024) {
      // Image size is less than or equal to 5MB, continue with your logic
      } else {
      // Image size is greater than 5MB, show an error message
      }
      const MB = this.getImageProperties(this.base64Str[1]);
      console.log('Imgae Size :' , MB);
      this.common.compressImageString(this.image, 0 , 0);
      // await this.getDimensions(this.base64Str[1])
      if (this.calculateImageSize(this.image) > 5.0) {
        alert('File size should not exceed 5mb');
        return;
      }
      this.presentImgModal(incident);
    }, (err) => {
      console.log(err);
    });

  }
  takePicture(incident) {
    this.diagnostic.requestRuntimePermission('WRITE_EXTERNAL_STORAGE');
    if(this.platform.is('ios')) {
    console.log("enter camera options");
    let cameraOptions: CameraOptions  = {
      quality: 20,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      saveToPhotoAlbum: false,
      allowEdit: true,
      correctOrientation: true,
      targetWidth: 600,
      targetHeight: 600
    }
    console.log("enter camera");
    this.camera.getPicture(cameraOptions).then<any,any>((imageData) => {
      console.log("Inside of camera");
      this.imageSrc = imageData;
      this.presentImgModal(incident);
    },async(err) => {
      alert(err);
      console.log(err);
    }).catch(err => {
      alert(err);
      console.log(err.message);
    })
  }
    else {
    this.diagnostic.requestRuntimePermission('WRITE_EXTERNAL_STORAGE');
    let options: CaptureImageOptions = { limit: 1 };
    this.mediaCapture.captureImage(options).then(
      (data: any[]) => {
        let file = data[0].fullPath;
        const name = file.substr(file.lastIndexOf('/') + 1);
        const copyFrom = file.substr(0, file.lastIndexOf('/') + 1);
        this.file.readAsDataURL(copyFrom, name).then(data=>{
          console.log(data);
          this.imageSrc = data.split('data:image/jpeg;base64,')[1];
          this.presentImgModal(incident);
        },error=>{
          console.log(error);
        })
      },(err: CaptureError) => console.error(err)
    );
  }

  }
  //Multiple Images
   async presentImgModal(incident) {
    let annotateModal = await this.modalCtrl.create({
      component: AnnotatePage,
      componentProps : { requestType: 'newRequest', value: incident.value, isNewImg: this.imageSrc }
    });
    annotateModal.onDidDismiss().then((detail: OverlayEventDetail) => {
      let data = detail.data
      if (data) {
        let image = {
          src: data.imageSrc,
          imgId: data.imgId ? data.imgId : '',
          description: ''
        };
        // if(incident.type === 'Image Upload')
        // {
        //   incident.images=[];
        // }
        incident.images.push(image);
        this.imageSrc = data.imageSrc;
      }
    });
    await annotateModal.present();
  }

  getOnlineImg(incident, index) {
    if (navigator.onLine) {
      let getImage = new GetAwsImage();
      getImage.key = incident.images[index].imgId;
      this.reqService.genericAWSImageGetOne(getImage, 'thumbnail').then(imageData => {
        if (null != imageData && imageData.imageBlob) {
          this.imageJsonList.push(imageData);
          localStorage.setItem(Config.constants.imgJson, JSON.stringify(this.imageJsonList));
          if (imageData.imageBlob != null && imageData.imageBlob != '') {
            incident.images[index].src = imageData.imageBlob;
          }
        }
      });
    } else {
      this.common.alertToast(this.reqService.translatedata('networkConnectivityError'));
    }
  }

  // AnnotatePage, { requestType: 'newRequest', value: imgSrc }

  async presentImgViewModal(incident, imgSrc, index) {
    let annotateModal = await this.modalCtrl.create({
      component : AnnotatePage,
      componentProps : { requestType: 'newRequest', value: imgSrc }
    });
    annotateModal.onDidDismiss().then((detail: OverlayEventDetail)=> {
      let data = detail.data
      if (data) {
        incident.images[index].src = data.imageSrc;
        this.imageSrc = data.imageSrc;
        if (data.imgId)
          incident.images[index].imgId = data.imgId;
      }
    });
    await annotateModal.present();
  }

  deleteSingleImg(incident, index) {
    incident.images.splice(index, 1);
  }
  open() {
    this.openBrowser = !this.openBrowser;
  }

  calculateImageSize(base64String) {
    let padding;
    let inBytes;
    let inBytess;
    let base64StringLength;
    if (base64String.endsWith('==')) { padding = 2; }
    else if (base64String.endsWith('=')) { padding = 1; }
    else { padding = 0; }

    base64StringLength = base64String.length;
    const imgSize = (base64String.length * 0.75) / 1024;
    console.log('imgSize :', imgSize);
    console.log(base64StringLength);
    inBytes = (base64StringLength * (3/4)) - padding;
    console.log('inBytes: ', inBytes)
    inBytess = (base64StringLength / 4) * 3 - padding;
    console.log('inBytess: ',inBytess);
    this.kbytes = inBytes / 1000;
    this.bytesToSize(inBytes)
    this.Mbytes = inBytes / (1024 ** 2) ;
    return this.Mbytes;
  }

  getDimensions(image : string){
    return new Promise((resolve, reject)=>{
 
        var img = new Image();
        
 
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const width = img.width;
          const height = img.height;
          await resolve({width, height})
       };
       img.src = image;
    })
 }

 getImageProperties(base64String) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = "data:image/jpeg;base64," + base64String;
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const fileSize = (base64String.length * 0.75) / 1024; // convert to KB
      const kb = fileSize;
      const mb = this.kbToMb(kb);
      const size = img.sizes;
      console.log('size :', size)
      console.log(`${kb} kb = ${mb} mb`);
      resolve({
        width: width,
        height: height,
        fileSize: fileSize,
        MB: mb
      });
    };
    img.onerror = (err) => {
      reject(err);
    };
  });
}

kbToMb(kb: number): number {
  const mb = kb / 1024;
  return Number(mb.toFixed(2)); // Round to 2 decimal places
}

 bytesToSize(bytes: number) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return 'n/a';
  bytes = Number(bytes);
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  if (i === 0) return `${bytes} ${sizes[i]}`
  return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`
}

}
