import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { NavController, Platform } from '@ionic/angular';
import { HaversineService, GeoCoord } from 'ng2-haversine';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';
import { Config } from '../config';
import {
  Geolocation,
  Geoposition
} from '@ionic-native/geolocation/ngx';



declare var google: any;

@Component({
  selector: 'app-track-user',
  templateUrl: './track-user.page.html',
  styleUrls: ['./track-user.page.scss'],
})
export class TrackUserPage implements OnInit, AfterViewInit{
  @ViewChild("map", {read: ElementRef, static: false}) mapElement: ElementRef;
  @ViewChild('directionsPanel') directionsPanel: any;
  destination: any;
  locationdirections: any = {};
  source: any;
  toggle: boolean;
  currentlocation: any;
  watch: any;
  map: any;
  markers: any = [];
  traceCollectionRef: any;
  storedLocation: any = [];
  profile: any;
  selectedRequest: any;
  nearToDestination: boolean;
  retry: boolean = true;
  lat: number;
  lng: number;
  location: any;
  mapelement: any;
  mapEle: any;
  latitudeRes: number;
  longitudeRes: number;

  constructor(
    public reqService: ServiceProvider,
    public platform: Platform,
    private diagnostic: Diagnostic,
    private firestore: AngularFirestore,
    private geolocation: Geolocation,
    private _haversineService: HaversineService,
    public common: CommonProvider,
    public navCtrl: NavController,
    public route: ActivatedRoute,
    public router : Router,
  ) {
    // console.log("mapElement" + this.mapElement)
    this.reqService.getUserProfile().then((info) => {
      let profile = info;
      this.profile = profile;
    });
    this.route.queryParams.subscribe((params) => {
      this.selectedRequest = params.selectedRequest
        ? JSON.parse(params.selectedRequest)
        : null;
      this.lat = params.lat ? JSON.parse(params.lat) : null;
      this.lng = params.lng ?  JSON.parse(params.lng) : null;
      this.location = params.location ?  params.location : null;
      console.log(this.location,this.lat,this.lng);
    });
  }
  ngAfterViewInit(): void {
  }

  ngOnInit() {

  }
  ionViewDidEnter() : void {
    console.log("view did load is called")
    let me = this;
    this.currentlocation = { lat: null, lng: null };
    if (this.platform.is('cordova')) {
      let value = this.diagnostic.isLocationEnabled();
      console.log("*************************" + value);
      this.diagnostic.isLocationEnabled().then((state) => {
        if (state) {
          me.getUserLocation();
        } else {
          me.common.alertToast(me.reqService.translatedata('enableLocation'));
          me.diagnostic.switchToLocationSettings();
        }
      });
      // me.getUserLocation();
      // let successCallback = (state) => {
      //   if (state) {
      //     me.getUserLocation();
      //   }
      // };
      // this.diagnostic.registerLocationStateChangeHandler(successCallback);
    } else {
      this.getUserLocation();
    }
    this.showmap();
  }
  showmap() {
    const location = new google.maps.LatLng(12.9077806, 79.3155421)
    const options = {
      center : location,
      zoom : 15,
      disable: true
    }
    this.map = new google.maps.Map(this.mapElement.nativeElement, options)
  }

  getUserLocation() {
    let me = this;
    this.geolocation
      .getCurrentPosition({
        timeout: 20000,
        enableHighAccuracy: true,
        maximumAge: 3600,
      })
      .then((resp) => {
        me.currentlocation = {
          lat: resp.coords.latitude,
          lng: resp.coords.longitude,
        };
        me.updateUserLocation();
        me.loadMap();
        me.getLocationName(me.currentlocation.lat, me.currentlocation.lng);
      })
      .catch((error) => {
        console.log(error+" ---catch error in get userloaction---");
        if (me.retry) {
          me.getUserLocation();
          me.retry = false;
        } else {
          this.common.alertToast(
            this.reqService.translatedata('locationDetectError')
          );
          this.loadDestinationMap();
        }
      });
  }

  updateLocation(position) {
    if (position.coords) {
      this.currentlocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      console.log("currentlocation----"+this.currentlocation)
      this.updateUserLocation();
      this.loadMap();
      this.getLocationName(this.currentlocation.lat, this.currentlocation.lng);
    } else {
      this.common.alertToast(
        this.reqService.translatedata('locationDetectError')
      );
      this.loadDestinationMap();
    }
  }

  updateUserLocation() {
    let res = JSON.parse(window.localStorage.getItem('Profile'));
      if (res) {
        let location = {
          organization: res.tenantId,
          userId: res.id,
          env: Config.constants.env,
          latitude: this.currentlocation.lat,
          longitude: this.currentlocation.lng,
        };
        this.reqService
          .addUserLocation(location)
          .then((result) => {})
          .catch(console.error);
      }
  }
  ionViewDidLeave() {
    if (this.common.locationWatch) this.common.locationWatch.unsubscribe();
  }

  watchLocation() {
    console.log('watchLocation is called----')
    let me = this;
    this.common.locationWatch = this.geolocation.watchPosition()
    .subscribe(position  => {
      if ((position as Geoposition).coords != undefined) {
          var data : any = position as Geoposition;
          console.log("position====>"+ data);
          let currentLocation: GeoCoord = {
            latitude: me.currentlocation.lat
              ? Number(me.currentlocation.lat)
              : Number(data.coords.latitude),
            longitude: me.currentlocation.lng
              ? Number(me.currentlocation.lng)
              : Number(data.coords.longitude),
          };
          console.log('currentLocation' + JSON.stringify(currentLocation));
          let reachedLocation: GeoCoord = {
            latitude: Number(data.coords.latitude),
            longitude: Number(data.coords.longitude),
          };
          console.log('reachedLocation' + JSON.stringify(reachedLocation));
          let destination: GeoCoord = {
            latitude: this.selectedRequest.latitude
              ? Number(this.selectedRequest.latitude)
              : Number(this.lat),

            longitude: this.selectedRequest.longitude
              ? Number(this.selectedRequest.longitude)
              : Number(this.lng),
          };
          console.log('destination' + JSON.stringify(destination));
          let distance = me._haversineService.getDistanceInMeters(
            reachedLocation,
            destination
          );
          let meters = me._haversineService.getDistanceInMeters(
            currentLocation,
            reachedLocation
          );
          // this.common.alertToast("Distance Meter "+distance);
          if (distance <= Number(Config.constants.setting.LocationRadius)) {
            me.currentlocation = {
              lat: 12.9077806,
              lng: 79.3155421,
            };
            me.getLocationName(me.currentlocation.lat, me.currentlocation.lng);
            me.plotMarker();
            me.updateUserLocation();
            if (
              !me.nearToDestination &&
              me.selectedRequest.startedById == me.profile.id
            ) {
              me.common.alertToast(
                me.reqService.translatedata('Near to Destination')
              );
              me.nearToDestination = true;
              setTimeout(() => {
                me.nearToDestination = false;
              }, 8000);
            }
          } else if (meters >= 20) {
            this.common.alertToast('Your Distance ' + meters);
            me.currentlocation = {
              lat: data.coords.latitude,
              lng: data.coords.longitude,
            };
            me.getLocationName(me.currentlocation.lat, me.currentlocation.lng);
            me.plotMarker();
            me.updateUserLocation();
          }
        } else {
          // var positionError = position as PositionError;
          // console.log(
          //   'Error ' + positionError.code + ': ' + positionError.message
          // );
          this.common.alertToast(
            this.reqService.translatedata('locationDetectError')
          );
        }
      });
  }

  getLocationName(lat, lng) {
    console.log('getLocationName is called');
    let me = this;
    var geocoder = new google.maps.Geocoder();
    let latlng = { lat: lat, lng: lng};
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          me.source = results[0].formatted_address;
        }
      }
    });
  }

  loadMap() {
    console.log("load mapp called")
    let latLng = new google.maps.LatLng(this.currentlocation);

    let mapOptions = {
      center: latLng,
      zoom: 15,
      disable: true
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    console.log("this.map"+ this.map);
    console.log("getDirection is called from load map")
    this.getDirection();

    this.plotMarker();
    console.log("watchLocation is called from load map")
    this.watchLocation();
  }

  loadDestinationMap() {
    console.log("loadDestinationMap is called.........")
    let me = this;
    this.currentlocation = {
      lat: 12.9077806,
      lng: 79.3155421,
    };
    let latLng = new google.maps.LatLng(me.currentlocation);
    console.log("latlng in load destination map" + JSON.stringify(latLng))
    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    console.log("plotmark is called from loaddestination map")
    this.plotMarker();
  }

  plotMarker() {
    console.log("plotMarker is called.........")
    this.deleteMarker();
    var marker = new google.maps.Marker({
      position: this.currentlocation,
      title: "I'm Here",
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        fillColor: '#05548a',
        scale: 3,
        strokeColor: '#05548a',
        strokeWeight: 6,
        rotation: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      },
    });
    this.markers.push(marker);
    marker.setMap(this.map);
    console.log("plotMarker is ended.........")
  }

  getDirection() {
    console.log("getdirection is called")
    let me = this;
    let directionsService = new google.maps.DirectionsService();
    let directionsDisplay = new google.maps.DirectionsRenderer();
    console.log('directionsDisplay'+JSON.stringify(directionsDisplay))
    directionsDisplay.setMap(null);
    directionsDisplay.setMap(this.map);
    console.log('this.map' + this.map)
    let deslatitude = this.selectedRequest.latitude
      ? this.selectedRequest.latitude
      : this.lat;
    let deslangtitude = this.selectedRequest.longitude
      ? this.selectedRequest.longitude
      : this.lng;
    this.destination = this.selectedRequest.locationName
      ? this.selectedRequest.locationName
      : this.location;
    directionsService.route(
      {
        origin: me.currentlocation,
        destination: { lat: +deslatitude, lng: +deslangtitude },
        travelMode: google.maps.TravelMode['DRIVING'],
      },
      (res, status) => {
        console.log('respose in getuser location ' + JSON.stringify(res))
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(res);
          this.locationdirections.distance =
            res.routes[0].legs[0].distance.text;
          this.locationdirections.duration =
            res.routes[0].legs[0].duration.text;
        } else {
          console.log(status);
        }
      }
    );
  }

  deleteMarker() {
    console.log('delete marker is called');
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
  }
  dismiss() {
    this.common.locationWatch.unsubscribe();
    this.navCtrl.pop();
  }

  checkin() {
    if (this.selectedRequest.collectTravelDetails) {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          selectedRequest: JSON.stringify(this.selectedRequest),
        },
      };
      this.router.navigate(['/transport-detail'], navigationExtras);
    } else {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          checkinType: this.selectedRequest.checkInType,
          selectedRequest: JSON.stringify(this.selectedRequest),
          stage: 'Three',
        },
      };
      this.router.navigate(['/checkin'],navigationExtras);
    }
  }
  // (click)="toggle = !toggle"
  tog() {
    this.toggle = !this.toggle;
  }
  back() {
    this.navCtrl.back();
  }
}
