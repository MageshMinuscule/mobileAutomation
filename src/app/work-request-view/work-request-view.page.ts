import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';
import { Events } from 'src/providers/events/events';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';
import { GetAwsImage } from '../data.model';
import { ViewImagePage } from '../view-image/view-image.page';
import { WorkRequestListPage } from '../work-request-list/work-request-list.page';

@Component({
  selector: 'app-work-request-view',
  templateUrl: './work-request-view.page.html',
  styleUrls: ['./work-request-view.page.scss'],
})
export class WorkRequestViewPage implements OnInit {
  profile: any = {};
  createRequest = false;
  createWorkorder = false;
  routing: any;
  items: any = {};
  srcOnly: any;
  imageSrc: string;
  value: any = [];
  workRequests: any = [];
  workRequestJson: any[];
  asset: any = {};
  del: any = {};
  modelData: any;
  imageBaseSrc: any = [];
  constructor(
    public reqService: ServiceProvider,
    public route: ActivatedRoute,
    public alertCtrl: AlertController,
    private router: Router,
    private common: CommonProvider,
    private events: Events, 
    public navCtrl: NavController,
    public modalCtrl: ModalController,
  ) {
    this.route.queryParams.subscribe((params) => {
      if (params && params.selectedAsset) {
        this.asset = params.selectedAsset;
      }
    });
    this.route.paramMap.subscribe((data) => {
      console.log(data);
    });
    this.route.queryParams.subscribe((params) => {
      if (params && params.item) {
        this.items = JSON.parse(params.item);
        this.workRequestJson =JSON.parse(this.items.customJson); 
        console.log(this.items.assetName);
        if (this.items && this.items.s3ImageId) {
          // setTimeout(() => {
            this.presentModal(this.items.s3ImageId);
          // }, 1000);
        }
        if (this.items && this.items.s3ImageList && this.items.s3ImageList.length > 0) {
          // setTimeout(() => {
            this.presentMultiModal(this.items.s3ImageList);
          // }, 1000);
        }
      }
    });
    if (this.items && this.items.s3ImageId) {
      setTimeout(() => {
        this.presentModal(this.items.s3ImageId);
      }, 1000);
    }
    this.reqService.getUserInfo()
    .subscribe(
      (res) => {
        if (res) {
          this.profile = res;
          if (this.profile) {
            if (this.profile.id === 1) {
              this.createRequest = true;
              this.createWorkorder = true;
            } else {
              // if (
              //   this.profile &&
              //   this.profile.userGroupNames &&
              //   this.profile.userGroupNames.includes('WorkRequestAccept')
              // ) {
              //   this.createWorkorder = true;
              // }
              this.profile.userPermissions.forEach(element => {
                if ((element.object_name === 'workOrder' && element.editAccess)) {
                  this.createWorkorder = true;
                }
              });
            }
          }
        }
      }
    )
  }

  
  presentMultiModal(value) {
    this.common.displayLoading();
    this.imageBaseSrc = [];
    value.forEach(element => {
    let getImage = new GetAwsImage();
    getImage.key = element;
    this.reqService.getThumbnailImage(getImage).subscribe(imageData => {
      if (null != imageData) {
        this.common.stopLoading();
        if (imageData.body != null && imageData.body != '') {
          this.imageBaseSrc.push('data:image/jpeg;base64,'+imageData.body);
        } else {
        // this.openImageModal(this.srcOnly);
        this.common.stopLoading();
        }
        //this.openImageModal(src);
      } 
    });
  });
  }

  ngOnInit() {}
  presentModal(value) {
    this.common.displayLoading();
    let getImage = new GetAwsImage();
    getImage.key = value;
    this.reqService
      .genericAWSImageGetOne(getImage, 'full')
      .then((imageData) => {
        if (null != imageData) {
          this.common.stopLoading();
          if (imageData.imageBlob != null && imageData.imageBlob != '') {
            this.srcOnly = imageData.imageBlob;
            this.imageSrc = 'data:image/jpeg;base64,' + imageData.imageBlob;
          }
        } else {
          this.openImageModal(this.srcOnly);
          this.common.stopLoading();
        }
      });
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
  requestCreate(data) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        chooseWorkflow: 'Show WorkFlow List',
        isFromWorkRequest: true,
        workRequest: JSON.stringify(data),
      },
    };
    this.router.navigate(['/search'], navigationExtras);
  }

  requestDelete(data) {
    this.del = data;
    this.presentConfirm(data);
  }
  async presentConfirm(value) {
    let alert = await this.alertCtrl.create({
      header: 'Confirm delete',
      message: 'Do you want to delete the workrequest?',
      backdropDismiss: false,
      inputs: [
        {
          name: 'enterReason',
          placeholder: 'Reason for reject the workrequest',
          checked: false,
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.workRequests.status = value.status
            console.log('Cancel clicked');
            return;
          },
        },
        {
          text: 'Reject',
          role: 'delete',
          handler: (data) => {
            console.log('delete clicked');
            
            if (data.enterReason && data.enterReason.trim() != '') {
              this.del.status = 'Rejected';
              this.workRequests.status = this.del.status;
              this.del.rejectReason = data.enterReason.trim();
              this.reqService.updateWorkRequest(this.del).subscribe(
                async (result) => {
                  {
                    if (result.id) {
                      this.common.alertToast(
                        this.reqService.translatedata(
                          'Work Request rejected successfully'
                        )
                      );
                      // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
                      // window.location.href = '/work-request-list';
                      this.router.navigate(['/work-request-list']);
                      this.common.stopLoading();
                    }
                  }
                },
                (error) => {
                  this.common.stopLoading();
                  if (error.status == 409) {
                    this.common.alertToast(
                      this.reqService.translatedata('recordAlreadyExist')
                    );
                  } else if (error.status == 500 || error.status == 0) {
                    this.common.alertToast(
                      this.reqService.translatedata('internalServerError')
                    );
                  } else {
                    this.events.publish('user:inactive', {
                      err: error.status,
                      time: Date.now(),
                    });
                  }
                }
              );
            } else {
              this.common.alertToast('please fill the value');
              return false;
            }
          },
        },
      ],
    });
    alert.present();
  }
  back() {
    this.router.navigate(['work-request-list']);
    // if(this.navCtrl) {
    //   this.navCtrl.pop();
    // }
  }
}
