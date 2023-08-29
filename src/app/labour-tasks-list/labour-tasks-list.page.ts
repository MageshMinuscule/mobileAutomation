import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-labour-tasks-list',
  templateUrl: './labour-tasks-list.page.html',
  styleUrls: ['./labour-tasks-list.page.scss'],
})
export class LabourTasksListPage implements OnInit, AfterViewInit {


  labourTasks: any = [];
  type: any;
  profile: any;
  isAdmin = false;
  userGroupNames: any = [];
  data: any;
  modelData: any;
  noRecordFound: boolean = false;
  requestId: any;
  status: any;
  locationId: any;
  templateSchema: any;
  subHeader: any;
  tab: any;
  module: any;
  requestData: any;
  draftRequest: any;
  workRequest: any;
  value: any = {};
  templateSchemaList: any;
  result: any = [];
 
  constructor(
    private common: CommonProvider,
    private reqService: ServiceProvider,
    public alertCtrl: AlertController,
    public route: ActivatedRoute,
    public router: Router,
    public navCtrl: NavController,
  ) {
  }
  ionViewDidEnter() {
    this.route.queryParams.subscribe((params: any) => {
       this.tab = params.tab ? params.tab : null;
       this.module = params && params.module ? params.module :null;
       this.requestId = params && params.requestId ? params.requestId : null;
       this.status = params && params.status ? params.status : null;
       this.locationId = params && params.locationId ? params.locationId :null;
       this.subHeader = params && params.subHeader ? params.subHeader : null;
       this.value = params && params.value ? JSON.parse(params.value) : {};
       if(this.value?.moduleName == 'new-request') {
        let result = JSON.parse(localStorage.getItem('labourTaskList'));
        result = result ? result : [];
        if(this.value?.result) {
          let data = JSON.parse(this.value?.result);
          result.push(data);
          window.localStorage.setItem('labourTaskList',JSON.stringify([...result]));
          this.labourTasks = (JSON.parse(localStorage.getItem('labourTaskList')));
        }else {
          this.labourTasks = result;
          if(this.labourTasks?.length == 0) this.noRecordFound = true;
        }

      }
      if(this.module == 'new-request') {
        let data = JSON.parse(localStorage.getItem('labourTaskList'));
        data = data ? data : [];
        this.labourTasks = data;
        this.noRecordFound = this.labourTasks?.length == 0 ? true : false;
      }
       this.templateSchema = params && params.templateSchema ? JSON.parse(params.templateSchema) : params.selectedRequest ? JSON.parse(params.selectedRequest) : null;
       if(this.module == 'new-request') this.assginValue(params);
       if(this.requestId) this.getLabourTasks();
       let value = JSON.parse(localStorage.getItem('userGroupNames'));
       this.userGroupNames = value;
       this.userGroupNames.forEach((element) => {
         if (element === 'SuperAdmins') {
           this.isAdmin = true;
         }
       });
       this.route.queryParams.subscribe(params => {
         if(params.id) {
           this.requestId = params.id;
           this.getLabourTasks();
         }
       })

    })
  }
  assginValue(params: any) {
    if(params.value) {  
      this.value = JSON.parse(params.value);
    }else {
      this.draftRequest = params.draftRequest ? JSON.parse(params.draftRequest) : null;
      this.requestData = params.requestData ? JSON.parse(params.requestData) : null;
      this.workRequest = params.workRequest ? JSON.parse(params.workRequest) : null;
      this.templateSchema = params.templateSchema ? JSON.parse(params.templateSchema) : null;
      this.templateSchemaList = params.templateSchemaList ? JSON.parse(params.templateSchemaList) : [];
      this.value = {
        workRequest: this.workRequest,
        requestData: this.requestData,
        draftRequest: this.draftRequest,
        templateSchema: this.templateSchema,
        templateSchemaList: this.templateSchemaList,
        moduleName:'new-request',
        
      }
    }

  }
  ngOnInit() {

  }
  ngAfterViewInit() {}

  back() {
    let data = this.labourTasks && this.labourTasks.length > 0 ? this.labourTasks : 0;
    if (this.value?.moduleName == 'new-request') {
      let navigationExtras: NavigationExtras = {
        queryParams:{ 
         value : JSON.stringify(this.value),

        },
        replaceUrl:true
      }
      this.router.navigate(['/new-request'],navigationExtras)
    } else {
      let navigationExtras: NavigationExtras = {
        queryParams:{
          selectedRequest: JSON.stringify(this.templateSchema),
          labourTasksCount: data.length,
          tab: this.tab ?this.tab :'labour',
          subHeader: this.subHeader,
          module:this.module
        },
        replaceUrl:true
      }
      this.router.navigate(['/request-detail'],navigationExtras)
    }


  }
  getLabourTasks() {
    this.common.displayLoading();
    this.reqService.getLabourTasksByrequestId(this.requestId).subscribe(
      (res) => {
        this.common.stopLoading();
        this.labourTasks = res.body;
        if(this.labourTasks.length == 0 ) {
          this.noRecordFound = true;
        }
        
      },
      async (err) => {
        this.noRecordFound = true;
        this.common.stopLoading();
        if (err.status) {
          this.common.alertToast(
            'cannot get the labour task list,please go back and try again.....'
          );
        }
      }
    );
  }
  async addLabourTask() {
    if(this.module == 'new-request') {
    }
    let navigationExtras : NavigationExtras = {
      queryParams:{
        locationId: this.locationId,
        requestId: this.requestId,
        selectedRequest: JSON.stringify(this.templateSchema),
        subHeader: this.subHeader,
        tab: this.tab ? this.tab :'labour',
        module:this.module,
        value : JSON.stringify(this.value)
      },replaceUrl:true
    }
    this.router.navigate(['labour-task-detail'],navigationExtras);
  }
  async editLabourTask(task) {
    let navigationExtras : NavigationExtras = {
      queryParams:{
                locationId: this.locationId,
                 requestId: this.requestId,
                 task: JSON.stringify(task),
                 selectedRequest: JSON.stringify(this.templateSchema),
                 subHeader: this.subHeader,
                 labourTasks:this.labourTasks,
                 tab: this.tab ?this.tab :'labour',
                 module:this.module,
                 value : JSON.stringify(this.value)
      },
      replaceUrl:true
    }
    this.router.navigate(['labour-task-detail'],navigationExtras);
  }
  async showDeleteConformation(task) {
    let alert = await this.alertCtrl.create({
      header: this.reqService.translatedata('confirm-delete'),
      message:
        '<div><span class="alert-text">' +
        this.reqService.translatedata('deleteConfirmation') +
        '</span></div>',
      cssClass: 'custom-alert',
      backdropDismiss: true,
      buttons: [
        {
          text: this.reqService.translatedata('Cancel'),
          role: 'Cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
        {
          text: this.reqService.translatedata('confirm'),
          handler: () => {
            this.deleteLabourTask(task);
          },
        },
      ],
    });
    await alert.present();
  }
  deleteLabourTask(task) {
    let lists = JSON.parse(localStorage.getItem('labourTaskList'));
    if(lists && lists.length > 0) {
      lists.splice(lists.indexOf(task),1);
      localStorage.setItem('labourTaskList',JSON.stringify(lists));
      this.common.alertToast('Labour Task deleted successfully');
      return;
    }
    this.reqService.deleteLabourTask(task.id)
    .subscribe(res=>{
      if (res == null) {
        this.getLabourTasks();
        this.common.stopLoading();
        this.common.alertToast(
          this.reqService.translatedata('Labour Task deleted successfully')
        );
      }
    },async (err)=>{
      this.common.stopLoading();
      this.common.alertToast(err.status+"error to delete labour task...")
    })
  }
  info() {
    this.common.alertToast('Swipe To Delete Labours Tasks');
  }
}
