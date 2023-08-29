import { Component, OnInit, ElementRef} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ServiceProvider } from '../../providers/service/service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { CommonProvider } from '../common/common';
import { Config } from '../config';
@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
})
export class EventsPage implements OnInit {
  events: any;
  calendarMode : any;
  calendarEvents: any;
  eventSource: any;
  list: any = [];
  date: any;
  isToday: Boolean;
  datePipe = new DatePipe('en-US');
  eventObject: any = {};
  holidaysList: any;
  viewTitle = "Calendar";
  hasNoRecord: boolean = false;
 Preventive = false;
 Work = false;
 currentUserId: Number;
  calendar = {
    mode: 'month',
    currentDate: new Date(),
  };
  currentEvents: { year: number; month: number; date: number; value: any }[];
  isScheduleRaised: boolean;
  assetId: any;
  module: any;




  constructor(
    private service: ServiceProvider,
    private elementRef: ElementRef,
    private router : Router,
    private common: CommonProvider,
    private route : ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.assetId = params.assetId ? params.assetId : null;
      this.module = params.module ? params.module : null;
    })
  }
  changeMode(mode : any) {
    this.calendar.mode = mode;
  }
  today() {
    this.calendar.currentDate = new Date();

  }
  loadEvents() {
    this.eventSource = this.createRandomEvents();
  }
  // onViewTitleChanged(title) {
  //   this.viewTitle = title;
  //   this.viewTitle = title; var month1 = title.split(" ")[0].toLowerCase();
  //   var months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  //   let index = months.indexOf(month1);
  //   console.log(month1);
  //   let val;
  //   if (index <= 8 && index >= 0) {
  //     let ind = index + 1; val = "0" + ind;
  //   } else {
  //     val = index + 1;
  //   }
  //   this.date = title.split(" ")[1] + "-" + val + "-01";
  //   console.log(this.date);
  //   this.loadEvents();
  // }
  // onCurrentDateChanged(event){
  //   var today = new Date();
  //   today.setHours(0, 0, 0, 0);
  //   event.setHours(0, 0, 0, 0);
  //   this.isToday = today.getTime() === event.getTime();
  //  }
  //  onTimeSelected(ev) {
  //  }
  //  onEventSelected(event) {
  //   let requestId = event.id;
  //   console.log(event.id)
  //     if (event.title.includes('(PM)')) {
  //       let navigationExtras: NavigationExtras = { queryParams: { instanceId: event.id },replaceUrl:true };
  //       this.router.navigate(['/schedule-job-instance'],navigationExtras)
  //     } else {
  //       this.isScheduleRaised = true;
  //       this.requestDetailPage(requestId);
  //     }
  //     console.log('Event selected:' + event.startTime + '-' + event.endTime + ',' + event.title);
  //  }
   requestDetailPage(requestId) {
    this.common.displayLoading();
    this.service.getRequestDetail(requestId)
    .subscribe(
      incidents => {
        this.common.stopLoading();
        if (incidents != null && incidents.detail != null) {
          let type = 'pending';
          if (incidents.type == "jobs") {
            type = 'job';
          }
          this.goDetailPage(incidents.detail, type);
         }else {
          this.common.alertToast('No Instance on This Request');
         }
      },async (error) => {
        this.common.stopLoading();
                   if (error.status == 401) {
              this.events.publish("user:inactive", {err:error.status, time:Date.now()});
            }
      }
    )
  }
  goDetailPage(incident, type) {
    incident.requestRaisedBy = null;
    let navigationExtras: NavigationExtras = {
      queryParams: {
        selectedRequest: JSON.stringify(incident),
        type: type,
        isDraft: false,
        isCalendar: true,
        module:this.module
      }, replaceUrl: true
    }
    this.router.navigate(['request-detail'], navigationExtras)
  }
  createRandomEvents() {
    let postData;
    this.eventSource = [];

    this.common.displayLoading();
    this.currentUserId = 1;
    if(this.assetId) {
       postData = {
        assetId: this.assetId,
        filterDate: this.date,
        calendarType: "dayGridMonth"
      }
    } else {
       postData = {
        filterDate: this.date,
        calendarType: "dayGridMonth"
      }
    }


    this.service.getScheduleJobInstances(postData)
    .subscribe(res=>{
      this.common.stopLoading();
      if(res){
        this.eventSource = this.prepareCalendarEvents(res);
      }
    },async(error)=>{
      console.log(error)
      this.common.stopLoading();
    })
     this.service.getWorkorders(postData)
     .subscribe(data =>{
      this.common.stopLoading();
       if(data){
        var result =  this.prepareCalendarEvents(data);
        this.eventSource = this.eventSource && this.eventSource.length > 0 ? this.eventSource.concat(result) : result;
       }
     },async(error)=>{
      console.log(error)
      this.common.stopLoading();
     })
}
prepareCalendarEvents(data){
  var events = [];
  this.calendarEvents = data;
  if (this.calendarEvents && this.calendarEvents.length > 0) {
    this.calendarEvents.forEach(element => {
     var id;
      if(element.title.includes('(PM)')) {
        this.Preventive = true;
        id = element.id;
      } else if(element.title.includes('(W)')) {
        this.Work = true;
        id = element.id;
      }
      events.push({
        title: element.title,
        startTime: new Date(element.start),
        endTime: new Date(element.end),
        allDay:false,
        id: id,
        eventColor: 'black',
        Type: "Pending"
      });

    });
  }
  return events;

}

getEvents() {
  let calendarEvents = null;
  this.service.getScheduleJobInstance().subscribe(data => {
    if (data != null && data.length > 0) {
      calendarEvents = data;
      localStorage.setItem(Config.constants.calendarJson,JSON.stringify(data));
    } else {
      if (!navigator.onLine) {
        calendarEvents = JSON.parse(localStorage.getItem('Config.constants.calendarJson'));
      } else {
        calendarEvents = [];
      }
    }
    this.common.isCalendarLoaded = true;
    this.common.updateCalendarStatus();
    if (data && data.length) {
      this.prepareEvents(data);
    } else {
      this.hasNoRecord = true;
    }
    this.common.stopLoading();
  },
   error => {
    this.common.stopLoading();
  }
  );
}

scrolltoEle() {
  let element: any = this.elementRef.nativeElement.querySelector(".current-date");
  let pos: any = element.getBoundingClientRect();
  // this.content.scrollTop(0, pos.top - 115, 200);
}
getTimeDifference(event) {
  let timeStart = new Date(event.startDateTime).getTime();
  let timeEnd = new Date(event.endDateTime).getTime();
  let hourDiff = timeEnd - timeStart;
  // let secDiff = hourDiff / 1000;
  let minDiff = hourDiff / 60 / 1000;
  let hDiff = hourDiff / 3600 / 1000;
  hDiff = Math.floor(hDiff);
  let timeDiff = minDiff - 60 * hDiff;
  return hDiff ? hDiff + ' Hr ' + timeDiff + ' Mins' : timeDiff + ' Mins';
}
getHourDifference(event) {
  let timeStart = new Date(event.startDateTime).getTime();
  let timeEnd = new Date(event.endDateTime).getTime();
  let hourDiff = timeEnd - timeStart;
  let hDiff = hourDiff / 3600 / 1000;
  hDiff = Math.floor(hDiff);
  return hDiff;
}
contructEvents(index, allDay, startTimeOnly, isMultiDay, newStartDate, isTimeDiff, isEnds) {
  let arrIndex = isMultiDay ? new Date(isMultiDay).getMonth() + '' + ("0" + new Date(isMultiDay).getDate()).slice(-2) : new Date(newStartDate ? newStartDate : index.startDateTime).getMonth() + '' + ("0" + new Date(newStartDate ? newStartDate : index.startDateTime).getDate()).slice(-2);
  if (this.eventObject[arrIndex]) {
    this.eventObject[arrIndex].events.push({
      id: index.id,
      requestId: index.requestId,
      calendarEvent: index,
      title: index.name,
      startTime: new Date(newStartDate ? newStartDate : index.startDateTime),
      endTime: new Date(index.endDateTime),
      startTimeOnly: startTimeOnly,
      isEnds: isEnds,
      timeDiff: isTimeDiff ? this.getTimeDifference(index) : false,
      allDay: allDay
    });
  } else {
    this.eventObject[arrIndex] = {
      id: index.id,
      requestId: index.requestId,
      title: index.name,
      startTime: new Date(newStartDate ? newStartDate : index.startDateTime),
      events: [{
        title: index.name,
        requestId: index.requestId,
        calendarEvent: index,
        startTime: new Date(newStartDate ? newStartDate : index.startDateTime),
        endTime: new Date(index.endDateTime),
        startTimeOnly: startTimeOnly,
        isEnds: isEnds,
        timeDiff: isTimeDiff ? this.getTimeDifference(index) : false,
        allDay: allDay
      }]
    }
  }
}
prepareEvents(data) {
  this.events = [];
  for (let index of data) {
    if (this.getHourDifference(index) < 24) {
      this.contructEvents(index, false, false, false, false, true, false);
    } else {
      let dayDif = (new Date(index.endDateTime).getTime() - new Date(index.startDateTime).getTime()) / 1000 / 60 / 60 / 24;
      dayDif = Math.floor(dayDif);
      this.contructEvents(index, false, true, false, false, false, false);
      for (let i = 1; i <= dayDif; i++) {
        let date = new Date().setDate(new Date(index.startDateTime).getDate() + i);
        if (dayDif == i) {
          let newStartDate = index.endDateTime;
          this.contructEvents(index, false, true, date, newStartDate, false, true);
        } else {
          let newStartDate = new Date(date);
          this.contructEvents(index, true, false, date, newStartDate, false, false);
        }
      }
    }
  }
  for (let result in this.eventObject) {
    this.events.push(this.eventObject[result]);
  }
  setTimeout(() => {
    if ((data != null && data.length > 0) && this.elementRef.nativeElement.querySelector(".current-date")) {
      this.scrolltoEle();
    }
  }, 100);
}
checkCurrentDate(date) {
  let currentDate1 = new Date();
  let currentDate2 = new Date(date);
  if (currentDate1.getDate() == currentDate2.getDate() && currentDate1.getMonth() == currentDate2.getMonth() && currentDate1.getFullYear() == currentDate2.getFullYear()) {
    return true;
  }
  return false;
}
getEventsDetail(event) {
  let requestId = event.calendarEvent.requestId ? event.calendarEvent.requestId : '';
  if (requestId) {
    this.service.getRequestDetail(requestId)
    .subscribe(
      incidents => {
        if (null != incidents && incidents.detail != null) {
          let type = 'pending';
          if (incidents.type == "jobs") {
            type = 'job';
          }
          this.goDetailPage(incidents.detail, type);
        }
      },async(error) =>{
        if (error.status == 401) {
          this.events.publish("user:inactive", {err:error.status, time:Date.now()});
        }
      }
    )
  } else {
    let data = event.calendarEvent.staticTab ? JSON.parse(event.calendarEvent.staticTab) : '';
    let formValue = {
      tabName: 'Static',
      form: data[0]
    }
    if (data && data.length > 0) {
    }
  }
}

back() {
  if(this.module == 'asset-detail') {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        assetId:this.assetId,
      },replaceUrl:true
    }
    this.router.navigate(['asset-detail'], navigationExtras)
  }else if(this.module == 'settings') {
    this.router.navigate(['settings'],{replaceUrl:true});
  }else {
    this.router.navigate(['home'],{replaceUrl:true});
  }
  
}




}
















  // Change current month/week/day



  // Selected date reange and hence title changed


  // Calendar event was clicked




