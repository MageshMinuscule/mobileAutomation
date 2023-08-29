import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Camera } from '@ionic-native/camera/ngx';
import { CaptureImageOptions, MediaCapture, CaptureError } from '@ionic-native/media-capture/ngx';
import {
  ModalController,
  NavController,
  NavParams,
  Platform,
} from '@ionic/angular';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';
import { Config } from '../config';
import { GetAwsImage } from '../data.model';
import{ File } from '@ionic-native/file/ngx';
@Component({
  selector: 'app-transport-detail',
  templateUrl: './transport-detail.page.html',
  styleUrls: ['./transport-detail.page.scss'],
})
export class TransportDetailPage implements OnInit {
  transport: any = {
    cost: '',
    images: [],
    type: '',
    amount: '',
    comments: '',
    use: '',
  };
  tranportForm = [
    {
      type: 'dropDown',
      value: '',
      cumpulsory: 'true',
      dropDownOption: [
        {
          value: 'Bike',
        },
        {
          value: 'Car',
        },
        {
          value: 'Bus',
        },
        {
          value: 'Train',
        },
      ],
      label: 'Transport Type',
    },
    {
      type: 'textInput',
      value: '',
      cumpulsory: 'true',
      label: 'Transport Cost',
    },
    {
      type: 'textArea',
      value: '',
      cumpulsory: 'true',
      label: 'Comments',
    },
    {
      type: 'radioButton',
      value: '',
      cumpulsory: 'true',
      radioButtonOption: [
        {
          value: 'Business',
        },
        {
          value: 'Personal',
        },
      ],
      label: 'Business or Personal?',
    },
    {
      type: 'imageWithAnnotation',
      value: '',
      cumpulsory: 'true',
      cameraOnly: '',
      imgAnnotation: '',
      label: 'Transport images',
    },
    {
      type: 'signatureOnly',
      value: '',
      cumpulsory: 'true',
      label: 'Signature',
      imgAnnotation: '',
      dropDownOption: '',
    },
  ];
  transportUse: any = ['Business', 'Personal'];
  transportTypes: any = ['Bike', 'Car', 'Bus', 'Train'];
  imageSrc: any = '';
  imgSrc: any;
  imageJsonList: any = [];
  selectedRequest: any;
  isBrowser: boolean;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    public camera: Camera,
    public modalCtrl: ModalController,
    public reqService: ServiceProvider,
    public common: CommonProvider,
    public route: ActivatedRoute,
    public mediaCapture: MediaCapture, private file:File
  ) {
    this.route.queryParams.subscribe((params) => {
      this.selectedRequest = params.selectedRequest
        ? JSON.parse(params.selectedRequest)
        : null;
    });
    this.isBrowser = !this.platform.is('cordova') ? true : false;
  }

  ngOnInit() {}
  ionViewDidLoad() {

    let locData = JSON.parse(localStorage.getItem(Config.constants.imgJson));
    if (locData != null) {
      this.imageJsonList = JSON.parse(locData);
    }
  }

  // For browser image annotation
  selectBrowserImage(event: any, incident) {
    this.imageSrc = '';
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (event: any) => {
        let base64String = event.target.result.split(',')[1];
        this.imageSrc = base64String;
        this.presentImgModal(incident);
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }
  takePicture(incident) {
    // let cameraOpt: CameraOptions = {
    //   quality: 20,
    //   destinationType: this.camera.DestinationType.DATA_URL,
    //   sourceType: this.camera.PictureSourceType.CAMERA,
    //   allowEdit: false,
    //   encodingType: this.camera.EncodingType.JPEG,
    //   saveToPhotoAlbum: false,
    //   correctOrientation: true,
    // };

    // this.camera.getPicture(cameraOpt).then(
    //   (imageData) => {
    //     this.imageSrc = imageData;
    //     this.presentImgModal(incident);
    //   },
    //   (err) => {}
    // );
    let options: CaptureImageOptions = { limit: 1 };
    this.mediaCapture.captureImage(options).then(
      (data: any[]) => {
        let file = data[0].fullPath;
        const name = file.substr(file.lastIndexOf('/') + 1);
        const copyFrom = file.substr(0, file.lastIndexOf('/') + 1);
        this.file.readAsDataURL(copyFrom, name).then(data=>{
          console.log(data);
          this.imageSrc = this.imageSrc = data.split('data:image/jpeg;base64,')[1];
          this.presentImgModal(incident);
        },error=>{
          console.log(error);
        })
      },(err: CaptureError) => console.error(err)
    );
  }
  //Multiple Images
  presentImgModal(incident) {
    // let annotateModal = this.modalCtrl.create(AnnotatePage, {
    //   requestType: 'newRequest',
    //   id: incident.id,
    //   value: incident.value,
    //   size: incident.imgAnnotation,
    //   isNewImg: this.imageSrc,
    // });
    // annotateModal.onDidDismiss((data) => {
    //   if (data) {
    //     let image = {
    //       src: data.imageSrc,
    //       description: '',
    //     };
    //     let imageId = {
    //       imgId: data.imgId,
    //       description: '',
    //     };
    //     incident.value.length
    //       ? incident.value.push(image)
    //       : (incident.value = [image]);
    //     this.imgSrc = data.imageSrc;
    //     if (data.imgId)
    //       incident.imgAnnotation && incident.imgAnnotation.length
    //         ? incident.imgAnnotation.push(imageId)
    //         : (incident.imgAnnotation = [imageId]);
    //     // incident.imgAnnotation = data.imgId;
    //   }
    // });
    // annotateModal.present();
  }
  // presentImgViewModal(incident, imgSrc, index) {
  //   let annotateModal = this.modalCtrl.create(AnnotatePage, {
  //     requestType: 'newRequest',
  //     id: incident.id,
  //     value: imgSrc,
  //     size: incident.imgAnnotation,
  //   });
  //   annotateModal.onDidDismiss((data) => {
  //     if (data) {
  //       incident.value[index].src = data.imageSrc;
  //       this.imgSrc = data.imageSrc;
  //       if (data.imgId) incident.imgAnnotation[index].imgId = data.imgId;
  //     }
  //   });
  //   annotateModal.present();
  // }
  deleteImg(incident) {
    incident.value = '';
  }
  deleteSingleImg(incident, index) {
    incident.value.splice(index, 1);
  }

  getOnlineImg(index) {
    if (navigator.onLine) {
      let getImage = new GetAwsImage();
      getImage.key = this.transport.images[index].src;
      this.reqService
        .genericAWSImageGetOne(getImage, 'thumbnail')
        .then((imageData) => {
          if (null != imageData) {
            this.imageJsonList.push(imageData);
            localStorage.setItem(Config.constants.imgJson, JSON.stringify(this.imageJsonList));
            if (imageData.imageBlob != null && imageData.imageBlob != '') {
              this.transport.images[index].src = imageData.imageBlob;
            } else {
              this.transport.temp[index].imgId = '';
              this.transport.images[index].src = '';
            }
          }
        });
    } else {
      this.common.alertToast(
        this.reqService.translatedata('networkConnectivityError')
      );
    }
  }

  submitTransportDetails() {
    for (let incident of this.tranportForm) {
      if (
        (incident.type == 'imageWithAnnotation' ||
          incident.type == 'signatureOnly') &&
        incident.cumpulsory &&
        incident.value == ''
      ) {
        this.common.alertToast(
          this.reqService.translatedata(incident.label + ' field is required')
        );
        return false;
      }
    }
    this.navCtrl.pop();
    // this.navCtrl.push(CheckinPage, {
    //   checkinType: this.selectedRequest.checkInType,
    //   selectedRequest: this.selectedRequest,
    //   stage: 'Three',
    // });
  }

  presentSignModal(incident) {
    // let annotateModal = this.modalCtrl.create(SignaturePage, {
    //   requestType: 'newRequest',
    //   id: incident.id,
    //   value: incident.value,
    //   size: incident.imgAnnotation,
    // });
    // annotateModal.onDidDismiss((data) => {
    //   if (data) {
    //     let imageId = {
    //       unique_Id: data.imgId,
    //       description: '',
    //     };
    //     incident.value = data.imageSrc;
    //     incident.imgAnnotation = data.imgId;
    //     incident.dropDownOption = [imageId];
    //   }
    // });
    // annotateModal.present();
  }
}
