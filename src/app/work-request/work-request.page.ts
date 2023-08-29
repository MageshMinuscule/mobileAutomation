import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Events } from 'src/providers/events/events';
import { NavController } from '@ionic/angular';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { PortalRequest } from '../data.model';
import { AngularFirestore } from '@angular/fire/firestore';


@Component({
  selector: 'app-work-request',
  templateUrl: './work-request.page.html',
  styleUrls: ['./work-request.page.scss'],
})

export class WorkRequestPage implements OnInit {
  asset : any;
  workRequest : any = {};
  facilityWorkRequest : any = {};
  description : any;
  // expectedDate : any;
  raisedById : any;
  priority : any;
  required  = true;
  profile : any;
  priorities = ['NORMAL', 'URGENT', 'CRITICAL'];
  ionicForm: FormGroup;
  isSubmitted = false;
  incident = {
  compulsory: false,
  type: 'Image Upload',
  cameraOnly: false,
  images: [],
  label: 'Upload Equipment Image',
  value: " "
  }
  facilityCustomer: any;
  facilitylocationId: any;
  facilitylocation: any;
  workRequestJson: any[];
  workrequestPreCusJson: any[] = [];
  shown: boolean;
  categoryListCopy: any = [];
  categoryList: any = [];
  assetCategoryName: any;
  isCategory: boolean = false;
  assetIndex: number;
  shownSubmitBtn: boolean = false;
  shownButton:boolean = false;
  images: any[] = [];
  constructor(
    private route : ActivatedRoute,
    private reqService : ServiceProvider,
    private common : CommonProvider, 
    private router : Router,
    public formBuilder: FormBuilder,
    public events : Events,
    public navCtrl: NavController, 
    public zone: NgZone, 
    private nativeStorage : NativeStorage,
    public firestore: AngularFirestore,
    public storage: NativeStorage,

  ) {
    this.images = [];
    this.route.queryParams.subscribe(params =>{
      if(params && params.selectedAsset){
        this.asset =  JSON.parse(params.selectedAsset)
        // this.workRequest.categoryId = this.asset.categoryId;
        // this.workRequest.categoryName = this.asset.categoryName;
        let cat = {
          id:this.asset.categoryId,
          name:this.asset.categoryName
        }
        this.selectCategory(cat);
        this.isCategory = this.asset.categoryName ?  true : false;
      }
    })
    this.route.queryParams.subscribe(params =>{
      if(params && params.customer){
        this.facilityCustomer = JSON.parse(params.customer);
      }
    })
    this.route.queryParams.subscribe(params =>{
      if(params && params.location){
        this.facilitylocation = JSON.parse(params.location);
      }
    })
    this.route.queryParams.subscribe(params =>{
      if(params && params.locationId){
        this.facilitylocationId = params.locationId
      }
    })
    this.reqService.getWorkrequestJson().subscribe(res=>{
      console.log(res);
      this.workRequestJson =  res.body; 
      this.getEnabledFields();
      setTimeout(() => {this.shownSubmitBtn = true;},500)
       
      console.log(this.workRequestJson);
    },async (err)=>{
      console.log(err);
    })
   }

   
  getEnabledFields() {
    var index = 0;
    this.workRequestJson[0].predefinedEnabledFields = this.workRequestJson[0].predefined;
    this.workRequestJson[0].predefined = [];
    this.workRequestJson[0].predefinedEnabledFields.forEach(element => {
      if (element.enable == true) {
        element.value = '';
        this.workRequestJson[0].predefined.push(element);
      }
      index++;
    });
    this.workRequestJson[0].customEnabledFields = this.workRequestJson[0].custom;
    this.workRequestJson[0].custom = [];
    this.workRequestJson[0].customEnabledFields.forEach(element => {
      if (element.enable == true) {
        element.value = '';
        this.workRequestJson[0].custom.push(element);
      }
      index++;
    });
  }

   ionViewWillEnter() {
    let profiles = JSON.parse(localStorage.getItem('Profile'));
    this.profile = profiles;
    if(profiles)
    {
    let catgoryCollectionRef = this.firestore.collection('organization').doc(profiles.tenantId).collection('category');
      catgoryCollectionRef.valueChanges().subscribe(res => {
        this.categoryListCopy = res;
        // var index = 0;
        // res.forEach(element => {
        //   index++;
        //   if(index <=2)
        //   {
        //     this.categoryListCopy.push(element);
        //   }
        // });
      });
    }    
   }

  ngOnInit() {
    this.ionicForm = this.formBuilder.group({
      priority: ['', [Validators.required]],
      description:['',[Validators.required]]
    })
  }
  fieldOnFocus() {
    if(this.workRequest.categoryName)
    {
      this.categoryList = [];
    }else{
      this.categoryList = this.categoryListCopy;
    }
  }
  clearResults() {
    this.categoryList = [];
  }
  filterCategoryResult(event) {
    var val = event.target.value;
    // this.workRequest.categoryName = null;
    // this.workRequest.categoryId = null;
    if (val) {
      let index = 0;
        this.categoryList = this.categoryListCopy.filter((item) => {
          index++;
          if(index <=5) 
          return item.name.toLowerCase().indexOf(val.toLowerCase()) > -1;
        });
    } else {
        this.categoryList = this.categoryListCopy;
    }
}
selectCategory(category) {
  this.workRequest.categoryId = category.id;
  this.workRequest.categoryName = category.name;
  this.assetCategoryName = category.name;
  this.categoryList = [];
}
  back(){
    this.router.navigate(['work-request-list']);
  }
  get errorControl() {
    return this.ionicForm.controls;
  }
  // createWorkRequest() {
  //   this.common.displayLoading();
  //   this.isSubmitted = true;
  //   if (!this.ionicForm.valid) {
  //     console.log('Please provide all the required values!')
  //     return false;
  //   } else {
  //   this.workRequest.assetId = this.asset && this.asset.id ? this.asset.id : null;
  //   // this.workRequest.assetName = this.asset.name;
  //   this.workRequest.locationId = this.facilitylocationId ? this.facilitylocationId : this.asset.locationId ? this.asset.locationId : null;
  //   this.workRequest.locationName = this.facilitylocation ? this.facilitylocation.name : this.asset.locationName ? this.asset.locationName : null;
  //   this.workRequest.companyId = this.facilityCustomer ? this.facilityCustomer.id : this.asset.customerId ? this.asset.customerId : null;
  //   this.workRequest.companyName = this.facilityCustomer ? this.facilityCustomer.name : this.asset.customerName ? this.asset.customerName : null;
  //   this.workRequest.description = this.workRequest.description ? this.workRequest.description : null;
  //   this.workRequest.customerName = this.workRequest.companyName ? this.workRequest.companyName : null;
  //   // this.workRequest.expectedDate = this.workRequest.expectedDate ? this.workRequest.expectedDate : null ;
  //   this.workRequest.raisedById = this.profile.id;
  //   this.workRequest.priority = this.workRequest.priority ? this.workRequest.priority.toUpperCase() : this.priority;
  //   this.workRequest.workType = 'ALL';
  //   this.workRequest.status = 'Yet to Create';
  //   this.workRequest.s3ImageId=this.incident.images[0] && this.incident.images[0].imgId ? this.incident.images[0].imgId:null;
  //   this.workRequest.imageDescription = this.incident.images[0] && this.incident.images[0].description ? this.incident.images[0].description:null
    
  //   this.reqService.createworkRequest(this.workRequest)
  //   .subscribe(
  //     (result) => {
  //       this.common.stopLoading();
  //       if (result.id) {
  //         this.common.alertToast(
  //           this.reqService.translatedata("Work Request created successfully")
  //         );
  //         this.router.navigate(['/work-request-list']);        
  //       }
  //     },async (err) => {
  //       this.common.stopLoading();
  //       if(err.status == 401){
  //         this.events.publish('user:inactive', {err: err.status, time: Date.now()});
  //       }else if(err.status == 409){
  //         this.common.alertToast(
  //           this.reqService.translatedata("recordAlreadyExist")
  //         );
  //       }else if (err.status == 500 || err.status == 0) {
  //         this.common.alertToast(
  //           this.reqService.translatedata("internalServerError")
  //         );
  //       }else{
  //         this.common.alertToast(
  //           this.reqService.translatedata("internalServerError")
  //         );
  //       }
  //     }
  //   )
  //   }
    
  // }
  findEmptyField(arr) {
    this.workrequestPreCusJson = [];
    // arr = arr.map(v => v.compulsory == true);
     arr = [...this.workRequestJson[0].predefined, ...this.workRequestJson[0].custom];
    arr = Object.assign([], JSON.parse(JSON.stringify(arr)));
    delete arr[this.assetIndex];
    arr.forEach(element => {
      if (element.compulsory == true) {
        this.workrequestPreCusJson.push(element);
      }
    });
    this.workrequestPreCusJson = this.workrequestPreCusJson.map(v => v.value == '');
    return this.workrequestPreCusJson.includes(true);
  }
  onInputKeyPressed(event,index?,type?,number?,image?) {
     var value = event.target.value;
      value = number == 'number' ? value : value.replace(/[^\w\s]/gi, '');
      if(type == 'predefined')
      {
        this.workRequestJson[0].predefined[index].value =  value;
      }else
      {
      this.workRequestJson[0].custom[index].value =  value;
      }
      // if (this.findEmptyField(this.workRequestJson[0].predefined)) {
      //   return;
      // }
  }
  createWorkRequest() {
    // this.shown = true;
    // this.common.displayLoading();
    this.isSubmitted = true;
    // if (!this.ionicForm.valid) {
    //   console.log('Please provide all the required values!');
    //   this.shown = false;
    //   return false;  
    // } else {
      if (this.incident && this.incident.images.length > 0) {
        const transformedArray = this.incident.images.map(obj => {
          return {
            imgId: obj.imgId
          };
        }); 
        console.log(transformedArray);

        this.incident.images.forEach(img => {
          this.images.push(img.imgId);
        });
      }
    this.workRequest.assetId = this.asset && this.asset.id ? this.asset.id : null;
    this.workRequest.assetName = this.asset && this.asset.assetName ? this.asset.assetName : null;
    this.workRequest.categoryId =  this.workRequest.categoryId ? this.workRequest.categoryId : null;
    this.workRequest.categoryName = this.workRequest.categoryName ? this.workRequest.categoryName : null;
    this.workRequest.active =  true;
    this.workRequest.categoryId =  this.asset && this.asset.id && this.asset.categoryId ? this.asset.categoryId : null;
    // this.workRequest.assetName = this.asset.name;
    this.workRequest.locationId = this.facilitylocationId ? this.facilitylocationId : this.asset.locationId ? this.asset.locationId : null;
    this.workRequest.locationName = this.facilitylocation ? this.facilitylocation.name : this.asset.locationName ? this.asset.locationName : null;
    this.workRequest.companyId = this.facilityCustomer ? this.facilityCustomer.id : this.asset && this.asset.customerId ? this.asset.customerId
    : this.facilitylocation && this.facilitylocation['companyId'] ? this.facilitylocation['companyId'] :null;
    this.workRequest.companyName = this.facilityCustomer ? this.facilityCustomer.name : this.asset && this.asset.customerName ? this.asset.customerName : null;
    this.workRequest.description = this.workRequest.description ? this.workRequest.description : null;
    this.workRequest.customerName = this.workRequest.companyName ? this.workRequest.companyName : null;
    // this.workRequest.expectedDate = this.workRequest.expectedDate ? this.workRequest.expectedDate : null ;
    this.workRequest.raisedById = this.profile.id;
    // this.workRequest.priority = this.workRequest.priority ? this.workRequest.priority.toUpperCase() : this.priority;
    this.workRequest.workType = 'ALL';
    this.workRequest.status = 'Yet to Create';
    this.workRequest.s3ImageList=this.incident.images[0] && this.incident.images[0].imgId && this.images && this.images.length > 0 ? this.images : null;
    // this.workRequest.imageDescription = this.incident.images[0] && this.incident.images[0].description ? this.incident.images[0].description:null
    this.updatePredefinedFieldValue(); 
    if (this.findEmptyField(this.workRequestJson[0].predefined)) {
      this.shownButton = false
      return;
    }
    this.shownButton = true;
    this.workRequest.customJson =  JSON.stringify(this.workRequestJson);
    this.reqService.createworkRequest(this.workRequest)
    .subscribe(
      (result) => {
        this.common.stopLoading();
        if (result.id) {
          this.common.alertToast(
            this.reqService.translatedata("Work Request created successfully")
          );
          this.router.navigate(['/work-request-list']);        
        }
      },async (err) => {
        this.shownButton = false;
        this.common.stopLoading();
        let error =
        typeof err.message == 'string'
          ? err.message
          : { detail: err.message, type: 'error' };
        if(err.status == 401){
          this.events.publish('user:inactive', {err: err.status, time: Date.now()});
        }else if(error.detail == 'I/O exception.') {
          this.common.alertToast("Problem for pushing a workrequest Data into webhook, please try again.");
        }else if(error.detail == 'No user found to assign the request') {
          this.common.alertToast(error.detail + ", please contact your administrator");
        }
        // else if(error.detail.contains('net.sf.jasperreports.exception.')){
        //   this.common.alertToast('Error while generating report for this request' + ", please contact your administrator");
        // }
        else if(err.status == 409){
          this.common.alertToast(
            this.reqService.translatedata("recordAlreadyExist")
          );
        }else{
          this.common.alertToast(
            error.detail+" please contact your administrator"
          );
        }
      }
    )
    // }
    
  }
  updatePredefinedFieldValue() {
    for (var i = 0; i < this.workRequestJson[0].predefined.length; i++) {
      switch (this.workRequestJson[0].predefined[i].fieldName) {
        case 'Customer':
          this.workRequestJson[0].predefined[i].value = this.workRequest.companyName ? this.workRequest.companyName : '';
          break;
        case 'Location':
          this.workRequestJson[0].predefined[i].value = this.workRequest.locationName ? this.workRequest.locationName : '';
          break;
        case 'Asset':
          this.assetIndex = i;
          this.workRequestJson[0].predefined[i].value = this.workRequest.assetName ? this.workRequest.assetName : '';
          break;
        case 'Category':
          this.workRequestJson[0].predefined[i].value = this.workRequest.categoryName ? this.workRequest.categoryName : '';
          break;
        case 'Invoice Reference Number':
          this.workRequestJson[0].predefined[i].value = this.workRequest.invoiceReferenceNumber
            ? this.workRequest.invoiceReferenceNumber
            : '';
          break;
        case 'Project Reference Number':
            this.workRequestJson[0].predefined[i].value = this.workRequest.projectReferenceNumber
              ? this.workRequest.projectReferenceNumber
              : '';
            break;
        case 'Contact Name':
          this.workRequestJson[0].predefined[i].value = this.workRequest.contactName ? this.workRequest.contactName : '';
          break;
        case 'Contact Number':
          this.workRequestJson[0].predefined[i].value = this.workRequest.contactNumber ? this.workRequest.contactNumber : '';
          break;
        case 'Priority':
          this.workRequestJson[0].predefined[i].value = this.workRequest.priority ? this.workRequest.priority : '';
          break;
        case 'File Upload':
          this.workRequestJson[0].predefined[i].value = this.workRequest.s3ImageList ? this.workRequest.s3ImageList : '';
          break;
        case 'Description':
          this.workRequestJson[0].predefined[i].value = this.workRequest.description ? this.workRequest.description : '';
          break;
      }
    }
  }
  imageEvent(event,index?,type?,number?,image?) {
    if(type == 'predefined' && image == 'image')
    {
      this.workRequestJson[0].predefined[index].value = 'imageId';
    }
    
  }
}
