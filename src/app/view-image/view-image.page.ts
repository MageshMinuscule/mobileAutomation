import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-view-image',
  templateUrl: './view-image.page.html',
  styleUrls: ['./view-image.page.scss'],
})
export class ViewImagePage implements OnInit {
  @Input() value : any;
  @Input() requestType : any;
  imageSrc: string = null;
  constructor(public route : ActivatedRoute, private _location : Location, private modalCtrl : ModalController) {
console.log( 'image src '+this.value);
        // this.imageSrc = this.value.includes('data:image') ? this.value :  'data:image/jpeg;base64,' +  this.value;
  }
  dismiss() {
    this.modalCtrl.dismiss();
  }

  ngOnInit() {
    this.imageSrc = this.value.includes('data:image') ? this.value :  'data:image/jpeg;base64,' +  this.value;
  }

}
