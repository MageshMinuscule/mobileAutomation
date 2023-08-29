import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyActivityPageRoutingModule } from './my-activity-routing.module';

import { MyActivityPage } from './my-activity.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyActivityPageRoutingModule
  ],
  declarations: [MyActivityPage]
})
export class MyActivityPageModule {}
