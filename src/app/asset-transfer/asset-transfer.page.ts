import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router, NavigationExtras } from '@angular/router';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-asset-transfer',
  templateUrl: './asset-transfer.page.html',
  styleUrls: ['./asset-transfer.page.scss'],
})
export class AssetTransferPage implements OnInit {

  loaded: boolean = true;
  profile: any;
  userList: any[] = [];
  users: any[] = [];
  userListResults: any[] = [];
  user: any = {};
  selectedUser: any = {};
  locationArray: any[] = [];
  locations: any[] = [];
  locationResults: any[] = [];
  selectedLocation: any = {};
  location: any = {};
  assetTransferType: any = 'USER';
  assetId: any;
  size: number = 10;
  page = 0;
  assetTransferUserList: any[] = [];
  assetTransferLocationList: any[] = [];
  filterBy: any = 'Relevance';
  customerId: any;
  usersList: any;
  locationList: any;
  locationChecked: boolean = false;
  userChecked: boolean = false;
  currentDate: any;
  userName: any;
  locationName: any;
  isEditAssetTransfer: any;
  isScroll: boolean = false;
  scrollEnd: boolean = false;
  totalItems: any;

  constructor(
    private firestore: AngularFirestore,
    private router: Router,
    private service: ServiceProvider,
    private common: CommonProvider,
    private datePipe: DatePipe,
    private route: ActivatedRoute
  ) {
    let profile = JSON.parse(window.localStorage.getItem('Profile'));
    this.profile = profile;
    this.currentDate = this.datePipe.transform((new Date), 'yyyy-MM-dd');

    this.route.queryParams.subscribe((params: any) => {
      this.assetId = params && params.assetId ? params.assetId : null;
      this.customerId = params && params.customerId ? params.customerId : null;
      this.getCurrentUser();
      this.getCurrentLocation();
      this.getCurrentAssetTransferUserList(null, null);
      this.getCurrentAssetTransferLocationList(null, null);
    });
    let userListCollectionRef = this.firestore
      .collection('organization')
      .doc(profile.tenantId)
      .collection('user_base', (ref) => ref.where('active', '==', true));
    userListCollectionRef.valueChanges().subscribe((res) => {
      this.userList = res;
      // this.userListResults = res;
      this.prepareuser();
    });
    let locationCollectionRef = this.firestore
      .collection('organization')
      .doc(profile.tenantId)
      .collection('location');
    locationCollectionRef.valueChanges().subscribe((res) => {
      this.locationArray = res;
      this.prepareLocation();
    });
  }

  ngOnInit() {
  }
  ionViewWillEnter(){
    this.route.queryParams.subscribe((params: any) => {
      if(params.isEditAssetTransfer) {
        this.isEditAssetTransfer = params.isEditAssetTransfer == 'true' ? true : false;
      }
    })
   
  }

  getCurrentAssetTransferUserList(num, tab) {
    let options = {
      page: this.page = num ? num : this.page,
      size: this.size
    }
    let assetId = parseInt(this.assetId)
    let data = {
      assetId: assetId,
      assetTransferType: "USER"
    }
    this.service.getAssetTransferByFilters(options, data).subscribe((res) => {
      let datas = res['body'];
      this.totalItems = res.headers.get('X-Total-Count');
      if (this.assetTransferUserList.length <= 10 && this.page > 0 ) {
        datas.forEach(element => {
          this.assetTransferUserList.push(element);
        });
        console.log(this.assetTransferUserList);
      } else {
        this.assetTransferUserList = datas;
      }
      if (this.assetTransferUserList.length != 0) {
        this.assetTransferUserList.forEach(element => {
          if (element.toDate == null) {
            element.toDate = 'Present';
          }
          if (element.duration == null) {
            element.duration = '-';
          }
        });
        if (tab != 'User' && tab != 'Location') {
        var custom = {
          name: res['body'][0].userName,
          id: res['body'][0].id,
        };
        this.user = { ...custom };
      }
      }
      if (this.totalItems == this.assetTransferUserList.length) {
        this.scrollEnd = true;
      }
    }, err => {
      console.log(err);
    });
  }

  getCurrentAssetTransferLocationList(num, tab) {
    let options = {
      page: this.page = num ? num : this.page,
      size: this.size
    }
    let assetId = parseInt(this.assetId)
    let data = {
      assetId: assetId,
      assetTransferType: "LOCATION"
    }
    this.service.getAssetTransferByFilters(options, data).subscribe((res) => {
      let datas = res['body'];
      this.totalItems = res.headers.get('X-Total-Count');
      if (this.assetTransferLocationList.length <= 10 && this.page > 0) {
        datas.forEach(element => {
          this.assetTransferLocationList.push(element);
        });
      } else {
      this.assetTransferLocationList = res['body'];
      }
      if (this.assetTransferLocationList.length != 0) {
      this.assetTransferLocationList.forEach(element => {
        if (element.toDate == null) {
          element.toDate = 'Present';
        }
        if (element.duration == null) {
          element.duration = '-';
        }
      });
      if (tab != 'User' && tab != 'Location') {
      var custom = {
        name: res['body'][0].locationName,
        id: res['body'][0].id,
      };
      this.location = { ...custom };
    }
    }
    if (this.totalItems == this.assetTransferLocationList.length) {
      this.isScroll = true;
    }
    }, err => {
      console.log(err);
    });
  }


  back() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        assetId: this.assetId,
      }, replaceUrl: true
    }
    this.router.navigate(['asset-detail'], navigationExtras);
  }

  getCurrentUser() {
    this.service.queryAllUserByCompany({ page: 0, size: 10 }, this.customerId, this.filterBy).subscribe((res) => {
      console.log(res);
      this.usersList = res['body'];
    }, err => {
      console.log(err);
    });
  }

  getCurrentLocation() {
    this.service.queryAllLoctionByCompanys({ page: 0, size: 10 }, { id: this.customerId }).subscribe((res) => {
      console.log(res);
      this.locationList = res['body'];
    }, err => {
      console.log(err);
    });
  }

  filterUserResult(event) {
    event.target.value = event.target.value
      ? event.target.value.trimStart()
      : '';
    let name = event.target.value;
    if (name) {
      this.userListResults = this.users.filter((item) => {
        return item.name.toLowerCase().indexOf(name.toLowerCase()) > -1;
      });
    } else {
      this.selectedUser = {};
      this.user = {
        name: '',
      };
    }
  }

  filterParentLocationResult(event, type) {
    var name;
    name = event.target.value ? event.target.value.trimStart() : '';
    if (name) {
      this.locationResults = this.locations.filter((item) => {
        return item.name.toLowerCase().indexOf(name.toLowerCase()) > -1;
      });
    } else {
      this.selectedLocation = {};
      this.location = {
        name: '',
      };
    }
  }

  selectUser(cus) {
    this.user = { ...cus };
    this.selectedUser = cus;
    this.userChecked = true;
    this.locationChecked = false;
    this.userName = cus.name;
  }

  selectLocation(cus) {
    this.location = { ...cus };
    this.locationChecked = true;
    this.userChecked = false;
    this.selectedLocation = cus;
    this.locationName = cus.name;
  }

  fieldOnFocus(type) {
    switch (type) {
      case 'User':
        this.userListResults = this.users;
        break;
      case 'location':
        this.locationResults = this.locations;
        break
      default:
        break;
    }
  }

  clearResults(type) {
    setTimeout(() => {
      switch (type) {
        case 'User':
          this.userListResults = [];
        case 'location':
          this.locationResults = [];
          break;
        default:
          break;
      }
    }, 100);
  }

  prepareuser() {
    this.users = [];
    for (let usr of this.userList) {
      if (usr.active) {
        var custom = {
          name: usr.firstName,
          id: usr.id,
        };
        this.users.push(custom);
      }
    }
  }

  saveAssettransfer() {
    if (this.locationChecked) {
      this.saveLocationTransfer();
    } else if (this.userChecked) {
      this.saveUsertransfer();
    }
  }

  saveLocationTransfer() {
    let date = new Date();
    let fromDate = this.datePipe.transform(date, 'yyyy-MM-dd');
    let assetId = parseInt(this.assetId)
    let data = {
      fromDate: fromDate,
      assetId: assetId,
      assetTransferType: 'LOCATION',
      locationId: this.location.id,
      locationName: this.location.name,
      userId: null,
      userName: null
    };
    this.service.saveAssettrasfer(data).subscribe((res) => {
      if (res) {
        // this.assetTransferLocationList.unshift(res['body']);
        this.getCurrentAssetTransferLocationList(null, null);
        this.common.alertToast('Asset Transfered Successfully');
        if (this.locationChecked && !this.userChecked) {
          if (this.locationName != null && this.locationName != '' && this.locationName != undefined) {
            this.saveLocationTransfer();
          } else {
            this.locationName = null;
          }
        } else {
          this.userName = null;
          this.locationName = null;
          this.locationChecked = false;
          this.userChecked = false;
        }
      }
    }, err => {
      console.log(err);
    });
  }

  saveUsertransfer() {
    let date = new Date();
    let fromDate = this.datePipe.transform(date, 'yyyy-MM-dd');
    let assetId = parseInt(this.assetId)
    let data = {
      fromDate: fromDate,
      assetId: assetId,
      assetTransferType: 'USER',
      userId: this.user.id,
      userName: this.user.name,
      locationId: null,
      locationName: null
    };
    this.service.saveAssettrasfer(data).subscribe((res) => {
      if (res) {
        // this.assetTransferUserList.unshift(res['body']);
        this.getCurrentAssetTransferUserList(null, null);
        this.common.alertToast('Asset Transfered Successfully');
        if (!this.locationChecked && this.userChecked) {
          if (this.userName != null && this.userName != '' && this.userName != undefined) {
            this.saveUsertransfer();
          } else {
            this.userName = null;
          }
        } else {
          this.userName = null;
          this.locationName = null;
          this.locationChecked = false;
          this.userChecked = false;
        }
      }
    }, err => {
      console.log(err);
    });
  }

  prepareLocation() {
    this.locations = [];
    for (let loc of this.locationArray) {
      if (loc.active) {
        var custom = {
          name: loc.name,
          id: loc.id,
        };
        this.locations.push(custom);
      }
    }
  }

  tabChange(event) {
    this.page = 0;
    this.assetTransferType = event.currentTarget.value;
    if (this.assetTransferType == 'LOCATION') {
      this.scrollEnd = false;
      this.assetTransferLocationList = [];
      this.getCurrentAssetTransferLocationList(null, null);
    } else if (this.assetTransferType == 'USER') {
      this.isScroll = false;
      this.assetTransferUserList = [];
      this.getCurrentAssetTransferUserList(null, null);
    }
  }

  getDiffDays(sDate, eDate) {
    var startDate = new Date(sDate);
    var endDate = new Date(eDate);
    var Time = endDate.getTime() - startDate.getTime();
    return Time / (1000 * 3600 * 24);
  }

  doInfinite(val, tab) {
    this.page = this.page + 1;
    if (tab == 'Location') {
      this.getCurrentAssetTransferLocationList(this.page, tab);
    } else if (tab == 'User') {
    this.getCurrentAssetTransferUserList(this.page, tab);
    }
  }
}

