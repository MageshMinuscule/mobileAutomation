import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ServiceProvider } from 'src/providers/service/service';

@Component({
  selector: 'app-work-guide',
  templateUrl: './work-guide.page.html',
  styleUrls: ['./work-guide.page.scss'],
})
export class WorkGuidePage implements OnInit {
  @ViewChild("searchBar", { static: false }) private searchbarElem: any;
  tab:any = 'Releated Requests';
  requestAssetHistoryies: any = [];
  searchResults: any = [];
  @Input() selectedRequest: any;
  showSearchBar: boolean = false;
  searchKeyword: string;
  profile: any;
  constructor(
    public route:ActivatedRoute,
    public reqService:ServiceProvider,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    let obj = {
      assetId: this.selectedRequest.assetId,
    }
    this.getAssetHistoryByAssetId(obj);
  }
  tabChange(ev) {
    this.tab = ev.detail.value;
    if(this.tab == 'Releated Requests') {
      let obj = {
        assetId: this.selectedRequest.assetId,
      }
      this.getAssetHistoryByAssetId(obj);
    }else {
      this.getGoogleSearch();
    }
  }
  getAssetHistoryByAssetId(obj) {
    this.reqService.getRequestAssetHistory(obj).subscribe(res => {
      this.requestAssetHistoryies = res?.body;
      this.requestAssetHistoryies.forEach(element => {
      element.signedurl = Object.values(element.signedUrlList);
      element.userName = Object.keys(element.signedUrlList);
      });
      console.log(this.requestAssetHistoryies);
    },async(err)=>{
      console.log(err);
    })
   }
   getGoogleSearch() {
    let query = this.selectedRequest.assetName+ "due to" + this.selectedRequest.requestDescription;
    this.reqService.getGoogleSearch(query).subscribe(res => {
      this.searchResults = res?.body?.organic_results;
    },async(err)=>{})
   }
   openLink(url) {
    this.modalCtrl.dismiss();
    window.open(url, '_blank');
   }
   ionViewDidLeave(){
    this.modalCtrl.dismiss();
   }
   back() {
    this.modalCtrl.dismiss();
   }
   focusInput() {
    setTimeout(() => {
      this.searchbarElem.setFocus();
    }, 500);
  }
  searchCancel() {
    this.searchKeyword = '';
    this.showSearchBar = false;
    this.requestAssetHistoryies =[];
    let obj = {
      assetId: this.selectedRequest.assetId,
    }
    this.getAssetHistoryByAssetId(obj);
  }
  onCancel(ev) {
    this.searchKeyword = '';
    this.requestAssetHistoryies =[];
    let obj = {
      assetId: this.selectedRequest.assetId,
    }
    this.getAssetHistoryByAssetId(obj);
  }
  filterResult(ev) {
    let val = ev.target.value;
    if(val && val.trim() != '') {
      let obj = {
        assetId: this.selectedRequest.assetId,
        searchText: val
      }
      this.reqService.getRequestAssetHistory(obj).subscribe(res => {
        this.requestAssetHistoryies =[];
        this.requestAssetHistoryies = res?.body;
        this.requestAssetHistoryies.forEach(element => {
          element.signedurl = Object.values(element.signedUrlList);
          element.userName = Object.keys(element.signedUrlList);
        });
      })

    }
  }
  goToDetail(requestId: any) {
    this.modalCtrl.dismiss(requestId);
  }
}

