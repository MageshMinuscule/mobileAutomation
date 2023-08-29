
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ModalController, NavParams} from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';
import { ServiceProvider } from 'src/providers/service/service';
import { TemplateProvider } from 'src/providers/template/template';
import { CommonProvider } from '../common/common';
import { GetAwsImage } from '../data.model';
import { ViewImagePage } from '../view-image/view-image.page';

@Component({
  selector: 'app-work-view',
  templateUrl: './work-view.page.html',
  styleUrls: ['./work-view.page.scss']
})
export class WorkViewPage implements OnInit {

  incident: any;
  workUpdateCallback: any;
  template: any;
  type: any;
  raisedBy: any;
  index: any;
  requestDetail: any = {};
  modelData: any;
  Pending: any;
  PendingComment: any;
  constructor( private route : ActivatedRoute, 
    public templateProvider: TemplateProvider, 
    public reqService: ServiceProvider, 
    public modalCtrl: ModalController, 
    public common: CommonProvider, 
    public alertCtrl: AlertController,
    public router: Router,
     public navParams: NavParams
   ) {
    this.incident = navParams.data['incident'];
    this.template = navParams.data['template'];
    this.index =navParams.data['index'];
    this.type = navParams.data['type'];
    this.raisedBy = navParams.data['submittedBy'];
    this.requestDetail = navParams.data['requestType'];
    if(this.template && this.template.rejectionReason) {
      this.Pending = JSON.parse(this.template.rejectionReason);
      this.PendingComment = JSON.parse(this.template.rejectionComments)
    }
 
  }

  presentModal(value, index?, src?) {
    if (navigator.onLine) {
      this.common.displayLoading();
      if (typeof value != 'string' && value) {
        let getImage = new GetAwsImage();
        getImage.key = value[index].imgId
        this.reqService.genericAWSImageGetOne(getImage, 'full').then(imageData => {
          if (null != imageData) {
            this.common.stopLoading();
            if (imageData.imageBlob != null && imageData.imageBlob != '') {
              src = imageData.imageBlob;
            }
            this.openImageModal(src);
          } else {
            this.common.stopLoading();
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

  presentSignModal(incident) {
    let src;
    if (navigator.onLine) {
      this.common.displayLoading();
      let getImage = new GetAwsImage();
      getImage.key = incident.imgId;
      this.reqService.genericAWSImageGetOne(getImage, 'full').then(imageData => {
        if (null != imageData) {
          this.common.stopLoading();
          if (imageData.imageBlob != null && imageData.imageBlob != '') {
            src = imageData.imageBlob;
            this.openImageModal(src);
          }
        } else {
          this.common.stopLoading();
        }
      })
    } else {
      this.openImageModal(src);
    }
  }

  openLink(url) {
    window.open(url, '_system', 'location=yes');
  }

  getFeedback(incident) {
    let feedback;
    if (incident.type == 'signaturewithSatisfactory') {
      feedback = incident.feedback;
    } else {
      feedback = incident.value;
    }
    return feedback;
  }

  ngOnInit() {
  }
  back() {
    this.modalCtrl.dismiss();
  }

}
