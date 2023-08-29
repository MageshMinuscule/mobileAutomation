import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Config } from '../config';
import { AngularFirestore } from '@angular/fire/firestore';
import { InventoryListPage } from '../inventory-list/inventory-list.page';
import { ModalController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';
import { ServiceProvider } from 'src/providers/service/service';
import { ImagePicker } from '@ionic-native/image-picker/ngx';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  language: any;
  profile: any;
  usergroupPermissions: any;
  overDueList: boolean;
  isAssetBased: boolean;
  showRequest = false;
  modelData: any;
  segment: string;
  imgRes: any[];
  options: { width: number; quality: number; outputType: number; maximumImagesCount: number; };
  constructor(private router : Router,
     private firestore: AngularFirestore,
     public modalCtrl: ModalController,
     private reqService : ServiceProvider,
     private imgPicker:ImagePicker
     ) {
      this.profile = JSON.parse(window.localStorage.getItem('Profile'));
      if (this.profile && this.profile.email && this.profile.tenantId == 'sea') {
        let outstandingCollectionRef = this.firestore.collection('sea').doc("overDue").collection(this.profile.email);
        outstandingCollectionRef.valueChanges().subscribe(res => {
          if (res) {
            this.overDueList = true
          }
        });
      }
    this.usergroupPermissions = JSON.parse(localStorage.getItem('usergroupPermissions'));
    if (this.usergroupPermissions) {
      if (this.profile.id === 1) {
        this.showRequest =  true;
    } else {      
      this.usergroupPermissions.forEach(element => {
        if ((element.object_name === 'clientRequest' && element.create_access === true) || (element.object_name.toLowerCase() === 'requestuser' && element.create_access === true)) {
          this.showRequest = true;
        }
      });
    }
    }
  }

  ngOnInit() {
  }
  imagepicker() {
    this.options = {
      width: 200,
      quality: 30,
      outputType: 1,
      maximumImagesCount:10
    };
    
    this.imgRes = [];
    this.imgPicker.getPictures(this.options).then((results) => {
      for (var i = 0; i < results.length; i++) {
        this.imgRes.push('data:image/jpeg;base64,' + results[i]);
      }
    }, (error) => {
      alert(error);
    });
  }
  ionViewWillEnter() {
    this.segment = "settings";
  }
  ionViewDidEnter() {
    this.language = Config.constants.setting.language ? Config.constants.setting.language : 'en';
  }

  gotoAbout() {
    this.router.navigate(['/about']);
  }

  gotoTravelPage() {
    this.router.navigate(['']);
  }

  gotoOutstanding() {
    let navigationExtras: NavigationExtras = {
      queryParams:{
        overDue: true
      }
    }
    this.router.navigate(['/user-list'],navigationExtras);
  }

  gotoCrane() {
    this.router.navigate(['']);
  }
  async gotoInventories() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        partsUpdate: 'Show Parts List',
        tab: 'settings'
      },replaceUrl:true
    }
    this.router.navigate(['inventory-list'],navigationExtras)
  }
  gotoAsset()
  {
    this.router.navigate(['/asset-list']);
  }
  meterReading() {
    this.router.navigate(['meter-reading']);
  }
  home() {
    this.router.navigate(['home'], {replaceUrl:true});
  }
  workRequestList() {
    this.router.navigate(['work-request-list']);
  }
  settings() {
    this.router.navigate(['settings']);
  }
  dashBoard() {
    this.router.navigate(['dashboard']);
  }
  tracking() {
    this.router.navigate(['track-user']);
  }
  track() {
    this.router.navigate(['track']);
  }
  viewCalendar() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        module:'settings'
      },replaceUrl:true
    }
    this.router.navigate(['/events'],navigationExtras);
  }
  watch() {
    this.router.navigate(['stop-watch'],{replaceUrl:true});
  }
}
