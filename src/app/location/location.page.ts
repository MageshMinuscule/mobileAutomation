import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
})
export class LocationPage implements OnInit {
  showSearchBar: boolean = false;
  searchKeyword: any = '';
  locations: any = [];
  results: any = [];
  location: any;
  profile: any;
  POSITION = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23,
  ];
  constructor(
    public alertCtrl: AlertController,
    firestore: AngularFirestore,
    public common: CommonProvider,
    public reqService: ServiceProvider,
    public router: Router,
    private _location : Location,
  ) {
    this.location = window.localStorage.getItem('location');
        this.profile = JSON.parse(localStorage.getItem('Profile'));
        let locationCollectionRef = firestore
          .collection('organization')
          .doc(this.profile.tenantId)
          .collection('location', (ref) => ref.where('active', '==', true));
        locationCollectionRef.valueChanges().subscribe((res) => {
          this.locations = this.arrangeLocation(res);
          this.common.locationList = this.locations;
          this.results = this.locations;
        });
      
 
  }

  ngOnInit() {}
  beginSearch() {
    this.showSearchBar = !this.showSearchBar;
  }
  back() {
    this._location.back();
  }
  onCancel($event) {

  }

  arrangeLocation(list) {
    const locations = [];
    this.POSITION.forEach((position) => {
      list.forEach((location) => {
        if (location.position == position) {
          locations.push(location);
        }
      });
    });
    return locations;
  }
  filterResult(Keyword) {
    let val = Keyword.target.value;
    val = val
      ? val.trim()
        ? val.trim().replace(new RegExp('\\s+', 'gm'), ' ')
        : ''
      : '';
    this.results = this.locations;
    if (val) {
      this.results = this.locations.filter((item) => {
        return item.name.toLowerCase().indexOf(val.toLowerCase()) > -1;
      });
    }
  }

  setCurrentLocation() {
    window.localStorage.setItem('location', this.location);
    this.router.navigate(['home']);
  }

  async showLocationConfirmation(location) {
    let alert = await this.alertCtrl.create({
      header: this.reqService.translatedata('confirm-location'),
      message:
        '<div><span class="alert-text">' +
        this.reqService.translatedata('selectConfirmation') +
        ' ' +
        location +
        '</span></div>',
      cssClass: 'custom-alert',
      backdropDismiss: true,
      buttons: [
        {
          text: this.reqService.translatedata('cancel'),
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
        {
          text: this.reqService.translatedata('confirm'),
          handler: () => {
            this.setCurrentLocation();
          },
        },
      ],
    });
    await alert.present();
  }
}
