import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ModalController, NavParams } from '@ionic/angular';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';
import { RequestDetailPage } from '../request-detail/request-detail.page';

@Component({
  selector: 'app-work-history',
  templateUrl: './work-history.page.html',
  styleUrls: ['./work-history.page.scss'],
})
export class WorkHistoryPage implements OnInit {
  assetId: any;
  incidents: any = [];
  selectedRequest: any;
  subHeader: any;
  module: any;
  tab: any;
  noRecordFound: boolean;
  requestTile: any;

  constructor(
    public reqService: ServiceProvider,
    public router: Router,
    public common: CommonProvider,
    public route: ActivatedRoute,
    public modalCtrl: ModalController,
  ) {    
  }
  ionViewWillEnter() {
    // this.noRecordFound = true;
    this.route.queryParams.subscribe((params: any) => {
      this.assetId = params && params.assetId ? params.assetId : null; 
      this.subHeader = params && params.subheader ? params.subheader : params.subHeader ;
      this.selectedRequest = params && params.selectedRequest ? JSON.parse(params.selectedRequest) : null;
      this.module = params && params.module ? params.module :null;
      this.tab = params && params.tab ? params.tab :null;
      this.requestTile = params && params.requestTitle ? params.requestTitle : null;
      if(this.assetId != null) {
        this.getAssetHistory(this.assetId);
      }else {
        this.noRecordFound = true;
      }
    })
    
  }
  getAssetHistory(assetId: any): any {
    
    this.reqService.getAssetHistory(assetId).subscribe((response) => {
      if (response) {
        this.incidents = [];
        this.incidents = response;
        this.noRecordFound = this.incidents.length == 0 ? true : false;
      } else {
        this.common.alertToast(
          this.reqService.translatedata('internalServerError')
        );
      }
    },async (err)=>{
      this.common.alertToast(
        this.reqService.translatedata(err.detail)
      );
    });
  }

  async goDetailPage(incident) {
    this.common.logClickEvent(
      'request_detail_click_from_asset_history',
      'Asset History Page'
    );
    let navigationExtras: NavigationExtras = {
      queryParams: {
          selectedRequest: JSON.stringify(incident),
          type: 'job',
          subHeader: this.subHeader,
          module:this.module,
          tab:this.tab,
          requestTile:this.requestTile
      },replaceUrl:true
    }
    this.router.navigate(['request-detail'], navigationExtras);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WorkHistoryListPage');
  }
  back() {
    if(this.module == 'asset-detail') {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          assetId:this.assetId,
        },replaceUrl:true
      }
      this.router.navigate(['asset-detail'], navigationExtras)
    }else if(this.module == 'myCreation') {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          tab:this.tab,
        },replaceUrl:true
      }
      this.router.navigate(['request-list'], navigationExtras)
    }else if(this.module == 'schedule-job-instance') {
      this.router.navigate(['events'],{replaceUrl:true})
    }else {
      let navigationExtras : NavigationExtras = {
        queryParams:{
          selectedRequest: JSON.stringify(this.selectedRequest),
          tab:'assetHistory',
          subHeader: this.subHeader
        },replaceUrl:true
      }
      this.router.navigate(['request-detail'],navigationExtras)
    }

  }

  ngOnInit() {}
}
