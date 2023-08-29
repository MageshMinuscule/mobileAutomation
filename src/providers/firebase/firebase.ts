import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { CommonProvider } from 'src/app/common/common';
import { ServiceProvider } from '../service/service';

@Injectable()
export class FirebaseProvider {
  profile: any;

  constructor(public http: HttpClient, private firestore: AngularFirestore, private common: CommonProvider, public reqService: ServiceProvider) {
    // this.getCount();
    this.getList();
  }

  getCount() {
    console.log('FirebaseProvider getCount  called');
    let info = JSON.parse(window.localStorage.getItem('Profile'));
      if (info) {
        this.profile = info;
      }
      if (this.profile && this.profile.tenantId) {
        try {
          try {
            let workflowCollectionRef = this.firestore.collection('organization').doc(this.profile.tenantId).collection('workflow');
            workflowCollectionRef.valueChanges().subscribe(res => {
              this.common.workflowList = res;
            });
          } catch (error) {
            console.error(error);
          }

          try {

            let assetCollectionRef = this.firestore.collection('organization').doc(this.profile.tenantId).collection('asset');
            if (this.profile.isRowlevel && this.profile.locationIds && this.profile.locationIds.length) {
              assetCollectionRef = this.firestore.collection<any>('organization').doc<any>(this.profile.tenantId).collection<any>("asset", ref => ref.where("path", "array-contains-any", this.profile.locationIds));
            }
            assetCollectionRef.valueChanges().subscribe(res => {
              this.common.assetList = res;
            });
          } catch (error) {
            console.log(error);
          }

          try {

            let companyCollectionRef = this.firestore.collection('organization').doc(this.profile.tenantId).collection('company');
            companyCollectionRef.valueChanges().subscribe(res => {
              this.common.companyList = res;
            });
          } catch (error) {
            console.error(error);
          }
        } catch (error) {
          console.log("Error in get Count ==>" + error);
        }
      }
  }

  getList() {
    this.reqService.getUserProfile().then((profile) => {
      this.profile = profile;
      if (profile && profile.tenantId) {
        try {
          let tagsCollectionRef = this.firestore.collection('organization').doc(profile.tenantId).collection('tag', ref => ref.orderBy("id", "asc"));
          tagsCollectionRef.valueChanges().subscribe((res) => {
            this.common.tagList = res;
          });
        } catch (error) {
          console.log("Error in list ==>" + error);
        }
        try {
          let locationCollectionRef = this.firestore.collection('organization').doc(profile.tenantId).collection('location');
          if (this.profile.isRowlevel && this.profile.locationIds && this.profile.locationIds.length) {
            locationCollectionRef = this.firestore.collection('organization').doc(profile.tenantId).collection('location', ref => ref.where("path", "array-contains-any", this.profile.locationIds));
          }
          locationCollectionRef.valueChanges().subscribe(res => {
            this.common.locationList = res;
          });
        } catch (error) {
          console.error(error);
        }
      }
    })
  }

  getAssetList() {
    this.reqService.getUserProfile().then((profile) => {
      if (profile && profile.tenantId) {
        try {
          let assetCollectionRef = this.firestore.collection('organization').doc(profile.tenantId).collection('asset');
          if (this.profile.isRowlevel && this.profile.locationIds && this.profile.locationIds.length) {
            assetCollectionRef = this.firestore.collection<any>('organization').doc<any>(this.profile.tenantId).collection<any>("asset", ref => ref.where("path", "array-contains-any", this.profile.locationIds));
          }
          assetCollectionRef.valueChanges().subscribe(res => {
            this.common.assetList = res;
          });
        } catch (error) {
          console.log(error);
        }
      }
    });
  }
}
