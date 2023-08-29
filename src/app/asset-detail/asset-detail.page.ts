import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';
import { Camera ,CameraOptions } from '@ionic-native/camera/ngx';
import { AnnotatePage } from '../annotate/annotate.page';
import { ModalController, NavParams, Platform, PopoverController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';
import { Events } from 'src/providers/events/events';
import { Location } from '@angular/common';
import { InventoryListPage } from '../inventory-list/inventory-list.page';
import { WorkHistoryPage } from '../work-history/work-history.page';
import { AttachmentPage } from '../attachment/attachment.page';
import { CaptureImageOptions, MediaCapture, CaptureError } from '@ionic-native/media-capture/ngx';
import{ File } from '@ionic-native/file/ngx';
import { AssetPopoverComponent } from '../asset-popover/asset-popover.component';
import { AssetTransferPage } from '../asset-transfer/asset-transfer.page';
@Component({
  selector: 'app-asset-detail',
  templateUrl: './asset-detail.page.html',
  styleUrls: ['./asset-detail.page.scss'],
})
export class AssetDetailPage implements OnInit {
  assetId: any ;
  asset: any;
  s3_Url = "https://s3.ap-south-1.amazonaws.com/cmms-admin-image/"
  imageSrc: any;
  modelData: any;
  onLine:boolean = true;
  width: any;
  height: any;
  isSmallScreen: boolean = false;
  isBigScreen: boolean = false;
  profile: any;
  isViewAssetTransfer: boolean;
  isEditAssetTransfer: boolean;
  constructor(
    private reqService : ServiceProvider,
    public router : Router,
    public route : ActivatedRoute,
    public common : CommonProvider,
    public camera : Camera,
    public modalCtrl : ModalController,
    public events :Events,
    public _location : Location,
    public mediaCapture: MediaCapture,
    public file: File,
    public platform: Platform,
    public popOver: PopoverController
  ) {
   }

  ngOnInit() {
    const width = this.platform.width();
    const height = this.platform.height();

    console.log('Screen Width:', width);
    console.log('Screen Height:', height);
    this.width = width;
    this.height = height;
    if (this.width < 500 && this.height < 800) {
      this.isSmallScreen = true;
    } else if (this.width > 500 && this.height > 900) {
      this.isBigScreen = true;
    }
  }
  ionViewWillEnter() {
    this.route.queryParams.subscribe((params: any) => {
      this.assetId = params && params.assetId ? params.assetId : null;
      if(this.assetId != null) {
        this.getAssetDetails();
      }
    })
    this.profile = JSON.parse(localStorage.getItem('Profile'));
    this.profile.userPermissions.forEach(element => {
      if ((element.object_name === 'assetTransfer' && element.editAccess)) {
        this.isEditAssetTransfer = true;
      }
      if ((element.object_name === 'assetTransfer' && element.menuVisibility)) {
        this.isViewAssetTransfer = true;
      }
    });
   
  }
  back() {
    this.router.navigate(['asset-list'],{replaceUrl:true});
  }

  getStyleObject() {
    if (this.isBigScreen) {
      return {
        'background': 'rgba(225, 238, 255, 0.5)'
      }
    } else if (this.isSmallScreen) {
    return {
      'background': 'rgba(225, 238, 255, 0.5)',
      'width': '156px',
      'height': '32px',
      'font-size': '15px'
    };
  }
  }

  getStyleObject2() {
    if (this.isBigScreen) {
      return {
        'background': 'rgba(225, 238, 255, 0.5)', 
        'margin-left': '-12px;'
      }
    } else if (this.isSmallScreen) {
    return {
      'width': '176px',
    'background': 'rgba(225, 238, 255, 0.5)',
    'margin-left': '-11px',
    'height': '32px',
    'font-size': '15px'
    };
  }
  }

  setFontSize() {
    if (this.isBigScreen) {}
    else if (this.isSmallScreen) {
    return {
      'font-size': '12px'
    }
  }
  }

  getAssetDetails() {
    this.common.displayLoading();
    this.reqService.getAssetInfo(this.assetId)
    .subscribe(
      (res) => {
        this.asset = res;
        setTimeout(() => {
          this.common.stopLoading();
        }, 100);
      },
      (error) => {
        setTimeout(() => {
          this.common.stopLoading();
        }, 100);
      }
    )
  }
  async gotoAttachment() {
    const modal = await this.modalCtrl.create({
      component: AttachmentPage,
      componentProps: {
        assetId: this.assetId,
      },
    });
    return await modal.present();

  }
  async getAssetHistory() {
    let navigationExtras : NavigationExtras = {
      queryParams:{
        assetId: this.assetId,
        module: 'asset-detail'
      },replaceUrl:true
    }
    this.router.navigate(['work-history'], navigationExtras);
  }
  async gotoParts() {
    let navigationExtras : NavigationExtras = {
      queryParams: {
        assetId:this.assetId,
        module:'asset-detail',
      },
      replaceUrl:true
    }
    this.router.navigate(['inventory-list'],navigationExtras);
  }

  takePicture() {
    if(this.platform.is('ios')) {
    let cameraOpt: CameraOptions = {
      quality: 20,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.CAMERA,
      allowEdit: false,
      encodingType: this.camera.EncodingType.JPEG,
      saveToPhotoAlbum: false,
      correctOrientation: true
    }

    this.camera.getPicture(cameraOpt).then((imageData) => {
      this.imageSrc = imageData;
      this.presentImgModal();
    }, (err) => {
    });
  } else {
    let options: CaptureImageOptions = { limit: 1 };
    this.mediaCapture.captureImage(options).then(
      (data: any[]) => {
        let file = data[0].fullPath;
        const name = file.substr(file.lastIndexOf('/') + 1);
        const copyFrom = file.substr(0, file.lastIndexOf('/') + 1);
        this.file.readAsDataURL(copyFrom, name).then(data=>{
          console.log(data);
          this.imageSrc = this.imageSrc = data.split('data:image/jpeg;base64,')[1];
          this.presentImgModal();
        },error=>{
          console.log(error);
        })
      },(err: CaptureError) => console.error(err)
    );
  }
  }

  async presentImgModal() {
    let annotateModal = await this.modalCtrl.create(
      {
        component:AnnotatePage,
        componentProps: { requestType: 'asset-detail', existingImg: this.asset.s3ImageId, isNewImg: this.imageSrc }
      }
    );
    annotateModal.onDidDismiss().then((detail: OverlayEventDetail) => {
      let data = detail.data;
      if (data) {
        this.asset.s3ImageId = data.imgId ? data.imgId : '';
        this.updateAsset();
      }
    });
    await annotateModal.present();
  }
  updateAsset() {
    this.common.displayLoading();
    this.reqService.updateAsset(this.asset)
    .subscribe(
      (result) => {
        setTimeout(() => {
          this.common.stopLoading();
        }, 100);
      },async (err) => {
        setTimeout(() => {
          this.common.stopLoading();
        }, 100);
        if(err.status == 401) this.events.publish('user:inactive', {err: err.status, time: Date.now()});
      }
    )
  }

  selectBrowserImage(event: any) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (event: any) => {
        let base64String = event.target.result.split(",")[1];
        this.imageSrc = base64String;
        this.presentImgModal();
      }
      reader.readAsDataURL(event.target.files[0]);
    }
  }
  gotoCalendar() {
    this.modalCtrl.dismiss();
    let navigationExtras: NavigationExtras = {
      queryParams: {
        assetId:this.assetId,
        module:'asset-detail',
      },replaceUrl:true
    }
    this.router.navigate(['events'], navigationExtras);
  }

  async presentPopover(event: Event) {
    const modal = await this.popOver.create({
      component: AssetPopoverComponent,
      event: event
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      console.log('Selected option:', data);
      if (data == 'Calender') {
        this.gotoCalendar();
      } else if (data == 'Inventory') {
        this.gotoParts();
      } else if (data == 'Attachment') {
        this.gotoAttachment();
      }
    }
  }

  goToAssetTransfer() {
    // this.modalCtrl.dismiss();
    // this.presentModal();
    let navigationExtras: NavigationExtras = {
      queryParams: {
        assetId:this.assetId,
        module:'asset-detail',
        customerId: this.asset.customerId,
        isEditAssetTransfer: this.isEditAssetTransfer
      },replaceUrl:true
    }
    this.router.navigate(['asset-transfer'], navigationExtras);
  }

  async presentModal() {
    const modal = await this.modalCtrl.create({
      component: AssetTransferPage,
      cssClass: 'fullscreen'
    });
    await modal.present();
  }

}
