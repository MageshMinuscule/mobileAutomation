import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonInput, NavController, Platform } from '@ionic/angular';
import { Events } from 'src/providers/events/events';
import { ServiceProvider, User } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';
import { Token } from '../data.model';
import { FCM } from "cordova-plugin-fcm-with-dependecy-updated/ionic/ngx";
import { Config } from '../config';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { TranslateService } from '@ngx-translate/core';
import { from} from 'rxjs';
import { Device } from '@ionic-native/device/ngx';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignUpPage implements OnInit {
  // @ViewChild(Slides) slides: Slides;
  @ViewChild('password') input: IonInput;
  email: ''
  userList: any = {};
  userListcopy:any = {};
  forgot: any = { email: '', contact: '', name: '',country: '', password: '',organisation: ''  };
  loginCredentials: any = { email: '', password: '' };
  form: any = 'form-1';
  dots:any = [1,2,3]
  selectIndex: any = 0;
  registerAccount: any;
  data: any = {};
  currentUser: User;
  userDetails: any ={};
  token: any;
  options: any = [];
  countries: any = [];
  keys: string[];
  countycodes: any = [];
  countriescopy: any = [];
  zonecode: any = '';
  isFirst:boolean = true;
  passwordinvalid: boolean = true;
  passworderrormsg: string;
  passwordlengtherror: string;
  showPassword: boolean;
  errorMsg: boolean;
  msg: string;
  constructor(
    private common : CommonProvider,
    private reqService: ServiceProvider,
    public router : Router,
    private navCtrl : NavController,
    private events: Events,
    private reqservice: ServiceProvider,
    private platform : Platform,
    private fcm : FCM,
    private device: Device,
    private local: NativeStorage,
    public translateService: TranslateService,
    public http: HttpClient,
  ) {
    this.userList = {
      addUserField: []
    };
    this.userListcopy = {
      addUserField: []
    };
    this.registerAccount = {
      active: true
    };
   }

  ngOnInit() {
    // this.logoutUser();
    this.http.get('https://trial.mobiscroll.com/content/countries.json').subscribe((resp: any) => {
      const countries = [];
      this.countriescopy = resp;
      for (let i = 0; i < resp.length; ++i) {
          const country = resp[i];
          this.countries.push(resp[i]['text']);
          this.countycodes.push(resp[i]['value']);
          // countries.push({ text: country.text, value: country.value });
      }
      // this.countries = countries;
      // this.countries = Object.keys(this.countries);
  }); 
  this.createNewField()

  }
  logoutUser() {
    this.common.logClickEvent('user_logout_btn_click', 'User Logout');
    this.events.publish('user-logout', {time : Date.now()});
  }
  selectCountry(country){
    this.zonecode = country.detail.value;
    for (let i = 0; i < this.countriescopy.length; ++i) {
      if(this.zonecode === this.countriescopy[i]['text']){
        this.registerAccount.zoneCode = this.countriescopy[i]['text'];
        this.registerAccount.countryCode = this.countriescopy[i]['value'];
      }
  }
  }
  signup(){
    this.common.displayLoading();
    this.registerAccount.zoneCode = "Asia/Kolkata";
    this.registerAccount.countryCode = "IN";
    if(this.errorMsg) {
      this.common.alertToast('You have entered an invalid email address!');
      return;
    }
    this.reqService.CreateAccount(this.registerAccount)
      .subscribe(
        async (res) => {
          res;
          this.reqService.onBoarding();
          // this.form = form;
          // this.selectIndex = dot;
            // this.common.displayLoading();
            this.common.logClickEvent('user_login_btn_click', "Login Page");
            if (navigator.onLine){
          this.loginCredentials.username = this.registerAccount.email;
          this.loginCredentials.password = this.registerAccount.password;
          this.loginCredentials.email = this.registerAccount.email;
          this.loginCredentials.origin = 'mobile';
          if (this.loginCredentials.email == '' || this.loginCredentials.password == '') {
            this.showAlert("Please fill all fields");
            return;
          }
          this.reqservice.userLogin(this.loginCredentials).subscribe((data) => {
            this.data = data,
            localStorage.setItem('auth-token', 'Bearer ' + this.data['id_token']);
            let profile;
            this.reqService.authenticateFirebase().then(() => {});
            this.reqService.authenticateFirebase().then(() => {});
            this.reqService.getUserInfo()
            .subscribe(
              async (res) => {
                this.currentUser = new User(
                  this.registerAccount.email,
                  this.registerAccount.password
                );
                if (this.platform.is("cordova")) {
                  let result = JSON.parse(window.localStorage.getItem(Config.constants.token));
                    if (null != result) {
                      let token = new Token();
                      this.fcm.getToken().then((deviceToken) => {
                        token.token = deviceToken;
                        window.localStorage.setItem("device-token", deviceToken);
                        let date = new Date();
                        token.creationDate = date.toISOString();
                        token.updatedDate = date.toISOString();
                        token.userEmail = this.currentUser.username;
                        token.deviceId = this.device.uuid;
                        console.log('token.deviceId' + token.deviceId);
                        console.log('token method call ')
                        this.reqService.addDeviceToken(token).subscribe((token)=>{
                          console.log('token'+ token)
                        }, async (err)=>{
                          console.log('error'+err);
                        })
                        
                      });
                    } else {
                      try {
                        console.log("this.fcm.token"+this.fcm.getToken());
                        this.token = await this.fcm.getToken();
        
                        console.log('getToken result: ', this.token);
                        let token = new Token();
                        console.log('get token called..........');
                          token.token = this.token;
                          window.localStorage.setItem("device-token", this.token);
                          let date = new Date();
                          token.creationDate = date.toISOString();
                          token.updatedDate = date.toISOString();
                          token.userEmail = this.currentUser.username;
                          token.deviceId = this.device.uuid;
                          console.log("device token call by req servive");
                          this.reqService.addDeviceToken(token).subscribe((token)=>{
                            console.log('token'+ token)
                          }, async (err)=>{
                            console.log('error'+err);
                        })
                      }catch (error) {
                        console.log(error);
                      }
                    }
                }
        
                if (res) {
                  profile = res;
                  localStorage.setItem("Profile", JSON.stringify(profile));
                  this.userDetails.username = profile.firstName;
                  this.userDetails.email = profile.email;
                  this.userDetails.langKey = profile.langKey;
                  this.userDetails.id = profile.id;
                  this.userDetails.org_id = profile.tenantId;
                  this.userDetails.customerIds = profile.customerIds;
                  this.userDetails.workflow = profile.workflowType;
                  this.userDetails.uicustomized = profile.uicustomized;
                  this.userDetails.mobileUITemplateId = profile.mobileUITemplateId;
                  this.userDetails.downTimeTracking = profile.downTimeTracking;
                  this.userDetails.restrictByLocation = profile.restrictByLocation;
                  this.userDetails.locationIds = profile.locationIds;
                  this.userDetails.isRowlevel = profile.isRowlevel;
                  window.localStorage.setItem('usergroupPermissions', JSON.stringify(profile.userPermissions));
                  window.localStorage.setItem('userGroupNames', JSON.stringify(profile.userGroupNames))
                  // this.local.setItem('usergroupPermissions', profile.userPermissions);
                  // this.local.setItem('userGroupNames', profile.userGroupNames);
                  this.common.setTenantId(profile.tenantId);
                  this.common.setWorkFlowType(profile.workflowType);
                  this.local.setItem('userName', this.userDetails.username);
                  this.local.setItem('userProfile', JSON.stringify(null));
                  this.local.setItem('userProfile', JSON.stringify(this.userDetails));
                  localStorage.setItem("userProfile", JSON.stringify(this.userDetails));
                  let value = JSON.parse(localStorage.getItem("userProfile"));
                  console.log(value);
                  this.events.publish('user:created', {
                    user:this.userDetails, time:Date.now()
                  });
              }
                setTimeout(() => {
                  this.common.stopLoading();
                  this.showAlert("Account Created Successfully!");
                  this.switchform('form-3',2);
                  let org = from(this.local.getItem('logo-img'))
                  org.subscribe(
                    (org) => {
                      if( profile && profile.userGroupNames && profile.userGroupNames.length === 1 && profile.userGroupNames[0].toLowerCase() === 'requestuser')
                      {
                        this.local.setItem('workRequestBasedLogin', 'workRequestBasedLogin');
                        // this.router.navigate(['/work-request-list']);
                      }
                     else
                     {
                      this.local.setItem('workRequestBasedLogin', 'normalUser');
                        if (org && org.organization == this.userDetails.org_id) {
                          // this.router.navigate(['/home']);
                        } else {
                          this.translateService.setDefaultLang(this.userDetails.langKey);
                          let navigationExtras: NavigationExtras = {
                            queryParams: {
                              orgId:this.userDetails.org_id,
                              uicustomized: JSON.stringify(this.userDetails.uicustomized)
                            }
                          }
                          // this.router.navigate(['/welcome'], navigationExtras);
                        }
                      }
                    },async (err) => {
                      if( profile && profile.userGroupNames && profile.userGroupNames.length === 1 && profile.userGroupNames[0].toLowerCase() === 'requestuser')
                      {
                        this.local.setItem('workRequestBasedLogin', 'workRequestBasedLogin');
                        // this.router.navigate(['/work-request-list']);
                      }else{
                      this.translateService.setDefaultLang(this.userDetails.langKey);
                      let navigationExtras: NavigationExtras = {
                        queryParams: {
                          orgId: this.userDetails.org_id,
                          uicustomized: JSON.stringify(this.userDetails.uicustomized)
                        }
                      }
                      // this.router.navigate(['/welcome'], navigationExtras);
                      }
                    }
                  )
                }, 1000);
              }
              
            )
          }, async (err) => {
            this.common.stopLoading();
            if (err['error'] && err["status"]) {
              let respBody = err['error'];
              if ('Bad credentials' == respBody.AuthenticationException || err["status"] == 400) {
                this.showAlert(this.reqService.translatedata("invalidCredentials"));
              } else {
                this.showAlert(respBody.AuthenticationException ? respBody.AuthenticationException : this.common.serverDown);
              }
            } else {
              this.showAlert(this.common.serverDown);
            }
          }
          );
        } else {
          this.showAlert(this.common.offlineMsg);
        }
        },
        async(err) =>{
          err;
          this.common.stopLoading();
          this.showAlert(this.reqService.translatedata("user creation failed"));
        });
  }
  sendInvite(){
    this.userList.addUserField[0]['email'] = this.userList.addUserField[0]['communicationEmail'];
    for (let i = 0; i < this.userList.addUserField.length; ++i) {
      this.userList.addUserField[i]['email'] = this.userList.addUserField[i]['communicationEmail'];
  }
    this.reqService.createUser(this.userList.addUserField).subscribe(
     response => {
      response;
      this.skipInvite();
      },
      async(err) => {
        this.common.alertToast(this.reqService.translatedata('user already exists!'));
        });
  }
  forgotPwd() {
    this.common.stopLoading();
    this.forgot.email = this.forgot.email.trim();
    if (this.forgot.email.includes('@') && this.forgot.email.includes('.')) {
      this.reqService.ResetPassword(this.forgot.email)
      .subscribe(
        result => {
          if (result) {
            this.common.alertToast(this.reqService.translatedata('If you\'re registered customer, you will get a reset password details in your email.'));
            this.router.navigate(['/login'])
          } 
        },async (result)=> {
           if (result.status == 400 && result.error == "e-mail address not registered") {
            this.common.alertToast(this.reqService.translatedata('E-mail address not registered'));
          }else if(result.status == 200 && result.error.text == "e-mail was sent"){
            this.common.alertToast(this.reqService.translatedata('If you\'re registered customer, you will get a reset password details in your email.'));
            
          } else {
            this.common.alertToast(this.reqService.translatedata('internalServerError' + result.status));
          }
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
          
        }
      )
    } else if (!this.forgot.email) {
      this.common.alertToast(this.reqService.translatedata('Please enter email address'));
    } else {
      this.common.alertToast(this.reqService.translatedata('Invalid email address'));
    }
  }
  gotoLogin(){
    this.common.displayLoading();
    if (navigator.onLine) {
      this.router.navigate(['/login']);
      this.common.stopLoading();
    }
    else {
      this.common.stopLoading();
      this.common.alertToast(this.reqService.translatedata('You are offline'));
    }

  }
  skipInvite(){
    let navigationExtras: NavigationExtras = {
        queryParams: {
          orgId: this.registerAccount.name,
          uicustomized: JSON.stringify(false)
        }
      }
      this.router.navigate(['/welcome'], navigationExtras);

  }
  switchform(form,dot){
    if(form === 'form-2' && dot === 1){
      this.validPassword(this.registerAccount.password);
      if(!this.passwordinvalid){
        this.form = form;
        this.selectIndex = dot;
      }
      else{
        this.common.alertToast(this.reqService.translatedata(this.passwordlengtherror +' '+ this.passworderrormsg));
      }
    }
    else{
      this.form = form;
      this.selectIndex = dot;
    }
    
  }
  inviteForm(form,dot){
    this.form = form;
    this.selectIndex = dot;
  }

  back(form,dot) {
    this.selectIndex = dot;
    this.form = form;
    // if(this.navCtrl){
    //   this.navCtrl.pop();
    // }
  }
  createNewField() {
    this.isFirst = false;
    this.userListcopy.addUserField.push({
      communicationEmail: '',
      email: '',
      firstName: '',
      emailerror: true,
      noemail: false,
      nameerror: true,
      noname: false
    });
    this.userList.addUserField.push({
      communicationEmail: '',
      email: '',
      firstName: '',
    });
  }
  addfield(){
    console.log(this.userList);
  }


showAlert(text) {
  setTimeout(() => {
    this.common.stopLoading();
  });
  this.common.alertToast(text);
}

validPassword(password) {
  const pass = this.registerAccount.password;
  var upperCaseCharacters = /[A-Z]+/g;
  var lowerCaseCharacters = /[a-z]+/g;
  var numberCharacters = /[0-9]+/g;
  var specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

  let hasLower = false;
  let hasUpper = false;
  let hasNum = false;
  let hasSpecial = false;

  if (
    !upperCaseCharacters.test(pass) &&
    !lowerCaseCharacters.test(pass) &&
    !numberCharacters.test(pass) &&
    !specialCharacters.test(pass)
  ) {
    this.passwordinvalid = true;
    this.passworderrormsg = ' 8 or more characters with a mix of uppercase, lowercase, & numbers.';
  } else {
    this.passworderrormsg = 'use at least';
    this.passwordlengtherror = 'Please use at least 8 character and';
    const lowercaseRegex = new RegExp('(?=.*[a-z])'); // has at least one lower case letter
    if (!lowercaseRegex.test(pass)) {
      hasLower = true;
      this.passwordinvalid = true;
      this.passworderrormsg = this.passworderrormsg + ' one Lowercase character';
    }

    const uppercaseRegex = new RegExp('(?=.*[A-Z])'); //has at least one upper case letter
    if (!uppercaseRegex.test(pass)) {
      hasUpper = true;
      this.passwordinvalid = true;
      this.passworderrormsg = this.passworderrormsg + ' one uppercase character';
    }

    const numRegex = new RegExp('(?=.*\\d)'); // has at least one number
    if (!numRegex.test(pass)) {
      hasNum = true;
      this.passwordinvalid = true;
      this.passworderrormsg = this.passworderrormsg + ' one Number';
    }

    const specialcharRegex = new RegExp('[!@#$%^&*(),.?":{}|<>]');
    if (!specialcharRegex.test(pass)) {
      hasSpecial = true;
      this.passwordinvalid = true;
      this.passworderrormsg = this.passworderrormsg + ' one special character';
    }
    if (pass.length < 8) {
      this.passwordinvalid = true;
      this.passwordlengtherror = 'Please use at least 8 character and';
    } else {
      this.passwordlengtherror = '';
    }
    if(specialcharRegex.test(pass) && numRegex.test(pass) && uppercaseRegex.test(pass) && lowercaseRegex.test(pass) && pass.length < 8){
      this.passwordinvalid = true;
      this.passwordlengtherror = 'Please use at least 8 character ';
      this.passworderrormsg = '';
    }

    if (specialcharRegex.test(pass) && numRegex.test(pass) && uppercaseRegex.test(pass) && lowercaseRegex.test(pass) && pass.length >= 8) {
      this.passwordinvalid = false;
      return;
    }
  }
}
toggleShow() {
  this.showPassword = !this.showPassword;
  // this.type = this.showPassword ? 'text' : 'password';
  this.input.type = this.showPassword ? 'text' : 'password';
}
validateEmail(value) {
  if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
    this.errorMsg = false;
    return true;
  }else {
    this.msg = 'You have entered an invalid email address!';
    this.errorMsg = true;
  }
}
  

}
