import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ServiceProvider } from 'src/providers/service/service';

@Component({
  selector: 'app-stop-watch',
  templateUrl: './stop-watch.page.html',
  styleUrls: ['./stop-watch.page.scss'],
})
export class StopWatchPage implements OnInit {
  hour:any = '0' + 0;
  sec:any = '0' + 0;
  min:any = '0' + 0;
  milliSec:any = '0' + 0;
  startTimer :any;
  running: boolean = false;
  @Input() isStart: boolean;
  @Input() selectedRequest: any;
  @Output() isPause = new EventEmitter<boolean>();
  profile: any;
  constructor(
    private reqService:ServiceProvider,
  ) { }

  async ngOnInit() {
    this.profile = JSON.parse(localStorage.getItem('Profile'));
    if(this.isStart) {
      this.start();
      await this.getTimeDuraion();
    }
    
  }
  async ngOnChanges(changes) {
    if(changes.isStart.currentValue) {
      this.start();
      await this.getTimeDuraion();
    }
  }

  async getTimeDuraion() {
    await this.reqService.getRequestTimeDuration(this.selectedRequest.requestId, this.profile.id, this.selectedRequest.requestHistoryId).then( async (res) => {
      if (res && res.body) {
      let totalMinutes = res?.body?.seconds;
      totalMinutes = Number(totalMinutes);
      this.hour = Math.floor(totalMinutes / 3600) <= 0 ? 0 : Math.floor(totalMinutes / 3600);
      this.min = Math.floor(totalMinutes % 3600 / 60) <= 0 ? 0 : Math.floor(totalMinutes % 3600 / 60);
      this.sec = Math.floor(totalMinutes % 3600 % 60) <= 0 ? 0 : Math.floor(totalMinutes % 3600 % 60);
      this.milliSec = 10 <= 0 ? 0 : 10;
    }
  }).catch(err => {
    console.log(err);
  });

}
  
  start() {
    if(!this.running) {
      this.running = true;
      this.startTimer = setInterval(() => {
        this.milliSec++;
        this.milliSec = this.milliSec < 10 ? "0" + this.milliSec : this.milliSec;
        if(this.milliSec == 100) {
          this.sec++;
          this.sec = this.sec < 10 ? "0" + this.sec : this.sec;
          this.milliSec = 0;
        }
        if(this.sec == 60) {
          this.min++;
          this.min = this.min < 10 ? "0" + this.min : this.min;
          this.sec = 0;
        }
        if(this.min == 60) {
          this.hour++;
          this.hour = this.hour < 10 ? "0" + this.hour : this.hour;
          this.min = 0;
        }

      }, 10);
    } else {
      clearInterval(this.startTimer);
      this.running = false;
      this.isPause.emit(true);
    }
  }

}
