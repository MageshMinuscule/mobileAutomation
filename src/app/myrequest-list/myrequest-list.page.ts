import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Events } from 'src/providers/events/events';

@Component({
  selector: 'app-myrequest-list',
  templateUrl: './myrequest-list.page.html',
  styleUrls: ['./myrequest-list.page.scss'],
})
export class MyrequestListPage implements OnInit {
 @Input('incident') incident : any ={};
  @Input() type : any ;

  constructor(public events : Events ) { 
  }
  goDetailPage(incident) {
    this.events.publish("click:detail", {data:incident});
  }
  ngOnInit() {
  }

}
