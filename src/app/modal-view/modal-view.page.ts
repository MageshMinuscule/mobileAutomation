import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-view',
  templateUrl: './modal-view.page.html',
  styleUrls: ['./modal-view.page.scss'],
})
export class ModalViewPage implements OnInit {
  @Input() title: any;
  @Input() msg: any;
  @Input() buttons: any = [];
  pauseReason:string = '';
  msgShown: boolean;
  constructor(
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
  }
  close() {
    this.modalCtrl.dismiss(null);
  }
  send() {
    if(this.pauseReason != "" && this.pauseReason != null && this.pauseReason != undefined) {
      this.modalCtrl.dismiss(this.pauseReason);
    }else {
      this.msg = 'Please enter pause reason';
      this.msgShown = true;
      return;
    }
    
  }
  buttonAction(btn) {
    this.modalCtrl.dismiss(btn);
  }
  inputEv(ev) {
    let val = ev.target.value;
    if(val != '' && val != null && val != undefined) {
      this.msgShown = false;
    }
  }

}
