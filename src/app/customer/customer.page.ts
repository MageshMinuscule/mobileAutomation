import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';

declare var google;
@Component({
  selector: 'app-customer',
  templateUrl: './customer.page.html',
  styleUrls: ['./customer.page.scss'],
})
export class CustomerPage implements OnInit {
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  GoogleAutocomplete: any;
  autocomplete: any;
  infoWindow: any;
  autocompleteItems: any = [];
  geocoder: any;
  markers: any;
  showLocationBar: boolean = false;
  selectedLocation: any = {};
  callBackFunc: any;
  latitude: any;
  longitude: any;
  btnTxt: any = 'save';
  locationName: any = 'Work Location';
  myDate: any;
  showMap: boolean = false;
  customerList: any = [];
  customer: any = {
    name: '',
    location: '',
  };
  constructor(
    public zone: NgZone,
    public reqService: ServiceProvider,
    public common: CommonProvider,
    public modalCtrl: ModalController,
    public route:ActivatedRoute
  ) {
    this.route.queryParams.subscribe((params) => {
      if (params && params.isFromRequest) {
        this.callBackFunc = params.callBack ? params.callBack : null;
        this.customerList = params.customerList ? params.customerList : null;
      }
    });
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocompleteItems = [];
    this.geocoder = new google.maps.Geocoder();
  }

  ngOnInit() {}
  updateSearchResults($event) {
    if (this.customer.location == '') {
      this.autocompleteItems = [];
      return;
    }
    this.GoogleAutocomplete.getPlacePredictions(
      { input: this.customer.location },
      (predictions, status) => {
        this.autocompleteItems = [];
        this.zone.run(() => {
          if (predictions && predictions.length) {
            predictions.forEach((prediction) => {
              this.autocompleteItems.push(prediction);
            });
          }
        });
      }
    );
  }
  selectSearchResult(item) {
    this.autocompleteItems = [];
    this.customer.location = item.description;
    this.markers = [];
    this.showMap = true;
    this.geocoder.geocode({ placeId: item.place_id }, (results, status) => {
      if (status === 'OK' && results[0]) {
        this.locationName = item.description;
        this.latitude = results[0].geometry.location.lat();
        this.longitude = results[0].geometry.location.lng();
        this.loadMap();
      }
    });
  }

  loadMap() {
    let latLng;
    if (this.latitude && this.longitude)
      latLng = new google.maps.LatLng(this.latitude, this.longitude);

    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.addMarker();
  }

  addMarker() {
    let me = this;
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter(),
      draggable: true,
    });


    // this.addInfoWindow(marker, content);
    google.maps.event.addListener(marker, 'dragend', function (event) {
      var geocoder = new google.maps.Geocoder();
      let latlng = {
        lat: marker.getPosition().lat(),
        lng: marker.getPosition().lng(),
      };
      me.latitude = marker.getPosition().lat();
      me.longitude = marker.getPosition().lng();
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK') {
          if (results[0]) {
            me.customer.location = results[0].formatted_address;
            // content = "<span class='info-window'>" + me.customer.location + "</span>";
            // me.addInfoWindow(marker, content);
          }
        }
      });
    });
  }

  addInfoWindow(marker, content) {
    if (this.infoWindow) this.infoWindow.close();
    this.infoWindow = new google.maps.InfoWindow({
      content: content,
    });
    this.infoWindow.open(this.map, marker);
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  addCustomer() {
    this.common.displayLoading();
    for (let customer of this.customerList) {
      if (customer.name == this.customer.name) {
        this.common.alertToast(this.reqService.translatedata('alreadyExist'));
        this.common.stopLoading();
        return false;
      }
    }
    let data = {
      customerName: this.customer.name,
      latitude: this.latitude,
      longitude: this.longitude,
      name: this.customer.location,
      address: this.customer.location,
    };
    this.reqService.createCustomerLocation(data)
    .subscribe(
      (result) => {
        if (result) {
          this.callBackFunc(this.customer).then(() => {
            setTimeout(() => {
              const customerJSON = result._body ? JSON.parse(result._body) : null;
              this.modalCtrl.dismiss(customerJSON);
              this.common.stopLoading();
            }, 1000);
          });
        }
      },async (err) => {
          this.common.stopLoading();
          this.common.alertToast(
            this.reqService.translatedata('internalServerError')
          );
      }
    )
  }
}
