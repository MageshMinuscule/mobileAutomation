import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ModalController } from '@ionic/angular';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';
import { Config } from '../config';

declare var google;
@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  GoogleAutocomplete: any;
  autocomplete: any;
  autocompleteItems: any;
  geocoder: any;
  title: any;
  isTracked: boolean = false;
  showAddButton: boolean = false;
  showLocationBar: boolean = false;
  selectedLocation: any = {
    name: '',
    latitude: '',
    longitude: ''
  };
  callBackFunc: any;
  latitude: any;
  longitude: any;
  locationName: any = 'Work Location';
  customerId: any;
  profile: any;
  geoCord: any;
  isLoad: boolean = false;
  markers: any = [];
  currentlocation: any = {};
  destination: any;
  locationdirections: any = {};
  destGeocord: any = {};
  startedBy: any;
  states: any = [];
  stateId: any = 1;
  constructor(
    private geolocation: Geolocation,
    private firestore: AngularFirestore,
    private reqService : ServiceProvider,
    public common : CommonProvider,
    public modalCtrl : ModalController,
    private route : ActivatedRoute,
    public zone: NgZone

  ) {
    this.route.queryParams.subscribe(params =>{
      if(params && params.isFromRequest){
        this.title = this.reqService.translatedata('addlocation');
        this.showLocationBar = true;
         this.route.queryParams.subscribe(params=>{
          this.customerId = params.companyId ? params.companyId : null
        })
        this.route.queryParams.subscribe(params=>{
          this.callBackFunc = params.callBack ? params.callBack : null
        })
      }
    })
    this.route.queryParams.subscribe(params =>{
      if(params && params.lat){
        this.title = this.reqService.translatedata('Work Location');
         this.route.queryParams.subscribe(params=>{
          this.latitude = params.lat ? params.lat : null
          this.longitude = params.lng ? params.lng : null
          this.locationName = params.location ? params.location : null
        })
      }
    })
    this.route.queryParams.subscribe(params =>{
      if(params && params.isTrack){
         this.route.queryParams.subscribe(params=>{
          this.startedBy = params.startedBy ? params.startedBy : null
          this.destGeocord.lat = params.destLat ? params.destLat : null
          this.destGeocord.lng = params.destLng ? params.destLng : null
          this.isLoad = true;
          this.title = this.reqService.translatedata('User Location');
            let profile = JSON.parse(window.localStorage.getItem('Profile'));
            this.profile = profile;
            if (Config.constants.isFirestoreEnabled) {
              let traceCollectionRef = firestore.collection('location_org').doc(profile.tenantId).collection('user').doc(JSON.stringify(this.startedBy));
              traceCollectionRef.valueChanges().subscribe((res) => {
                if (res) {
                  this.geoCord = res;
                  if (!this.isTracked)
                    this.loadMap();
                  else
                    this.plotMarker();
                  this.isTracked = true;
                } else {

                }
              });
            }
   
        })
      }
    })
    this.reqService.getUserProfile().then(info => {
      let profile = info;
      let res = JSON.parse(localStorage.getItem('location_state'));
        if (res && res.length) {
          this.states = res;
        } else {
          let stateCollectionRef = firestore.collection('organization').doc(profile.tenantId).collection('location_state');
          stateCollectionRef.valueChanges().subscribe((res) => {
            this.states = res;
            localStorage.setItem('location_state', JSON.stringify(res));
          });
        }
    });
    this.route.queryParams.subscribe(params => {
      this.destination = params.destination ? params.destination : null
    })
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = { input: '' };
    this.autocompleteItems = [];
    this.geocoder = new google.maps.Geocoder;
    let me = this;
    this.geocoder.geocode({ 'address': this.destination }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          me.destination = results[0].geometry;
        }
      }
    });
    this.markers = [];
   }

  ngOnInit() {
  }
  ionViewDidLoad() {
    if (!this.showLocationBar && !this.isLoad)
      this.loadMap();
  }

  updateSearchResults() {
    this.showAddButton = false;
    if (this.autocomplete.input == '') {
      this.autocompleteItems = [];
      return;
    }
    this.GoogleAutocomplete.getPlacePredictions({ input: this.autocomplete.input },
      (predictions, status) => {
        this.autocompleteItems = [];
        this.zone.run(() => {
          if (predictions && predictions.length) {
            predictions.forEach((prediction) => {
              this.autocompleteItems.push(prediction);
            });
          }
        });
      });
  }

  selectSearchResult(item) {
    this.showAddButton = true;
    this.loadMap();
    this.autocompleteItems = [];
    this.autocomplete.input = item.description;
    this.markers = [];
    this.geocoder.geocode({ 'placeId': item.place_id }, (results, status) => {
      if (status === 'OK' && results[0]) {
        console.log(results[0]);
        let state = this.getStateName(results[0]);
        this.setStateId(state);
        // let position = {
        //   lat: results[0].geometry.location.lat,
        //   lng: results[0].geometry.location.lng
        // };
        let marker = new google.maps.Marker({
          position: results[0].geometry.location,
          map: this.map,
        });
        this.selectedLocation.name = item.description;
        this.selectedLocation.latitude = results[0].geometry.location.lat();
        this.selectedLocation.longitude = results[0].geometry.location.lng();
        let content = "<h5>" + this.autocomplete.input + "</h5>";
        this.addInfoWindow(marker, content)
        this.markers.push(marker);
        this.map.setCenter(results[0].geometry.location);
      }
    })
  }

  getStateName(object): Object {
    let state = 'Others';
    const address_components = object.address_components;
    address_components.forEach(element => {
      if (element.types[0] == 'administrative_area_level_1') {
        state = element.long_name;
      }
    });
    return state;
  }

  setStateId(name) {
    for (let state of this.states) {
      if (state.name == name) {
        this.stateId = state.id;
      }
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  tryGeolocation() {
    this.markers = [];
    this.geolocation.getCurrentPosition().then((resp) => {
      let pos = {
        lat: resp.coords.latitude,
        lng: resp.coords.longitude
      };
      let marker = new google.maps.Marker({
        position: pos,
        map: this.map,
        title: 'I am here!'
      });
      this.markers.push(marker);
      this.map.setCenter(pos);
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  loadMap() {
    let latLng;
    if (!this.showLocationBar && !this.geoCord)
      latLng = new google.maps.LatLng(13.030813, 80.163945);
    if (this.latitude && this.longitude)
      latLng = new google.maps.LatLng(this.latitude, this.longitude);
    if (this.geoCord) {
      latLng = new google.maps.LatLng(this.geoCord.location.latitude, this.geoCord.location.longitude);
    }

    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    if (!this.showAddButton) {
      this.plotMarker();
      this.getDirection();
    }

  }

  addMarker() {
    let me = this;
    let marker = new google.maps.Marker({
      map: this.map,
      // animation: google.maps.Animation.DROP,
      position: this.map.getCenter(),
      draggable: false
    });

    let content = "<h6>User Here</h6>";

    this.addInfoWindow(marker, content);
    google.maps.event.addListener(marker, 'dragend', function (event) {
      var geocoder = new google.maps.Geocoder;
      let latlng = { lat: marker.getPosition().lat(), lng: marker.getPosition().lng() };
      me.selectedLocation.latitude = marker.getPosition().lat();
      me.selectedLocation.longitude = marker.getPosition().lng();
      geocoder.geocode({ 'location': latlng }, (results, status) => {
        if (status === 'OK') {
          if (results[0]) {
            me.selectedLocation.name = results[0].formatted_address;
            // content = "<span class='info-window'>" + me.selectedLocation.name + "</span>";
            // me.addInfoWindow(marker, content);
          }
        }
      });
    });

  }

  plotMarker() {
    this.deleteMarker();
    this.currentlocation = { lat: this.geoCord.location.latitude, lng: this.geoCord.location.longitude };
    var icon = {
      url: "../../assets/imgs/marker.png",
      scaledSize: new google.maps.Size(50, 50)
    };
    var marker = new google.maps.Marker({
      position: this.currentlocation,
      title: "User Here",
      map: this.map,
      icon: icon
      // animation: google.maps.Animation.DROP,
      // icon: {
      //   path: google.maps.SymbolPath.CIRCLE,
      //   fillColor: '#05548a',
      //   strokeColor: '#05548a',
      //   strokeWeight: 6,
      //   scale: 3
      // }
      // icon: {
      //   path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      //   fillColor: '#05548a',
      //   scale: 3,
      //   strokeColor: '#05548a',
      //   strokeWeight: 6,
      //   rotation: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
      // }
    });
    this.markers.push(marker)
    marker.setMap(this.map);
    let content = "<h6>User Here</h6>";

    this.addInfoWindow(marker, content);
    let me = this;
    marker.addListener('click', function () {
      me.addInfoWindow(marker, content);
    });
  }

  getDirection() {
    let me = this;
    let directionsService = new google.maps.DirectionsService;
    let directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay.setMap(null);
    directionsDisplay.setMap(this.map);
    directionsService.route({
      origin: me.currentlocation,
      destination: { lat: +this.destGeocord.lat, lng: +this.destGeocord.lng },
      travelMode: google.maps.TravelMode['DRIVING']
    }, (res, status) => {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(res);
        this.locationdirections.distance = res.routes[0].legs[0].distance.text;
        this.locationdirections.duration = res.routes[0].legs[0].duration.text;
      } else {
        console.log(status);
      }

    });
  }

  deleteMarker() {
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
  }

  addInfoWindow(marker, content) {

    let infoWindow = new google.maps.InfoWindow({
      content: content
    });
    infoWindow.open(this.map, marker);

  }

  addLocation() {
    this.common.displayLoading();
    let data = {
      latitude: this.selectedLocation.latitude,
      longitude: this.selectedLocation.longitude,
      name: this.selectedLocation.name,
      companyId: this.customerId,
      stateId: this.stateId,
      address: this.selectedLocation.name
    }
    this.reqService.createCustomerLocation(data)
    .subscribe(
      result => {
        if (result) {
          this.callBackFunc(this.selectedLocation).then(() => {
            setTimeout(() => {
              const locationJSON = result._body ? JSON.parse(result._body) : null;
              this.modalCtrl.dismiss(locationJSON);
              this.common.stopLoading();
            }, 1000);
          });
        }
      },async (err)=>{
        this.common.stopLoading();
        this.common.alertToast(this.reqService.translatedata('internalServerError'));
      }
    )
  }

}
