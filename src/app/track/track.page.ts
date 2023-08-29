import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';
import { Device } from '@ionic-native/device/ngx';
import { Router } from '@angular/router';


declare var google: any;
@Component({
  selector: 'app-track',
  templateUrl: './track.page.html',
  styleUrls: ['./track.page.scss'],
})
export class TrackPage implements OnInit {
  @ViewChild("map", {read: ElementRef, static: false}) mapElement: ElementRef;
  trackedRoute: any[];
  currentlocation: { lat: any; lng: any; };
  retry: boolean;
  map: any;
  markers: any= [];
  profile: any;

  constructor(
    private geolocation: Geolocation,
    private device: Device,
    private common: CommonProvider,
    private reqService: ServiceProvider,
    private router : Router
  ) { }

  ngOnInit() {
    this.profile = JSON.parse(localStorage.getItem('userProfile'));
  }
  LocationTracker(type?) {
    this.trackedRoute = [];
    this.geolocation
    .getCurrentPosition({
      timeout: 20000,
      enableHighAccuracy: true,
      // maximumAge: 3600,
    })
    .then((resp) => {
      this.currentlocation = {
        lat: resp.coords.latitude,
        lng: resp.coords.longitude,
      };
      // this.showmap();
      console.log(JSON.stringify(this.currentlocation) + type);
      let track = {
        latitude:this.currentlocation.lat,
        longitude:this.currentlocation.lng,
        uuid:this.device.uuid,
        status:type,
        userId:this.profile.id

      }
      this.reqService.locationTracking(track).subscribe(res=>{
        console.log(res);
      })
    })
    .catch((error) => {
      this.retry = true;
      console.log(error+" ---catch error in get userloaction---");
      if (this.retry) {
        // this.LocationTracker();
        this.retry = false;
      } else {
        this.common.alertToast(
          this.reqService.translatedata('locationDetectError')
        );
      }
    });
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
    // this.getDirection();

    this.plotMarker();
    console.log("watchLocation is called from load map")
    // this.watchLocation();
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
  deleteMarker() {
    console.log('delete marker is called');
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
  }
  back() {
    this.router.navigate(['settings']);
  }
}
