import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ScheduleDemoPageRoutingModule } from './schedule-demo-routing.module';

import { ScheduleDemoPage } from './schedule-demo.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ScheduleDemoPageRoutingModule,
    TranslateModule
  ],
  declarations: [ScheduleDemoPage]
})
export class ScheduleDemoPageModule {}
