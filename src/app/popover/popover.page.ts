import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.page.html',
  styleUrls: ['./popover.page.scss'],
})
export class PopoverPage implements OnInit {
  @ViewChild("datePicker") datePicker;
  @ViewChild("timePicker") timePicker;
  ngOnInit() {
  }

  schedule: any = {
    date: "",
    time: new Date().toTimeString().split(" GMT+0530")[0]
  };
  myTime: any;
  constructor(public modalCtrl: ModalController) {
    setTimeout(() => {
      this.datePicker.open();
    }, 200);
  }

  async scheduleRequest() {
    let date = new Date(
      this.schedule.date + "T" + this.schedule.time
    ).toISOString();
    await this.modalCtrl.dismiss(date)
  }
}
