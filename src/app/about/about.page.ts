import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Config } from '../config'

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {
  version: any;

  constructor( public platform: Platform,public router: Router) {
    this.version = platform.is('cordova') ? (platform.is('android') ? Config.constants.setting.AndroidVersion : Config.constants.setting.IOSVersion) : Config.constants.setting.AndroidVersion;
  }

  ngOnInit() {
  }
  back() {
    this.router.navigate(['/home']);
  }
   

}
