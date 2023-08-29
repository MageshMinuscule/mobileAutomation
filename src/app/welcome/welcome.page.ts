import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {
  user: any;
  logoSrc: any;
  response: any = [];
  disabled: boolean = true;
  spinShown: boolean = true;
  constructor(
    private firestore : AngularFirestore,
    private  common : CommonProvider,
    private nav : NavController,
    public router: Router,
    public modalCtrl : ModalController,
    public route: ActivatedRoute
  ) {
    localStorage.setItem('logo-img', JSON.stringify(''));
      this.route.queryParams.subscribe(params => {
        if(params.orgId && params.uicustomized) {
          let tagsCollectionRef = this.firestore.collection('organization').doc(params.orgId).collection('tag', ref => ref.orderBy("id", "asc"));
          tagsCollectionRef.valueChanges().subscribe((res) => {
            this.common.tagList = res;
          });
          this.common.viewType = JSON.parse(params.uicustomized) ? 'location' : 'user';
          this.common.setViewType(this.common.viewType);
          let logoCollectionRef = this.firestore.collection('organization_logo', ref => ref.where('organization', '==', params.orgId));
          logoCollectionRef.valueChanges().subscribe((res) => {
            if (res && res.length) {
              this.response = res[0];
              this.logoSrc = this.response.logo;
              localStorage.setItem('logo-img', JSON.stringify(''));
              localStorage.setItem('logo-img',JSON.stringify(this.response));
              localStorage.setItem('logo-home',JSON.stringify(this.response));
              this.spinShown = false;
            } else {
              this.spinShown = false;
              this.logoSrc = this.common.logo;
              localStorage.setItem('logo-home', JSON.stringify(''));
            }
            this.disabled = false;

          });
        }
      })
   }

  ngOnInit() {
  }

  async gotoHome() {
    if (this.common.getViewType() == 'location') {
      this.nav.navigateRoot('/location');
    } else {
 this.router.navigate(['home'],{replaceUrl:true})
    }
  }

}
