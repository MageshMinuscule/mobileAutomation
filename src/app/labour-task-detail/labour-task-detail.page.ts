import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { Events } from 'src/providers/events/events';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-labour-task-detail',
  templateUrl: './labour-task-detail.page.html',
  styleUrls: ['./labour-task-detail.page.scss'],
})
export class LabourTaskDetailPage implements OnInit {
  requestId: any;
  labourTasks: any = [];
  labourTask: any = {};
  filteruserList: any = [];
  user: any = {};
  required = true;
  userList: any = [];
  profile: any;
  locationId: any;
  dummy: any = {};
  selectedUser: any = {};
  task: any = {};
  time: number;
  loginval: any = {};
  logoutval: any = {};
  hoursworked: boolean;
  isReadOnly: any;
  modelData: any;
  templateSchema: any;
  subHeader: any;
  tab: any;
  module: any;
  value: any = {};
  result: any;
  constructor(
    private common: CommonProvider,
    private reqService: ServiceProvider,
    public firestore: AngularFirestore,
    private events: Events,
    public router: Router,
    public route: ActivatedRoute,
    public navCtrl: NavController,
  ) {
  }
  ionViewWillEnter() {
    this.route.queryParams.subscribe((params :any) => {
      this.locationId = params && params.locationId ? params.locationId : null;
      this.tab = params && params.tab ? params.tab : 'labour';
      this.requestId = params && params.requestId ? params.requestId : null;
      this.task = params && params.task ? JSON.parse(params.task) : null;
      this.subHeader = params && params.subHeader ? params.subHeader : null;
      this.templateSchema = params && params.selectedRequest ? JSON.parse(params.selectedRequest): null;
      this.module = params && params.module ? params.module : null;
      this.value = params && params.value ? JSON.parse(params.value) : null;
      if(this.task != null) {
        this.labourTask =  this.task;
      }
    })
    let profile = JSON.parse(window.localStorage.getItem('Profile'));
    this.profile = profile;
    if (this.profile.isRowLevel) {
      this.getUserBasedOnRowlevel();
    } else {
      let userListCollectionRef = this.firestore
        .collection('organization')
        .doc(profile.tenantId)
        .collection('user_base', (ref) => ref.where('active', '==', true));
      userListCollectionRef.valueChanges().subscribe((res) => {
        this.userList = res;
      });
    }
  }
  ngOnInit() {
  }
  getUserBasedOnRowlevel() {
    this.reqService.getUsersByRowLevel(this.locationId).subscribe(
      (res) => {
        this.filteruserList = res;
      },
      (error) => {}
    );
  }

  filterUserResult(Keyword) {
    let val = this.validateInput(Keyword);
    this.user.id = '';
    if (val) {
      if (this.profile.isRowLevel) {
        this.reqService.getRowLevelUsersAutocomplete(this.locationId, val).subscribe(
          (res) => {
            this.filteruserList = res;
          },
          (error) => {}
        );
      } else {
        this.filteruserList = this.userList.filter((item) => {
          return item.firstName.toLowerCase().indexOf(val.toLowerCase()) > -1;
        });
      }
    } else {
      this.filteruserList = this.userList;
    }
  }
  validateInput(event) {
    event.target.value = event.target.value
      ? event.target.value.trimStart()
      : '';
    if (event.target.name) {
      switch (event.target.name) {
        case 'user':
          this.labourTask.userName = event.target.value;
          break;
        case 'workingHours':
          this.labourTask.hoursWorked = event.target.value;
          break;
        case 'estimatedHours':
          this.labourTask.estimatedHours = event.target.value;
          break;
        case 'description':
          this.labourTask.description = event.target.value;
          break;
        default:
          break;
      }
    }
    return event.target.value;
  }
  fieldOnFocus(type) {
    switch (type) {
      case 'User':
        if (this.user.firstName == undefined) {
          this.filteruserList = this.userList
        };
        break;
      default:
        break;
    }
  }
  selectUser(user) {
    this.user.id = user.id;
    this.user.firstName = user.firstName;
    this.user.hourlyRate = user.hourlyRate;
    this.filteruserList = [];
    this.labourTask.userName = this.user.firstName;
    this.labourTask.userId = this.user.id;
    this.labourTask.labourCharge = this.user.hourlyRate;
  }
  clearResults(type) {
    setTimeout(() => {
      switch (type) {
        case 'User':
          this.filteruserList = [];
          break;

        default:
          break;
      }
    }, 500);
  }
  addTasks() {
    if (this.labourTask.userName === null || this.labourTask.userName === '') {
      this.common.alertToast(
        this.reqService.translatedata('User Name is required')
      );
      return;
    } else if (
      this.labourTask.hoursWorked === null ||
      this.labourTask.hoursWorked === ''
    ) {
      this.common.alertToast(
        this.reqService.translatedata('Working hours is required')
      );
      return;
    }
    else if (
      this.labourTask.description === null ||
      this.labourTask.description === ''
    ) {
      this.common.alertToast(
        this.reqService.translatedata('Description is required')
      );
      return;
    } else {
      this.labourTask.requestId = this.requestId;
      this.labourTask.requestLoactionId = this.locationId;
      this.labourTask.locationId = this.locationId;
      this.saveLabourTask();
    }
  }
  saveLabourTask() {
    this.common.displayLoading();
    if(this.requestId == null || this.requestId == undefined || this.requestId == '') {
      this.common.stopLoading();
      this.value.result = JSON.stringify(this.labourTask);
      this.update();
      return;
    }
    if(this.user.id == "") {
      this.common.stopLoading();
      this.common.alertToast('Please Select User in Drop Down List');
      return;
    }
    this.labourTask.loginTime = this.labourTask.loginTime
      ? this.labourTask.loginTime
      : null;
    this.labourTask.logoutTime = this.labourTask.logoutTime
      ? this.labourTask.logoutTime
      : null;
    let service = this.labourTask.id
      ? this.reqService.updateLabourTask(this.labourTask)
      : this.reqService.createLabourTask(this.labourTask);
    service.subscribe(
      (result) => {
        this.result = result;
        this.value.result = JSON.stringify(result);
        this.common.stopLoading();
        if (result.id) {
          this.common.alertToast(
            this.reqService.translatedata('Labour Tasks added successfully')
          );
          this.update();
        }
      },
      async (err) => {
        this.common.stopLoading();
        if (err.status == 401) {
          this.events.publish('user:inactive', {
            err: err.status,
            time: Date.now(),
          });
        } else if (err.status == 409) {
          this.common.alertToast(
            this.reqService.translatedata('recordAlreadyExist')
          );
        } else if (err.status == 500 || err.status == 0) {
          this.common.alertToast(
            this.reqService.translatedata('internalServerError')
          );
        }
      }
    );
  }
  async update() {
    let navigationExtras : NavigationExtras = {
      queryParams: {
        requestId: this.labourTask.requestId,
        selectedRequest: JSON.stringify(this.templateSchema),
        subHeader: this.subHeader,
        module:this.module,
        value : JSON.stringify(this.value),
        result: JSON.stringify(this.result),
      },replaceUrl:true
    }
    this.router.navigate(['labour-tasks-list'], navigationExtras);
  }
  logIn(event) {
    if (this.labourTask.loginTime && this.labourTask.logoutTime) {
      this.labourTask.hoursWorked = (
        (new Date(this.labourTask.logoutTime).getTime() -
          new Date(this.labourTask.loginTime).getTime()) /
        (1000 * 60 * 60)
      ).toFixed(2);
    }
  }
  back() {
    let navigationExtras: NavigationExtras = {
      queryParams:{
        requestId: this.requestId,
        selectedRequest: JSON.stringify(this.templateSchema),
        subHeader: this.subHeader,
        module:this.module,
        value:JSON.stringify(this.value),
        result: JSON.stringify(this.result),

      },replaceUrl:true
    }
    this.router.navigate(['labour-tasks-list'], navigationExtras)
  }
  clearLabourtask() {
    this.user = {}
    this.labourTask = {};
  }
}
