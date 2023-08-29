import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavController, NavParams } from '@ionic/angular';
import { ServiceProvider } from 'src/providers/service/service';
import { CommonProvider } from '../common/common';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {

  companyId: any;
  contact: any = {};
  required = true;
  constructor(private modalCtrl: ModalController,private navparams: NavParams, private navCtrl: NavController, private location: Location, private reqService: ServiceProvider, private common: CommonProvider, public route:ActivatedRoute, public router: Router) {
    this.companyId = this.navparams.data.companyId ? this.navparams.data.companyId : null;
    if (this.companyId) {
      this.getContactDetails(this.companyId)
    }
  }
  back() {
    this.modalCtrl.dismiss().catch(() => {
    })
  }
  updateContact() {
    let valid = this.contact.primaryEmail != null && this.contact.primaryEmail != '' && this.contact.primaryEmail != undefined ? this.validateEmails() : true;
    if (!valid) {
      return;
    }
    this.common.displayLoading();
    this.reqService.updateCustomer(this.contact)
      .subscribe(
        (res) => {
          this.contact = res;
          this.common.stopLoading();
          this.common.alertToast(
            this.reqService.translatedata("Contact details updated successfully")
          );
          this.location.back();
        }, async (error) => {
          this.common.stopLoading();
        }
      )

  }
  getContactDetails(id) {
    this.reqService.getCustomer(id)
      .subscribe(
        (res) => {
          this.contact = res;
          this.common.stopLoading();

        },
        (error) => {
          this.common.stopLoading();
        }
      )
  }
  validateInput(event) {
    event.target.value = event.target.value
      ? event.target.value.trimStart()
      : "";
    if (event.target.name) {
      switch (event.target.name) {
        case "userName":
          this.contact.name = event.target.value;
          break;
        case "primaryContact":
          this.contact.primaryContact = event.target.value;
          break;
        case "primaryEmail":
          this.contact.primaryEmail = event.target.value;
          break;
        case "primaryPhone":
          this.contact.primaryPhone = event.target.value;
          break;
        default:
          break;
      }
    }
    return event.target.value;
  }
  makeCall() {
    // let num = this.contact.primaryPhone
    // this.callNumber.callNumber(num, true)
    // .then((resp) => console.log('Launched dialer!'))
    // .catch((e) => console.log('Error launching dialer'))
  }
  validateEmails() {
    let isValid = true;

    if (
      this.contact.primaryEmail &&
      this.contact.primaryEmail.trim() &&
      this.contact.primaryEmail.includes("@") &&
      this.contact.primaryEmail.includes(".")
    ) {
      isValid = true;
    } else {
      this.common.alertToast(
        this.reqService.translatedata(
          "Please enter a valid email"
        )
      );
      isValid = false;
    }
    return isValid;
  }

  ngOnInit() {
  }

}
