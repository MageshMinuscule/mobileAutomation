import { ModalController, PopoverController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-face-id',
  templateUrl: './face-id.page.html',
  styleUrls: ['./face-id.page.scss'],
})
export class FaceIdPage implements OnInit {

  constructor(
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
  }
  tryAgain() {
    this.popoverController.dismiss('try');
  }
  UsePass() {
    this.popoverController.dismiss('userpass');
  }
}
