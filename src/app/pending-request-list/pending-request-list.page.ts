import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Events } from 'src/providers/events/events';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-pending-request-list',
  templateUrl: './pending-request-list.page.html',
  styleUrls: ['./pending-request-list.page.scss'],
})
export class PendingRequestListPage implements OnInit {
  @Input('incident') incident : any = {};
  @Input('type') type : string;
  @Input('subHeader') subHeader: any;
  @Output() parentData = new EventEmitter();
  shownAck: boolean = false;
  shownCheckIn: boolean = false;
  shownStartWork: boolean = false;
  shownDetail: boolean = false;
  isClickedOnce:boolean = false;
  datePipe = new DatePipe('en-US');
  constructor(
    private events: Events,
    private router: Router,
    private common: CommonProvider,
    private reqService: ServiceProvider,
    ) {}

  ngOnInit() {
  }

  goDetailPage(incident) {
    this.shownDetail = true;
    let profile  = JSON.parse(window.localStorage.getItem('Profile'));
    let tenantId = profile.tenantId;
    if(navigator.onLine || tenantId == 'test' || tenantId == 'supremecourt' || tenantId == 'smitechengineeringpteltd' || tenantId == 'cryotos' || tenantId =='alzainfarmsllc' || tenantId =='bgmcomputers' || tenantId == 'moon') {
      setTimeout(() => {
        this.events.publish('click:detail', {
          user: incident,
          type: 'view',
        });
      }, 0);
    } else {
      this.common.alertToast(this.reqService.translatedata('networkConnectivityError'));
    }


  }

  acknowledge(event,incident) {
    this.shownAck = true;
      this.events.publish('click:detail', {
        user: incident,
        type: 'acknowledge',
      });
      event.stopPropagation();
  }

  checkin(incident) {
    this.shownCheckIn = true;
    setTimeout(() => {
      this.events.publish('click:detail', {
        user: incident,
        type: 'checkin',
      });
    }, 0);

  }

  startWork(incident) {
    this.shownStartWork = true;
    setTimeout(() => {
      this.events.publish('click:detail', {
        user: incident,
        type: 'startwork',
      });
    }, 0);

  }
}
