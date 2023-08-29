import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker/ngx';
import { ModalController, Platform, AlertController } from '@ionic/angular';
import { Config } from 'build/stage/config';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';
import { AWSImageUpload, GetAwsImage } from '../data.model';
import { ViewImagePage } from '../view-image/view-image.page';

@Component({
  selector: 'app-images',
  templateUrl: './images.page.html',
  styleUrls: ['./images.page.scss'],
})
export class ImagesPage implements OnInit {

  @Input('incident') incident : any = {};
  @Input('name') name : any;
  @ViewChild("fileInput")  fileInput: ElementRef;
  isBrowser: boolean;
  imageSrc: any;
  imageJsonList: any = [];
  openBrowser: boolean;
  imgRes: any = [];
  showLoader: boolean;
  formData = new FormData();
  images: any;
  isImageCompress: boolean;
  imageInfo: boolean = false;
  msg = "Maximum Image Size is 5MB";

  constructor(private imagePicker: ImagePicker,
    public common : CommonProvider,
    public reqService : ServiceProvider,
    private platform : Platform, 
    public modalCtrl: ModalController,
    public alertCtrl: AlertController
    ) { }

  ngOnInit() {
    this.images = [];
    this.imgRes = [];
    console.log('loged 1:', this.isBrowser);
    // this.isBrowser = this.platform.is('cordova') ? false : true;
    console.log('loged 2:', this.isBrowser);
  }

  showProgressBar() {
    this.showLoader = true;
  }

  hideProgressBar() {
    this.showLoader = false;
  }

  async pickImage(event: any, incident) {
    if (this.platform.is('ios')) {
      if (!this.imagePicker.hasReadPermission()) {
        this.imagePicker.requestReadPermission()
      }
      const options: ImagePickerOptions = {
        maximumImagesCount: 10,
        width: 600,
        height: 600,
        quality: 30,
        outputType: 1
      }
      this.imagePicker.getPictures(options).then((results) => {
        if (results != 'OK') {
          this.showProgressBar();
          for (let i = 0; i < results.length; i++) {
            console.log('Image URI: ' + results[i]);
            this.imgRes.push(results[i]);
            console.log('img  :', this.imgRes);
            this.imgRes = [...new Set(this.imgRes)];
            console.log('img  :', this.imgRes);
            this.saveImages(results[i], incident);
          }
        }
      }, (err) => {
        console.log('Error: ' + err);
      });
    } else {
      console.log('consjini');
      let image = event.target.files;

      if (image && image.length > 10) {
        return this.common.alertToast('Please choose only 10 images')
      }
      console.log('images', image);
      // await this.saveCompressImages(image,incident);
      await this.askImageCompressAlert(image, incident);

    }
  }
  orderImage(image): Promise<any> {
  return new Promise(async (resolve,reject)=>{
    var reader = new FileReader();
    reader.onload = async (event: any) => {
    this.showProgressBar();
    let base64String = event.target.result.split(",")[1];
    if(this.isImageCompress) {
      base64String = await this.common.compressImageString(event.target.result,200,100);
    }
    resolve(base64String)
  }
  await reader.readAsDataURL(image);
  })
  }
  async saveCompressImages(image,incident) {
    for(let file of image){
      let base64String = await this.orderImage(file);
      this.saveImages(base64String, incident,image);
  };
  }
  async askImageCompressAlert(image,incident) {
    let alert =  await this.alertCtrl.create({
      header: this.reqService.translatedata("Image Compressor"),
      message: '<div><span class="alert-text">' + this.reqService.translatedata("To compress the image quality, click the confirm button") + "</span></div>",
      cssClass: "custom-alert",
      backdropDismiss : false,
      buttons: [
        {
          text: this.reqService.translatedata("Cancel"),
          role: "Orginal",
          handler: () => {
            this.isImageCompress = false;
            this.saveCompressImages(image,incident);
            // console.log("Cancel clicked");
          },
        },
        {
          text: this.reqService.translatedata("Yes"),
          handler: () => {
            this.isImageCompress = true;
            this.saveCompressImages(image,incident);
          },
        },
      ],
    });
    await alert.present();
  }
  async saveImages(data, incident,image?) {
    let uploadJson = new AWSImageUpload();
    uploadJson.baseImage = data;
    if (data.length > 0 && navigator.onLine) {
      this.reqService.genericAwsPost(uploadJson)
      .subscribe(datas=>{
        this.common.stopLoading();
        let message;
        let uploadId;
        if (datas) {
          message = "success";
          uploadId = datas;
        } else {
          message = "failure";
        }
        let value = uploadId;
        if (value) {
          let image = {
            src: uploadJson.baseImage,
            imgId: value ? value : '',
            description: '',
          };
          incident.images.push(image);
          this.hideProgressBar();
          console.log('incedent Images : ', incident.images);
          // this.imageSrc = data.imageSrc;
        }
      },async(err)=>{
        this.showLoader = false;
        if(err.status == 413 || err.status == 0) {
          this.common.alertToast('Image size is exceeds above 4MB');
        }else  {
          this.common.alertToast(err.message);
          console.log("err: ", err)
        }

      });
    }else {
      this.hideProgressBar();
      let image = {
        src: uploadJson.baseImage,
        imgId: '',
        description: '',
      };
      incident.images.push(image);
      let imageUploadList = [];
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
    }
  }
  
  deleteSingleImg(incident, index) {
    incident.images.splice(index, 1);
  }

  presentModal(value, index?, src?) {
    if (navigator.onLine) {
      if (typeof value != 'string' && value) {
        let getImage = new GetAwsImage();
        getImage.key = value[index].imgId
        this.reqService.genericAWSImageGetOne(getImage, 'full').then(imageData => {
          if (null != imageData) {
            if (imageData.imageBlob != null && imageData.imageBlob != '') {
              src = imageData.imageBlob;
            }
            this.openImageModal(src);
          } else {
          }
        })
      } else {
        this.openImageModal(src);
      }
    } else {
      this.openImageModal(src);
    }
  }

  async openImageModal(src) {
    
    const modal = await this.modalCtrl.create({
      component: ViewImagePage,
      componentProps: {
        requestType: 'view', 
        value: src
      },
    });
    return await modal.present();
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

  showInfo() {
    this.imageInfo = this.imageInfo == true ? false : true;
  }

}
